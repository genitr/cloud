import os

from django.conf import settings
from rest_framework import serializers

from django.contrib.auth import get_user_model

from .models import Folder, File, FileSharing


User = get_user_model()


class FolderSerializer(serializers.ModelSerializer):
    """Сериализатор для папок"""
    
    parent_info = serializers.SerializerMethodField()
    owner_info = serializers.SerializerMethodField()
    subfolders_count = serializers.IntegerField(source='subfolders.count', read_only=True)
    files_count = serializers.IntegerField(source='files.count', read_only=True)
    full_path = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    size_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id',
            'name',
            'parent_folder',
            'parent_info',
            'owner',
            'owner_info',
            'subfolders_count',
            'files_count',
            'full_path',
            'size',
            'size_formatted',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'size', 'size_formatted']
    
    def get_size(self, obj):
        """Расчет размера папки (сумма всех файлов в папке и подпапках)"""
        total_size = 0
        
        # Функция для рекурсивного сбора файлов
        def collect_files(folder):
            nonlocal total_size
            # Добавляем файлы из текущей папки
            for file in folder.files.all():
                total_size += file.size
            # Рекурсивно обрабатываем подпапки
            for subfolder in folder.subfolders.all():
                collect_files(subfolder)
        
        collect_files(obj)
        return total_size
    
    def get_size_formatted(self, obj):
        """Форматирование размера"""
        size = self.get_size(obj)
        for unit in ['Б', 'КБ', 'МБ', 'ГБ']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} ТБ"
    
    def get_parent_info(self, obj):
        """Информация о родительской папке"""
        if obj.parent_folder:
            return {
                'id': obj.parent_folder.id,
                'name': obj.parent_folder.name,
                'full_path': obj.parent_folder.get_full_path()
            }
        return None
    
    def get_owner_info(self, obj):
        """Информация о владельце"""
        if obj.owner:
            return {
                'id': obj.owner.id,
                'username': obj.owner.username,
                'storage_path': obj.owner.storage_path
            }
        return None
    
    def get_full_path(self, obj):
        """Полный путь к папке"""
        return obj.get_full_path()
    
    def validate(self, data):
        """Проверка на циклические ссылки"""
        if self.instance and data.get('parent_folder') == self.instance:
            raise serializers.ValidationError(
                "Папка не может быть родителем самой себя"
            )
        return data


class FolderCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания папок"""
    
    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent_folder']
        read_only_fields = ['id']
    
    def validate(self, data):
        """Проверка уникальности имени в папке"""
        name = data.get('name')
        parent = data.get('parent_folder')
        
        # Получаем пользователя из контекста
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Проверяем, есть ли уже папка с таким именем
            existing = Folder.objects.filter(
                name=name,
                parent_folder=parent,
                owner=request.user
            ).exists()
            
            if existing:
                parent_path = parent.get_full_path() if parent else 'Корень'
                raise serializers.ValidationError(
                    f"Папка с именем '{name}' уже существует в {parent_path}"
                )
        
        return data


class FolderListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списков"""
    full_path = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent_folder.name', read_only=True)
    
    class Meta:
        model = Folder
        fields = [
            'id', 
            'name', 
            'parent_name',
            'full_path',
            'created_at'
        ]
    
    def get_full_path(self, obj):
        return obj.get_full_path()


class FolderTreeSerializer(serializers.ModelSerializer):
    """Сериализатор для построения дерева папок"""
    subfolders = serializers.SerializerMethodField()
    full_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = ['id', 'name', 'full_path', 'subfolders']
    
    def get_full_path(self, obj):
        return obj.get_full_path()
    
    def get_subfolders(self, obj):
        # Рекурсивно сериализуем подпапки
        subfolders = obj.subfolders.all()
        if subfolders.exists():
            return FolderTreeSerializer(subfolders, many=True, context=self.context).data
        return []


class FileSerializer(serializers.ModelSerializer):
    """Основной сериализатор для файлов"""
    
    folder_info = serializers.SerializerMethodField()
    logical_path = serializers.SerializerMethodField()
    owner_info = serializers.SerializerMethodField()
    size_formatted = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    downloads_count = serializers.IntegerField(read_only=True)
    views_count = serializers.IntegerField(read_only=True)
    last_downloaded_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = File
        fields = [
            'id',
            'name',
            'original_name',
            'file',
            'file_url',
            'folder',
            'folder_info',
            'owner',
            'owner_info',
            'size',
            'size_formatted',
            'content_type',
            'comment',
            'logical_path',
            'uploaded_at',
            'updated_at',
            'downloads_count',
            'views_count',
            'last_downloaded_at',
        ]
        read_only_fields = [
            'id', 
            'original_name', 
            'size', 
            'content_type', 
            'uploaded_at', 
            'updated_at',
            'owner',
            'downloads_count',
            'views_count',
            'last_downloaded_at',
        ]
    
    def get_file_url(self, obj):
        """Полный URL для доступа к файлу"""
        if obj.file:
            return obj.file.url
        return None
    
    def get_folder_info(self, obj):
        if obj.folder:
            return {
                'id': obj.folder.id,
                'name': obj.folder.name,
                'full_path': obj.folder.get_full_path(),
                'storage_url': f"{settings.MEDIA_URL}{obj.folder.storage_path}" if hasattr(obj.folder, 'storage_path') else None
            }
        return {'id': None, 'name': 'Корень', 'full_path': '/'}
    
    def get_owner_info(self, obj):
        """Информация о владельце"""
        return {
            'id': obj.owner.id,
            'username': obj.owner.username,
            'email': obj.owner.email,
            'storage_url': f"{settings.MEDIA_URL}{obj.owner.storage_path}" if obj.owner.storage_path else None
        }
    
    def get_logical_path(self, obj):
        """Используем метод модели"""
        return obj.get_logical_path()
    
    def get_size_formatted(self, obj):
        """Форматируем размер в человеко-читаемый вид"""
        size = obj.size
        for unit in ['Б', 'КБ', 'МБ', 'ГБ']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} ТБ"


class FileUploadSerializer(serializers.ModelSerializer):
    """Сериализатор для загрузки файлов"""
    
    class Meta:
        model = File
        fields = [
            'id',
            'file',
            'name',
            'folder',
            'comment',
        ]
        read_only_fields = ['id']
    
    def validate_file(self, value):
        """Валидация файла"""
        max_size = 100 * 1024 * 1024  # 100MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Файл слишком большой. Максимальный размер: 100MB"
            )
        
        return value
    
    def validate_folder(self, value):
        """Проверка, что папка принадлежит пользователю"""
        request = self.context.get('request')
        if request and value and value.owner != request.user:
            raise serializers.ValidationError(
                "У вас нет доступа к этой папке"
            )
        return value


class FileListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списка файлов"""
    
    folder_name = serializers.CharField(source='folder.name', read_only=True, default='Корень')
    size_formatted = serializers.SerializerMethodField()
    downloads_count = serializers.IntegerField(read_only=True)
    views_count = serializers.IntegerField(read_only=True)
    last_downloaded_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = File
        fields = [
            'id',
            'name',
            'folder_name',
            'size_formatted',
            'content_type',
            'uploaded_at',
            'owner',
            'comment',
            'downloads_count',
            'views_count',
            'last_downloaded_at',
        ]
    
    def get_size_formatted(self, obj):
        size = obj.size
        for unit in ['Б', 'КБ', 'МБ', 'ГБ']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} ТБ"


class FileSharingSerializer(serializers.ModelSerializer):
    """Сериализатор для расшаривания файлов"""

    file_info = serializers.SerializerMethodField()
    created_by_info = serializers.SerializerMethodField()
    share_url = serializers.ReadOnlyField()
    
    class Meta:
        model = FileSharing
        fields = [
            'id',
            'file',
            'file_info',
            'created_by',
            'created_by_info',
            'share_token',
            'share_url',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'share_token',
            'created_at',
            'created_by'
        ]
    
    def get_file_info(self, obj):
        """Информация о файле"""
        return {
            'id': obj.file.id,
            'name': obj.file.name,
            'original_name': obj.file.original_name,
            'size': obj.file.size,
            'content_type': obj.file.content_type,
            'logical_path': obj.file.get_logical_path()
        }
    
    def get_created_by_info(self, obj):
        """Информация о создателе"""
        return {
            'id': obj.created_by.id,
            'username': obj.created_by.username
        }

    def validate_file(self, value):
        """Проверка доступа к файлу"""
        request = self.context.get('request')
        if request and value.owner != request.user:
            raise serializers.ValidationError(
                "Вы можете расшаривать только свои файлы"
            )
        return value


class PublicFileShareSerializer(serializers.ModelSerializer):
    """Публичный сериализатор"""
    
    file_info = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = FileSharing
        fields = [
            'share_token',
            'file_info',
            'created_by_username',
            'created_at'
        ]
    
    def get_file_info(self, obj):
        """Только публичная информация о файле"""
        return {
            'name': obj.file.name,
            'original_name': obj.file.original_name,
            'size': obj.file.size,
            'content_type': obj.file.content_type,
            'comment': obj.file.comment,
            'uploaded_at': obj.file.uploaded_at
        }
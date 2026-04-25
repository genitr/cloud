from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate

from django.db import models


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для списка пользователей"""

    files_count = serializers.SerializerMethodField()
    total_size = serializers.SerializerMethodField()
    total_size_formatted = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'is_active', 
            'is_staff',
            'is_superuser',
            'date_joined',
            'files_count',
            'total_size',
            'total_size_formatted'
        ]
        read_only_fields = ['id', 'is_active', 'date_joined']
    
    def get_files_count(self, obj):
        """Количество файлов пользователя"""
        from file_storage.models import File
        return File.objects.filter(owner=obj).count()
    
    def get_total_size(self, obj):
        """Общий размер файлов в байтах"""
        from file_storage.models import File
        total = File.objects.filter(owner=obj).aggregate(total=models.Sum('size'))['total']
        return total or 0
    
    def get_total_size_formatted(self, obj):
        """Форматированный общий размер"""
        size = self.get_total_size(obj)
        if size == 0:
            return '0 Б'
        
        for unit in ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} ПБ"
    

class UserDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для профиля"""

    full_name = serializers.SerializerMethodField()
    storage_url = serializers.SerializerMethodField()
    files_count = serializers.IntegerField(source='file_set.count', read_only=True)
    folders_count = serializers.IntegerField(source='folder_set.count', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'full_name', 
            'storage_path', 
            'storage_url',
            'files_count', 
            'folders_count',
            'is_active', 
            'is_staff', 
            'is_superuser',
            'date_joined', 
            'last_login'
        ]
        read_only_fields = [
            'id',
            'username',
            'storage_path', 
            'is_active', 
            'is_staff',
            'date_joined', 
            'last_login'
        ]
    
    def get_full_name(self, obj):
        """Безопасное получение полного имени"""

        if not obj:
            return ''
        
        if hasattr(obj, 'get_full_name') and obj.get_full_name():
            return obj.get_full_name()
        
        return obj.username if hasattr(obj, 'username') else ''
    
    def get_storage_url(self, obj):
        if hasattr(obj, 'storage_path') and obj.storage_path:
            return f"/media/{obj.storage_path}"
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления профиля"""

    current_password = serializers.CharField(
        write_only=True, 
        required=False,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        write_only=True, 
        required=False,
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        write_only=True, 
        required=False,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'first_name', 
            'last_name', 
            'email',
            'current_password', 
            'new_password', 
            'new_password2'
        ]
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate_email(self, value):
        """Проверка уникальности email"""
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError('Email уже используется')
        return value
    
    def validate(self, data):
        """Валидация смены пароля"""
        user = self.context['request'].user
        
        if data.get('new_password'):
            if not data.get('current_password'):
                raise serializers.ValidationError({
                    'current_password': 'Необходимо указать текущий пароль'
                })
            
            if not user.check_password(data['current_password']):
                raise serializers.ValidationError({
                    'current_password': 'Неверный текущий пароль'
                })
            
            if data['new_password'] != data['new_password2']:
                raise serializers.ValidationError({
                    'new_password': 'Новые пароли не совпадают'
                })
        
        return data
    
    def update(self, instance, validated_data):
        """Обновление пользователя"""
        validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('new_password2', None)
        
        # Обновляем поля
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Если меняем пароль
        if new_password:
            instance.set_password(new_password)
        
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('Пользователь заблокирован')
                data['user'] = user
            else:
                raise serializers.ValidationError('Неверный логин или пароль')
        else:
            raise serializers.ValidationError('Необходимо указать username и password')
        
        return data
    

class RegistrationSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации"""
    
    password2 = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'username', 
            'email', 
            'password', 
            'password2',
            'first_name', 
            'last_name',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Имя пользователя уже занято')
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email уже зарегистрирован')
        return value
    
    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password': 'Пароли не совпадают'
            })
        return data
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserStorageSerializer(serializers.Serializer):
    """Сериализатор для информации о хранилище"""
    
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    storage_path = serializers.CharField()
    storage_url = serializers.CharField()
    total_files = serializers.IntegerField()
    total_folders = serializers.IntegerField()
    total_size = serializers.IntegerField()
    total_size_formatted = serializers.CharField()
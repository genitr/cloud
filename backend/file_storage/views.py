import os
import logging

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from django.utils import timezone

from .models import Folder, File, FileSharing
from .serializers import (
    FileSharingSerializer,
    FolderSerializer,
    FolderCreateSerializer,
    FileListSerializer,
    FileSerializer,
    FileSharing,
    FileUploadSerializer,
    PublicFileShareSerializer
)


logger = logging.getLogger(__name__)

class FolderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращает папки только текущего пользователя"""

        user = self.request.user

        if not user.is_authenticated:
            logger.debug("Анонимный запрос к папкам, возвращаем пустой результат")
            return Folder.objects.none()
        
        user_id = self.request.query_params.get('user_id')
        
        # Если указан user_id и пользователь админ - показываем папки другого пользователя
        if user_id and (user.is_staff or user.is_superuser):
            return Folder.objects.filter(owner_id=user_id)
        
        logger.debug(f"Пользователь {self.request.user.username} запросил список папок")
        return Folder.objects.filter(owner=user)
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return FolderCreateSerializer
        return FolderSerializer
    
    def perform_create(self, serializer):
        """Автоматически устанавливаем владельца"""
        folder = serializer.save(owner=self.request.user)
        logger.info(f"Пользователь {self.request.user.username} создал папку: {folder.name} (ID: {folder.id})")
    
    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        """Возвращает содержимое папки"""
        folder = self.get_object()
        logger.info(f"Пользователь {request.user.username} запросил содержимое папки: {folder.name} (ID: {folder.id})")
        
        # Получаем подпапки
        subfolders = folder.subfolders.all()
        folders_data = FolderSerializer(subfolders, many=True, context={'request': request}).data
        
        # Получаем файлы
        files = folder.files.all()
        files_data = FileSerializer(files, many=True, context={'request': request}).data
        
        logger.debug(f"Папка {folder.name} содержит {len(subfolders)} подпапок и {len(files)} файлов")

        return Response({
            'folder': {
                'id': folder.id,
                'name': folder.name,
                'full_path': folder.get_full_path()
            },
            'subfolders': folders_data,
            'files': files_data
        })
    
    def get_object(self):
        """Переопределяем get_object для поддержки user_id для админа"""
        obj = super().get_object()
        user = self.request.user
        user_id = self.request.query_params.get('user_id')
        
        # Если админ и указан user_id, проверяем что папка принадлежит этому пользователю
        if user_id and (user.is_staff or user.is_superuser):
            if obj.owner_id != int(user_id):
                raise PermissionDenied("Папка не принадлежит указанному пользователю")
            return obj
        
        # Обычная проверка прав
        if obj.owner != user and not user.is_staff:
            raise PermissionDenied("У вас нет прав на эту папку")
        return obj


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Возвращает файлы только текущего пользователя.
        """
        user = self.request.user

        # Проверяем аутентификацию
        if not self.request.user.is_authenticated:
            logger.debug("Анонимный запрос к файлам, возвращаем пустой результат")
            return File.objects.none()
        
        user_id = self.request.query_params.get('user_id')

        # Если указан user_id и пользователь админ - показываем файлы другого пользователя
        if user_id and (user.is_staff or user.is_superuser):
            return File.objects.filter(owner_id=user_id)
        
        # Получаем базовый queryset
        queryset = File.objects.filter(owner=user)
        
        # Дополнительные фильтры
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
            logger.debug(f"Пользователь {self.request.user.username} фильтрует файлы по папке ID: {folder_id}")
        
        content_type = self.request.query_params.get('type')
        if content_type:
            queryset = queryset.filter(content_type__startswith=content_type)
            logger.debug(f"Пользователь {self.request.user.username} фильтрует файлы по типу: {content_type}")
        
        return queryset.select_related('folder', 'owner')
    
    def get_serializer_class(self):
        """Выбираем сериализатор в зависимости от действия"""
        if self.action == 'list':
            return FileListSerializer
        elif self.action == 'create':
            return FileUploadSerializer
        elif self.action == 'download':
            return None  # Для скачивания не нужен сериализатор
        return FileSerializer
    
    def perform_create(self, serializer):
        """Создание файла с текущим пользователем"""
        file_obj = serializer.save(owner=self.request.user)
        logger.info(f"Пользователь {self.request.user.username} загрузил файл: {file_obj.original_name} (ID: {file_obj.id}), размер: {file_obj.size} байт")
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        Просмотр файла (НЕ увеличивает счетчики)
        GET /api/files/{id}/preview/
        """
        file_obj = self.get_object()
        
        # Проверяем права доступа
        if file_obj.owner != request.user and not request.user.is_staff:
            return Response(
                {"error": "У вас нет прав на просмотр этого файла"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Просто возвращаем файл без изменения счетчиков
        return FileResponse(
            file_obj.file.open('rb'),
            content_type=file_obj.content_type or 'application/octet-stream'
        )
    
    @action(detail=True, methods=['post'])
    def record_view(self, request, pk=None):
        """
        Увеличение счетчика просмотров (ТОЛЬКО для просмотров)
        POST /api/files/{id}/record_view/
        """
        file_obj = self.get_object()
        
        # Проверяем права
        if file_obj.owner != request.user and not request.user.is_staff:
            return Response(
                {"error": "У вас нет прав"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_views = file_obj.views_count
        file_obj.increment_views()
        
        logger.info(f"Файл {file_obj.original_name}: просмотр +1 ({old_views} -> {file_obj.views_count})")
        
        return Response({
            'status': 'ok',
            'views_count': file_obj.views_count,
            'message': f'Просмотров: {file_obj.views_count}'
        })
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """
        Скачивание файла (увеличивает счетчик скачиваний)
        GET /api/files/{id}/download/
        """
        file_obj = self.get_object()
        
        # Проверяем права
        if file_obj.owner != request.user and not request.user.is_staff:
            return Response(
                {"error": "У вас нет прав на скачивание этого файла"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_downloads = file_obj.downloads_count
        file_obj.increment_downloads()
        
        logger.info(f"Файл {file_obj.original_name}: скачивание +1 ({old_downloads} -> {file_obj.downloads_count})")
        
        return FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Создание ссылки для расшаривания"""
        file_obj = self.get_object()
        user = request.user
        user_id = request.query_params.get('user_id')
        
        # Проверяем права
        if file_obj.owner != request.user and not user.is_staff:
            logger.warning(f"Пользователь {request.user.username} попытался расшарить чужой файл: {file_obj.original_name} (владелец: {file_obj.owner.username})")
            return Response(
                {"error": "Вы можете расшаривать только свои файлы"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Если админ и указан user_id, проверяем соответствие
        if user_id and user.is_staff:
            if file_obj.owner_id != int(user_id):
                return Response(
                    {"error": "Файл не принадлежит указанному пользователю"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Проверяем, нет ли уже активной ссылки
        existing_share = FileSharing.objects.filter(file=file_obj).first()
        if existing_share:
            logger.info(f"Using existing share for file {file_obj.id}")
            serializer = FileSharingSerializer(existing_share, context={'request': request})
            return Response(serializer.data)
        
        # Создаем расшаривание
        sharing = FileSharing.objects.create(
            file=file_obj,
            created_by=request.user,
        )

        logger.info(f"Пользователь {request.user.username} создал публичную ссылку для файла: {file_obj.original_name} (ID: {file_obj.id}).")
        
        serializer = FileSharingSerializer(sharing, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Обновление файла (имя, комментарий)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        user = request.user
        user_id = request.query_params.get('user_id')
        
        # Проверяем права
        if instance.owner != request.user and not user.is_staff:
            logger.warning(f"Пользователь {request.user.username} попытался отредактировать чужой файл: {instance.original_name} (владелец: {instance.owner.username})")
            return Response(
                {"error": "Вы можете редактировать только свои файлы"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if user_id and user.is_staff:
            if instance.owner_id != int(user_id):
                return Response(
                    {"error": "Файл не принадлежит указанному пользователю"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        old_name = instance.original_name
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        logger.info(f"Пользователь {request.user.username} обновил файл: {old_name} -> {instance.original_name} (ID: {instance.id})")
        
        return Response(serializer.data)
    
    def get_object(self):
        """Переопределяем get_object для поддержки user_id для админа"""
        obj = super().get_object()
        user = self.request.user
        user_id = self.request.query_params.get('user_id')
        
        # Для share эндпоинта админ может получить любой файл
        if self.action == 'share':
            if user.is_staff or user.is_superuser:
                # Если указан user_id, проверяем соответствие
                if user_id and obj.owner_id != int(user_id):
                    from rest_framework.exceptions import PermissionDenied
                    raise PermissionDenied("Файл не принадлежит указанному пользователю")
                return obj
        
        # Если админ и указан user_id, проверяем что файл принадлежит этому пользователю
        if user_id and (user.is_staff or user.is_superuser):
            if obj.owner_id != int(user_id):
                raise PermissionDenied("Файл не принадлежит указанному пользователю")
            return obj
        
        # Обычная проверка прав
        if obj.owner != user and not user.is_staff:
            raise PermissionDenied("У вас нет прав на этот файл")
        return obj
    
    def perform_destroy(self, instance):
        logger.info(f"Удаление файла: {instance.original_name} (ID: {instance.id}) пользователем {self.request.user.username}")
        instance.delete()
        logger.info(f"Файл {instance.original_name} успешно удален")


class FileSharingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSharingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        user_id = self.request.query_params.get('user_id')
        
        # Админ может видеть ссылки на файлы любого пользователя
        if user.is_staff or user.is_superuser:
            if user_id:
                return FileSharing.objects.filter(file__owner_id=user_id)
            return FileSharing.objects.all()
        
        return FileSharing.objects.filter(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        share = self.get_object()
        user = request.user
        user_id = request.query_params.get('user_id')
        
        # Проверка прав
        if share.created_by != user and not user.is_staff:
            return Response(
                {"error": "Вы можете отозвать только свои ссылки"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        file_name = share.file.original_name
        share.delete()

        logger.info(f"Пользователь {request.user.username} отозвал публичную ссылку для файла: {file_name}")

        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicShareViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicFileShareSerializer

    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)')
    def info(self, request, token=None):
        """Получение информации о файле (НЕ увеличивает счетчики)"""
        try:
            share = FileSharing.objects.get(share_token=token)
            serializer = self.get_serializer(share)
            return Response(serializer.data)
        except FileSharing.DoesNotExist:
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='(?P<token>[^/.]+)/record_view')
    def record_view(self, request, token=None):
        """
        Запись просмотра - увеличивает ТОЛЬКО счетчик просмотров
        POST /api/public/{token}/record_view/
        """
        try:
            
            share = FileSharing.objects.get(share_token=token)
            logger.info(f"📁 Найден файл: {share.file.original_name} (ID: {share.file.id})")
            logger.info(f"📊 Всего просмотров: {share.file.views_count}")
            
            old_views = share.file.views_count
            share.file.views_count += 1
            share.file.save(update_fields=['views_count'])
            
            logger.info(f"✅ Просмотры обновлены: {old_views} -> {share.file.views_count}")
            
            return Response({
                'status': 'ok',
                'views_count': share.file.views_count
            })
            
        except FileSharing.DoesNotExist:
            logger.error(f"❌ Share not found for token: {token}")
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"❌ Error: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)/preview')
    def preview(self, request, token=None):
        """
        Предпросмотр файла (НЕ увеличивает счетчики)
        GET /api/public/{token}/preview/
        """
        try:
            share = FileSharing.objects.get(share_token=token)
            
            # Возвращаем файл для предпросмотра без увеличения счетчиков
            return FileResponse(
                share.file.file.open('rb'),
                content_type=share.file.content_type or 'application/octet-stream'
            )
            
        except FileSharing.DoesNotExist:
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)/download')
    def download(self, request, token=None):
        """Скачивание файла (увеличивает счетчик скачиваний)"""
        try:
            share = FileSharing.objects.get(share_token=token)
            
            # Увеличиваем ТОЛЬКО счетчик скачиваний
            old_downloads = share.file.downloads_count
            share.file.downloads_count += 1
            share.file.last_downloaded_at = timezone.now()
            share.file.save(update_fields=['downloads_count', 'last_downloaded_at'])
            
            return FileResponse(
                share.file.file.open('rb'),
                as_attachment=True,
                filename=share.file.original_name
            )
        except FileSharing.DoesNotExist:
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    

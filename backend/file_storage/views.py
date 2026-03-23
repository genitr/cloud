import os
import logging

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import APIView, action
from rest_framework.response import Response
from django.http import FileResponse
from django.utils import timezone

from .models import Folder, File, FileSharing
from .serializers import (
    FileSharingSerializer,
    FolderSerializer, 
    FolderListSerializer, 
    FolderTreeSerializer,
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
        if not self.request.user.is_authenticated:
            logger.debug("Анонимный запрос к папкам, возвращаем пустой результат")
            return Folder.objects.none()
        
        logger.debug(f"Пользователь {self.request.user.username} запросил список папок")
        return Folder.objects.filter(owner=self.request.user)
    
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


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Возвращает файлы только текущего пользователя.
        """
        # Проверяем аутентификацию
        if not self.request.user.is_authenticated:
            logger.debug("Анонимный запрос к файлам, возвращаем пустой результат")
            return File.objects.none()
        
        # Получаем базовый queryset
        queryset = File.objects.filter(owner=self.request.user)
        
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
    def view(self, request, pk=None):
        """Увеличение счетчика просмотров (для API)"""
        file_obj = self.get_object()
        old_views = file_obj.views_count
        file_obj.increment_views()

        logger.info(f"Пользователь {request.user.username} просмотрел файл: {file_obj.original_name} (ID: {file_obj.id}). Просмотров: {old_views} -> {file_obj.views_count}")

        return Response({'status': 'ok', 'views_count': file_obj.views_count})
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Скачивание файла"""
        file_obj = self.get_object()
        
        # Проверяем права доступа
        if file_obj.owner != request.user:
            logger.warning(f"Пользователь {request.user.username} попытался скачать чужой файл: {file_obj.original_name} (владелец: {file_obj.owner.username})")
            return Response(
                {"error": "У вас нет прав на скачивание этого файла"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_downloads = file_obj.downloads_count
        file_obj.increment_downloads()

        logger.info(f"Пользователь {request.user.username} скачал файл: {file_obj.original_name} (ID: {file_obj.id}), размер: {file_obj.size} байт. Скачиваний: {old_downloads} -> {file_obj.downloads_count}")

        # Отдаем файл
        response = FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.original_name
        )
        return response
    
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """Создание ссылки для расшаривания"""
        file_obj = self.get_object()
        
        # Проверяем права
        if file_obj.owner != request.user:
            logger.warning(f"Пользователь {request.user.username} попытался расшарить чужой файл: {file_obj.original_name} (владелец: {file_obj.owner.username})")
            return Response(
                {"error": "Вы можете расшаривать только свои файлы"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Создаем расшаривание
        sharing = FileSharing.objects.create(
            file=file_obj,
            created_by=request.user,
        )

        logger.info(f"Пользователь {request.user.username} создал публичную ссылку для файла: {file_obj.original_name} (ID: {file_obj.id}), токен: {sharing.share_token[:8]}...")
        
        serializer = FileSharingSerializer(sharing, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """Обновление файла (имя, комментарий)"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Проверяем права
        if instance.owner != request.user:
            logger.warning(f"Пользователь {request.user.username} попытался отредактировать чужой файл: {instance.original_name} (владелец: {instance.owner.username})")
            return Response(
                {"error": "Вы можете редактировать только свои файлы"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        old_name = instance.original_name
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        logger.info(f"Пользователь {request.user.username} обновил файл: {old_name} -> {instance.original_name} (ID: {instance.id})")
        
        return Response(serializer.data)


class FileSharingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSharingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FileSharing.objects.filter(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        share = self.get_object()
        file_name = share.file.original_name
        share_token = share.share_token[:8]

        share.delete()

        logger.info(f"Пользователь {request.user.username} отозвал публичную ссылку для файла: {file_name} (токен: {share_token}...)")

        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicShareViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicFileShareSerializer

    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)')
    def info(self, request, token=None):
        """Получение информации о файле"""
        logger.info(f"Публичный запрос информации о файле по токену: {token[:8]}...")

        try:
            share = FileSharing.objects.get(share_token=token)
            logger.debug(f"Найден файл: {share.file.id} - {share.file.original_name}, текущие просмотры: {share.file.views_count}")
            
            # Увеличиваем счетчик просмотров
            old_views = share.file.views_count
            share.file.views_count += 1
            share.file.save(update_fields=['views_count'])
            
            logger.info(f"Увеличен счетчик просмотров для файла {share.file.original_name} (ID: {share.file.id}): {old_views} -> {share.file.views_count}")
            
            serializer = self.get_serializer(share)
            return Response(serializer.data)
            
        except FileSharing.DoesNotExist:
            logger.warning(f"Попытка доступа к несуществующей публичной ссылке: {token[:8]}...")
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)/download')
    def download(self, request, token=None):
        """Скачивание файла (увеличивает скачивания)"""
        logger.info(f"Публичный запрос на скачивание файла по токену: {token[:8]}...")
        try:
            share = FileSharing.objects.get(share_token=token)
            logger.debug(f"Найден файл: {share.file.id} - {share.file.original_name}, текущие скачивания: {share.file.downloads_count}")
            
            # Увеличиваем счетчик скачиваний
            old_downloads = share.file.downloads_count
            share.file.downloads_count += 1
            share.file.last_downloaded_at = timezone.now()
            share.file.save(update_fields=['downloads_count', 'last_downloaded_at'])
            
            logger.info(f"Файл {share.file.original_name} (ID: {share.file.id}) скачан по публичной ссылке. Скачиваний: {old_downloads} -> {share.file.downloads_count}")
            
            return FileResponse(
                share.file.file.open('rb'),
                as_attachment=True,
                filename=share.file.original_name
            )
            
        except FileSharing.DoesNotExist:
            logger.warning(f"Попытка скачивания по несуществующей публичной ссылке: {token[:8]}...")
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    

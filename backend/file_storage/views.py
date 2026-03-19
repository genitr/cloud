import os

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import APIView, action
from django.http import FileResponse
from rest_framework.response import Response

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

class FolderViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращает папки только текущего пользователя"""
        if not self.request.user.is_authenticated:
            return Folder.objects.none()
        
        return Folder.objects.filter(owner=self.request.user)
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия"""
        if self.action == 'create':
            return FolderCreateSerializer
        return FolderSerializer
    
    def perform_create(self, serializer):
        """Автоматически устанавливаем владельца"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        """Возвращает содержимое папки"""
        folder = self.get_object()
        
        # Получаем подпапки
        subfolders = folder.subfolders.all()
        folders_data = FolderSerializer(subfolders, many=True, context={'request': request}).data
        
        # Получаем файлы
        files = folder.files.all()
        files_data = FileSerializer(files, many=True, context={'request': request}).data
        
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
            return File.objects.none()
        
        # Получаем базовый queryset
        queryset = File.objects.filter(owner=self.request.user)
        
        # Дополнительные фильтры
        folder_id = self.request.query_params.get('folder')
        if folder_id:
            queryset = queryset.filter(folder_id=folder_id)
        
        content_type = self.request.query_params.get('type')
        if content_type:
            queryset = queryset.filter(content_type__startswith=content_type)
        
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
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Скачивание файла"""
        file_obj = self.get_object()
        
        # Проверяем права доступа
        if file_obj.owner != request.user:
            return Response(
                {"error": "У вас нет прав на скачивание этого файла"},
                status=status.HTTP_403_FORBIDDEN
            )
        
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
            return Response(
                {"error": "Вы можете расшаривать только свои файлы"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Создаем расшаривание
        sharing = FileSharing.objects.create(
            file=file_obj,
            created_by=request.user,
        )
        
        serializer = FileSharingSerializer(sharing, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class FileSharingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FileSharingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FileSharing.objects.filter(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        share = self.get_object()
        share.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicShareViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = PublicFileShareSerializer
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)')
    def info(self, request, token=None):
        """Получение информации о файле"""
        try:
            share = FileSharing.objects.get(share_token=token)
            share.record_access(request)
            serializer = self.get_serializer(share)
            return Response(serializer.data)
        except FileSharing.DoesNotExist:
            return Response(
                {"error": "Ссылка недействительна"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], url_path='(?P<token>[^/.]+)/download')
    def download(self, request, token=None):
        """Скачивание файла"""
        try:
            share = FileSharing.objects.get(share_token=token)
            share.record_access(request)
            share.downloads_count += 1
            share.save()
            
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

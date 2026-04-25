import logging
import os
import uuid

from django.conf import settings
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

def user_file_upload_path(instance, filename):
    """
    Функция для upload_to, использующая путь пользователя
    """

    # Используем путь пользователя из модели User
    user = instance.owner
    base_path = user.storage_path

    now = timezone.now()
    
    # Уникальное имя
    ext = filename.split('.')[-1].lower()
    new_filename = f"{uuid.uuid4().hex}.{ext}"

    # Собираем полный путь
    return os.path.join(
        base_path,
        str(now.year),
        str(now.month).zfill(2),
        new_filename
    )

User = get_user_model()

class Folder(models.Model):
    """Модель папки для загружаемых файлов"""

    name = models.CharField(
        max_length=255,
        verbose_name="Название",
    )
    parent_folder = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subfolders',
        verbose_name="Родительская папка",
    )
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name="Владелец",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Создано",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Обновлено",
    )

    class Meta:
        verbose_name = 'Папка'
        verbose_name_plural = 'Папки'
        unique_together = ['name', 'parent_folder', 'owner']
        
    def __str__(self):
        return self.name
    
    def get_full_path(self):
        """Возвращает логический путь"""
        if self.parent_folder:
            return f"{self.parent_folder.get_full_path()}/{self.name}"
        return self.name
    
    def delete(self, *args, **kwargs):
        """Рекурсивное удаление папки со всем содержимым и очистка пустых папок"""
        
        # Сохраняем путь к папке
        folder_path = None
        if hasattr(self, 'owner') and self.owner:
            folder_path = os.path.join(settings.FILE_STORAGE_ROOT, self.get_full_path())
        
        # Удаляем все файлы в папке
        for file in self.files.all():
            file.delete()
        
        # Удаляем все подпапки
        for subfolder in self.subfolders.all():
            subfolder.delete()
        
        # Удаляем запись о папке из БД
        super().delete(*args, **kwargs)
        
        # Удаляем физическую папку, если она пуста
        if folder_path and os.path.exists(folder_path):
            try:
                if not os.listdir(folder_path):
                    os.rmdir(folder_path)
                    logger.info(f"Удалена пустая папка: {folder_path}")
                    
                    # Очищаем родительские папки
                    self._cleanup_empty_directories(os.path.dirname(folder_path))
            except Exception as e:
                logger.error(f"Ошибка при удалении папки {folder_path}: {e}")
    
    def _cleanup_empty_directories(self, directory_path):
        """Рекурсивно удаляет пустые директории"""
        try:
            if not os.path.exists(directory_path):
                return
            
            storage_root = settings.FILE_STORAGE_ROOT
            
            # Не удаляем корневую папку
            if directory_path == storage_root:
                return
            
            if not os.listdir(directory_path):
                os.rmdir(directory_path)
                logger.info(f"Удалена пустая папка: {directory_path}")
                
                parent_dir = os.path.dirname(directory_path)
                if parent_dir != storage_root and parent_dir.startswith(storage_root):
                    self._cleanup_empty_directories(parent_dir)
                    
        except Exception as e:
            logger.error(f"Ошибка при удалении папки {directory_path}: {e}")


class File(models.Model):
    """Модель загружаемого файла"""

    file = models.FileField(
        upload_to=user_file_upload_path,
        verbose_name="Файл",
    )

    folder = models.ForeignKey(
        Folder, 
        on_delete=models.CASCADE,
        related_name='files',
        null=True,
        blank=True,
        verbose_name="Папка",
    )

    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        verbose_name="Владелец",
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Название",
    )
    original_name = models.CharField(
        max_length=255,
        editable=False,
        verbose_name="Оригинальное название",
    )
    size = models.BigIntegerField(
        null=True,
        blank=True,
        editable=False,
        verbose_name="Размер",
    )
    content_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        editable=False,
        verbose_name="Тип",
    )
    comment = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Комментарий",
    )
    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Загружено",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Обновлено",
    )

    downloads_count = models.PositiveIntegerField(
        default=0, 
        editable=False
    )
    views_count = models.PositiveIntegerField(
        default=0, 
        editable=False
    )
    last_downloaded_at = models.DateTimeField(
        null=True, 
        blank=True, 
        editable=False
    )

    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.original_name
    
    def save(self, *args, **kwargs):
        if self.file:
            # === Обработка имени и оригинального имени ===
            if not self.pk:
                self.original_name = self.file.name
                
                if not self.name:
                    self.name = os.path.splitext(self.file.name)[0]

            # === Определение размера ===
            if hasattr(self.file, 'size'):
                self.size = self.file.size
            
            # === Определение MIME-типа ===
            if not self.content_type and hasattr(self.file, 'read'):
                try:
                    import magic
                    file_data = self.file.read(1024)
                    self.file.seek(0)
                    self.content_type = magic.from_buffer(file_data, mime=True)

                except ImportError:
                    import mimetypes
                    self.content_type = mimetypes.guess_type(self.file.name)[0] or 'application/octet-stream'
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Удаление файла с диска и очистка пустых папок"""
        file_path = None
        
        # Сохраняем путь к файлу перед удалением
        if self.file and os.path.isfile(self.file.path):
            file_path = self.file.path
        
        # Удаляем запись из БД
        super().delete(*args, **kwargs)
        
        # Удаляем физический файл и пустые папки
        if file_path:
            try:
                # Удаляем файл
                os.remove(file_path)
                logger.info(f"Физический файл удален: {file_path}")
                
                # Удаляем пустые родительские папки
                self._cleanup_empty_directories(os.path.dirname(file_path))
                
            except Exception as e:
                logger.error(f"Ошибка при удалении файла {file_path}: {e}")
    
    def _cleanup_empty_directories(self, directory_path):
        """Рекурсивно удаляет пустые директории"""
        try:
            # Проверяем, существует ли директория
            if not os.path.exists(directory_path):
                return
            
            # Проверяем, пуста ли директория
            if not os.listdir(directory_path):
                os.rmdir(directory_path)
                logger.info(f"Удалена пустая папка: {directory_path}")
                
                # Рекурсивно проверяем родительскую папку
                parent_dir = os.path.dirname(directory_path)
                
                # Не удаляем корневую папку storage
                storage_root = settings.FILE_STORAGE_ROOT
                if parent_dir != storage_root and parent_dir.startswith(storage_root):
                    self._cleanup_empty_directories(parent_dir)
                    
        except Exception as e:
            logger.error(f"Ошибка при удалении папки {directory_path}: {e}")
    
    def get_logical_path(self):
        """Логический путь с учетом папок"""
        if self.folder:
            return f"{self.folder.get_full_path()}/{self.name}"
        return f"/{self.name}"
    
    def get_physical_path(self):
        """Физический путь на диске"""
        return self.file.path
    
    def increment_downloads(self):
        """Увеличить счетчик скачиваний"""
        self.downloads_count += 1
        self.last_downloaded_at = timezone.now()
        self.save(update_fields=['downloads_count', 'last_downloaded_at'])
    
    def increment_views(self):
        """Увеличить счетчик просмотров"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class FileSharing(models.Model):
    """Модель для расшаривания файла"""

    file = models.ForeignKey(
        File,
        on_delete=models.CASCADE,
        related_name='shares',
        verbose_name='Файл'
    )
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_shares',
        verbose_name='Создатель'
    )
    
    share_token = models.UUIDField(
        unique=True,
        default=uuid.uuid4,
        editable=False,
        db_index=True,
        verbose_name='Токен доступа',
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создано', 
    )

    class Meta:
        verbose_name = 'Расшаривание'
        verbose_name_plural = 'Расшаривания'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['share_token']),
        ]
    
    def __str__(self):
        return f"{self.file.name} - {self.share_token}"
    
    @property
    def share_url(self):
        """Полная ссылка для доступа"""
        return f"/share/{self.share_token}/"


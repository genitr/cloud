import os
import uuid

from django.conf import settings
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

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
    
    def get_logical_path(self):
        """Логический путь с учетом папок"""
        if self.folder:
            return f"{self.folder.get_full_path()}/{self.name}"
        return f"/{self.name}"
    
    def get_physical_path(self):
        """Физический путь на диске"""
        return self.file.path


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
    
    downloads_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Скачиваний',
    )
    
    views_count = models.PositiveIntegerField(
        default=0,
        verbose_name='Просмотров',
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Создано', 
    )

    last_accessed = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Последний доступ',
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
    
    def record_access(self, request=None):
        """Записывает факт доступа к файлу"""
        self.views_count += 1
        if request and request.method == 'GET' and 'download' in request.path:
            self.downloads_count += 1
        self.last_accessed = timezone.now()
        self.save(update_fields=['views_count', 'downloads_count', 'last_accessed'])

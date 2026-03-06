import os

from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """Модель пользователя"""

    storage_path = models.CharField(
        max_length=255,
        unique=True,
        blank=True,
        verbose_name="Путь к хранилищу",
        help_text='Уникальный путь для файлов пользователя'
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        
    def __str__(self):
        return self.get_username()

    def save(self, *args, **kwargs):
        """Автоматически генерируем путь при создании"""
        if not self.storage_path:
            self.storage_path = self.generate_storage_path()
        super().save(*args, **kwargs)
    
    def generate_storage_path(self):
        """
        Генерирует уникальный путь для хранилища пользователя
        на основе id и username
        """
        timestamp = timezone.now().strftime('%Y%m')
        return f"users/{self.id}_{self.username}_{timestamp}/"
    
    @property
    def full_storage_path(self):
        """Полный путь к хранилищу пользователя"""
        return os.path.join(settings.FILE_STORAGE_ROOT, self.storage_path)

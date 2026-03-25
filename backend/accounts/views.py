import logging

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model, logout as django_logout
from django.db.models import Sum, Count
from .serializers import (
    UserSerializer, 
    UserDetailSerializer, 
    UserUpdateSerializer,
    RegistrationSerializer,
    UserStorageSerializer,
    LoginSerializer
)
from .permissions import IsAdminUser


# Настройка логгера
logger = logging.getLogger(__name__)

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления пользователями.
    """
    
    queryset = User.objects.all().order_by('-date_joined')
    
    def get_serializer_class(self):
        """
        Выбор сериализатора в зависимости от действия.
        """
        if self.action == 'create':
            return RegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'retrieve' and self.request.user.is_staff:
            return UserDetailSerializer
        elif self.action == 'storage_info':
            return UserStorageSerializer
        elif self.action == 'me':
            return UserDetailSerializer
        else:
            return UserSerializer
    
    def get_permissions(self):
        """
        Настройка прав доступа для разных действий.
        """
        if self.action == 'create':
            # Регистрация доступна всем
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'destroy', 'toggle_active']:
            # Только админы могут видеть список и удалять пользователей
            permission_classes = [IsAdminUser]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            # Владелец или админ
            permission_classes = [IsAdminUser]
        elif self.action == 'me':
            # Только авторизованные
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'storage_info':
            # Владелец или админ
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Ограничение queryset в зависимости от прав.
        """
        user = self.request.user
        
        # Анонимные пользователи ничего не видят
        if not user.is_authenticated:
            logger.debug(f"Анонимный запрос к queryset, возвращаем пустой результат")
            return User.objects.none()
        
        # Админы видят всех
        if user.is_staff or user.is_superuser:
            logger.debug(f"Админ {user.username} запросил полный список пользователей")
            return User.objects.all()
        
        # Обычные пользователи видят только себя
        if self.action == 'list':
            logger.debug(f"Пользователь {user.username} запросил список, возвращаем только себя")
            return self.queryset.filter(id=user.id)
        
        return self.queryset
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """
        Эндпоинты для работы с текущим пользователем.
        
        GET /api/users/me/ - получить свой профиль

        PUT /api/users/me/ - полное обновление профиля

        PATCH /api/users/me/ - частичное обновление профиля
        """
        user = request.user
        
        if request.method == 'GET':
            logger.info(f"Пользователь {user.username} (ID: {user.id}) запросил свой профиль")
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            logger.info(f"Пользователь {user.username} (ID: {user.id}) обновляет свой профиль")
            logger.debug(f"Данные обновления: {request.data}")

            serializer = UserUpdateSerializer(
                user,
                data=request.data,
                partial=request.method == 'PATCH',
                context={'request': request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()

            logger.info(f"Профиль пользователя {user.username} (ID: {user.id}) успешно обновлен")
            
            # Возвращаем обновленные данные
            detail_serializer = UserDetailSerializer(user)
            return Response(detail_serializer.data)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def login(self, request):
        """
        Вход в систему и получение токена.
        
        POST /api/users/login/
        {
            "username": "john",
            "password": "secret123"
        }
        """
        username = request.data.get('username', 'unknown')
        logger.info(f"Попытка входа пользователя: {username}")

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Удаляем старый токен и создаем новый
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)

        logger.info(f"Пользователь {user.username} (ID: {user.id}) успешно вошел в систему.")
        
        return Response({
            'success': True,
            'message': 'Вход выполнен успешно',
            'data': {
                'user': UserDetailSerializer(user, context={'request': request}).data,
                'token': token.key
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """
        Выход из профиля пользователя (удаление токена).
        
        POST /api/users/logout/
        """
        user = request.user
        logger.info(f"Пользователь {user.username} (ID: {user.id}) выходит из системы")

        try:
            # Удаляем токен
            request.user.auth_token.delete()
            django_logout(request)

            logger.info(f"Пользователь {user.username} (ID: {user.id}) успешно вышел из системы")
            
            return Response({
                'message': 'Успешный выход из системы'
            }, status=status.HTTP_200_OK)
        except (AttributeError, Token.DoesNotExist) as e:
            logger.warning(f"Ошибка при выходе пользователя {user.username}: {str(e)}")
            return Response({
                'message': 'Уже выполнен выход'
            }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def storage(self, request, pk=None):
        """
        Информация о хранилище пользователя.
        
        GET /api/users/{id}/storage/
        """
        user = self.get_object()
        logger.info(f"Запрос информации о хранилище пользователя {user.username} (ID: {user.id}) от {request.user.username}")
        
        # Получаем статистику по файлам
        from file_storage.models import File, Folder
        
        files = File.objects.filter(owner=user)
        folders = Folder.objects.filter(owner=user)
        
        total_size = files.aggregate(Sum('size'))['size__sum'] or 0
        files_count = files.count()
        folders_count = folders.count()

        logger.debug(f"Статистика хранилища для {user.username}: файлов={files_count}, папок={folders_count}, размер={total_size} байт")
        
        # Статистика по типам файлов
        files_by_type = files.values('content_type').annotate(
            count=Count('id'),
            total_size=Sum('size')
        ).order_by('-total_size')
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'storage_path': user.storage_path,
            'full_storage_path': user.full_storage_path,
            'storage_url': f"/media/{user.storage_path}" if user.storage_path else None,
            'statistics': {
                'total_files': files_count,
                'total_folders': folders_count,
                'total_size': total_size,
                'total_size_formatted': self._format_size(total_size),
                'used_space': {
                    'bytes': total_size,
                    'human_readable': self._format_size(total_size)
                }
            },
            'files_by_type': [
                {
                    'type': item['content_type'] or 'unknown',
                    'count': item['count'],
                    'total_size': item['total_size'],
                    'total_size_formatted': self._format_size(item['total_size'])
                }
                for item in files_by_type
            ],
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def toggle_active(self, request, pk=None):
        """
        Блокировка/разблокировка пользователя (только для админов).
        
        POST /api/users/{id}/toggle_active/
        """
        user = self.get_object()
        admin = request.user
        # Нельзя заблокировать самого себя
        if user == request.user:
            logger.warning(f"Пользователь {admin.username} попытался заблокировать самого себя")
            return Response({
                'error': 'Нельзя заблокировать самого себя'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Меняем статус
        user.is_active = not user.is_active
        user.save()
        
        # Если блокируем - удаляем все токены пользователя
        if not user.is_active:
            token_count = Token.objects.filter(user=user).count()
            Token.objects.filter(user=user).delete()
            logger.info(f"Админ {admin.username} заблокировал пользователя {user.username} (ID: {user.id}). Удалено токенов: {token_count}")
        else:
            logger.info(f"Админ {admin.username} разблокировал пользователя {user.username} (ID: {user.id})")

        return Response({
            'id': user.id,
            'username': user.username,
            'is_active': user.is_active,
            'message': f"Пользователь {'активирован' if user.is_active else 'заблокирован'}"
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        """
        Общая статистика по пользователям (для админов).
        
        GET /api/users/stats/
        """
        if not request.user.is_staff:
            logger.warning(f"Пользователь {request.user.username} попытался получить статистику без прав администратора")
            return Response({
                'error': 'Только для администраторов'
            }, status=status.HTTP_403_FORBIDDEN)
        
        logger.info(f"Админ {request.user.username} запросил статистику пользователей")

        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        
        # Пользователи за последние 30 дней
        from django.utils import timezone
        from datetime import timedelta
        
        last_month = timezone.now() - timedelta(days=30)
        new_users = User.objects.filter(date_joined__gte=last_month).count()
        
        logger.debug(f"Статистика: всего={total_users}, активных={active_users}, сотрудников={staff_users}, новых={new_users}")

        return Response({
            'total_users': total_users,
            'active_users': active_users,
            'inactive_users': total_users - active_users,
            'staff_users': staff_users,
            'new_users_last_30_days': new_users,
            'registration_by_month': self._get_registration_stats()
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def make_admin(self, request, pk=None):
        """
        Назначить пользователя администратором.
        
        POST /api/users/{id}/make_admin/
        """
        admin = request.user
        user = self.get_object()
        
        # Нельзя сделать админом самого себя?
        if user == request.user:
            logger.warning(f"Пользователь {admin.username} попытался назначить себя администратором через make_admin")
            return Response({
                'error': 'Нельзя изменить свои права через этот эндпоинт'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_staff = True
        user.save()

        logger.info(f"Админ {admin.username} назначил пользователя {user.username} (ID: {user.id}) администратором")
        
        return Response({
            'message': f'Пользователь {user.username} назначен администратором',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def remove_admin(self, request, pk=None):
        """
        Снять права администратора.
        
        POST /api/users/{id}/remove_admin/
        """
        user = self.get_object()
        admin = request.user
        
        if user == request.user:
            logger.warning(f"Пользователь {admin.username} попытался снять права администратора с самого себя")
            return Response({
                'error': 'Нельзя снять права администратора с самого себя'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_staff = False
        user.save()
        
        logger.info(f"Админ {admin.username} снял права администратора с пользователя {user.username} (ID: {user.id})")

        return Response({
            'message': f'Права администратора сняты с пользователя {user.username}',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_staff': user.is_staff
            }
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def make_superuser(self, request, pk=None):
        """
        Назначить пользователя суперпользователем.
        
        POST /api/users/{id}/make_superuser/
        """
        user = self.get_object()
        admin = request.user
        
        if user == request.user:
            logger.warning(f"Пользователь {admin.username} попытался назначить себя суперпользователем")
            return Response({
                'error': 'Нельзя изменить свои права через этот эндпоинт'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_staff = True
        user.is_superuser = True
        user.save()

        logger.info(f"Админ {admin.username} назначил пользователя {user.username} (ID: {user.id}) суперпользователем")
        
        return Response({
            'message': f'Пользователь {user.username} назначен суперпользователем',
            'user': {
                'id': user.id,
                'username': user.username,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def check_permissions(self, request):
        """Проверить свои права"""
        user = request.user
        logger.debug(f"Пользователь {user.username} проверил свои права")
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'is_authenticated': user.is_authenticated,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'permissions': {
                'can_view_all_users': user.is_staff,
                'can_edit_users': user.is_staff,
                'can_delete_users': user.is_superuser,
                'can_make_admin': user.is_superuser
            }
        })
    
    def _format_size(self, size):
        """Форматирование размера в человеко-читаемый вид"""
        if not size:
            return '0 Б'
        
        for unit in ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} ПБ"
    
    def _get_registration_stats(self):
        """Статистика регистраций по месяцам"""
        from django.db.models import Count
        from django.db.models.functions import TruncMonth
        
        return User.objects.annotate(
            month=TruncMonth('date_joined')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')[:12]
    
    def perform_create(self, serializer):
        """Создание пользователя"""
        user = serializer.save()
        
        # Создаем токен автоматически
        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"Создан новый пользователь: {user.username} (ID: {user.id}). Токен {'создан' if created else 'уже существовал'}")
    
    def perform_destroy(self, instance):
        """Удаление пользователя (с очисткой)"""
        logger.warning(f"Удаление пользователя {instance.username} (ID: {instance.id}) администратором {self.request.user.username}")

        instance.delete()
        logger.info(f"Пользователь {instance.username} (ID: {instance.id}) успешно удален")
    
    def create(self, request, *args, **kwargs):
        """
        Переопределяем create для возврата токена при регистрации.
        POST /api/users/ - регистрация нового пользователя
        """
        username = request.data.get('username', 'unknown')
        email = request.data.get('email', 'unknown')
        logger.info(f"Попытка регистрации нового пользователя: {username} (email: {email})")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Создаем пользователя (токен создается в perform_create)
        self.perform_create(serializer)
        
        # Получаем созданного пользователя
        user = serializer.instance
        
        # Получаем токен
        token, created = Token.objects.get_or_create(user=user)
        
        # Сериализуем пользователя
        user_data = UserDetailSerializer(user, context={'request': request}).data
        logger.info(f"Пользователь {user.username} (ID: {user.id}) успешно зарегистрирован")
        
        # Добавляем токен к ответу
        response_data = {
            'user': user_data,
            'token': token.key,
            'message': 'Регистрация выполнена успешно'
        }
        
        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

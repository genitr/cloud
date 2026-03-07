from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Базовый сериализатор для списка пользователей"""

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'is_active', 
            'date_joined'
        ]
        read_only_fields = ['id', 'is_active', 'date_joined']
    

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
            'date_joined', 
            'last_login'
        ]
        read_only_fields = [
            'id', 
            'storage_path', 
            'is_active', 
            'is_staff',
            'date_joined', 
            'last_login'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_storage_url(self, obj):
        if obj.storage_path:
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
        read_only_fields = ['token']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
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
        
        # Создаем токен
        Token.objects.create(user=user)
        
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
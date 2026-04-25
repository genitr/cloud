# 📁 Cloud Storage - Backend

Бэкенд для облачного хранилища файлов на Django REST Framework.

## 🛠 Технологии
- **Django 5.x** - основной фреймворк
- **Django REST Framework** - построение API
- **PostgreSQL** - база данных
- **Gunicorn** - WSGI сервер
- **django-cors-headers** - CORS поддержка


## 🚀 Установка

### Локальная разработка

```bash
# Клонирование
git clone https://github.com/genitr/cloud.git
cd cloud/backend

# Установка зависимостей
pip install -r requirements.txt

# Применение миграций
python manage.py makemigrations
python manage.py migrate

# Создание суперпользователя
python manage.py createsuperuser

# Запуск
python manage.py runserver

#Содержимое .env
DJANGO_SECRET_KEY
DEBUG
ALLOWED_HOSTS
CORS_ALLOW_ALL
CORS_ALLOWED_ORIGINS
CSRF_COOKIE_SECURE
SESSION_COOKIE_SECURE
DB_USER
DB_PASS
DB_HOST
DB_PORT
DB_NAME
```

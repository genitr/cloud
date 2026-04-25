# 🐍 Cloud Storage Backend

Бэкенд-часть облачного хранилища, реализованная на Django и Django REST Framework.

## 🛠 Технологии
- **Django 5.x**
- **Django REST Framework**
- **PostgreSQL**
- **Session Authentication**
- **CSRF Protection**
- **Gunicorn**
- **django-cors-headers**

## 📦 Установка и запуск

### 1. Создание виртуального окружения

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows
```

### 2. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 3. Настройка переменных окружения

```bash
# Создайте файл .env в корне проекта:
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
CSRF_COOKIE_SECURE=False
SESSION_COOKIE_SECURE=False
DB_USER=postgres
DB_PASS=your-password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_cloud
```

### 4. Настройка базы данных

```bash
# Создание базы данных PostgreSQL
sudo -u postgres psql
CREATE DATABASE my_cloud;
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE my_cloud TO your_user;
\q
```

### 5. Миграции и создание суперпользователя

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 6. Запуск сервера разработки

```bash
python manage.py runserver
```

## 📁 Структура проекта

```bash
cloud/
├── 📂 backend/
│   ├── 📂 accounts/
│   │   ├── 📂 migrations/
│   │   ├── 📄 __init__.py
│   │   ├── 📄 admin.py
│   │   ├── 📄 apps.py
│   │   ├── 📄 models.py
│   │   ├── 📄 permissions.py
│   │   ├── 📄 serializers.py
│   │   ├── 📄 tests.py
│   │   ├── 📄 urls.py
│   │   └── 📄 views.py
│   ├── 📂 config/
│   │   ├── 📄 __init__.py
│   │   ├── 📄 asgi.py
│   │   ├── 📄 settings.py
│   │   ├── 📄 urls.py
│   │   └── 📄 wsgi.py
│   ├── 📂 file_storage/
│   │   ├── 📂 migrations/
│   │   ├── 📄 __init__.py
│   │   ├── 📄 admin.py
│   │   ├── 📄 apps.py
│   │   ├── 📄 models.py
│   │   ├── 📄 serializers.py
│   │   ├── 📄 tests.py
│   │   ├── 📄 urls.py
│   │   └── 📄 views.py
│   ├── 📄 manage.py
│   ├── 📄 README.md
│   ├── 📄 requirements.txt
├── 📂 frontend/
```

## 🔌 API Endpoints

**Аутентификация и пользователи (/api/users/)**
| Метод	| Endpoint	| Описание	| Доступ |
|:-------|:-----------|:-----------|:--------|
| POST	| /api/users/	| Регистрация	| Все |
| POST	| /api/users/login/	| Вход	| Все |
| POST	| /api/users/logout/	| Выход	| Авторизованные |
| GET	| /api/users/me/	| Текущий пользователь	| Авторизованные |
| GET	| /api/users/	| Список пользователей	| Админ |
| DELETE	| /api/users/{id}/	| Удаление пользователя	| Админ |
| POST	| /api/users/{id}/toggle_active/	| Блокировка/разблокировка	| Админ |
| POST	| /api/users/{id}/make_admin/	| Назначение админом	| Админ |
| POST	| /api/users/{id}/remove_admin/	| Снятие прав админа	| Админ |
| GET	| /api/users/stats/	| Статистика	| Админ |
| GET	| /api/users/{id}/storage/	| Информация о хранилище	| Админ |

**Файлы и папки (/api/files/, /api/folders/)**
| Метод	 | Endpoint	  | Описание   | Доступ  |
|:-------|:-----------|:-----------|:--------|
GET |	/api/files/ |	Список файлов |	Авторизованные
POST |	/api/files/ |	Загрузка файла |	Авторизованные
GET |	/api/files/{id}/ |	Информация о файле |	Владелец/Админ
PATCH |	/api/files/{id}/ |	Обновление файла |	Владелец/Админ
DELETE |	/api/files/{id}/ |	Удаление файла |	Владелец/Админ
GET |	/api/files/{id}/preview/ |	Просмотр файла |	Владелец/Админ
POST |	/api/files/{id}/record_view/ |	Запись просмотра |	Владелец/Админ
GET |	/api/files/{id}/download/ |	Скачивание файла |	Владелец/Админ
POST |	/api/files/{id}/share/ |	Создание ссылки |	Владелец/Админ
GET |	/api/folders/ |	Список папок |	Авторизованные
POST |	/api/folders/ |	Создание папки |	Авторизованные
GET |	/api/folders/{id}/contents/ |	Содержимое папки |	Владелец/Админ
DELETE |	/api/folders/{id}/ |	Удаление папки |	Владелец/Админ

**Публичные ссылки (/api/public/)**
| Метод	| Endpoint	| Описание	| Доступ |
|-------|-----------|-----------|--------|
GET |	/api/public/{token}/ |	Информация о файле |	Все
GET |	/api/public/{token}/preview/ |	Предпросмотр |	Все
POST |	/api/public/{token}/record_view/ |	Запись просмотра |	Все
GET |	/api/public/{token}/download/ |	Скачивание файла |	Все

## 🔒 Безопасность
- Аутентификация через сессии Django
- CSRF защита для всех небезопасных методов
- Разграничение прав доступа на уровне API
- Физическое удаление файлов с диска
- Очистка пустых директорий

## 🐛 Отладка
Для включения детального логирования измените настройки в settings.py:

```bash
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```
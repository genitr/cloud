# ☁️ Cloud Storage App - Облачное хранилище

Веб-приложение для управления файлами в облаке с поддержкой пользователей, администраторов и публичных ссылок.

## 🛠 Технологии

### Бэкенд
- **Django** - веб-фреймворк
- **Django REST Framework** - создание API
- **PostgreSQL** - база данных
- **Session Authentication** - аутентификация через сессии
- **CSRF Protection** - защита от межсайтовых запросов
- **Gunicorn** - WSGI сервер
- **Nginx** - веб-сервер и reverse proxy

### Фронтенд
- **React** - библиотека для UI
- **TypeScript** - типизация
- **Redux Toolkit** - управление состоянием
- **React Router** - маршрутизация
- **Vite** - сборка проекта
  
## ✨ Функциональность

- ✅ Регистрация и авторизация пользователей
- ✅ Загрузка и скачивание файлов
- ✅ Публичные ссылки для файлов
- ✅ Административная панель
- ✅ Управление пользователями (блокировка, назначение прав)
- ✅ Статистика хранилища

## 🏗 Структура проекта

```
cloud/
├── 📂 backend/
│   ├── 📂 accounts/
│   ├── 📂 config/
│   ├── 📂 file_storage/
│   ├── 📄 manage.py
│   ├── 📄 **README.md**
│   ├── 📄 requirements.txt
├── 📂 frontend/
│   ├── 📁 public/
│   ├── 📁 src/
│   │   ├── 📂 assets/
│   │   ├── 📂 components/
│   │   ├── 📂 hooks/
│   │   ├── 📂 Layouts/
│   │   ├── 📂 pages/
│   │   ├── 📂 routes/
│   │   ├── 📂 store/
│   │   └── 📂 utils/
│   │   ├── 📄 types.ts
│   │   ├── 📄 index.css
│   │   ├── 📄 index.tsx
│   ├── 📄 eslint.config.js
│   ├── 📄 index.html
│   ├── 📄 **package-lock.json**
│   ├── 📄 **package.json**
│   ├── 📄 **README.md**
│   ├── 📄 tsconfig.app.json
│   ├── 📄 **tsconfig.json**
│   ├── 📄 tsconfig.node.json
│   └── 📄 vite.config.ts
└── 📄 **README.md**
```
## 🚀 Быстрый старт

### Требования
- Python 3.10 или выше
- Node.js 18 или выше
- PostgreSQL 14 или выше

### Установка и запуск

#### Клонирование репозитория
```bash
git clone https://github.com/genitr/cloud.git
```

#### Настройка бэкенда
```bash
cd cloud/backend
python -m venv venv

# Активация окружения
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Установка зависимостей
pip install -r requirements.txt

# Создайте .env файл с вашими настройками
DJANGO_SECRET_KEY
DEBUG                   # True/False
ALLOWED_HOSTS
CORS_ALLOWED_ORIGINS
CSRF_COOKIE_SECURE      # True/False
SESSION_COOKIE_SECURE   # True/False
DB_USER
DB_PASS
DB_HOST
DB_PORT
DB_NAME

# Примените миграции и протестируйте сервер
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Настройка фронтенда
```bash
cd cloud/frontend
npm install
npm run dev
```
---
#### Приложение будет доступно:

`Фронтенд:` http://localhost:5173

`Бэкенд API:` http://localhost:8000/api/

`Django Admin:` http://localhost:8000/admin/

---

### 📝 Лицензия
MIT

---
### 👥 Авторы



Genitr - GitHub

---
### 🙏 Благодарности

Django REST Framework

React community

PostgreSQL

---
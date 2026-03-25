# ☁️ Cloud Storage - Облачное хранилище файлов

Веб-приложение для хранения, управления и обмена файлами в облаке. Проект состоит из бэкенда на Django REST Framework и фронтенда на React с TypeScript.

## 🚀 Демо
- Фронтенд: `http://194.67.100.138`
- Админка Django: `http://194.67.100.138/admin`
- API: `http://194.67.100.138/api`

## 📋 Содержание
- [☁️ Cloud Storage - Облачное хранилище файлов](#️-cloud-storage---облачное-хранилище-файлов)
  - [🚀 Демо](#-демо)
  - [📋 Содержание](#-содержание)
  - [🛠 Технологии](#-технологии)
    - [Бэкенд](#бэкенд)
    - [Фронтенд](#фронтенд)
  - [✨ Функциональность](#-функциональность)
  - [🏗 Структура проекта](#-структура-проекта)
  - [📦 Установка и запуск (локально)](#-установка-и-запуск-локально)
    - [Требования](#требования)
    - [Бэкенд](#бэкенд-1)

## 🛠 Технологии

### Бэкенд
- **Django 5.x** - веб-фреймворк
- **Django REST Framework** - создание API
- **PostgreSQL** - база данных
- **Gunicorn** - WSGI сервер
- **Nginx** - веб-сервер и reverse proxy

### Фронтенд
- **React 18** - библиотека для UI
- **TypeScript** - типизация
- **Redux Toolkit** - управление состоянием
- **Vite** - сборка проекта

## ✨ Функциональность

- ✅ Регистрация и авторизация пользователей
- ✅ Загрузка и скачивание файлов
- ✅ Создание и управление папками
- ✅ Публичные ссылки для файлов
- ✅ Административная панель
- ✅ Управление пользователями (блокировка, назначение прав)
- ✅ Статистика хранилища

## 🏗 Структура проекта
cloud-storage/
├── backend/ # Django проект
│ ├── config/ # Настройки Django
│ ├── accounts/ # Приложение пользователей
│ ├── file_storage/ # Приложение файлового хранилища
│ ├── staticfiles/ # Собранная статика
│ ├── storage/ # хранилище файлов
│ ├── requirements.txt # Зависимости Python
│ └── .env # Переменные окружения
├── frontend/ # React проект
│ ├── src/ # Исходный код
│ ├── public/ # Публичные файлы
│ ├── package.json # Зависимости Node.js
│ └── vite.config.ts # Конфигурация Vite
└── README.md # Документация


## 📦 Установка и запуск (локально)

### Требования
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Бэкенд

```bash
# Установка пакетов
sudo apt update
sudo apt install python3-pip python3-venv postgresql
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

#зависимости для компиляции psycopg2
sudo apt install libpq-dev python3-dev build-essential -y


# Создание и активация виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt
pip install gunicorn

# Настройка базы данных PostgreSQL
sudo su postgres
psql

CREATE USER user_name WITH PASSWORD 'password';
ALTER USER user_name WITH SUPERUSER;

CREATE DATABASE user_name;

#перезаходим в psql под новым пользователем и создаем базу данных для проекта
\q
exit
psql
CREATE DATABASE cloud;

# Клонирование репозитория
git clone https://github.com/genitr/cloud.git
cd cloud/backend

#создание и активация виртуального окружения
python3 -m venv .venv
source .venv/bin/activate

#установка зависимостей python
pip install -r requirements.txt
pip install gunicorn

#создание и редактирование файла .env
nano .env

#Содержимое .env
DJANGO_SECRET_KEY
DEBUG
ALLOWED_HOSTS
CORS_ALLOW_ALL
CORS_ALLOWED_ORIGINS
DB_USER
DB_PASS
DB_HOST
DB_PORT
DB_NAME

#создать директории
mkdir static
mkdir staticfiles
mkdir storage

#создание миграций и суперпользователя
python manage.py migrate
python manage.py createsuperuser

#установка зависимостей javascript
npm install

#сборка
npm run build

#установка и настройка NGINX
sudo apt install nginx

#запуск NGINX
sudo systemctl start nginx

#создание сервиса gunicorn
sudo nano /etc/systemd/system/gunicorn.service

#содержимое gunicorn.service
[Unit]
Description=gunicorn service
After=network.target

[Service]
User=genitr
Group=www-data
WorkingDirectory=/home/user_name/cloud/backend
Environment="PATH=/home/user_name/cloud/backend/.venv/bin"
EnvironmentFile=/home/user_name/cloud/backend/.env
ExecStart=/home/user_name/cloud/backend/.venv/bin/gunicorn --workers 3 --bind unix:/home/user_name/cloud/backend/config/project.sock config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target


#запускаем и активируем сервис gunicorn
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn

#настраиваем NGINX
sudo nano /etc/nginx/sites-available/cloud

#содержимое файла конфигурации cloud
server {
    listen 80;
    server_name server_ip;

    # React статика (фронтенд)
    location / {
        root /home/user_name/cloud/frontend/dist;
        try_files $uri /index.html;

        # Кэширование статических ассетов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Статика Django (админка, rest_framework)
    location /static/ {
        alias /home/user_name/cloud/backend/staticfiles/;
    }

    # Медиа файлы (если есть)
    location /media/ {
        alias /home/user_name/cloud/backend/media/;
    }

    # Django API
    location /api/ {
        proxy_pass http://unix:/home/user_name/cloud/backend/config/project.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django админка
    location /admin/ {
        proxy_pass http://unix:/home/user_name/cloud/backend/config/project.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}


#включаем сайт
sudo ln -s /etc/nginx/sites-available/cloud /etc/nginx/sites-enabled
sudo systemctl stop nginx
sudo systemctl start nginx

#добавляем NGINX в фаервол
sudo ufw allow 'Nginx Full'
```

📝 Лицензия
MIT

👥 Авторы
Genitr - GitHub

🙏 Благодарности
Django REST Framework

React community

PostgreSQL

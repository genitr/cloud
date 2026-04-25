# 🚀 Деплой проекта на VPS (reg.ru)
**Подробная инструкция**

---

## 📋 Предварительные требования
- VPS сервер (Ubuntu 24.04 LTS)
- Домен или IP-адрес
- Базовые знания командной строки

## 🔌 Подключение к серверу

```bash
ssh root@123.45.67.890
```

## 👤 Создание нового пользователя (рекомендуется)

```bash
# Создание пользователя
adduser your_user

# Предоставление прав sudo
usermod your_user -aG sudo

# Переключение на нового пользователя
ssh your_user@123.45.67.890
```

## 🛠 Настройка сервера
### Установка необходимых пакетов

```bash
# Проверка установленных пакетов
python3 --version
git --version

# Обновление пакетного менеджера
sudo apt update

# Установка Python и инструментов
sudo apt install -y python3-pip python3-venv

# Установка PostgreSQL
sudo apt install -y postgresql

# Зависимости для psycopg2
sudo apt install -y libpq-dev python3-dev build-essential

# Установка Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Установка Nginx
sudo apt install -y nginx
```

### Проверка и запуск сервисов

```bash
# Проверка PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql

# Проверка Nginx
sudo systemctl status nginx
sudo systemctl start nginx
```

## 🗄 Настройка базы данных

```bash
# Переключение на пользователя postgres
sudo su postgres
psql

# В psql выполнить:
CREATE USER your_user WITH PASSWORD 'ваш_пароль';
ALTER USER your_user WITH SUPERUSER;
CREATE DATABASE my_cloud;
\q
exit
```

## 📦 Клонирование проекта

```bash
# Переход в домашнюю директорию
cd ~

# Клонирование репозитория
git clone https://github.com/genitr/cloud.git
cd cloud
```

## 🐍 Настройка бэкенда

```bash
# Переход в папку бэкенда
cd backend

# Создание и активация виртуального окружения
python3 -m venv .venv
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Создание необходимых директорий
mkdir -p static staticfiles storage media

# Создание файла .env
nano .env
```

### Миграции и статика

```bash
# Применение миграций
python manage.py migrate

# Сбор статики
python manage.py collectstatic

# Тестовый запуск
python manage.py runserver 0.0.0.0:8000

# Если порт занят, освободить его
fuser -k 8000/tcp
```

## ⚛️ Настройка фронтенда

```bash
# Переход в папку фронтенда
cd ../frontend

# Установка зависимостей
npm install

# Создание .env файла для фронтенда
sudo nano .env # "VITE_API_URL=http://ваш_ip_адрес/api"

# Сборка проекта
npm run build
```

## 🚀 Настройка Gunicorn
### Создание сервиса Gunicorn

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

### Содержимое gunicorn.service

```bash
[Unit]
Description=gunicorn service
After=network.target

[Service]
User=your_user
Group=www-data
WorkingDirectory=/home/your_user/cloud/backend
Environment="PATH=/home/your_user/cloud/backend/.venv/bin"
EnvironmentFile=/home/your_user/cloud/backend/.env
ExecStart=/home/your_user/cloud/backend/.venv/bin/gunicorn --workers 3 --bind unix:/home/your_user/cloud/backend/config/project.sock config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

### Запуск Gunicorn

```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

## 🌐 Настройка Nginx
### Создание конфигурации сайта

```bash
sudo nano /etc/nginx/sites-available/cloud
```

### Содержимое конфигурации:

```bash
server {
    listen 80;
    server_name ваш_ip_адрес;

    client_max_body_size 100M;

    # React статика (фронтенд)
    location / {
        root /home/your_user/cloud/frontend/dist;
        try_files $uri /index.html;

        # Кэширование статических ассетов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Статика Django
    location /static/ {
        alias /home/your_user/cloud/backend/staticfiles/;
    }

    # Медиа файлы
    location /media/ {
        alias /home/your_user/cloud/backend/media/;
    }

    # Django API
    location /api/ {
        proxy_pass http://unix:/home/your_user/cloud/backend/config/project.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django админка
    location /admin/ {
        proxy_pass http://unix:/home/your_user/cloud/backend/config/project.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Активация сайта

```bash
# Создание символьной ссылки
sudo ln -s /etc/nginx/sites-available/cloud /etc/nginx/sites-enabled

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

## 🔒 Настройка прав доступа

```bash
# Доступ www-data к домашней папке
sudo chmod 755 /home/your_user
sudo chmod 755 /home/your_user/cloud
sudo chmod 755 /home/your_user/cloud/backend
sudo chmod 755 /home/your_user/cloud/backend/config

# Права на сокет
sudo chmod 777 /home/your_user/cloud/backend/config/project.sock

# Добавление www-data в группу your_user
sudo usermod -a -G your_user www-data

# Проверка доступа
sudo -u www-data ls -la /home/your_user/cloud/backend/config/
```

## 🔥 Настройка фаервола

```bash
# Разрешение Nginx
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH

# Включение фаервола
sudo ufw enable

# Проверка статуса
sudo ufw status
```

## 🔄 Полезные команды для обслуживания
### Перезапуск сервисов

```bash
# Перезапуск Gunicorn
sudo systemctl restart gunicorn

# Перезапуск Nginx
sudo systemctl restart nginx

# Перезапуск всех сервисов
sudo systemctl restart gunicorn && sudo systemctl restart nginx
```
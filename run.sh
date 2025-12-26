#!/bin/bash

# Скрипт автоматического развертывания Music School (Production Ready)
# Этот скрипт идемпотентен: его можно запускать многократно, он будет только обновлять сайт.

set -e # Остановить выполнение при любой ошибке

echo "🚀 Начинаем проверку и настройку сервера..."

# 1. Проверка системных ресурсов
echo "📊 Проверка ресурсов..."
MIN_RAM_MB=512
FREE_RAM=$(free -m | awk '/^Mem:/{print $4}')
FREE_DISK=$(df -m / | awk 'NR==2 {print $4}')

if [ "$FREE_RAM" -lt "$MIN_RAM_MB" ]; then
    echo "⚠️ Внимание: Мало оперативной памяти ($FREE_RAM MB). Сборка может быть медленной."
fi

if [ "$FREE_DISK" -lt 1000 ]; then
    echo "❌ Ошибка: Недостаточно места на диске (нужно минимум 1GB)."
    exit 1
fi

# 2. Проверка и установка зависимостей (Docker)
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Docker не найден. Устанавливаем..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker установлен."
else
    echo "✅ Docker уже установлен."
fi

# 3. Определяем путь к исходникам
if [ -d "site" ]; then
    cd site
fi

if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Файл package.json не найден. Убедись, что ты в папке проекта."
    exit 1
fi

# 4. Генерация/Обновление конфигураций
echo "📝 Обновляем конфигурацию Docker..."

cat <<EOF > Dockerfile
# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

cat <<EOF > nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

cat <<EOF > docker-compose.yml
version: '3.8'
services:
  site:
    build: .
    container_name: music_school_app
    ports:
      - "80:80"
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
EOF

# 5. Умный запуск (Idem-potent deployment)
echo "🏗️ Обновляем контейнеры..."

# Удаляем старые зависшие контейнеры, если они есть (из прошлых версий скрипта)
sudo docker rm -f site_site_1 2>/dev/null || true

# Используем Docker Compose V2 (современный стандарт)
if sudo docker compose version &> /dev/null; then
    # --build заставит пересобрать образ, если код изменился
    # --remove-orphans удалит старые контейнеры этого проекта, если мы переименовали сервисы
    sudo docker compose up -d --build --remove-orphans
elif command -v docker-compose &> /dev/null; then
    sudo docker-compose up -d --build --remove-orphans
else
    echo "❌ Ошибка: Docker Compose не найден."
    exit 1
fi

echo "✨ Готово! Сайт обновлен и запущен."
echo "🔗 Проверь статус: sudo docker ps"
echo "📝 Логи: sudo docker compose logs -f site"


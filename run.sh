#!/bin/bash

# VERSION: 2025-12-26-V3 (Robust Direct Docker)
# Скрипт автоматического развертывания Music School (Production Ready)

set -e

echo "🚀 Запуск скрипта развертывания (Версия V3)..."

# 1. Проверка системных ресурсов
echo "📊 Проверка ресурсов..."
MIN_RAM_MB=512
FREE_RAM=$(free -m | awk '/^Mem:/{print $4}')
FREE_DISK=$(df -m / | awk 'NR==2 {print $4}')

echo "RAM: ${FREE_RAM}MB Free, Disk: ${FREE_DISK}MB Free"

if [ "$FREE_RAM" -lt "$MIN_RAM_MB" ]; then
    echo "⚠️ Внимание: Мало оперативной памяти. Сборка может быть медленной."
fi

# 2. Очистка ВСЕХ старых следов docker-compose
echo "🧹 Тотальная очистка старых контейнеров и конфигов..."
# Удаляем docker-compose.yml если он есть, чтобы он случайно не вызвался
rm -f docker-compose.yml site/docker-compose.yml 2>/dev/null || true

# Останавливаем вообще всё, что может занять 80 порт или иметь имя 'site'
sudo docker stop music_school_app site_site_1 2>/dev/null || true
sudo docker rm -f music_school_app site_site_1 2>/dev/null || true

# 3. Определяем путь к исходникам
if [ -d "site" ]; then
    cd site
fi

if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Файл package.json не найден."
    exit 1
fi

# 4. Генерация только нужных файлов конфигурации
echo "📝 Подготовка чистых конфигов Docker..."

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

# 5. Прямой запуск через Docker (без Compose!)
echo "🏗️ Сборка образа (direct build)..."
sudo docker build -t music_school_site .

echo "🚀 Запуск нового контейнера (direct run)..."
sudo docker run -d \
    --name music_school_app \
    --restart always \
    -p 80:80 \
    music_school_site

echo "✨ Готово! Сайт запущен напрямую через Docker."
echo "🔗 Проверь статус: sudo docker ps"
echo "📝 Логи: sudo docker logs -f music_school_app"


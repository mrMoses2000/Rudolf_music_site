#!/bin/bash

# Скрипт автоматического развертывания Music School MVP
# Исправленная версия: корректно работает с папкой 'site'

echo "🚀 Начинаем настройку сервера..."

# 1. Проверка Docker
if ! [ -x "$(command -v docker)" ]; then
  echo "📦 Устанавливаем Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo "✅ Docker установлен."
fi

# 2. Определяем путь к исходникам
# Если папка 'site' существует в текущей директории, переходим в неё
if [ -d "site" ]; then
    echo "📂 Найдена папка 'site', используем её как корень проекта."
    cd site
fi

# Проверка наличия package.json
if [ ! -f "package.json" ]; then
  echo "❌ Ошибка: package.json не найден ни в текущей папке, ни в подпапке 'site'."
  echo "Убедись, что ты запускаешь скрипт из корня проекта, где лежит папка 'site'."
  exit 1
fi

# 3. Создание Docker-файлов прямо в папке с кодом
echo "📝 Создаем конфигурацию Docker..."

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

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

cat <<EOF > docker-compose.yml
version: '3.8'
services:
  site:
    build: .
    ports:
      - "80:80"
    restart: always
EOF

# 4. Запуск
echo "🏗️ Собираем и запускаем контейнеры..."
if command -v docker-compose &> /dev/null; then
    sudo docker-compose up -d --build
elif sudo docker compose version &> /dev/null; then
    sudo docker compose up -d --build
else
    echo "❌ Ошибка: docker-compose не найден. Установи его через: sudo apt install docker-compose"
    exit 1
fi

echo "✨ Готово! Сайт должен быть доступен по IP сервера на порту 80."
echo "Проверь статус: sudo docker ps"

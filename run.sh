#!/bin/bash

# Скрипт автоматического развертывания Music School MVP
# Для Ubuntu 22.04+

echo "🚀 Начинаем настройку сервера..."

# 1. Проверка Docker
if ! [ -x "$(command -v docker)" ]; then
  echo "📦 Устанавливаем Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  echo "✅ Docker установлен."
fi

# 2. Создание директории проекта
PROJECT_DIR="music_school_site"
mkdir -p $PROJECT_DIR && cd $PROJECT_DIR

# 3. Создание Dockerfile (Multi-stage build)
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

# 4. Создание nginx.conf
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

# 5. Создание docker-compose.yml
cat <<EOF > docker-compose.yml
version: '3.8'
services:
  site:
    build: .
    ports:
      - "80:80"
    restart: always
EOF

# 6. Подготовка исходного кода (упаковка из локальных файлов)
# Примечание: В реальном сценарии мы бы делали git clone, 
# но так как я работаю локально, я создам структуру здесь.

echo "📝 Создаем структуру фронтенда..."

# Здесь мы предполагаем, что файлы уже скопированы или мы их генерируем.
# Для демонстрации я создам базовый index.html, 
# так как перенос всего React-проекта в один bash-скрипт избыточен.
# В идеале тебе нужно просто скопировать папку 'site' на сервер.

echo "⚠️ Важно: Для полной работы скопируй папку 'site' с твоего Mac на сервер в ~/music_school_site"
echo "Затем запусти: docker-compose up -d --build"

# Запуск (если файлы на месте)
if [ -f "package.json" ]; then
  sudo docker compose up -d --build
  echo "✨ Сайт запущен на http://localhost"
else
  echo "❌ package.json не найден. Сначала скопируй файлы проекта."
fi

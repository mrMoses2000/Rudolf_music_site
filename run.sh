#!/bin/bash

# VERSION: 2025-12-26-V4 (Robust Direct Docker + HTTPS)
# Скрипт автоматического развертывания Music School (Production Ready)

set -e

echo "🚀 Запуск скрипта развертывания (Версия V4)..."

# Загрузка переменных окружения (если есть)
ENV_FILE="${ENV_FILE:-/etc/music_school.env}"
if [ -f "$ENV_FILE" ]; then
    # shellcheck disable=SC1090
    source "$ENV_FILE"
fi
if [ -f ".env" ]; then
    set -a
    # shellcheck disable=SC1091
    source ".env"
    set +a
fi

# HTTPS настройки (опционально)
DOMAIN="${DOMAIN:-}"
PRIMARY_DOMAIN="${DOMAIN#www.}"
WWW_DOMAIN="www.${PRIMARY_DOMAIN}"
SERVER_NAMES=""
SSL_CERT="${SSL_CERT:-}"
SSL_KEY="${SSL_KEY:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"
CERT_CHECK_DAYS="${CERT_CHECK_DAYS:-30}"
ENABLE_HTTPS=0

if [ -n "$PRIMARY_DOMAIN" ] && [ "$PRIMARY_DOMAIN" != "$DOMAIN" ]; then
    DOMAIN="$PRIMARY_DOMAIN"
fi

if [ -n "$DOMAIN" ]; then
    SERVER_NAMES="${PRIMARY_DOMAIN} ${WWW_DOMAIN}"
    SSL_CERT="${SSL_CERT:-/etc/letsencrypt/live/$PRIMARY_DOMAIN/fullchain.pem}"
    SSL_KEY="${SSL_KEY:-/etc/letsencrypt/live/$PRIMARY_DOMAIN/privkey.pem}"
fi

ensure_certificates() {
    if [ -z "$DOMAIN" ]; then
        return 0
    fi

    if sudo test -f "$SSL_CERT" && sudo test -f "$SSL_KEY"; then
        if sudo openssl x509 -checkend "$((CERT_CHECK_DAYS * 24 * 3600))" -noout -in "$SSL_CERT" >/dev/null 2>&1; then
            ENABLE_HTTPS=1
            return 0
        fi
    fi

    if ! command -v certbot >/dev/null 2>&1; then
        echo "📦 Устанавливаю certbot..."
        sudo apt-get update -y
        sudo apt-get install -y certbot
    fi

    echo "🔐 Получаю/обновляю сертификат Let's Encrypt для $PRIMARY_DOMAIN и $WWW_DOMAIN..."
    if [ -n "$CERTBOT_EMAIL" ]; then
        sudo certbot certonly --standalone --non-interactive --agree-tos -m "$CERTBOT_EMAIL" \
            -d "$PRIMARY_DOMAIN" -d "$WWW_DOMAIN" --keep-until-expiring
    else
        echo "⚠️ CERTBOT_EMAIL не задан. Использую регистрацию без email (не рекомендуется)."
        sudo certbot certonly --standalone --non-interactive --agree-tos --register-unsafely-without-email \
            -d "$PRIMARY_DOMAIN" -d "$WWW_DOMAIN" --keep-until-expiring
    fi

    if sudo test -f "$SSL_CERT" && sudo test -f "$SSL_KEY"; then
        ENABLE_HTTPS=1
    else
        echo "❌ Не удалось найти файлы сертификата после успешного запроса."
        echo "   Проверьте путь: $SSL_CERT и $SSL_KEY"
        exit 1
    fi
}

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

# Удаляем мёртвые контейнеры (НЕ трогаем работающий music_school_app — он будет заменён позже)
sudo docker rm -f site_site_1 2>/dev/null || true

# Получение сертификатов (если настроен DOMAIN)
ensure_certificates

# Подготовка авто-обновления сертификатов (cron)
if [ "$ENABLE_HTTPS" -eq 1 ]; then
    RENEW_SCRIPT="/usr/local/bin/renew_music_school_ssl.sh"
    sudo tee "$RENEW_SCRIPT" >/dev/null <<EOF
#!/bin/bash
set -e
DOMAIN="$PRIMARY_DOMAIN"
WWW_DOMAIN="$WWW_DOMAIN"
SSL_CERT="$SSL_CERT"
CERT_CHECK_DAYS="$CERT_CHECK_DAYS"
CERTBOT_EMAIL="$CERTBOT_EMAIL"

if [ -f "\$SSL_CERT" ] && openssl x509 -checkend "\$((CERT_CHECK_DAYS * 24 * 3600))" -noout -in "\$SSL_CERT" >/dev/null 2>&1; then
    exit 0
fi

docker stop music_school_app 2>/dev/null || true

if [ -n "\$CERTBOT_EMAIL" ]; then
    certbot certonly --standalone --non-interactive --agree-tos -m "\$CERTBOT_EMAIL" \\
        -d "\$DOMAIN" -d "\$WWW_DOMAIN" --keep-until-expiring
else
    certbot certonly --standalone --non-interactive --agree-tos --register-unsafely-without-email \\
        -d "\$DOMAIN" -d "\$WWW_DOMAIN" --keep-until-expiring
fi

docker start music_school_app 2>/dev/null || true
EOF

    sudo chmod +x "$RENEW_SCRIPT"
    sudo tee /etc/cron.d/music_school_ssl_renew >/dev/null <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 4 * * * root $RENEW_SCRIPT
EOF

    if systemctl list-unit-files 2>/dev/null | grep -q '^certbot.timer'; then
        echo "🧯 Отключаю certbot.timer, чтобы избежать дублирования продления."
        sudo systemctl disable --now certbot.timer 2>/dev/null || true
    fi
fi

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
ARG VITE_WEB3FORMS_KEY
ARG VITE_ACCESS_WEB3FORMS_KEY
ARG VITE_WEB3FORMS_TO_EMAIL
ENV VITE_WEB3FORMS_KEY=$VITE_WEB3FORMS_KEY
ENV VITE_ACCESS_WEB3FORMS_KEY=$VITE_ACCESS_WEB3FORMS_KEY
ENV VITE_WEB3FORMS_TO_EMAIL=$VITE_WEB3FORMS_TO_EMAIL
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
EOF

if [ "$ENABLE_HTTPS" -eq 1 ]; then
cat <<EOF > nginx.conf
server {
    listen 80;
    server_name ${SERVER_NAMES};
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /fonts/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /images/ {
        add_header Cache-Control "public, max-age=2592000";
        try_files \$uri =404;
    }

    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${SERVER_NAMES};

    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /fonts/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /images/ {
        add_header Cache-Control "public, max-age=2592000";
        try_files \$uri =404;
    }

    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
else
cat <<EOF > nginx.conf
server {
    listen 80;
    server_name _;
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_vary on;
    gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;

    location /assets/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /fonts/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files \$uri =404;
    }
    location /images/ {
        add_header Cache-Control "public, max-age=2592000";
        try_files \$uri =404;
    }

    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
fi

# 5. Blue-green deploy: build FIRST, then swap containers (~2s downtime instead of ~3min)
echo "🏗️ Сборка нового образа (сайт работает во время сборки)..."
sudo docker build \
    --build-arg VITE_WEB3FORMS_KEY="${VITE_WEB3FORMS_KEY:-}" \
    --build-arg VITE_ACCESS_WEB3FORMS_KEY="${VITE_ACCESS_WEB3FORMS_KEY:-}" \
    --build-arg VITE_WEB3FORMS_TO_EMAIL="${VITE_WEB3FORMS_TO_EMAIL:-}" \
    -t music_school_site:new .

echo "🔄 Замена контейнера (старый → новый)..."
DOCKER_PORTS="-p 80:80"
DOCKER_VOLUMES=""
if [ "$ENABLE_HTTPS" -eq 1 ]; then
    DOCKER_PORTS="$DOCKER_PORTS -p 443:443"
    DOCKER_VOLUMES="-v /etc/letsencrypt:/etc/letsencrypt:ro"
fi

# Stop+remove old container only AFTER new image is built
sudo docker stop music_school_app 2>/dev/null || true
sudo docker rm -f music_school_app 2>/dev/null || true

# Tag the new image as :latest and start
sudo docker tag music_school_site:new music_school_site:latest
sudo docker run -d \
    --name music_school_app \
    --restart always \
    $DOCKER_PORTS \
    $DOCKER_VOLUMES \
    music_school_site:latest

# Cleanup
sudo docker rmi music_school_site:new 2>/dev/null || true

echo "✨ Готово! Сайт обновлён (blue-green deploy)."
echo "🔗 Проверь статус: sudo docker ps"
echo "📝 Логи: sudo docker logs -f music_school_app"

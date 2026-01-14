# Musikschule CMS Bielefeld (Rudolf Music Site)

Современный SPA‑сайт музыкальной школы на React + Vite с бережной миграцией контента из старого HTML.

## Быстрый старт

### Требования
- Node.js 18+
- Docker (для production сборки через `run.sh`)

### Локальная разработка
```bash
cd site
npm install
npm run dev
```
Сайт будет доступен на `http://localhost:5173`.

## Production (Docker + HTTPS)
Запуск из корня:
```bash
./run.sh
```
Скрипт:
- собирает фронтенд,
- генерирует `Dockerfile` и `nginx.conf`,
- поднимает контейнер,
- при наличии домена автоматически получает/обновляет сертификат (Let’s Encrypt),
- включает HTTPS + HTTP/2.

### Переменные окружения (HTTPS)
Можно задать в `/etc/music_school.env` или `.env` рядом с `run.sh`:
```bash
DOMAIN=musikschule-cms-bielefeld.de
CERTBOT_EMAIL=admin@musikschule-cms-bielefeld.de
CERT_CHECK_DAYS=30
```
Сертификаты находятся в:
```
/etc/letsencrypt/live/<domain>/
```
Автопродление настроено через cron (`/etc/cron.d/music_school_ssl_renew`).

## Формы (Web3Forms)
Переменные для формы:
```bash
VITE_WEB3FORMS_KEY=ваш_ключ
VITE_WEB3FORMS_TO_EMAIL=info@musikschule-cms-bielefeld.de
```
Если `VITE_WEB3FORMS_TO_EMAIL` не задана — используется `content.contact.email`.

## Изображения и производительность
- Все изображения — в `site/public/images/`.
- Форматы: **WebP + AVIF** (AVIF предпочтителен, WebP — fallback).
- `SmartImage` автоматически отдаёт AVIF/WebP с `srcSet`.
- В `site/src/utils/imageVariants.js` описаны ширины вариантов.

## SEO
- `site/public/robots.txt`
- `site/public/sitemap.xml`
- `meta description` в `site/index.html`

## Документация (глубокие гайды)
- `SSL_GUIDE.md` — базовая криптография и TLS.
- `SSL_OS_DEEP_DIVE.md` — TLS/HTTPS на уровне ОС и ядра.
- `TLS_CERT_UNDER_THE_HOOD.md` — структура сертификатов и математика.
- `DNS_TLS_CERTS_DEEP_DIVE.md` — DNS, ACME и выпуск сертификатов.
- `BROWSER_UNDER_THE_HOOD.md` — работа браузера от URL до пикселя.
- `NGINX_UNDER_THE_HOOD.md` — архитектура nginx и обработка запросов.

## Cloudflare (рекомендованный сценарий)
Cloudflare даёт HTTP/3, Brotli и edge‑кеш, что заметно ускоряет первый заход.

### Шаги подключения
1) Создать сайт в Cloudflare и выбрать план Free.
2) В Cloudflare добавить DNS:
   - `A` запись `@` → `3.79.24.73` (Proxied = ON)
   - `A` запись `www` → `3.79.24.73` (Proxied = ON)
   - Если есть почта — перенести MX/SPF/DMARC.
3) В 1blu заменить **Nameserver** на NS от Cloudflare.
4) Cloudflare → SSL/TLS:
   - режим **Full (strict)**
   - TLS 1.2/1.3 включены
5) Cloudflare → Speed:
   - HTTP/3 = ON
   - Brotli = ON
6) Cloudflare → Cache Rules:
   - `/images/*` → Cache Everything, Edge TTL 1 year
   - `/assets/*` → Cache Everything, Edge TTL 1 year
   - `/fonts/*` → Cache Everything, Edge TTL 1 year

### Проверка
- В ответах должен быть `alt-svc: h3="..."` (HTTP/3).
- Запросы к изображениям получают `cf-cache-status: HIT`.

## Структура проекта
```
site/
  public/
    images/
    fonts/
    robots.txt
    sitemap.xml
  src/
    components/
    data/content.js
    pages/
    App.jsx
    index.css
```

## Где править контент
- **Тексты/цены/ссылки:** `site/src/data/content.js`
- **Маршруты:** `site/src/App.jsx`

## Источник истины
Папка `music_site_copy/` содержит оригинальные HTML‑страницы. Любые изменения контента должны соответствовать этому источнику.

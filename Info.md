# Info.md — карта проекта

Краткое описание архитектуры и того, где что лежит.

## Архитектура
Проект — SPA на React (Vite) + Tailwind + Framer Motion.
- Весь контент живёт в `site/src/data/content.js`.
- Страницы в `site/src/pages/` берут данные из `content.js`.
- `SmartImage` автоматически отдаёт AVIF → WebP + `srcSet`.

## Ключевые папки
- `site/src/data/content.js` — **мозг контента** (тексты, цены, изображения).
- `site/src/components/SmartImage.jsx` — оптимизация изображений.
- `site/public/images/` — все изображения (WebP/AVIF).
- `site/public/fonts/` — self‑host шрифты.

## Формы
- Web3Forms.
- Ключ: `VITE_WEB3FORMS_KEY`.
- Email получателя: `VITE_WEB3FORMS_TO_EMAIL` или `content.contact.email`.

## SEO
- `site/public/robots.txt`
- `site/public/sitemap.xml`
- `meta description` в `site/index.html`

## Гайды
- `AGENT_LOG.md` — журнал входов агентов (модель/аккаунт/время).
- `COMMIT_MESSAGE.md` — шаблон текста коммита от агента.
- `INDEX_REPORT.md` — отчёт полного индексирования (полный список файлов).
- `SSL_GUIDE.md` — базовая криптография и TLS.
- `SSL_OS_DEEP_DIVE.md` — TLS/HTTPS на уровне ОС и ядра.
- `TLS_CERT_UNDER_THE_HOOD.md` — структура сертификатов и математика.
- `DNS_TLS_CERTS_DEEP_DIVE.md` — DNS, ACME и выпуск сертификатов.
- `BROWSER_UNDER_THE_HOOD.md` — работа браузера от URL до пикселя.
- `NGINX_UNDER_THE_HOOD.md` — архитектура nginx и обработка запросов.

## Деплой
Запуск в корне:
```bash
./run.sh
```
Скрипт:
- собирает фронтенд,
- генерирует Docker/Nginx конфиг,
- поднимает HTTPS (Let’s Encrypt),
- включает HTTP/2 и кеш‑заголовки.

## Источник истины
`music_site_copy/` — оригинальные HTML‑страницы для сверки контента.

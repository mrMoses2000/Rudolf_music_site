# AGENTS.md - Контекст проекта и правила работы

## Continuity Ledger (обязательно)
- В начале **каждого** ответа читать `CONTINUITY.md`.
- Обновлять `CONTINUITY.md`, если меняются цель/решение/состояние/важные результаты.
- Коротко, по фактам, без лишнего текста.

## Базовые правила
- **Язык общения: только русский.**
- Источник истины контента: `music_site_copy/`.
- Все текстовые правки/структуры делаем через `site/src/data/content.js`.
- Проект — SPA: React (Vite), Tailwind, Framer Motion.

## Архитектура (коротко)
- `site/src/data/content.js` — центральный источник контента.
- `site/src/pages/*.jsx` — страницы, берут данные из `content.js`.
- `site/src/components/SmartImage.jsx` — оптимизированные изображения (AVIF → WebP).

## Изображения
- Все ассеты лежат в `site/public/images/`.
- Основной формат: **WebP**, альтернативный: **AVIF**.
- Для изображений используем `SmartImage` + `useSrcSet`.
- Если добавляем новый файл:
  1) кладём WebP в `/images`,
  2) делаем варианты `-512/-768/...`,
  3) добавляем ширины в `site/src/utils/imageVariants.js`,
  4) (по возможности) генерируем AVIF‑варианты.

## Формы
- Web3Forms используется для отправки писем.
- Ключ берётся из `VITE_WEB3FORMS_KEY`.
- Адрес получателя берётся из `VITE_WEB3FORMS_TO_EMAIL` или `content.contact.email`.

## SEO
- `site/public/robots.txt` и `site/public/sitemap.xml` должны быть валидными.
- В `site/index.html` есть `meta description`.

## Деплой
- Запуск: `./run.sh` в корне.
- Скрипт генерирует `Dockerfile` и `nginx.conf`, включает HTTPS (certbot), HTTP/2 и кеш‑заголовки.
- Переменные для HTTPS: `/etc/music_school.env` или `.env` рядом с `run.sh`.

## Важные факты
- Musikkurse‑страница и блоки удалены по просьбе клиента.
- Шрифты self‑host в `site/public/fonts`.
- Карточки и hero‑изображения оптимизированы и используют AVIF/WebP.

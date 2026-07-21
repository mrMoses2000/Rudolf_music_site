# AGENTS.md - Контекст проекта и правила работы

## Continuity Ledger (compaction-safe)
> [!IMPORTANT]
> **CRITICAL: START HERE.**
> Before doing ANYTHING else, check `AGENT_LOG.md`.
> If you are a new agent/session: **YOU MUST EXECUTE THE "Протокол синхронизации" (Section below).**
> Do not write code until you have read `Info.md` and checked `INDEX_REPORT.md`.

Maintain a single Continuity Ledger for this workspace in `CONTINUITY.md`. The ledger is the canonical session briefing designed to survive context compaction; do not rely on earlier chat text unless it’s reflected in the ledger.

### How it works
- At the start of every assistant turn: read `CONTINUITY.md`, update it to reflect the latest goal, constraints, decisions, state, then proceed with the work.
- Update `CONTINUITY.md` again whenever any of these change: goal, constraints or assumptions, key decisions, progress state Done Now Next, or important tool outcomes.
- Keep it short and stable: facts only, no transcripts. Mark uncertainty as UNCONFIRMED, never guess.
- If you notice missing recall or a compaction or summary event: refresh or rebuild the ledger from visible context, mark gaps UNCONFIRMED, ask up to 1–3 targeted questions, then continue.

### Chat context policy
- Treat the latest user message as the active delta.
- Use earlier chat only if it is reflected in CONTINUITY or other project md.
- If the latest message conflicts with md, ask 1–3 clarification questions, then proceed with minimal safe changes.

### functions.update_plan vs the Ledger
- functions.update_plan is for short term execution scaffolding while you work.
- CONTINUITY.md is for long running continuity across compaction, not a step by step task list.
- Keep them consistent when plan or state changes.

### In replies
- Begin with a brief Ledger Snapshot goal now next open questions. Print the full ledger only when it materially changes or when the user asks.

### CONTINUITY.md format
- Goal incl success criteria
- Constraints or assumptions
- Key decisions
- State
- Done
- Now
- Next
- Open questions UNCONFIRMED if needed
- Working set files ids commands

## Agent Stamp (обновляется агентом)
Last agent stamp: 2026-07-21T17:32:40Z | model=GPT-5 (Codex) | account=unknown | session_id=unknown | purpose=prepare Telegram editor runtime and AWS domain migration

## Базовые правила
- **Язык общения: только русский.**
- Источник истины контента: `music_site_copy/` (вся структура и тексты должны иметь эквивалент в `site/`).
- Все текстовые правки/структуры делаем через `site/src/data/content.js`.
- Проект — SPA: React (Vite), Tailwind, Framer Motion.

## Где лежат служебные md файлы
- В этом проекте — в корне.
- Для новых проектов рекомендуется папка `meta/` (см. `future/`).

## Протокол индексирования проекта (для нового агента)
1) Прочитать: `README.md`, `Info.md`, `CONTINUITY.md` + гайды TLS/DNS/Browser/Nginx.
2) Снять инвентарь файлов:
   - `rg --files` (в корне) → список всех файлов.
3) Проиндексировать ключевые каталоги:
   - `site/src/pages/` — все страницы и их маршруты.
   - `site/src/components/` — общие компоненты и UX‑поведение.
   - `site/src/data/content.js` — контент и ссылки на изображения.
   - `site/src/utils/` — логика изображений/оптимизации.
   - `site/public/` — ассеты, robots.txt, sitemap.xml, fonts.
4) Сверить контент 1:1 с `music_site_copy/`:
   - проверить, что все страницы/разделы имеют эквивалент в `site/`.
   - если что‑то отсутствует — зафиксировать и перенести через `content.js`.
5) При изменениях дизайна не трогать смысл и тексты без согласования.
6) Если нужен новый фреймворк или API — сначала проверить через Context7.
7) После полного индексирования обновить `INDEX_REPORT.md`.

## Протокол синхронизации агентов (обязателен)
**Вход:**
1) Посмотреть `AGENT_LOG.md` (последняя запись) и `CONTINUITY.md`.
2) Если последняя запись старше 7 дней, модель/аккаунт другой, или `git_head` отличается — запустить протокол индексирования.
3) Обновить строку **Agent Stamp** в этом файле (модель, аккаунт, цель).

**Выход:**
1) Записать новую строку в `AGENT_LOG.md` (включая `git_branch` и `git_head`).
2) Обновить `CONTINUITY.md` (если менялись цели/решения/состояние).
3) Если внесены правки — подготовить текст коммита в `COMMIT_MESSAGE.md`.

**Зачем:** единая точка правды о «кто/когда/с какой моделью» работал и насколько данные актуальны.

## Коммиты
- Сообщения коммитов пишем на русском языке.
- Актуальный текст хранится в `COMMIT_MESSAGE.md`.

## INDEX_REPORT.md
- Это отчёт полного индексирования проекта с полным списком файлов.
- Пересоздаётся при срабатывании условий из протокола синхронизации и после полного обхода.
- Генерация: `scripts/generate_index_report.sh` (можно задать `AGENT_MODEL/AGENT_ACCOUNT/AGENT_SESSION_ID`).

## Формат AGENT_LOG.md (обязательные поля)
- timestamp_utc
- model
- account
- session_id
- purpose
- git_branch
- git_head
- touched_files
- notes

## Правило первого входа
- Если в `AGENT_LOG.md` нет записи с данной парой `model + account`, это считается первым входом.
- В таком случае запускать полный протокол индексирования.

## Архитектура (коротко)
- `site/src/data/content.js` — центральный источник контента.
- `site/src/pages/*.jsx` — страницы, берут данные из `content.js`.
- `site/src/components/SmartImage.jsx` — оптимизированные изображения (AVIF → WebP).
- Роутинг — React Router; переходы/анимации через Framer Motion.

## Изображения
- Все ассеты лежат в `site/public/images/`.
- Основной формат: **WebP**, альтернативный: **AVIF** (приоритет AVIF).
- Для изображений используем `SmartImage` + `useSrcSet`.
- Если добавляем новый файл:
  1) кладём WebP в `/images`,
  2) делаем варианты `-512/-768/...`,
  3) добавляем ширины в `site/src/utils/imageVariants.js`,
  4) (по возможности) генерируем AVIF‑варианты.
  5) обновляем `content.js` ссылками на новые файлы.

## Формы
- Web3Forms используется для отправки писем.
- Ключ берётся из `VITE_WEB3FORMS_KEY`.
- Адрес получателя берётся из `VITE_WEB3FORMS_TO_EMAIL` или `content.contact.email`.

## SEO
- `site/public/robots.txt` и `site/public/sitemap.xml` должны быть валидными.
- В `site/index.html` есть `meta description`.

## Производительность
- `SmartImage` отдаёт AVIF/WebP через `srcSet`.
- Критичные изображения могут быть `loading="eager"` и с `fetchpriority="high"`.
- YouTube подключается через `LazyYouTube` (чтобы не тянуть тяжелые скрипты на первом экране).
- nginx включает gzip и cache headers для `/assets`, `/images`, `/fonts`.

## Деплой
- Запуск: `./run.sh` в корне.
- Скрипт генерирует `Dockerfile` и `nginx.conf`, включает HTTPS (certbot), HTTP/2 и кеш‑заголовки.
- Переменные для HTTPS: `/etc/music_school.env` или `.env` рядом с `run.sh`.
  - `DOMAIN`, `CERTBOT_EMAIL`, `CERT_CHECK_DAYS`.
- Сертификаты: `/etc/letsencrypt/live/<domain>/fullchain.pem` и `privkey.pem`.
- Автопродление: cron (`/etc/cron.d/music_school_ssl_renew`).

## Инфраструктура и домен
- Сервер: Ubuntu VPS, деплой через Docker.
- Домены: `musikschule-cms-bielefeld.de` и `www` → A‑записи на IP сервера.
- Порты: 80 (HTTP) и 443 (HTTPS) должны быть открыты.
- Cloudflare — опционально (см. README).

## Важные факты
- Musikkurse‑страница и блоки удалены по просьбе клиента.
- Шрифты self‑host в `site/public/fonts`.
- Карточки и hero‑изображения оптимизированы и используют AVIF/WebP.

## Глубокая документация
- `SSL_GUIDE.md`, `SSL_OS_DEEP_DIVE.md`, `TLS_CERT_UNDER_THE_HOOD.md`
- `DNS_TLS_CERTS_DEEP_DIVE.md`
- `BROWSER_UNDER_THE_HOOD.md`
- `NGINX_UNDER_THE_HOOD.md`

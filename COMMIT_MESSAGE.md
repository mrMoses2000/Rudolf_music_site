# COMMIT_MESSAGE.md

## Proposed commit message

исправление: перевести telegram-бота на codex и обновить актуальное

## Details
- заменить Gemini CLI интеграцию Telegram-бота на Codex CLI
- добавить self-authorization через Telegram contact для двух разрешённых телефонов
- обновить `Aktuelles` текстом из DOCX про Abschlussprüfungen 2025–2026
- исправить Web3Forms false-success fallback, lint и npm audit
- обновить SSL renew script: после renew перезапускается `musikschule-tg-bot.service`

## Notes for reviewer
- локально и на сервере прошли `npm run lint`, `npm run build`, `npm run typecheck`, `npm audit`
- production deploy выполнен через `./run.sh`
- проверены `/health`, webhook POST с secret header, Codex smoke, основные маршруты сайта

# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать реальный Telegram start

## Details
- зафиксировать доставку первого реального `/start` в production webhook
- записать корректный переход неавторизованного пользователя к self-contact flow
- отметить возможность двуязычных DE/RU системных сообщений без runtime-изменений
- обновить continuity ledger и agent log

## Notes for reviewer
- значения секретов не раскрывались
- self-contact auth ещё ожидается; SQLite пока содержит 0 авторизованных пользователей
- runtime-логика и пользовательские строки не изменялись
- перенос домена и DNS не затрагивался

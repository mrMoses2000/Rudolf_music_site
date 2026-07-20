# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать аварийное восстановление сайта

## Details
- обновить agent stamp, continuity ledger, индекс и журнал агента
- зафиксировать snapshot, Elastic IP, новый Docker deploy и выпуск TLS-сертификата
- зафиксировать перенос DNS-записей в Cloudflare и асинхронную смену NS в 1blu
- указать сохранённые остановленные контейнеры и незавершённое восстановление секретов

## Notes for reviewer
- runtime-код сайта не менялся; документируются реальные внешние операции миграции
- Web3Forms и Telegram/Codex bot ожидают отдельного восстановления секретов

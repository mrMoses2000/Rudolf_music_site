# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать проверку Telegram и AWS Billing

## Details
- зафиксировать свежую production-проверку Telegram-редактора и внешнего health
- записать отсутствие реальных пользовательских update и авторизации
- сохранить read-only результаты AWS Bills, Payments и Credits
- обновить continuity ledger, agent log и полный индекс проекта

## Notes for reviewer
- значения секретов не раскрывались
- реальный пользовательский `/start` и self-contact auth ещё ожидаются
- точная AWS due date ещё не назначена, потому что invoice имеет статус pending
- перенос домена и DNS не затрагивался

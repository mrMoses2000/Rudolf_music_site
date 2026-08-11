# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать отказ Telegram self-contact

## Details
- зафиксировать доставку реального self-contact update в production webhook
- записать подтверждённую причину отказа `phone_not_allowed`
- отметить расхождение фактического Telegram-номера с административным allowlist
- обновить continuity ledger и agent log

## Notes for reviewer
- значения секретов не раскрывались
- изменение security allowlist ожидает явного подтверждения владельца
- runtime-логика, env и пользовательские строки не изменялись
- перенос домена и DNS не затрагивался

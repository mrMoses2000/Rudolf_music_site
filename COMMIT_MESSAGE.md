# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать замену Telegram-номера

## Details
- зафиксировать разрешённую production-замену ошибочного казахстанского номера
- записать backup, сохранение трёх немецких номеров и итоговый allowlist count
- сохранить результаты restart, health и Telegram webhook verification
- обновить continuity ledger и agent log

## Notes for reviewer
- значения секретов не раскрывались
- secret values в Git не добавлялись
- runtime-код и пользовательские строки не изменялись
- перенос домена и DNS не затрагивался

# COMMIT_MESSAGE.md

## Proposed commit message

бот: синхронизировать webhook при запуске

## Details
- автоматически регистрировать webhook с текущим secret при каждом запуске
- возвращать HTTP 403 и писать предупреждение при неверном secret
- журналировать идентификатор принятого Telegram update без содержимого сообщения
- обновить continuity ledger и полный индекс проекта

## Notes for reviewer
- значения секретов не раскрывались
- пользовательская логика и схема SQLite не менялись
- typecheck Telegram-сервиса проходит

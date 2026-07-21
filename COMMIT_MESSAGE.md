# COMMIT_MESSAGE.md

## Proposed commit message

документация: зафиксировать проверку Telegram-редактора

## Details
- зафиксировать успешную проверку Telegram и AssemblyAI токенов
- записать запуск systemd-сервиса и успешную сквозную транскрибацию
- зафиксировать блокировку публичного TCP 8443 в EC2 Security Group

## Notes for reviewer
- значения секретов не раскрывались
- webhook уже указывает на правильный URL, но origin пока недоступен извне

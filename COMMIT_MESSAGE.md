# COMMIT_MESSAGE.md

## Proposed commit message

бот: обновить модель AssemblyAI

## Details
- заменить снятую с поддержки модель `universal` на `universal-3-5-pro`
- оставить `universal-2` как fallback для неподдерживаемых языков
- зафиксировать текущую фазу проверки Telegram-редактора в continuity ledger

## Notes for reviewer
- Telegram и AssemblyAI токены проверяются без вывода значений секретов
- typecheck сервиса проходит

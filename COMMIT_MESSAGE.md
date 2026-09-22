# COMMIT_MESSAGE.md

## Proposed commit message

Исправить публикацию изображений через Telegram-бота

## Details
- сохранять владельца репозитория для подготовленных WebP и редактируемых файлов после rollback
- восстанавливать доступ AGY перед каждой проверкой worktree
- не отправлять ложное `Erledigt`, если изображение не привело к изменению сайта

## Notes for reviewer
- причина подтверждена production-журналом и правами файлов после истёкшего подтверждения
- Telegram bot typecheck, site lint и build прошли локально
- production image smoke и финальные health/worktree проверки выполняются после deploy

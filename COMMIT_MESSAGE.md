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
- commit `ff21330` запушен и развёрнут fast-forward на production
- production image smoke подтвердил content diff, asset diff, allowlist и корректный rollback
- service active, `NRestarts=0`, webhook/health/site/worktree проверены

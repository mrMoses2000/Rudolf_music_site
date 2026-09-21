# COMMIT_MESSAGE.md

## Proposed commit message

Перевести Telegram-бот с Codex на AGY

## Details
- запускать Google Antigravity CLI 1.2.7 headless через непривилегированного `ubuntu`
- передавать prompt через NDJSON stdin и принимать только terminal status `SUCCESS`
- закрепить `gemini-3.8-flash-medium`, sandbox, workspace и timeout
- проверять чистоту worktree, allowlist изменений и очищать неожиданные untracked files
- добавить rollback-safe production migration и root-owned AGY wrapper
- сохранять подчёркивания внутри технических идентификаторов Telegram

## Notes for reviewer
- значения секретов не записывались и не выводились
- production commits: `f9077af`, `4658d8e`, `517fce3`
- backup: `/var/backups/musikschule-agy-migration/20260921T162555Z`
- bot active/enabled, `NRestarts=0`, webhook/health/site/worktree проверены
- write smoke и webhook → AGY → Telegram E2E успешны; Codex не участвует в runtime

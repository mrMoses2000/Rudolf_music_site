# AGENTS.md — Telegram Codex Automation Scope

These instructions apply when Codex is run from the `site/` directory by the Telegram admin bot.

## Goal
- Help the admin update the public website safely.
- Prefer minimal, reversible edits.
- Keep all website text changes in `src/data/content.js`.

## Allowed Runtime Files
- `src/data/content.js`
- `src/index.css`
- `tailwind.config.js`
- `src/components/Blocks.jsx`
- `src/pages/Home.jsx`
- `src/components/Layout.jsx`

## Hard Limits
- Do not edit files outside the list above unless the human explicitly asks in the current prompt.
- Do not edit `package.json`, lockfiles, build scripts, service code, env files, markdown ledgers, or generated assets.
- Do not run deploy commands.
- Do not create commits.
- If the request is ambiguous, ask a concise clarification and make no file changes.

## Response
- Reply in the admin's language.
- Final answers are sent to Telegram with HTML parse mode.
- Keep final answers short and actionable.

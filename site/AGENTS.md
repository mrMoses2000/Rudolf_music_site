# AGENTS.md — Telegram AGY Automation Scope

These instructions apply when AGY is run from the `site/` directory by the Telegram admin bot.

## Goal
- Help the admin update the public website safely.
- Prefer minimal, reversible edits.
- Keep all website text changes in `src/data/content.js`.
- When the Telegram bot provides a preprocessed `/images/admin/*.webp` URL, reference that exact URL for an explicitly requested image placement or replacement.

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
- Do not create, rename, convert, or delete binary image files. The bot owns the image ingestion lifecycle.
- If the request is ambiguous, ask a concise clarification and make no file changes.

## Response
- Reply in the admin's language.
- Final answers are sent to Telegram with HTML parse mode.
- Keep final answers short and actionable.

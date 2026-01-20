# CONTINUITY.md

- Goal (incl. success criteria):
  - Сделать блок "Unsere Standorte" более выразительным и читабельным (карточки с адресами).
- Constraints/Assumptions:
  - Follow AGENTS.md; content source of truth is `music_site_copy/`; edit text/images via `site/src/data/content.js`.
  - Language rule: communicate in Russian.
  - Sandbox: danger-full-access; network enabled; approval_policy never.
- Key decisions:
  - Коммит перестановки логотипа сделан отдельно.
  - Добавить пункт меню "Unsere Standorte" (ссылка на `/standorte`) и убрать AGB/Impressum из верхнего меню; оставить их в футере.
- State:
  - Done:
    - Коммит: `ui: поменяли местами логотип и текст`.
    - В шапке добавлен пункт "Unsere Standorte", AGB/Impressum убраны из верхнего меню (desktop + mobile).
    - Обновлен контент `pages.standorte` под 3 адреса клиента.
    - Исправлен синтаксис строк адресов в `site/src/data/content.js` (переносы строки через `\n`).
    - Страница `/standorte` переведена на карточки адресов (grid).
    - Убрано дублирование заголовка "Unsere Standorte" на странице.
  - Now:
    - Подтвердить, что заголовок и карточки выглядят логично.
  - Next:
    - Внести точечные правки по замечаниям пользователя.

- Open questions (UNCONFIRMED if needed):
  - UNCONFIRMED: написание адреса "Kleebrink" vs "Kleebring".
  - UNCONFIRMED: оставить AGB/Impressum в мобильном меню или тоже убрать.
- Working set (files/ids/commands):
  - Files: `site/src/pages/Standorte.jsx`, `site/src/data/content.js`, `CONTINUITY.md`.
  - Commands: `rg -n "Kleebring|Kleebrink" site/src/data/content.js`.

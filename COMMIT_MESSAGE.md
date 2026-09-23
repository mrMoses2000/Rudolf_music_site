# COMMIT_MESSAGE.md

## Proposed commit message

Исправить публикацию фото на странице «Über uns»

## Details
- добавить поддержку inline-блоков изображений и настраиваемого hero на странице `/about`
- уточнить для AGY: «поставь фото на страницу» означает добавить image-блок в `content.js`, а не завершать ход без diff
- сохранить отдельное поведение для явной замены hero/background

## Notes for reviewer
- новая фотография с Telegram unique id `AQADjxxrG4WgoUl8` была доставлена, но AGY завершил ход без изменения сайта
- причина: `/about` имела жёсткий hero и не рендерила `image`-блоки, поэтому агент не мог выразить публикацию через разрешённый `content.js`
- локальные typecheck, lint и build прошли; production deployment и новый AGY smoke выполняются после коммита

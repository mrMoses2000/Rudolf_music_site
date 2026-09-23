# COMMIT_MESSAGE.md

## Proposed commit message

Сообщать о повторно отправленном фото как об уже опубликованном

## Details
- узнавать уже опубликованное фото по Telegram `file_unique_id` и ссылке в `content.js`
- при отсутствии нового diff показывать существующий URL и запрашивать точное место для дополнительного размещения
- сохранять прежнее сообщение об отказе для действительно новых фото без изменения сайта

## Notes for reviewer
- production updates `623942980/981` обработаны без ошибки; AGY вернул success без diff
- обе повторные отправки имеют unique id опубликованного фото `AQAD9xtrG4WgoUl8`
- typecheck и локальная проверка known/unknown photo прошли

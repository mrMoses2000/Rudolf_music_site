# COMMIT_MESSAGE.md

## Proposed commit message

Исправить права опубликованных Telegram-изображений

## Details
- задавать новым WebP mode 644, доступный nginx после Docker COPY
- проверять HTTP 200 у новых изображений после пересборки перед сообщением об успехе
- сохранить опубликованное пользователем изображение и ссылку на него

## Notes for reviewer
- причина подтверждена ответом origin HTTP 403 и mode 640 в Docker image
- сохранён production commit `9c2b1ae` с пользовательским фото
- bot typecheck, site lint/build прошли локально
- commit `36c52b0` развёрнут; сайт повторно собран из source WebP mode 644
- origin/public URL возвращают `200 image/webp`, бот active, worktree clean

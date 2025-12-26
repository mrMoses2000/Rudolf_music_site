---
description: Начало дизайна — создание Hero-секции по референсу
---

# 1. Начало дизайна (Hero Section)

## Технологии
- Использовать **только чистый HTML, CSS и JavaScript** (без фреймворков)
- Никаких Tailwind, Bootstrap и т.п.

## Задача
Создать идеальную Hero-секцию, **максимально похожую на загруженную картинку-референс**.

## Шрифты
- Подобрать похожие шрифты из Google Fonts
- Типы: антиквы (serif), гротески (sans-serif), моноширинные (monospace), рукописные (cursive)
- Подключить через `<link>` в `<head>`

## Иконки
- Использовать **Iconify** для иконок (CDN подключение)
- Подключение: `<script src="https://code.iconify.design/3/3.1.0/iconify.min.js"></script>`
- Использование: `<span class="iconify" data-icon="mdi:phone"></span>`

## Стиль кода
- Аккуратные отступы
- Минималистичная типографика
- Соблюдать визуальный ритм и пропорции
- Использовать CSS переменные для цветов

## Структура файлов
```
/
├── index.html
└── css/
    └── style.css
```

## Пример подключения шрифтов
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Важно
- Сначала проанализировать референс, определить цвета, шрифты, отступы
- Создать pixel-perfect версию Hero-секции
- Использовать семантичные HTML5 теги

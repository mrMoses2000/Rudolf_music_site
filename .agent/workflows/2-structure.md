---
description: Структурирование проекта — организация кода после создания Hero
---

# 2. Структурирование проекта

## Когда использовать
После того как **Hero-секция готова и одобрена**.

## Задача
«Узаконить» архитектуру кода, сделать её системной и масштабируемой.

## Структура HTML
Разделить код на чёткие логические блоки:

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Musikschule CMS Bielefeld</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <!-- Навигация, логотип, контакты -->
    </header>

    <main>
        <!-- Hero-секция перемещается сюда -->
        <section class="hero">...</section>
        
        <!-- Дальнейшие секции -->
        <section class="about">...</section>
        <section class="services">...</section>
        <!-- и т.д. -->
    </main>

    <footer>
        <!-- Подвал сайта -->
    </footer>
</body>
</html>
```

## Глобальные стили (css/style.css)

### CSS-переменные
```css
:root {
    /* Цвета */
    --color-primary: #...;
    --color-secondary: #...;
    --color-text: #...;
    --color-background: #...;
    
    /* Типографика */
    --font-primary: 'Inter', sans-serif;
    --font-heading: 'Playfair Display', serif;
    
    /* Размеры */
    --container-width: 1200px;
    --spacing-unit: 8px;
}
```

### Контейнер
```css
.container {
    max-width: var(--container-width);
    margin: 0 auto;
    padding: 0 calc(var(--spacing-unit) * 3);
}
```

### Базовые стили
```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-primary);
    color: var(--color-text);
    line-height: 1.6;
}

section {
    padding: calc(var(--spacing-unit) * 10) 0;
}
```

## Структура файлов (расширенная)
```
/
├── index.html
├── css/
│   ├── style.css       # Глобальные стили + переменные
│   ├── header.css      # Стили хедера (опционально)
│   └── sections.css    # Стили секций (опционально)
├── js/
│   └── main.js         # JavaScript (при необходимости)
└── img/
    └── ...             # Изображения
```

## Цель
- Сделать вёрстку **системной и предсказуемой**
- Все секции должны **наследовать общий дизайн**
- Нейросеть не должна создавать «кашу» при добавлении новых блоков
- Единообразные отступы, ширина контейнера, типографика

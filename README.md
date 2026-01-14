# Musikschule CMS Bielefeld (Project Rudolf)

Добро пожаловать в репозиторий проекта **Musikschule CMS Bielefeld**.
Это современное веб-приложение для музыкальной школы, построенное на стеке React + Vite, которое заменило старый статический сайт.

## 🚀 Быстрый старт

### Требования
- Node.js (v18+)
- Docker (для production сборки и проверки контейнеров)

### Локальная разработка
```bash
cd site
npm install
npm run dev
```
Сайт будет доступен по адресу `http://localhost:5173`.

### Production сборка и запуск (Docker)
В корне проекта есть скрипт автоматизации:
```bash
./run.sh
```
Этот скрипт:
1. Собирает Docker-образ.
2. Поднимает Nginx-контейнер.
3. Доступен по адресу `http://localhost:80` (или `http://<IP-сервера>`).

---

## 🔐 HTTPS (443) и сертификаты Let's Encrypt

### DNS (у провайдера домена)
Нужны прямые DNS-записи, без URL-перенаправления:
- A: `musikschule-cms-bielefeld.de` → `3.79.24.73`
- CNAME: `www` → `musikschule-cms-bielefeld.de`  
  (или второй A на тот же IP)

Рекомендуется отключить "Weiterleitung/URL-Forwarding", чтобы избежать конфликтов и лишних редиректов.

### Порты
Откройте входящие 80 и 443 в firewall / security group.

### Получение сертификатов
Скрипт `run.sh` автоматически получит/обновит сертификаты, если:
- Установлен `certbot`
- Передан домен в переменной `DOMAIN`

Пример запуска:
```bash
DOMAIN=musikschule-cms-bielefeld.de CERTBOT_EMAIL=admin@musikschule-cms-bielefeld.de ./run.sh
```

Можно хранить переменные в файле и не передавать их каждый раз:
- `/etc/music_school.env` (предпочтительно, вне репозитория)
- `.env` рядом с `run.sh`

Пример `/etc/music_school.env`:
```bash
DOMAIN=musikschule-cms-bielefeld.de
CERTBOT_EMAIL=admin@musikschule-cms-bielefeld.de
CERT_CHECK_DAYS=30
```

По умолчанию сертификаты размещаются в:
```
/etc/letsencrypt/live/musikschule-cms-bielefeld.de/
```

### Автопродление
`run.sh` создаёт скрипт и cron-задачу:
- Скрипт: `/usr/local/bin/renew_music_school_ssl.sh`
- Cron: `/etc/cron.d/music_school_ssl_renew` (ежедневно в 04:00)

Логика: если сертификат истекает менее чем через 30 дней — контейнер
останавливается, выполняется `certbot certonly --standalone`, затем
контейнер запускается заново.

По умолчанию `run.sh` отключает `certbot.timer`, чтобы избежать двойного продления.

---

## 🏗 Архитектура

Проект является **Single Page Application (SPA)**.
- **Frontend Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Routing:** [React Router v7](https://reactrouter.com/)

### Ключевые особенности
1.  **Data-Driven Design**: Весь контент (тексты, ссылки на изображения, цены) вынесен в `site/src/data/content.js`. Это "CMS" данного проекта. Изменения в этом файле автоматически отражаются на сайте.
2.  **Blocks System**: Компонент `Blocks.jsx` (`site/src/components/Blocks.jsx`) рендерит контент из JSON. Поддерживает заголовки (`h1`-`h4`), параграфы (`p`), списки (`ul`, `li`).
3.  **Instrument Template**: Страница `InstrumentPage.jsx` является универсальным шаблоном для всех инструментов (Скрипка, Гитара и т.д.). Данные подгружаются динамически на основе URL (slug).
4.  **Optimized Images**: Использование компонента `SmartImage` для поддержки WebP и `srcSet`, обеспечивая быструю загрузку адаптивных изображений.

---

## 📂 Структура проекта

### Корневые файлы
- `AGENTS.md`: Инструкции для AI-агентов по работе с проектом.
- `CONTINUITY.md`: Журнал прогресса и текущего состояния задач (Context Ledger).
- `Info.md`: Общая информация о проекте (архив).
- `run.sh`: Скрипт деплоя.
- `music_site_copy/`: 🛑 **Архив легаси сайта**. Используется как "Source of Truth" (источник истины) для сверки контента.
- `n8n_doc_base/`: Документация по n8n (справочная информация для настройки автоматизаций, если потребуется).

### `site/` (Исходный код приложения)
```text
site/
├── public/              # Статические ассеты
│   ├── images/          # Все изображения сайта
│   └── ...
├── src/
│   ├── components/      # UI компоненты
│   │   ├── Layout.jsx   # Общий макет (Header, Footer)
│   │   ├── Blocks.jsx   # Рендер текстовых блоков
│   │   └── SmartImage.jsx # Оптимизированное изображение
│   ├── data/
│   │   └── content.js   # 🧠 ГЛАВНЫЙ ФАЙЛ КОНТЕНТА
│   ├── pages/           # Страницы (Home, About, Contact и др.)
│   ├── App.jsx          # Роутинг и глобальные настройки
│   └── index.css        # Tailwind директивы и шрифты
├── Dockerfile           # (Генерируется скриптом run.sh)
├── nginx.conf           # (Генерируется скриптом run.sh)
└── vite.config.js       # Конфигурация Vite
```

---

## 🛠 Workflow разработки

### Как изменить текст или цену?
1. Откройте `site/src/data/content.js`.
2. Найдите нужную секцию (например, `fees` для цен или `pages.about` для текста "О нас").
3. Измените значение.
4. Готово! React автоматически обновит интерфейс.

### Как добавить новое изображение?
1. Поместите файл изображения в `site/public/images/`.
2. (Опционально) Создайте WebP версии для оптимизации.
3. Укажите путь к изображению в `content.js`, например: `/images/my-new-photo.jpg`.

### Как сверить контент с оригиналом?
Если возникают сомнения, какой текст должен быть на странице:
1. Зайдите в папку `music_site_copy/musikschule-cms-bielefeld.de/`.
2. Найдите соответствующий `.html` файл (например, `JeKits.html`).
3. Используйте его содержимое как эталон.

---

## 🤖 Для AI-ассистентов
При начале работы с проектом:
1. **ВСЕГДА** читайте `CONTINUITY.md` для понимания текущего контекста и незавершенных задач.
2. Соблюдайте правила, описанные в `AGENTS.md`.
3. Основной язык коммуникации: Русский (если не указано иное). 

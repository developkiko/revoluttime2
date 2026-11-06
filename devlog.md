# RevolutTIME — devlog

Хронология разработки нового сайта. Коммиты в `main` → автодеплой на Vercel.
Последние коммиты — см. `git log`; логотип-исходник — `c60e5db`.

## 01.11.2026

### `9f0409b` — базовый лейаут и главная v1
- Настроен next-intl (i18n/routing|request|navigation, messages de/ru/en, `proxy.ts` — в Next 16 middleware переименован в proxy), плагин в next.config.
- Создан `app/[lang]/layout.tsx` как корневой layout (html lang=locale, шрифты, провайдеры); стартовые `app/layout.tsx`/`app/page.tsx` удалены.
- Корзина (`CartProvider` на useSyncExternalStore + localStorage, правила хуков react-hooks v6), CartDrawer на Sheet.
- Header (логотип, навигация, переключатель языков, бадж корзины), Footer (контакты Hebertshausen + Impressum/Datenschutz/AGB/Widerruf).
- Hero + ProductVariants (фасовки 90/120), фото продукта в `public/imgs/product/`.

### `ab520ce` — перестройка под направления
- Добавлены /shop, /hydrogen, /studio, /partner; на главной — сетка направлений.
- lib/catalog.ts: офферы (спорт/отдых/туризм) + слоты бронирования (LocalozedText, date/maxPeople/priceCents).
- BookingWidget: выбор даты, участники, билет в общую корзину (товар может быть «билетом»).

### `33f1d28` — партнёрский фокус главной
- Hero уменьшен до слайдера направлений; сетка направлений; PartnerSection с шагами.
- Заявления «сосуды/кровь» возвращены со звёздочками → сноски с HWG-оговоркой внизу страницы водорода.
- Убран тизер таблеток с главной (информация — на /shop и /hydrogen).

### `12b46e9` — ре-деплой
- Пустой коммит: Supabase `sb-revolut-db` был на паузе, из-за чего деплой падал. После включения базы — перезапущен и проверен (все новые маршруты 200 на проде).

## 02.11.2026

### `d2ab08d` — четыре направления + полный слайдер
- Hero-слайдер стал «листается весь блок» (стрелки по бокам, точки + счётчик, адаптив).
- 4 направления с под-страницами: /sport+/sport/[slug] (бадминтон, теннис), /recreation+/[slug], /tourism+/[slug], /hydrogen/tablets.
- Брендовый 2-слойный логотип и пентагон рефералов — перенесены с revoluttimenew (CSS/SVG извлечены из старого сайта).
- Компактный переключатель языков (dropdown), тема dark/light (next-themes; на телефонах тоже).
- фикс: горизонтальный оверфлоу от баджа корзины (overflow-x: clip).

### `4c21ce2` — иконки, анимации, скелетоны, очередь тостов, панель авторизации
- Эмодзи → lucide (применение, сравнение магния).
- Шаги партнёрки: цвета по шагам (sky/violet/amber/emerald), акцентные полоски, каскадное появление (whileInView), hover-подъём + свечение + пружинная иконка.
- `app/[lang]/loading.tsx` + ui/skeleton — скелетон навигации для всех страниц.
- Тосты sonner: `visibleToasts={1}` — очередь, а не стопка.
- Панель авторизации в шапке (Popover): форма RHF+zod (мок), UserMenu.

### `c633bda` — настоящая авторизация Telegram + Google
- Сессия: подписанная HMAC httpOnly-cookie (`lib/auth-session.ts`), /api/auth/me, /api/auth/logout.
- Telegram Login Widget (@revoluttime_bot) → /api/auth/telegram: HMAC-SHA256 проверка данных (24ч анти-реплей).
- Google OAuth code flow: /api/auth/google/start → согласие → /api/auth/google/callback (обмен кода, userinfo).
- Панель: виджет Telegram + кнопка Google; email/пароль — после API аккаунтов.

### `1694af1` — каскад уровней и /dummy
- LevelsCascade: 6 цветных уровней A–F (slide-in слева; hover: сдвиг + заливка чипа + тинт фона — другой, чем у шагов).
- ContactWidget: форма (RHF+zod) + контактная карточка.
- /dummy: песочница всех компонентов (noindex) — по образцу старого /ru/dummy.

### `f2de75d` + `fcf101f` — заявки админам в Telegram, политики
- /api/contact: валидация zod → пересылка админам в Telegram (TELEGRAM_ADMIN_CHAT_ID) + инбокс для админки.
- /api/telegram/webhook: бот отвечает на /start chat_id владельца (регистрация админа); вебхук переключён со старого сайта на этот (`setWebhook` → /api/telegram/webhook, подтверждено Telegram).
- Datenschutz дополнен бронями студий/поездок (участники).
- Сообщения админ-панели читаются с /api/admin/messages (гейт isAdmin).

### `f95c067` — страницы политик (de/ru/en)
- /[lang]/legal/[slug]: impressum (§ 5 DDG, Kleinunternehmer § 19 UStG), datenschutz (GDPR: хостинг Vercel, localStorage, контакты/заказы, внешние входы, права, BayLDA), agb, widerrufsbelehrung (исключение вскрытых БАД по § 312g BGB).
- RU/EN с плашкой «немецкая версия юридически обязательна».

## 08480c6 → 2c76897 — пять направлений владельца
- Структура приведена к списку владельца: таблетки / студия / оборудование / активно-спортивный отдых / рефералка («деньги делают деньги»).
- Hero-слайдер: 5 целых блоков; сетка направлений — 5 карточек; nav/footer обновлены.
- /sport и /tourism слиты в /recreation (все брони вместе); /equipment — новая страница.

### `9e85362` + `2c76897` — оборудование по поставщикам владельца
- 4 позиции: H₂-ингалятор 900–3600 мл/мин (H2Medical, Hydrogen Wellness), EMS miha bodytec, Red Light панели/капсулы (IDEATHERAPY, SunPlus), виброплатформа (Hypervibe, LifePro) — карточки со ссылками на производителей.
- «Минимальный старт студии» (EMS + Red Light + ингалятор + свои таблетки OEM; теги Recovery/Longevity/Biohacking/Anti-Aging/Performance; 30–50 м²) + OEM-блок (Private Label таблетки).
- 2c76897 — фикс: вернуть импорт ArrowUpRightIcon.

## 8d8f62a — владелец = админ
- chat_id владельца `5157746090` (получен через /start бота): TELEGRAM_ADMIN_CHAT_ID и ADMIN_EMAILS (дефолт кода + .env.local).
- Проверена доставка Telegram-сообщений владельцу.

### `fcf101f` — Datenschutz про брони
- Раздел 5 дополнен: брони студийных сессий/поездок (имя, контакты, участники).

## Известные инциденты/уроки
- Supabase на паузе валил деплой → после включения переподтвердить Redeploy.
- cacheComponents: `new Date()` запрещён при пререндере → клиентские useSyncExternalStore-паттерны.
- react-hooks v6: setState в useEffect → useSyncExternalStore.
- Turbopack: `getOfferSlot` должен импортироваться из правильного модуля (проверять импорты после рефакторинга).
- Turbopack кеширует CSS между сборками: правки `globals.css` могут не попасть в `next build` (JS пересобирается, CSS — нет) → `rm -rf .next` перед пересборкой (грабля №12 в project.md).
- opentype.js `toPathData` может выдать NaN на отдельных Q-командах (баг оптимизации) → сериализовать команды пути самостоятельно.
- Windows/Git Bash: кириллица в curl-JSON ломается → слать через node fetch.

## 06.11.2026

### `c60e5db` — точная копия логотипа revolut-first-eight (CSS + SVG)
- Шрифты Poppins (600/900, latin) из исходника `F:\WebstormProjects\revoluttime` скопированы в `public/fonts/`, импорт `poppins.css` в globals.css.
- Секция «Original-Logo» на /dummy: точная копия `.logo-wrap` (классы `src8-*`): шапочный вариант (custom-head-logo, 24px, обводка 2px) и hero (custom-logo, 10vw, float-анимация, обводка 4px). Значения выверены по computed styles живого сайта (computed, а не исходный CSS — в Tailwind-утилитах исходника часть правил перекрывается специфичностью).
- Выверен нюанс исходника: у `h1.fg` 45°-градиент заголовков (gold-text-animation) задан, но невидим — перекрыт непрозрачным цветом текста #1A2438; «синева» на глифах — это полосы нижнего слоя div.bg, выглядывающие из-за scaleY(1.05) и сдвига fg на -2px (пиксель-проверено на живом сайте).
- SVG-копия hero: `public/imgs/brand/revoluttime-hero.svg` — Poppins → кривые (opentype.js, baseline 152/190 по метрикам hhea), полосы 105° → linearGradient spreadMethod=repeat (один период 12% оси), scaleY(1.05)+drop-shadow как в CSS; fg — сплошная #1A2438.
- Vercel MCP перепроверен: авторизация ок (developkiko, team по умолчанию верная), но API команду не отдаёт: проекты — пустой список, `GET /v9/projects/{id}` → 404, deployments → 403; CLI бесполезен (`VERCEL_TOKEN` в окружении невалиден). Диагноз уточнён в project.md (грабля №11).

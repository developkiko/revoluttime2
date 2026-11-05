# RevolutTIME — обзор проекта

> Прочти также `roadmap.md` (статус задач) и `devlog.md` (история разработки).

## Что это

Сайт экосистемы **RevolutTIME** — бренд активного долголетия (Мюнхен, Германия).
Владелец: Gewerbe Yuriy Moshenets, Weilbacher 10, 85241 Hebertshausen (тел/WhatsApp +49 175 9590916). Бренд принадлежит YULKK UNITED CORP., США.

**5 направлений (утверждено владельцем):**
1. **Таблетки** — шипучие таблетки Магний + H₂ (90 таб. €18.99 / 120 таб. + бокс €24.99), покупка онлайн через корзину.
2. **Фитнес биохакинг студия** — Hydrogen Breathing, Red Light, нанокостюм, вибротренинг, силовой тренинг, восстановление.
3. **Продажа оборудования** — H₂-ингаляторы (900–3600 мл/мин), Red Light панели, EMS miha bodytec, виброплатформы. Цена по запросу.
4. **Активно спортивный отдых** — бадминтон, термы, забеги, хайкинг. Бронирование: дата + число участников.
5. **Реферальная программа** — «Деньги делают деньги»: до 30%, уровни A–F, пожизненные бонусы, выплаты на карту/крипто/Telegram.

Упрощённый UX: без отдельных карточек товара — всё на направленческих страницах + корзина (общая для таблеток и «билетов»).

## Стек и тулчейн

- **Next.js 16.4.3** (App Router, Turbopack, `cacheComponents: true`, `partialPrefetching: true`) + **React 19.3**
- **Tailwind CSS v4** (CSS-first конфиг в `globals.css`, без tailwind.config) + **shadcn/ui** (style `radix-vega`, компоненты импортируют `cn` из пакета `cn` и примитивы из пакета `radix-ui` — НЕ из `@radix-ui/*`)
- **next-intl 4.14.9** — локали `de` (дефолт), `ru`, `en`; все тексты только через messages/*.json
- **framer-motion** (анимации), **sonner** (тосты, visibleToasts=1 — очередь), **next-themes** (dark/light, class-стратегия)
- **react-hook-form + zod** (формы), **lucide-react** (иконки, эмодзи запрещены)
- Supabase (`@supabase/ssr`, `supabase-js`) и grammy установлены, **но в код не подключены** (см. roadmap)
- Хостинг: **Vercel** (Git-интеграция: push в main = автодеплой)

## ⚠️ Важные конвенции и грабли (Next 16 / окружение)

1. **middleware переименован в `proxy.ts`** (Next 16) — локаль-мидлварь next-intl живёт там.
2. `params` в страницах/лейаутах — **Promise** (`await params`). Глобальные типы `LayoutProps<'/x'>`, `PageProps<'/x'>` доступны без импорта.
3. `app/[lang]/layout.tsx` — **корневой layout** (содержит `<html>`); `app/layout.tsx` не существует.
4. **`cacheComponents: true`**: нельзя `new Date()` при пререндере (год — через `useSyncExternalStore`, см. `components/layout/CurrentYear.tsx`).
5. **react-hooks v6 (eslint)**: запрещён `setState` напрямую в `useEffect` — сторы на `useSyncExternalStore` (корзина, профиль, auth, CurrentYear).
6. Route-файлам (`route.ts`/`page.tsx`) **нельзя иметь лишние экспорты** — вспомогательные функции выносить в `lib/` или компоненты.
7. **`NEXT_PUBLIC_*` запекаются при сборке** — после добавления env в Vercel нужен полный **Redeploy**.
8. Правило владельца: **все изменения → сразу все 3 локали (de+ru+en) → коммит → push**.
9. Валидация JSON переводов: `node -e "JSON.parse(...)"` перед билдом.
10. Кириллица в `curl` на Windows ломает UTF-8 — Telegram API звать через `node -e "fetch(...)"`.
11. Vercel MCP не видит этот проект (403/404 на deployments/env) — деплой перезапускать **пустым коммитом** в main.

## Дерево проекта (корень = репозиторий)

```
revoluttime/                     ← здесь .env.local, .gitignore, AGENTS.md
├── proxy.ts                     ← next-intl middleware (Next 16 конвенция)
├── i18n/                        ← routing.ts (локали), request.ts (messages loader), navigation.ts (Link/useRouter)
├── messages/                    ← de.json, ru.json, en.json — ВСЕ тексты сайта
├── lib/
│   ├── products.ts              ← фасовки таблеток, SITE (телефон/WhatsApp/Telegram), formatPrice
│   ├── catalog.ts               ← офферы (спорт/отдых/туризм/equipment) + слоты бронирования; мок под Supabase
│   ├── auth-session.ts          ← подписанная HMAC session-cookie (сервер)
│   ├── auth-store.ts            ← клиентская сессия (useSyncExternalStore, /api/auth/me)
│   ├── profile-store.ts         ← displayName + аватар (dataURL) в localStorage
│   ├── partner-demo.ts          ← демо-данные кабинета (партнёры, покупки, бонусы, баланс)
│   ├── admin-store.ts           ← демо-оверлей офферов для админки (localStorage)
│   ├── contact-inbox.ts         ← инбокс заявок (в памяти, demo)
│   └── utils.ts                 ← cn()
├── components/
│   ├── layout/                  ← Header, Footer, Logo (2-слойный брендовый), ThemeToggle, AuthPanel, TelegramLoginWidget, LoginNotice, CtaBanner, CurrentYear
│   ├── home/                    ← HeroSection (слайдер 5 блоков), DirectionsSection (5 карточек), PartnerSection (+pentagon), UsageSection
│   ├── shop/ProductVariants.tsx ← карточки фасовок 90/120 + корзина
│   ├── cart/                    ← CartProvider (useSyncExternalStore+localStorage; pack|ticket), CartDrawer
│   ├── booking/BookingWidget.tsx← выбор даты + участники + цена → билет в корзину
│   ├── sections/                ← OffersGrid, OfferDetail (общие для списков/деталей броней)
│   ├── partner/                 ← PartnerSteps (цветные анимированные), LevelsCascade (A–F)
│   ├── contact/ContactWidget.tsx← форма → /api/contact
│   ├── cabinet/                 ← ProfileCard (аватар/имя/экспорт/удаление), ReferralLink, WithdrawButton
│   ├── admin/                   ← AdminPanel (вкладки), AdminDemoButton
│   └── ui/                      ← shadcn: button, card, input, sheet, dialog, dropdown-menu, popover, skeleton, sonner…
├── app/
│   ├── api/
│   │   ├── auth/telegram/webhook/  ← POST: бот; /start отвечает chat_id
│   │   ├── auth/google/start|callback/ ← OAuth code flow
│   │   ├── auth/telegram/          ← POST: HMAC-проверка Login Widget → сессия
│   │   ├── auth/me, auth/logout, auth/dev-admin (демо-админ; отключается AUTH_DEMO_MODE=false)
│   │   ├── contact/                ← POST: заявка → Telegram админам + инбокс
│   │   └── admin/messages/         ← GET: инбокс (только isAdmin)
│   └── [lang]/
│       ├── layout.tsx  ← КОРНЕВОЙ layout: <html lang>, шрифты, ThemeProvider, NextIntlClientProvider, CartProvider, Header/Footer/CartDrawer/Toaster/LoginNotice
│       ├── page.tsx    ← главная: HeroSection (5 слайдов) + DirectionsSection + PartnerSection
│       ├── loading.tsx ← скелетон навигации
│       ├── shop/       ← покупка таблеток (ProductVariants + UsageSection)
│       ├── hydrogen/   ← наука H₂ (+ hydrogen/tablets — под-страница «состав/усвоение/сравнение»)
│       ├── studio/     ← студия (6 услуг из визитки)
│       ├── equipment/  ← оборудование (поставщики, старт-набор студии, OEM, форма)
│       ├── recreation/ ← все брони (спорт+отдых+туризм) + recreation/[slug] (деталь + BookingWidget)
│       ├── partner/    ← рефералка: как работает, выгоды, каскад A–F, выплаты, CTA
│       ├── cabinet/    ← кабинет (гейт: вход обязателен)
│       ├── admin/      ← админка (гейт: ADMIN_EMAILS)
│       ├── dummy/      ← песочница всех компонентов (noindex)
│       └── legal/[slug]/ ← impressum | datenschutz | agb | widerruf
├── public/imgs/                ← product/ (таблетки), brand/ (бокс ADD LIFE)
├── messages/*.json, i18n/, proxy.ts
└── AGENTS.md                   ← автоген Next.js, не трогать
```

## Модули (данные и состояние)

| Модуль | Хранилище | Что держит |
|---|---|---|
| `lib/catalog.ts` | статичный seed → потом Supabase | офферы 4 секций, слоты (date/maxPeople/priceCents), suppliers[], LocalizedText de/ru/en |
| `components/cart/CartProvider` | localStorage `revoluttime-cart-v2` | товары `pack` (90/120 таб) и `ticket` (оффер+слот+люди) — корзина общая |
| `lib/auth-store.ts` | httpOnly cookie (`rt_session`, HMAC-SHA256) | сессия: email/name/provider/picture/isAdmin |
| `lib/profile-store.ts` | localStorage `revoluttime-profile-v1:<email>` | displayName, аватар (dataURL 256px) |
| `lib/admin-store.ts` | localStorage `revoluttime-admin-offers-v1` | демо-оверлей правок офферов (до Supabase) |
| `lib/contact-inbox.ts` | память сервера (эфемерно) | заявки формы для вкладки «Сообщения» |
| `lib/partner-demo.ts` | статика | демо: партнёры, покупки, бонусы, баланс 84.50 € |

## API-эндпоинты

| Метод | Путь | Что делает | Env |
|---|---|---|---|
| GET | `/api/auth/me` | текущий юзер или null | — |
| POST | `/api/auth/logout` | очистить cookie | — |
| POST | `/api/auth/telegram` | HMAC-проверка данных Login Widget → сессия | TELEGRAM_BOT_TOKEN |
| GET | `/api/auth/google/start` | 302 на согласие Google | NEXT_PUBLIC_GOOGLE_CLIENT_ID |
| GET | `/api/auth/google/callback` | обмен кода → userinfo → сессия | + GOOGLE_CLIENT_SECRET |
| POST | `/api/auth/dev-admin` | ДЕМО: вход admin@revoluttime.de (отключить: AUTH_DEMO_MODE=false) | — |
| POST | `/api/telegram/webhook` | вебхук бота; /start → отвечает chat_id | TELEGRAM_BOT_TOKEN |
| POST | `/api/contact` | заявка формы → Telegram админам + инбокс | TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID |
| GET | `/api/admin/messages` | инбокс (только isAdmin) | — |

## Внешние сервисы

| Сервис | Детали |
|---|---|
| **Vercel** | проект `revolut-time` (id `prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR`; прод: https://revolut-time.vercel.app; git: `developkiko/revoluttime2` → main. ⚠️ Vercel MCP не имеет доступа к деплоям/env этого проекта (403/404) |
| **Supabase** | `sb-revolut-db` → https://qyksdgzguhtjhnrswiib.supabase.co — проект поднят, НО в код не подключён (нет ключей в env, нет таблиц) |
| **Telegram** | бот @revoluttime_bot (токен в .env.local); webhook → `/api/telegram/webhook`; чат владельца **5157746090** (туда падают заявки формы); для Login Widget нужен `/setdomain` в BotFather |
| **Google OAuth** | клиент `375681716439-2fjf695spkeoba8tnsaji618g00n1b15...` (проект hunefo в консоли); redirect: `<origin>/api/auth/google/callback`; статус Testing → добавить test users или Publish |
| **Контакты владельца** | +49 175 9590916 (WhatsApp/Tel) — визитка; адрес Hebertshausen |

## Env-переменные (`.env.local` локально; те же — в Vercel Settings → Environment Variables)

```
TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_BOT_NAME,
NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
AUTH_SESSION_SECRET, TELEGRAM_ADMIN_CHAT_ID=5157746090,
ADMIN_EMAILS=admin@revoluttime.de,5157746090@telegram.revoluttime
```
Плюс от Supabase-интеграции: NEXT_PUBLIC_SUPABASE_URL, ключи (проверить наличие в Vercel).

## Ссылки

- Прод: https://revolut-time.vercel.app · GitHub: https://github.com/developkiko/revoluttime2 (main)
- Старые сайты (источник идей): revoluttimenew.vercel.app (партнёрка), revoluttime.vercel.app (магазин v1), hidrogen-hho.vercel.app (архив)
- Документы бренда: `../infos/*.md`, фото/визитка: `../imgs/`

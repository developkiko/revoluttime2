# RevolutTIME — обзор проекта

> **Порядок чтения в новом чате:** 1) `DEVLOG_CURRENT.md` (точка передачи сессии, актуальность), 2) этот файл, 3) `roadmap.md` (статус задач), 4) `devlog.md` + `devlog_target.md` (история).

## Что это

Сайт экосистемы **RevolutTIME** — бренд активного долголетия (район Мюнхена, Германия).
Владелец: Gewerbe Yuriy Moshenets, Weilbacher Str. 10, 85241 Hebertshausen (тел/WhatsApp +49 175 9590916). Бренд принадлежит YULKK UNITED CORP., США (Reg. 81-4691539). Юрлицо на проде — Kleinunternehmer §19 UStG.

**5 направлений (утверждено владельцем):**
1. **Таблетки** — RevolutTIME Redox+ COMPLEX: шипучие таблетки Магний + H₂ (H₂ ≤ 1,6 ppm по Eurofins, 5,13 g магния), **фасовка 90 таб. — 70 €**; партнёрам 60 €/пачка при заказе от 10 пачек (+1 пачка в подарок). Покупка через корзину → Stripe Checkout.
2. **Фитнес биохакинг студия** — Hydrogen Breathing, Red Light, нанокостюм, вибротренинг, силовой тренинг, восстановление.
3. **Продажа оборудования** — H₂-ингаляторы (900–3600 мл/мин), Red Light панели, EMS miha bodytec, виброплатформы. Цена по запросу.
4. **Конференция и отдых** (б. «Активно спортивный отдых») — брони: дата + участники.
5. **Партнёрская программа** — план уровней I–V (50/10/2/1/1 % от покупки, фонд 64 %), вход 600 €, матрица 5×5, потенциал 27 000 € (`lib/mlm-calculator.ts`).

Дизайн — **точный порт шаблона Ultra Proxy** (route groups `(site)`/`(ultra)`), primary бренда — **#070E21 Midnight Navy** (решение владельца, 21.11.2026).

## Стек и тулчейн

- **Next.js 16.4.3** (App Router, Turbopack, `cacheComponents: true`) + **React 19.3**
- **Tailwind CSS v4** (CSS-first конфиг в `app/globals.css`) + **shadcn/ui** (style `radix-vega`: `cn` из пакета `cn`, примитивы из пакета `radix-ui` — НЕ из `@radix-ui/*`)
- **next-intl 4.14.9** — локали `de` (дефолт), `ru`, `en`; ВСЕ тексты сайта — `messages/{de,ru,en}.json`
- **framer-motion**, **next-themes** (dark/light, class-стратегия), **react-hook-form + zod**, **lucide-react** (эмодзи запрещены)
- **notice** — единая система уведомлений (`components/ui/notice`, варианты success/error/info/warning); **sonner удалён**
- **FX-модули** (порт с дамми старого сайта): CSS-тултипы `data-tip`, 3D-tilt `data-tilt` (+`TiltObserver`), spotlight `data-spotlight` (+`SpotlightObserver`), кастомный курсор (globals.css, z максимальный), шиммер-логотип `.rt-logo`
- **PWA**: `public/manifest.webmanifest` + `public/sw.js` (кэш только статики) + `PwaRegistration`
- **БД — одна, Supabase `revtime`** (владелец 21.11: «neon или supabase?» → консолидация): энциклопедия, orders/financial_ledger (Stripe-вебхук) **+ весь ultra/auth-стек** (users, auth_links, ultra_kv, payments, telegram_*, ultra_products/reviews, site_config, admin_chats, visits; self-healing DDL в `lib/ultra/db.ts`). Драйвер `pg` через Supabase transaction-pooler (`DATABASE_URL`, порт 6543); Neon-драйвер выпилен. `profiles`/`referral_tree` — заготовки под выплаты.
- Хостинг: **Vercel** (git `developkiko/revoluttime2` → main = автодеплой)

## ⚠️ Важные конвенции и грабли (Next 16 / окружение)

1. **middleware переименован в `proxy.ts`** (Next 16) — локаль-мидлварь next-intl там.
2. `params` в страницах/лейаутах — **Promise** (`await params`). Глобальные типы `LayoutProps<'/x'>`, `PageProps<'/x'>` доступны без импорта.
3. `app/[lang]/layout.tsx` — **корневой layout** (содержит `<html>`); `app/layout.tsx` не существует. Route groups: `app/[lang]/(site)/` (хром сайта) и `app/[lang]/(ultra)/` (свой layout/providers/ultra.css).
4. **`cacheComponents: true`**: нельзя `new Date()` при пререндере (год — `useSyncExternalStore`); `dynamic`/`dynamicParams` экспорты запрещены (runtime-данным — `await connection()`); `useSearchParams`/`usePathname` — только внутри `<Suspense>`.
5. **react-hooks v6 (eslint)**: запрещён `setState` напрямую в `useEffect` — сторы на `useSyncExternalStore`.
6. **`NEXT_PUBLIC_*` запекаются при сборке** — после добавления env в Vercel нужен Redeploy.
7. **Turbopack кеширует CSS**: правки `globals.css` могут не попасть в билд → `rm -rf .next` перед пересборкой.
8. **Off-canvas drawer + translateX(100%) раздувает scrollWidth в WebKit даже при `position: fixed`** → в `@layer base` стоит `html { overflow-x: clip }` + `visibility: hidden` у закрытого `.rt-mobile-nav` — не удалять (иначе «фантомный правый отступ»). Ширину документа мерить probe'ом (`scrollWidth` vs `clientWidth`).
9. **Cookie+PWA промпты** живут в общем fixed-контейнере `.rt-bottom-widgets` (грид; мобайл — стек, десктоп — одна строка). Стили ultra-виджетов, используемые на (site), должны жить в **globals.css** (ultra.css на site-страницах не грузится!).
10. **CustomCursor держать ВНЕ стекинг-контейнеров** (он в `SiteUltraWidgets` снаружи `.rt-bottom-widgets`) — его z-index глобальный, выше тостов.
11. **Токен-мост**: shadcn-переменные перезаписаны палитрой Ultra в globals.css. **Primary split (Midnight Navy #070E21)**: `--primary` — solid (заливные кнопки через `bg-[var(--primary)]` + `--primary-border` окантовка в dark), `--color-primary` = `var(--primary-soft)` — акцентные text/border/тинты (steel `#8fa2e0` на dark — иначе navy-текст на navy-фоне невидим). Логотип-градиент — на отдельном `--logo-grad-primary` (синие концы). НЕ заливать navy напрямую в text-*.
12. Правило владельца (**обновлено 21.11.2026, отменяет прежнее «сразу все 3 локали»**): **новые тексты — только по-русски.** Ключ создаётся сразу во всех 3 локалях (de+ru+en), но в de/en вставляется ТОТ ЖЕ русский текст, БЕЗ перевода — перевод будет отдельным батчем позже (владелец). Существующие переводы не откатывать. Дальше как раньше: валидация JSON → build без ошибок → коммит → push (main = автодеплой).
13. Кириллица в `curl` на Windows ломает UTF-8 — Telegram/JSON звать через `node -e "fetch(...)"`.
14. **Vercel MCP/CLI**: не передавать `teamId` (личный Hobby-аккаунт — с ним 404/403); env `VERCEL_TOKEN` протух — CLI-фолбэк `env -u VERCEL_TOKEN vercel …`, рабочий токен в `~/AppData/Roaming/com.vercel.cli/Data/auth.json`. Деплой-статус проверять через `gh api repos/developkiko/revoluttime2/commits/<sha>/status`.
15. **Зомби `next start`** держит порт после прерванной сессии — убивать (`netstat -ano | grep :PORT` → `taskkill //F //PID`). Локальные пробы — на свободных портах (3100+).
16. Мобильная верификация без владельца: `node scripts/check-webkit.mjs` (Playwright WebKit = движок Safari, iPhone-дескриптор; гидрация 4–8 с — ждать селектор). Владелец проверяет редко — проверять самому.
17. `/api/ultra/auth/telegram` и `/api/auth/telegram` — разные стеки; у site-варианта HMAC считается по ВСЕМ полям payload — лишние поля ломают подпись.

## Дерево проекта (корень = репозиторий)

```
revoluttime/
├── proxy.ts                      ← next-intl middleware (Next 16)
├── i18n/                         ← routing.ts, request.ts, navigation.ts (Link/usePathname/useRouter с локалью)
├── messages/                     ← de.json, ru.json, en.json — ВСЕ тексты site-стека
├── app/
│   ├── globals.css               ← токен-мост Ultra (весь дизайн), cookie/pwa, FX, курсор, bottom-widgets
│   ├── styles/port.css           ← порт с дамми (селект Popover API, tabs-glider, rb-кнопки)
│   ├── api/
│   │   ├── auth/                 ← me, logout, telegram (widget), google/{start,callback},
│   │   │                           facebook/{start,callback,deauthorize}, tg/{code,exchange} (код-флоу),
│   │   │                           links (+links/unlink — привязка аккаунтов), dev-admin (демо)
│   │   ├── telegram/webhook/     ← бот: /start → chat id; /start <code> → код-вход (ссылка в чат)
│   │   ├── contact/, admin/messages/, journey/lead/
│   │   ├── checkout/             ← Stripe Checkout Session (цены из серверного каталога)
│   │   ├── webhooks/stripe/      ← constructEventAsync → orders + financial_ledger + Telegram
│   │   └── ultra/                ← 19 роутов шаблона (auth, payment, products, reviews, visits…)
│   └── [lang]/
│       ├── layout.tsx            ← КОРНЕВОЙ: <html>, шрифты, ThemeProvider, NextIntl
│       ├── (site)/               ← хром сайта: Header/Footer/CartDrawer/CookieBanner/AnalyticsGate/SiteUltraWidgets
│       │   ├── page.tsx          ← главная (HeroSection — слайдер 5, Directions, Encyclopedia, Reviews, Partner, UltraPages)
│       │   ├── shop/ hydrogen/(+tablets) studio/ equipment/ recreation/(+[slug]) partner/ journey/
│       │   ├── cabinet/          ← 5 вкладок (CabinetTabs, хеш-роутинг #balance/#profile/…)
│       │   ├── encyclopedia/(+[slug]) legal/[slug] checkout/ admin/ dummy/ left/ status/
│       │   ├── certificates/     ← Eurofins + сертификаты (цель кликабельных бейджей)
│       │   └── auth-telegram/    ← лендинг ссылки из бота (обмен токена на сессию)
│       └── (ultra)/              ← ultra-home, features, compare, stats, prev, privacy, terms, refund, cookies, dashboard…
│           ├── layout.tsx (Providers, PwaRegistration), ultra.css (своя палитра)
├── components/
│   ├── layout/                   ← Header, Footer, Logo, ThemeToggle, AuthPanel (2 кнопки+AuthModal | user-pill),
│   │                              AuthModal (табы Вход/Регистрация + соцсети), TgCodeFlow, AuthTelegramClient,
│   │                              CookieBanner, SiteUltraWidgets (курсор+FAB+bottom-widgets), LoginNotice, ModalControls
│   ├── home/ hero ultra/home/    ← HeroSection (5 слайдов, слайды /imgs/for-ads/slide1-5.png)
│   ├── shop/ cart/ booking/ sections/ partner/ encyclopedia/ wiki/ journey/ cabinet/ (CabinetTabs, ProfileCard, LinkedAccounts, PartnerNetwork) admin/ fx/
│   ├── ultra/                    ← auth/ (AuthModal шаблона, SocialAuthButtons), dashboard/, home/, layout/ (Header, PolicyLayout, LangSwitcher), ui/ (ModalEngine, LanguageModal, PolicyModal, ThemeToggle)
│   └── ui/                       ← shadcn + notice
├── lib/                          ← auth-session/auth-store/auth-links, ultra/{db,db-data,kv,session,auth-store,i18n,…},
│                                   mlm-calculator, catalog, products, journey{,-pdf}, encyclopedia*, telegram, analytics, consent
├── supabase/migrations/          ← init+grants+expansion+pricing_v2 (энциклопедия/продукты)
├── public/                       ← imgs/for-ads (слайды), ultra/, fonts (Poppins), manifest, sw.js
└── scripts/                      ← check-webkit.mjs, generate-expansion-sql.mjs, ultra/* (миграции/вебхуки)
```

## Модули (данные и состояние)

| Модуль | Хранилище | Что держит |
|---|---|---|
| `lib/ultra/db.ts` + `db-data.ts` | Supabase (`DATABASE_URL`, pooler) | self-healing схема: users, ultra_kv, payments, telegram_*, ultra_products/reviews, site_config, admin_chats, **auth_links** |
| `lib/auth-session.ts` / `auth-store.ts` | HMAC-cookie `rt_session` (30д) | сессия site-стека: email/name/provider (google\|telegram\|facebook)/picture/isAdmin |
| `lib/auth-links.ts` | Supabase `auth_links` | привязка провайдеров к anchor-email; unlink-guard «последний способ» |
| `lib/ultra/auth-store.tsx` | `up_session` (KV 7д) + /api/auth/me | ultra-сессия (мост: пробует site /api/auth/me первым) |
| `lib/catalog.ts`, `lib/products.ts` | статичный сид (→ потом БД) | офферы/слоты, фасовки 90 таб. 70 €, SITE-контакты |
| `lib/mlm-calculator.ts` | чистые функции | план I–V: 50/10/2/1/1 %, TOTAL_FUND_RATIO 0.64 |
| CartProvider / profile-store / admin-store / contact-inbox | localStorage/память | корзина `revoluttime-cart-v2` (pack\|ticket), профиль `…-v1:<email>`, оверлей офферов, инбокс |
| `lib/consent.ts` | `rt_cookie_consent` | granted\|essential — гейт аналитики |
| Supabase `revtime` | postgres (eu-west-3) | энциклопедия (research/claims/articles), orders, financial_ledger |

## API-эндпоинты (основные)

| Путь | Что | Env |
|---|---|---|
| `/api/auth/me`·`logout`·`dev-admin` | сессия site-стека | — |
| `/api/auth/google/{start,callback}` | OAuth Google (+`?link=1` привязка) | GOOGLE_CLIENT_* |
| `/api/auth/facebook/{start,callback,deauthorize}` | OAuth Facebook (+link, deauthorize-callback FB) | FACEBOOK_APP_ID/SECRET |
| `/api/auth/telegram` | HMAC Login Widget (забальзамирован в UI) | TELEGRAM_BOT_TOKEN |
| `/api/auth/tg/code` → `/api/auth/tg/exchange` | обходной код-вход: код → бот → одноразовая ссылка → сессия/привязка | +DATABASE_URL, NEXT_PUBLIC_TELEGRAM_BOT_NAME |
| `/api/auth/links` (+`/unlink`) | список/отвязка способов входа (guard 409 last_method) | +DATABASE_URL |
| `/api/telegram/webhook` | бот: `/start` → chat id; `/start <code>` → ссылка входа | TELEGRAM_BOT_TOKEN(+SECRET) |
| `/api/checkout`, `/api/webhooks/stripe` | Stripe Checkout + ledger/orders + TG-алерт | STRIPE_* (+SUPABASE_SERVICE_ROLE_KEY) |
| `/api/contact`, `/api/journey/lead`, `/api/admin/messages` | заявки → Telegram+инбокс; PDF-лид; инбокс | TELEGRAM_ADMIN_CHAT_ID |
| `/api/ultra/*` (19 роутов) | шаблон: auth/products/reviews/visits/payments/site-config/tg-боты | DATABASE_URL, CLIENT_BOT_TOKEN… |

## Внешние сервисы

| Сервис | Детали |
|---|---|
| **Vercel** | проект `revolut-time` (`prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR` (Hobby); прод https://revolut-time.vercel.app; git `developkiko/revoluttime2` → main. MCP — без teamId |
| **GitHub** | developkiko/revoluttime2 (main); админка — отдельный репо `revtime2-admin` (adm-rt.vercel.app, запущен владельцем) |
| **Supabase** | единая БД: пулер `aws-0-eu-west-3.pooler.supabase.com:6543` (`DATABASE_URL` в Vercel + локально в .env.local) |
| **Supabase** | проект `revtime` (`jzjezfewouleamrsnzla`, eu-west-3), ключи вручную в Vercel env (БЕЗ маркетплейс-интеграции — она валила деплои). С Windows доступ только через пулер `aws-0-eu-west-3.pooler.supabase.com:5432` (юзер `postgres.<ref>`) |
| **Telegram** | @revoluttime_bot, chat владельца **5157746090**; webhook → `/api/telegram/webhook`; для старого widget-входа нужен `/setdomain` (куплен нормальный домен) |
| **Google OAuth** | redirect `<origin>/api/auth/google/callback` |
| **Facebook** | приложение создано владельцем; redirect `https://revolut-time.vercel.app/api/auth/facebook/callback`, deauthorize `…/deauthorize`, JS-SDK домен `revolut-time.vercel.app`; env FACEBOOK_APP_ID/SECRET — добавить в Vercel |
| **Eurofins** | анализ AR-26-HH-013581-02 (H₂ ≤ 1,6 ppm) — страница /certificates |

## Env-переменные

**Есть в Vercel:** `DATABASE_URL` (Supabase pooler), `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` (revtime), `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_NAME`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SESSION_SECRET`, `STRIPE_SECRET_KEY`?(проверить).
**Есть локально (.env.local):** тот же набор минус DATABASE_URL (+ ADMIN_EMAILS, TELEGRAM_ADMIN_CHAT_ID, POSTGRES_URL_NON_POOLING — пулер Supabase для миграций).
**Ждут добавления в Vercel:** `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` (Facebook-вход), `STRIPE_WEBHOOK_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_…`, для вебхука записей), `NEXT_PUBLIC_POSTHOG_KEY` (аналитика за consent-гейтом), `NEXT_PUBLIC_SITE_URL=https://revolut-time.vercel.app` (ссылки TG-входа/sitemap).

## Ссылки

- Прод: https://revolut-time.vercel.app · GitHub: https://github.com/developkiko/revoluttime2 (main)
- Исходники/архивы: `F:\WebstormProjects\revoluttime` (старый сайт, revolut-first-eight), revoluttime.vercel.app (v1), hidrogen-hho.vercel.app (архив)
- Документы бренда: `../infos/*.md`; ассеты: `../imgs-finally/` (слайды, этикетка `эттикетка/`, иконки)

# DEVLOG_CURRENT — точка передачи сессии (10.11.2026)

> Файл для бесшовного продолжения работы в новом чате. Прочти сначала `project.md` (стек, конвенции, грабли), затем `roadmap.md` (статусы), затем этот файл.

## 1. Стек и архитектура прода

- **Next.js 16.4.3** (App Router, Turbopack, `cacheComponents: true`, PPR; middleware = `proxy.ts`; `params` — Promise; segment-config `dynamic`/`dynamicParams` ЗАПРЕЩЕНЫ) + **React 19.3**
- **Tailwind v4** (CSS-first, конфиг в `app/globals.css`) + **shadcn** (импорты из пакетов `radix-ui` и `cn`)
- **next-intl**: de (дефолт) / ru / en — любые тексты сразу в `messages/{de,ru,en}.json`; ESLint react-hooks v6: запрещены setState в useEffect и `location.href=` (использовать `location.assign`)
- **Supabase** `sb-revolut-db` (`qyksdgzguhtjhnrswiib`, eu-central-1): `@supabase/ssr` + `pg`; клиенты `lib/supabase/{client,server}.ts`; миграция `supabase/migrations/20261110000000_init.sql` (DDL+RLS+сид)
- **Vercel**: проект `revolut-time` (`prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR` (Hobby); git `developkiko/revoluttime2` → main = автодеплой
- Хранилища: корзина `revoluttime-cart-v2`, профиль `revoluttime-profile-v1:<email>`, consent `rt_cookie_consent` (`granted|essential`), реф `rt_ref` (cookie 30д) — все через useSyncExternalStore-сторы

**Грабли (полный список в project.md):** `new Date()` запрещён при пререндере; NEXT_PUBLIC_* запекаются при сборке; Turbopack кеширует CSS → после правок globals.css `rm -rf .next`; Vercel MCP — НЕ передавать teamId (личный Hobby-аккаунт, иначе 404/403); кириллица в curl на Windows — только через node fetch; зомби-`next start` держит порт 3000 после TaskStop.

## 2. Статус выплат и юнит-экономики

- **Цены прода зафиксированы: 18,99 € (pack-90) и 24,99 € (pack-120)**. Kleinunternehmer nach §19 UStG — НДС не начисляется, netto = gross.
- **Партнёрский фонд = 30% нетто**: 5,70 € / 7,50 € (`lib/mlm-calculator.ts`, центовая арифметика).
- **Сетка уровней (доля фонда)**: A 12%, B 6%, C 4%, D 3%, E 3%, F 2% → выплаты за SKU-90: 0,68 / 0,34 / 0,23 / 0,17 / 0,17 / 0,11 €; за SKU-120: 0,90 / 0,45 / 0,30 / 0,23 / 0,23 / 0,15 €. Публичная сетка — на `/partner` (секция «fund» + §19-сноска).
- **Юрлицо**: бренд — **YULKK UNITED CORP.**, 39 Cobblers Ln, Staten Island, NY 10304, USA (Company Reg. 81-4691539); дистрибьютор/склад в ЕС — **Gewerbe Yuriy Moshenets, Weilbacher Str. 10, 85241 Hebertshausen, Deutschland**; Impressum e-mail: karakymg@gmail.com; §18 Abs. 2 MStV: Yuriy Moshenets. Платежи — Stripe (US), логистика — DE.
- Владелец (админ): тел/WhatsApp +49 175 9590916; Telegram @revoluttime_bot, chat_id **5157746090** (в ADMIN_EMAILS/TELEGRAM_ADMIN_CHAT_ID дефолтах кода).

## 3. Последние коммиты и что сделано

| Коммит | Что |
|---|---|
| `2f94f25` | **P0.1 Stripe Checkout**: /checkout (+success/cancel), /api/checkout (сессия, цены из серверного каталога, DE/AT/CH, ref-metadata), CartDrawer закрывается при переходе |
| `78bf060` | **P0.2 Legal+SEO**: Impressum email/адрес ×3 локали, CookieBanner + `lib/consent.ts`, robots.txt, app/sitemap.ts (66 URL), manifest.json |
| `2061e6f` | **P0.3 Ref+Analytics+US Corp**: RefCapture (?ref=→cookie/localStorage), PostHog за consent-гейтом (`lib/analytics/events.ts`, 5 событий), Impressum с YULKK Corp Reg. 81-4691539 |
| `7ff9566` | **P1.1 Бандл**: hero/partner-steps/levels/drawer/contact/booking/auth-content → lazy (`next/dynamic ssr:false` + скелетоны); главная 341→**284 КБ gz** (флор стека ~250 — бюджет ТЗ <180 недостижим, см. отчёт в истории) |
| `ae6f20b` | **P1.2 Юнит-экономика**: mlm-calculator + сетка A–F на /partner |
| `913d912` | **P1.3 Энциклопедия**: /encyclopedia + /encyclopedia/[slug], ResearchCard, EvidenceBadge, 2 статьи ×3 локали, HWG-дисклеймеры |
| `ca01bd2` | **P2.1 Supabase** (текущий HEAD): DDL+RLS+сид миграция, supabase-клиенты, DB-first загрузчики энциклопедии с фолбэком на сид, скрипт раннер |

## 4. Точная точка остановки

**Спринт P2, ШАГ 1 — код завершён и запушен (`ca01bd2`), НО заблокирован инфраструктурой:**

1. ⛔ **Supabase `sb-revolut-db` в статусе Suspended** (Free-plan заморозка). Подтверждено: pooler → «tenant not found», DNS `db.*` хоста не резолвится, REST отдаёт заглушку.
2. **Действие владельца**: Supabase Dashboard → sb-revolut-db → **Restore**.
3. **Действие агента после Restore**: `node --env-file=.env.local scripts/run-migration.mjs supabase/migrations/20261110000000_init.sql` → проверить «MIGRATION OK» + сид-каунты (research 3, claims 4, articles 6, article_claims 12, products 2) → перезапустить деплой (пустой коммит) → прод читает статьи из БД (проверить, что /de/encyclopedia отдаёт контент БД).
4. Ключи Supabase уже: в Vercel (интеграция) + в локальном `.env.local`. Secrets из чата НЕ коммитить.
5. Затем **ШАГ 2**: энциклопедия до 10+ статей (добавлять в сид-файл + сид-миграцию синхронно), фильтр по evidence level; **ШАГ 3**: `/api/webhooks/stripe` (verify signature) → insert `orders` + `financial_ledger` (pending, unlocks_at = NOW()+14д) → Telegram-уведомление админу (не @TGDrive67bot, а существующий @revoluttime_bot/chat 5157746090 — уточнить у владельца).

**Известный кворк**: несуществующий slug энциклопедии = 404-контент при HTTP 200 (cacheComponents/PPR не даёт `dynamicParams`); candidate fix — в P2.2.

## 5. ENV-переменные

**Отсутствуют и нужны (Vercel → Settings → Env → затем Redeploy):**
- `STRIPE_SECRET_KEY` — включает оплату (сейчас /api/checkout отдаёт 503 stripe_not_configured)
- `NEXT_PUBLIC_POSTHOG_KEY` (+ опц. `NEXT_PUBLIC_POSTHOG_HOST`, дефолт eu) — включает аналитику (гейт по consent)

**Есть на Vercel (интеграция):** NEXT_PUBLIC_SUPABASE_URL/ANON/PUBLISHABLE, SUPABASE_SERVICE_ROLE_KEY/SECRET/JWT, POSTGRES_*
**Есть (владелец добавлял):** TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_BOT_NAME, NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SESSION_SECRET
**Локально (`.env.local`, не в git):** всё вышеперечисленное для Supabase.
**Рекомендовано добавить:** `ADMIN_EMAILS`, `TELEGRAM_ADMIN_CHAT_ID` (сейчас дефолты кода), опц. `NEXT_PUBLIC_SITE_URL`.

## 6. Правила работы (из чата владельца)
- Любое изменение → сразу все 3 локали (de/ru/en) → валидация JSON (`node -e "JSON.parse(...)"`)
- По завершении КАЖДОЙ задачи — commit + push в main (автодеплой), если владелец не сказал иное
- Ошибок сборки/линта перед коммитом быть не должно
- Не читать всё подряд — только файлы текущего шага

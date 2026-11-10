# RevolutTIME — roadmap (статус на 10.11.2026)

Легенда: ✅ готово и на проде · 🟡 сделано в демо/мок-режиме (ждёт API/БД/ключей) · ❌ не начато

## Спринты
- ✅ **P0 — безопасность, закон, монетизация** (2f94f25, 78bf060, 2061e6f): Stripe Checkout (/checkout + /api/checkout + success/cancel), CookieBanner (TDDDG §25, gate `lib/consent.ts`), robots.txt + sitemap.xml + manifest.json, Impressum с реальным email и US Corp (Company Reg. 81-4691539), `?ref=` capture (cookie 30д + localStorage), PostHog за consent-гейтом, типизированные события (`lib/analytics/events.ts`).
- ✅ **P1 — бандл, юнит-экономика, контент-хаб** (7ff9566, ae6f20b, 913d912): 7 компонентов в lazy-чанки (главная 341→284 КБ gz; флор стека ~250), `lib/mlm-calculator.ts` + сетка A–F с евро-суммами на /partner, /encyclopedia (поиск, фильтры категорий, EvidenceBadge, ResearchCard, 2 статьи, HWG-дисклеймеры).
- 🟡 **P2 — Supabase, энциклопедия 10+, Telegram-уведомления** — активен:
  - ✅ шаг 1 в коде (ca01bd2): миграция DDL+RLS+сид (`supabase/migrations/20261110000000_init.sql`), клиенты (`lib/supabase/{client,server}.ts`), DB-first загрузчики с фолбэком (`lib/encyclopedia-db.ts`), раннер `scripts/run-migration.mjs`.
  - ⛔ **БЛОКЕР: Supabase проект Suspended** — владелец должен нажать Restore в дашборде; затем `node --env-file=.env.local scripts/run-migration.mjs supabase/migrations/20261110000000_init.sql` + проверка.
  - ❌ шаг 2: энциклопедия до 10+ статей, фильтр по уровню доказательности, revalidate контента.
  - ❌ шаг 3: `/api/webhooks/stripe` → orders + financial_ledger (pending 14д) → Telegram-уведомление админу (бот @revoluttime_bot, chat 5157746090).

## Инфраструктура
- ✅ Next.js 16.4.3 + React 19.3 + Tailwind v4 (CSS-first) + shadcn (radix-ui pkg) + next-intl de/ru/en, Vercel из main
- ✅ Темы, скелетоны, sonner (очередь по 1), lazy-чанки: hero/partner-steps/levels/cart-drawer/contact/booking/auth-popover
- ✅ Supabase-интеграция на Vercel: env-ключи注入ятся автоматически; локально — в .env.local (не в git)
- 🟡 Supabase `sb-revolut-db` — **Suspended, ждёт Restore**; таблиц нет до миграции

## Направление 1 — Таблетки
- ✅ /shop: фасовки 90 (18,99 €) и 120+бокс (24,99 €), корзина, применение
- ✅ /checkout: summary + Stripe Checkout Session (цены из серверного каталога, DE/AT/CH, metadata.ref)
- 🟡 Оплата live: код готов, нужен `STRIPE_SECRET_KEY` в Vercel → Redeploy; без ключа — 503 + тост «через WhatsApp/Telegram»
- ✅ /hydrogen + /hydrogen/tablets (HWG-сноски)

## Направление 2 — Студия
- ✅ /studio: 6 услуг + CTA WhatsApp
- ❌ Онлайн-запись на сессии

## Направление 3 — Оборудование
- ✅ /equipment: 4 поставщика, старт-набор, OEM, заявка (мок → Telegram)
- ❌ Фото от поставщиков; карточки /equipment/[slug]

## Направление 4 — Активный отдых
- ✅ /recreation + /recreation/[slug] (BookingWidget, билет в корзину; 9 slug-ов)
- 🟡 Слоты в статичном seed (lib/catalog.ts) → перенос в Supabase (badminton_events уже в DDL)

## Направление 5 — Рефералка
- ✅ /partner: шаги, каскад A–F, сетка фонда (30% → 5,70/7,50 €; A12/B6/C4/D3/E3/F2 % фонда) + §19-сноска
- ✅ /cabinet: профиль, реф-ссылка, покупки/бонусы (демо-данные), экспорт, удаление
- ✅ `?ref=` → cookie rt_ref 30д → Stripe metadata.ref/client_reference_id
- ❌ Реальный расчёт выплат: financial_ledger (таблица в DDL, запись — в P2.3 вебхуке)
- ❌ Email+пароль вход (ждёт API аккаунтов); Telegram+Google работают

## Админка
- 🟡 /admin: демо-цифры, офферы (локальный оверлей), сообщения (инбокс в памяти)
- ❌ Настоящая админка на Supabase (CRUD + роли)

## Юридическое
- ✅ Impressum (karakymg@gmail.com, Weilbacher Str. 10, YULKK UNITED CORP. + Reg. 81-4691539, Kleinunternehmer §19), Datenschutz, AGB, Widerruf (de/ru/en)
- ✅ CookieBanner (rt_cookie_consent: granted/essential; аналитика гейтится hasAnalyticsConsent())

## Техдолг
- ✅ robots.txt, sitemap.xml (66+ URL), manifest.json
- ❌ SEO: OG-картинки, hreflang-каноникал между локалями
- ❌ Vercel Blob для аватаров (dataURL в localStorage)
- ❌ Email-вход в кабинет
- 🟡 Soft-404: несуществующий slug энциклопедии отдаёт 404-контент с HTTP 200 (cacheComponents/PPR) — доработать
- 💡 Слайдер hero → «комплексы партнёрки» (массив готов к фиду)

## ENV (Vercel → Settings → Environment Variables)
- ❌ Нужны: `STRIPE_SECRET_KEY` (оплата live), `NEXT_PUBLIC_POSTHOG_KEY` (+ опц. `NEXT_PUBLIC_POSTHOG_HOST`)
- ✅ Есть: Supabase-набор (интеграция), TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_BOT_NAME, GOOGLE_CLIENT_*, AUTH_SESSION_SECRET
- 💡 Рекомендовано: ADMIN_EMAILS, TELEGRAM_ADMIN_CHAT_ID (на проде дефолты кода), NEXT_PUBLIC_SITE_URL

# RevolutTIME — roadmap (статус на 21.11.2026, вечер)

Легенда: ✅ готово и на проде · 🟡 код готов, ждёт env/ключей/проверки · ❌ не начато

## Инфраструктура и дизайн
- ✅ Next.js 16.4.3 + React 19.3 + Tailwind v4 + shadcn + next-intl de/ru/en; route groups `(site)`/`(ultra)`; кеш-гейты cacheComponents
- ✅ **Ultra Proxy port** (15.11): токен-мост (весь сайт), кабинет на 5 вкладках, ultra-страницы ребрендированы, `/api/ultra/*` (19 роутов) + Neon; FX-модули (тултипы/tilt/spotlight), notice вместо sonner, кастомный курсор, шиммер-логотип
- ✅ **Primary #070E21 Midnight Navy** (владелец): split-токены (solid/soft/border/logo-grad), все solid-точки переведены
- ✅ PWA: manifest + sw.js (только статики) + регистрация; иконки-плейсхолдеры (ждут фирменный PNG)
- ✅ Мобильные фиксы: drawer=шаблон 1:1, iOS 100dvh+safe-area, bg-fixed снят, cookie-бокс на 320px, `.rt-bottom-widgets` (куки+PWA стек/одна строка), `html{overflow-x:clip}` против фантомного отступа
- ✅ WebKit self-check: `scripts/check-webkit.mjs` (Playwright Safari-движок, iPhone-дескриптор)

## Auth (a3aeb96, 21.11)
- ✅ Шапка: «Регистрация»+«Войти» → модалки (табы, email/пароль-поля, равные Google/Telegram/Facebook); дропдаун только у вошедших
- ✅ Google OAuth (было) + **Facebook OAuth** (start/callback/deauthorize) — 🟡 ждёт `FACEBOOK_APP_ID/SECRET` в Vercel (владельцу выданы URL полей приложения)
- ✅ **Telegram обходной код-флоу** (widget забальзамирован — нужен verify-домен): код → `t.me/bot?start=CODE` → бот шлёт ссылку → `/{lang}/auth-telegram` → сессия — 🟡 e2e на проде (нужен DATABASE_URL, он только в Vercel)
- ✅ **Привязка аккаунтов**: `auth_links` (Neon), кабинет#profile «Способы входа», unlink-guard «единственный способ» + ссылка на Профиль; email-метод — пустышка
- ❌ Email-вход (регистрация/восстановление) — после того как владелец подберёт email-сервис на домене
- ✅ Страницы/модалки политик: язык через URL (фикс сброса после F5), тема в PolicyLayout/PolicyModal

## Направление 1 — Таблетки
- ✅ /shop: **90 таб. — 70 €** (партнёрам 60 € от 10 пачек + 1 в подарок), корзина, применение
- ✅ /checkout + Stripe Checkout Session (DE/AT/CH, metadata.ref) — 🟡 оплата live ждёт `STRIPE_SECRET_KEY` (+ webhook: `STRIPE_WEBHOOK_SECRET` + `SUPABASE_SERVICE_ROLE_KEY`)
- ✅ /hydrogen + /hydrogen/tablets; **/certificates** (Eurofins + placeholder сертификатов), бейджи кликабельны
- ✅ Тексты синхронизированы с этикеткой (1 мин растворение, 100–150 мл, пить сразу, «из Германии в любую страну», «молекулы водорода и соли магния») ×3 локали
- ❌ PDF-отчёт Eurofins и сканы сертификатов на /certificates (ждут владельца); задняя сторона этикетки — сверка

## Направление 2 — Студия
- ✅ /studio (6 услуг, FX, CTA WhatsApp)
- ❌ Онлайн-запись на сессии

## Направление 3 — Оборудование
- ✅ /equipment (поставщики, старт-набор, OEM, заявка)
- ❌ Фото от поставщиков; карточки /equipment/[slug]

## Направление 4 — Конференция и отдых
- ✅ /recreation + [slug] (BookingWidget, OfferSlots-карточки, билет в корзину)
- 🟡 Слоты в статичном seed → в БД (badminton_events в DDL)

## Направление 5 — Партнёрка
- ✅ План **I–V (50/10/2/1/1 %, фонд 64 %)** на /partner + `lib/mlm-calculator.ts`; PartnerNetwork (модуль владельца); кабинет (вкладки, демо-данные, экспорт/GDPR)
- ✅ `?ref=` → cookie 30д → Stripe metadata; financial_ledger-запись в вебхуке (64 %)
- ❌ Реальные выплаты: профили/банк-реквизиты, расчёт по ledger

## Контент-хаб
- ✅ Энциклопедия: 10 статей ×3, DB-first (Supabase `revtime`) с фолбэком на сид, поиск/категории/EvidenceBadge, вики-линки; Journey-квиз + PDF-лид (ru-PDF = en-заглушка — нужен шрифт с кириллицей)
- ❌ Фильтр по уровню доказательности; OG-картинки; hreflang

## Админка
- ✅ Отдельный репо/проект владельца (`revtime2-admin` → adm-rt.vercel.app); на сайте — админ-ссылка в меню + инбокс сообщений
- ❌ Связка API (NEXT_PUBLIC_UP_ADMIN_API_URL ↔ админка), роли

## Техдолг
- 🟡 Soft-404 slug энциклопедии (404-контент при HTTP 200, cacheComponents)
- ❌ Vercel Blob для аватаров; SEO OG/hreflang; PWA-иконки фирменные
- ❌ Проверка TG-код-флоу e2e на проде; сертификаты-PDF
- 💡 Hero-слайды = массив SLIDE_MEDIA (`components/home/HeroSection.tsx`) — готов к расширению; новые креативы кладутся в `public/imgs/for-ads/slide1-5.png`

## ENV (Vercel → Settings → Environment Variables)
- ✅ Есть: `DATABASE_URL` (Neon), `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` (revtime), `TELEGRAM_BOT_TOKEN`, `NEXT_PUBLIC_TELEGRAM_BOT_NAME`, `GOOGLE_CLIENT_*`, `AUTH_SESSION_SECRET`
- ❌ **Добавить:** `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET`; `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_…`); `NEXT_PUBLIC_POSTHOG_KEY`; `NEXT_PUBLIC_SITE_URL=https://revolut-time.vercel.app`
- 💡 После добавления env с NEXT_PUBLIC_* — полный Redeploy

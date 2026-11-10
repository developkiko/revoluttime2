# DEVLOG_CURRENT — точка передачи сессии (10.11.2026, вечер)

> Файл для бесшовного продолжения работы в новом чате. Прочти сначала `project.md` (стек, конвенции, грабли), затем `roadmap.md` (статусы), затем этот файл.

## 1. Стек и архитектура прода

- **Next.js 16.4.3** (App Router, Turbopack, `cacheComponents: true`, PPR; middleware = `proxy.ts`; `params` — Promise; segment-config `dynamic`/`dynamicParams` ЗАПРЕЩЕНЫ) + **React 19.3**
- **Tailwind v4** (CSS-first, конфиг в `app/globals.css`) + **shadcn** (импорты из пакетов `radix-ui` и `cn`)
- **next-intl**: de (дефолт) / ru / en — любые тексты сразу в `messages/{de,ru,en}.json`; ESLint react-hooks v6: запрещены setState в useEffect и `location.href=` (использовать `location.assign`)
- **Vercel**: проект `revolut-time` (`prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR` (Hobby); git `developkiko/revoluttime2` → main = автодеплой
- **Supabase**: старый `sb-revolut-db` владелец удалил; **создан новый проект `revtime`** (`jzjezfewouleamrsnzla`, регион **eu-west-3 Paris**). Подключён БЕЗ маркетплейс-интеграции (она валила деплои) — ключи вручную в Vercel env. Ключи нового формата: `sb_publishable_…` (роль anon); для записи из вебхука позже понадобится `sb_secret_…` (service_role). Прямой хост `db.<ref>` — IPv6-only, с Windows не резолвится → для миграций использовать **пулер `aws-0-eu-west-3.pooler.supabase.com:5432`, юзер `postgres.<ref>`** (в `.env.local`). Новые проекты Supabase не дают anon GRANTы по умолчанию → миграция `20261110000001_grants.sql` обязательна.
- Хранилища: корзина `revoluttime-cart-v2`, профиль `revoluttime-profile-v1:<email>`, consent `rt_cookie_consent` (`granted|essential`), реф `rt_ref` (cookie 30д) — все через useSyncExternalStore-сторы

**Грабли (полный список в project.md):** `new Date()` запрещён при пререндере; NEXT_PUBLIC_* запекаются при сборке; Turbopack кеширует CSS → после правок globals.css `rm -rf .next`; Vercel MCP — НЕ передавать teamId (личный Hobby-аккаунт, иначе 404/403); кириллица в curl на Windows — только через node fetch; зомби-`next start` держит порт 3000 после TaskStop.
**Новый грабль (10.11):** застрявший сайдкар маркетплейс-интеграции валит ЛЮБОЙ деплой проекта в «Resource provisioning timed out» (и через Git, и через CLI) — удаление интеграции чинит провижининг мгновенно. Vercel MCP в сессии может держать протухший VERCEL_TOKEN из env — CLI-фолбэк `env -u VERCEL_TOKEN vercel …` или валидный токен из `~/AppData/Roaming/com.vercel.cli/Data/auth.json`.

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
| `7ff9566` | **P1.1 Бандл**: hero/partner-steps/levels/drawer/contact/booking/auth-content → lazy; главная 341→**284 КБ gz** |
| `ae6f20b` | **P1.2 Юнит-экономика**: mlm-calculator + сетка A–F на /partner |
| `913d912` | **P1.3 Энциклопедия**: /encyclopedia + /encyclopedia/[slug], ResearchCard, EvidenceBadge, 2 статьи ×3 локали, HWG-дисклеймеры |
| `ca01bd2` | **P2.1 Supabase-код**: DDL+RLS+сид миграция, supabase-клиенты, DB-first загрузчики энциклопедии с фолбэком на сид, скрипт раннер (код остаётся; БД удалена → загрузчики спят, сайт на статическом сиде) |
| `85e6005` | chore: чистка неиспользуемого import в contact API |
| `3d0c1cc`, `2c6fe3a` | пустые ретраи деплоя (упали на provisioning — см. ниже) + `.gitignore: .vercel` |
| **CLI-deploy** | Прод обновлён вручную через `vercel deploy --prod` (билд `revolut-time-het7m111j`), после удаления битой Supabase-интеграции |
| `6b0f727` | **Supabase переприкручен**: новый проект `revtime` (eu-west-3), миграции init+grants прогнаны, env на Vercel, **E2E-проверено: прод читает статьи из БД** (probe-статья появилась/исчезла в каталоге корректно) |
| `b4735c9` | **P2 frontend batch**: свайпы Hero (Pointer Events, touch+мышь, touch-pan-y), видео `/videos/tbltv1.mp4` на /hydrogen/tablets (autoplay muted loop, `tablets.demo` ×3 локали), фоны `/images/wall/` в Hero/Studio/Equipment/Recreation (низкая opacity + градиент), **/api/webhooks/stripe** (constructEventAsync → upsert orders + pending ledger 14д + Telegram) через `lib/telegram.ts` (общий notifyAdminChat, contact API отрефакторен) |
| `d0efa2d` | **Энциклопедия 10 статей**: расширение ×3 локали через `lib/encyclopedia-expansion.json` (single source → TS-сид + генератор `scripts/generate-expansion-sql.mjs` → миграция `20261111000000_expansion.sql`); 6 новых PubMed-пейперов (PMID/DOI верифицированы поиском: Aoki 22520831, Nakao 20216947, Kajiyama 19083400, Song 23610159, Dole 1166304, Gröber 26404370); БД: 30 статей / 9 пейперов / 13 claims / 51 связь; поиск+фильтры категорий уже работали, sitemap теперь генерит slugs из сида |
| `b73cf34` | **Discovery Journey (каркас)**: `/journey` — квиз 3 шага (цель/опыт/формат) + контакт с consent → рекомендация одной из 4 программ (`lib/journey.ts`) → **PDF-лид-магнит**: `/api/journey/lead` (zod + Telegram-алерт «🚀 Новый лид» + инбокс /admin + PDF без зависимостей `lib/journey-pdf.ts` — core Helvetica, WinAnsi; **ru-PDF отдаётся en-копией** — кириллица не поддерживается core-шрифтами); lazy-чанк квиза; footer-линк; sitemap +journey |

## 4. Хроника сессии 10.11 (важно для понимания)

1. Supabase `sb-revolut-db` был Suspended → владелец нажал Restore → **миграция успешно прогнана** (12 таблиц, сид: research 3 / claims 4 / articles 6 / article_claims 12 / products 2), RLS проверен (anon читает, пишет нет).
2. Все деплои с `ca01bd2` падали с **«Resource provisioning timed out»** (6 раз подряд, и Git и CLI) — билд даже не стартовал, код не при чём.
3. Диагноз: идентичный по билд-конфигу старый проект `revoluttime` собирался CLI за 43 с; единственное отличие `revolut-time` — env-стор Supabase-маркетплейс-интеграции → **сайдкар интеграции завис после suspend/restore Supabase**.
4. При диагностике CLI-деплой случайно ушёл в СТАРЫЙ проект `revoluttime` (линк по имени папки) → **откатил** его прод на прежний билд от 23.10 (переназначение алиаса; истории деплоев не тронуты).
5. Владелец удалил Supabase-проект полностью → интеграция и её env ушли с Vercel → **деплой прошёл, прод обновлён**, смоук-тесты зелёные (encyclopedia 200 на сид-фолбэке, checkout 503 без Stripe-ключа как ожидается, shop 200).

## 5. Точная точка остановки

**Supabase переприкручен, прод читает из БД. Спринт P2 продолжается:**

1. ✅ БД `revtime` (eu-west-3): миграции `20261110000000_init.sql` + `20261110000001_grants.sql` прогнаны; сид (research 3 / claims 4 / articles 6 / article_claims 12 / products 2); RLS+гранты проверены (anon читает опубликованное, INSERT 401).
2. ✅ E2E: prod-каталог показывает статьи из БД (probe-метод: временная статья в БД появилась на /de/encyclopedia и исчезла после удаления).
3. ➡ **ШАГ 2 готов (d0efa2d)**: энциклопедия 10 статей ×3 локали. Новые статьи добавлять так: `lib/encyclopedia-expansion.json` (контент) → `node scripts/generate-expansion-sql.mjs` (перегенерирует миграцию) → прогон раннера на БД. Фильтр по evidence level в UI — пока только категории + поиск; по статусу claims не фильтрует (кандидат в доработку).
4. ➡ **ШАГ 3 (код готов, ждёт ключей)**: `/api/webhooks/stripe` написан (constructEventAsync → upsert `orders` по stripe_session_id + pending-запись в `financial_ledger` (фонд 30% из mlm-calculator, unlocks_at = +14д) → Telegram). Активируется тремя env в Vercel: `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` (Stripe Dashboard → Developers → Webhooks → endpoint `https://revolut-time.vercel.app/api/webhooks/stripe`, событие checkout.session.completed + async_payment_succeeded) + `SUPABASE_SERVICE_ROLE_KEY` (= `sb_secret_…`). Без ключей отдаёт 503 — Stripe сам ретраит. beneficiary_id в ledger пока null (profiles/auth ещё нет — бэкфилл позже).
5. Известный кворк: несуществующий slug энциклопедии = 404-контент при HTTP 200 (cacheComponents/PPR не даёт `dynamicParams`) — кандидат в P2.2.
6. **Discovery Journey** (b73cf34): каркас работает на проде; PDF — заглушка-генератор на core-шрифтах (для кириллицы/красивой вёрстки понадобится pdf-lib/react-pdf с встроенным шрифтом); лиды пока пишутся в демо-инбокс + Telegram (таблицы leads в БД нет).

## 6. ENV-переменные

**Отсутствуют и нужны (Vercel → Settings → Env → затем Redeploy):**
- `STRIPE_SECRET_KEY` — включает оплату (сейчас /api/checkout отдаёт 503 stripe_not_configured)
- `NEXT_PUBLIC_POSTHOG_KEY` (+ опц. `NEXT_PUBLIC_POSTHOG_HOST`, дефолт eu) — включает аналитику (гейт по consent)

**Есть на Vercel:** NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (новый проект `revtime`), TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_BOT_NAME, NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SESSION_SECRET.
**Есть локально (`.env.local`, не в git):** те же + ADMIN_EMAILS + TELEGRAM_ADMIN_CHAT_ID + POSTGRES_URL_NON_POOLING (пулер eu-west-3, для миграций).
**Нужен позже (ШАГ 3):** `SUPABASE_SERVICE_ROLE_KEY` = `sb_secret_…` из Settings → API → Secret keys.
**Рекомендовано добавить:** `NEXT_PUBLIC_SITE_URL=https://revolut-time.vercel.app` (дефолт в sitemap уже совпадает с прод-доменом).

## 7. Правила работы (из чата владельца)
- Любое изменение → сразу все 3 локали (de/ru/en) → валидация JSON (`node -e "JSON.parse(...)"`)
- По завершении КАЖДОЙ задачи — commit + push в main (автодеплой), если владелец не сказал иное
- Ошибок сборки/линта перед коммитом быть не должно
- Не читать всё подряд — только файлы текущего шага

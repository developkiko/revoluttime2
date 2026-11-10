# DEVLOG_CURRENT — точка передачи сессии (10.11.2026, вечер)

> Файл для бесшовного продолжения работы в новом чате. Прочти сначала `project.md` (стек, конвенции, грабли), затем `roadmap.md` (статусы), затем этот файл.

## 1. Стек и архитектура прода

- **Next.js 16.4.3** (App Router, Turbopack, `cacheComponents: true`, PPR; middleware = `proxy.ts`; `params` — Promise; segment-config `dynamic`/`dynamicParams` ЗАПРЕЩЕНЫ) + **React 19.3**
- **Tailwind v4** (CSS-first, конфиг в `app/globals.css`) + **shadcn** (импорты из пакетов `radix-ui` и `cn`)
- **next-intl**: de (дефолт) / ru / en — любые тексты сразу в `messages/{de,ru,en}.json`; ESLint react-hooks v6: запрещены setState в useEffect и `location.href=` (использовать `location.assign`)
- **Vercel**: проект `revolut-time` (`prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR` (Hobby); git `developkiko/revoluttime2` → main = автодеплой
- **Supabase УДАЛЁН владельцем** (решение 10.11.2026): проект `sb-revolut-db` снесён, маркетплейс-интеграция на Vercel отвязана, env-ключи удалены из Vercel и из локального `.env.local`
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

## 4. Хроника сессии 10.11 (важно для понимания)

1. Supabase `sb-revolut-db` был Suspended → владелец нажал Restore → **миграция успешно прогнана** (12 таблиц, сид: research 3 / claims 4 / articles 6 / article_claims 12 / products 2), RLS проверен (anon читает, пишет нет).
2. Все деплои с `ca01bd2` падали с **«Resource provisioning timed out»** (6 раз подряд, и Git и CLI) — билд даже не стартовал, код не при чём.
3. Диагноз: идентичный по билд-конфигу старый проект `revoluttime` собирался CLI за 43 с; единственное отличие `revolut-time` — env-стор Supabase-маркетплейс-интеграции → **сайдкар интеграции завис после suspend/restore Supabase**.
4. При диагностике CLI-деплой случайно ушёл в СТАРЫЙ проект `revoluttime` (линк по имени папки) → **откатил** его прод на прежний билд от 23.10 (переназначение алиаса; истории деплоев не тронуты).
5. Владелец удалил Supabase-проект полностью → интеграция и её env ушли с Vercel → **деплой прошёл, прод обновлён**, смоук-тесты зелёные (encyclopedia 200 на сид-фолбэке, checkout 503 без Stripe-ключа как ожидается, shop 200).

## 5. Точная точка остановки

**Спринт P2 пересобран под «без БД»:**

1. ✅ Прод = свежий билд `revolut-time.vercel.app` (CLI-деплой). Сайт полностью на статических сидах — это штатный режим кода (загрузчики `lib/encyclopedia-db.ts` спят без env).
2. ❓ **Git-автодеплой**: сайдкар убран — надо проверить, что новый пуш доезжает до прода сам (CLI-деплой был ручным). Если нет — проверить link (`gitProviderOptions.createDeployments` был `disabled`) в Dashboard → Settings → Git.
3. ➡ **ШАГ 2 (не зависит от БД)**: энциклопедия до 10+ статей — контент пишется в статический сид (`lib/encyclopedia.ts`) ×3 локали, фильтр по evidence level.
4. ➡ **ШАГ 3**: `/api/webhooks/stripe` (verify signature) — был план «insert orders + financial_ledger в Supabase»; **требуется решение владельца о хранилище** (новый Supabase-проект / файл-сторе / отложить). Telegram-уведомление админу (@revoluttime_bot, chat 5157746090) не зависит от БД — можно делать сразу.
5. Известный кворк: несуществующий slug энциклопедии = 404-контент при HTTP 200 (cacheComponents/PPR не даёт `dynamicParams`) — кандидат в P2.2.

## 6. ENV-переменные

**Отсутствуют и нужны (Vercel → Settings → Env → затем Redeploy):**
- `STRIPE_SECRET_KEY` — включает оплату (сейчас /api/checkout отдаёт 503 stripe_not_configured)
- `NEXT_PUBLIC_POSTHOG_KEY` (+ опц. `NEXT_PUBLIC_POSTHOG_HOST`, дефолт eu) — включает аналитику (гейт по consent)

**Есть на Vercel:** TELEGRAM_BOT_TOKEN, NEXT_PUBLIC_TELEGRAM_BOT_NAME, NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SESSION_SECRET.
**Есть локально (`.env.local`, не в git):** те же + ADMIN_EMAILS + TELEGRAM_ADMIN_CHAT_ID.
**Supabase-*: удалены везде** (локально и на Vercel) — БД больше нет.
**Рекомендовано добавить:** `NEXT_PUBLIC_SITE_URL=https://revolut-time.vercel.app` (дефолт в sitemap уже совпадает с прод-доменом).

## 7. Правила работы (из чата владельца)
- Любое изменение → сразу все 3 локали (de/ru/en) → валидация JSON (`node -e "JSON.parse(...)"`)
- По завершении КАЖДОЙ задачи — commit + push в main (автодеплой), если владелец не сказал иное
- Ошибок сборки/линта перед коммитом быть не должно
- Не читать всё подряд — только файлы текущего шага

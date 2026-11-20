# DEVLOG_CURRENT — точка передачи сессии (21.11.2026, вечер)

> Файл для бесшовного продолжения в новом чате. Порядок чтения: `project.md` (стек, конвенции, грабли, env) → `roadmap.md` (статусы) → этот файл. История — `devlog.md` (до 06.11), `devlog_target.md` (свежие батчи), `git log`.

## 1. Стек и архитектура прода (кратко)

- **Next.js 16.4.3** + React 19.3, Tailwind v4 (CSS-first), shadcn `radix-vega`, next-intl de/ru/en, `cacheComponents` (грабли в `project.md` §грабли).
- **Route groups**: `app/[lang]/(site)/` — хром сайта; `app/[lang]/(ultra)/` — шаблонные страницы со своим layout/ultra.css. Корневой `[lang]/layout.tsx` = html/шрифты/NextIntl/ThemeProvider.
- **Дизайн** = порт шаблона Ultra Proxy через токен-мост в `globals.css`. **Primary #070E21 Midnight Navy** (владелец): `--primary` solid + `--primary-soft` (steel #8fa2e0 на dark) + `--logo-grad-primary` для логотипа + `--primary-border` окантовка dark-кнопок.
- **БД ×2**: **Neon** (`DATABASE_URL`, только в Vercel env — локально нет!) — ultra-стек + `auth_links`; **Supabase `revtime`** (eu-west-3) — энциклопедия + orders/financial_ledger.
- Уведомления — `notice` (sonner удалён); FX-модули (tilt/spotlight/тултипы/курсор); PWA (manifest+sw.js).
- Vercel `revolut-time` (`prj_fByD65LZUCP3K84JexOgF1IVs5Q6`), team `team_TWbuf03uGZI1HmKdbpyzJvNR`; git `developkiko/revoluttime2` → main = автодеплой; статус через `gh api …/commits/<sha>/status`.

## 2. Цены и юнит-экономика (актуально)

- Розница **70 € (pack-90)**; pack-120 УДАЛЁН. Партнёрам **60 €/пачка при заказе от 10** (+1 пачка в подарок; checkout metadata `partner_bundle=1_1free`).
- Партнёрский план **I–V: 50/10/2/1/1 %** от покупки (фонд 64 %), вход 600 €, матрица 5×5, потенциал 27 000 € (`lib/mlm-calculator.ts`; ledger в вебхуке = 64 %).
- Kleinunternehmer §19 UStG; Impressum: karakymg@gmail.com, Weilbacher Str. 10, YULKK UNITED CORP. Владелец/админ: +49 175 9590916, Telegram chat **5157746090**.

## 3. Последние коммиты (новейшие сверху)

| Коммит | Что |
|---|---|
| **`a3aeb96`** (21.11) | **Этикетка-синхронизация + auth-модалки + политики.** ① Тексты по этикетке/сообщениям владельца ×3 локали: растворение/концентрация **1 мин** (было 1–1,5/3–4), **пить сразу после приготовления**, вода **100–150 мл** (было 150–200), **«Отправка из Германии в любую страну»** (чипы, perk3, FAQ), «высвобождает молекулы водорода и соли магния»; бейджи Eurofins **кликабельны** → новая страница **/certificates**. ② Auth: шапка = 2 кнопки («Регистрация» solid + «Войти» outline) → **AuthModal** (табы Вход/Регистрация, email+пароль-пустышка, равные кнопки Google/Telegram/Facebook); дропдаун только у вошедших. **Telegram обходной код-флоу** (widget забальзамирован): `/api/auth/tg/code` → `t.me/бот?start=CODE` → сайт-бот шлёт ссылку → `/{lang}/auth-telegram` → сессия. **Facebook OAuth** (start/callback/deauthorize, клон Google). **Привязка аккаунтов**: таблица `auth_links` (Neon), кабинет→Профиль→«Способы входа», guard «нельзя отвязать единственный способ» + ссылка на Профиль; email-пустышка. ③ Политики: LangSwitcher/LanguageModal теперь меняют **URL-локаль** (раньше сбрасывался после F5); `UltraThemeToggle` добавлен в PolicyLayout/PolicyModal. |
| **`c878d6b`** (21.11) | **Мобилка/десктоп + Midnight Navy.** Корзина на мобиле скрыта для неавторизованных + строкой в drawer. Cookie+PWA — общий контейнер `.rt-bottom-widgets` (мобайл стек, десктоп одна строка; куки на 320px — 2 строки текста + кнопки рядом). **Правый отступ найден**: off-canvas drawer (translateX(100%)) раздувает scrollWidth в WebKit → `html{overflow-x:clip}` + `visibility:hidden` закрытому drawer (overflow 0 на 320/1920, WebKit-проба). Primary → **#070E21** (split-токены, см. project.md §11). Слайды slide1–5.png обновлены. |
| **`c9410e4`+`7fd0e28`** (16.11) | WebKit-проверка iPhone (`scripts/check-webkit.mjs`); фикс обрезки hero и bg-fixed артефактов iOS. |
| **`95ee21c`/`47151c3`** (16.11) | Слайды 4–5, spotlight без обрезки, **notice вместо sonner** (везде); порт с дамми: селект Popover API, глайдер-вкладки кабинета, OfferSlots, ReceiptPrint, /left, служебные экраны. |
| **`cbfb622`…`b7aecbf`** (15.11) | Мобильное меню = шаблон `.mobile-nav` 1:1; закрытый селект языка; hero-высоты; ВЕСЬ ultra-токен-набор → globals.css; кабинет в стилях ultra-дашборда. |
| **`9602fd0`/`c7cb688`** (15.11) | Header в точных стилях шаблона (шиммер-лого, иконка корзины, пилюля языка, юзер-пилюля cap 120px); hero на шаблонном каркасе; **админка запушена отдельно** (`revtime2-admin`, adm-rt.vercel.app). |
| **`f9d49bb`/`41b1904`** (15.11) | Логотип-шиммер (точный шаблонный градиент, регистр RevolutTIME — требование владельца); CustomCursor + виджеты site-wide; **PWA на весь сайт** (manifest+sw.js). |
| **`d83481b`/`81d5416`** (15.11) | **Ultra Proxy порт**: route groups (site)/(ultra), токен-мост (весь сайт переодет 1 правкой), кабинет на 5 вкладках, ребрендинг ultra-страниц Ultra Proxy → RevolutTIME, `/api/ultra/*` + KV→Neon. |
| `acf2cea`…`d0efa2d` (11–13.11) | Auth UX (аватар, ссылки меню), PartnerNetwork (модуль владельца), Pricing v2 (70 €, план I–V), оверлей-фиксы, вики-линки, энциклопедия 10 статей, Journey+PDF-лид, Stripe-вебхук (код). |

## 4. Точная точка остановки

**Всё запушено (a3aeb96), прод деплоится/задеплоен. Ждут владельца/ключей:**

1. ✅ Работает на проде: сайт целиком (5 направлений + кабинет + энциклопедия + Journey), Google-вход, корзина, /certificates, политики (язык+тема).
2. 🟡 **Facebook-вход**: код готов; владельцу выданы значения полей FB-приложения (redirect/deauthorize/SDK-домен) — он их вносит + добавляет `FACEBOOK_APP_ID`/`FACEBOOK_APP_SECRET` в Vercel → Redeploy. До env кнопка честно отдаёт `?login=unconfigured`.
3. 🟡 **Telegram код-вход**: код готов; e2e-проверка возможна ТОЛЬКО на проде (нужен `DATABASE_URL` — локально его нет; API отдаёт graceful 503). Проверить: модалка → Telegram → код → бот → ссылка → кабинет. Вебхук сайт-бота уже на `/api/telegram/webhook` (обычный /start отвечает chat id — не сломан).
4. 🟡 **Stripe**: `/api/checkout` + `/api/webhooks/stripe` готовы; ждут `STRIPE_SECRET_KEY` (+`STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`=`sb_secret_…`) в Vercel. Без ключей checkout отдаёт 503.
5. 🟡 **Сертификаты**: /certificates — Eurofins-карточка + заглушка «Сертификаты соответствия». Ждём от владельца PDF отчёта Eurofins и сканы сертификатов. **Задняя сторона этикетки ещё не прислана** (`../imgs-finally/эттикетка/` — только front-smpl.jpg) — когда придёт, сверить состав/применение как для передней.
6. ❌ **Email-вход** (регистрация/восстановление): пустышка по решению владельца — он найдёт бесплатный email-сервис на своём домене, потом прикрутим. Поля в модалке уже есть.
7. ❌ **PostHog**: ждёт `NEXT_PUBLIC_POSTHOG_KEY` (код + consent-гейт готовы).
8. Известные кворки: soft-404 slug энциклопедии (HTTP 200), hreflang/OG-картинки, аватары в Blob — см. roadmap «Техдолг».
9. `public/imgs/hho/` (h2.png, logo.cdr, page*.png) — НОВЫЕ исходники владельца, **сознательно не закоммичены** (.cdr не должен попадать в public) — уточнить у владельца, нужны ли на сайте.

## 5. Правила работы (из чатов владельца)

- Любое изменение → сразу все 3 локали (de/ru/en) → валидация JSON → build без ошибок → **commit + push в main** (автодеплой) в конце каждой задачи.
- Владелец присылает скриншоты/сообщения из Telegram-чата — претворять в код и указывать это в девлоге.
- Легальные тексты ultra-страниц — пока только бренд-замена (содержание шаблонное).
- Регистр «RevolutTIME» в логотипе — явное требование владельца.
- Админку ведёт владелец в отдельном репо; здесь её не развиваем.

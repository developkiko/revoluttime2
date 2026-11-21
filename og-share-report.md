# OG / шаринг — отчёт и условия соцсетей (Фаза G, 22.11.2026)

> Для ревью владельца. «Поделиться» — стандартный набор для немцев: WhatsApp,
> Telegram, Facebook, X, E-Mail + копирование ссылки (+ нативное меню шаринга
> на телефонах). Кнопка стоит на страницах **/videos** и **/streams**.

## Что сделано

1. **OG-картинка** `public/imgs/brand/og.png` (1200×630, 56 KB): градиент
   бренда + атом H₂. Генератор — `scripts/generate-og-image.mjs` (правки
   дизайна — править скрипт и перезапустить).
2. **OG-метаданные** подключены ко всему сайту в корневом layout:
   `og:title`, `og:description`, `og:image` (+width/height/alt), `og:type`,
   `og:site_name`, `twitter:card summary_large_image`.
   База ссылок — `NEXT_PUBLIC_SITE_URL`, фолбэк `https://revoluttime.de`
   (поменять на боевой домен, когда оживёт DNS — см. need-connect.md).
3. **ShareButton** (components/videos/ShareButton.tsx): на мобилках —
   нативное меню; на десктопе — дропдаун с сетями ниже.

## Условия каждой соцсети (список к ревью)

| Сеть | Ссылка шаринга | Что читает превью | Ограничения |
|---|---|---|---|
| **WhatsApp** | `https://wa.me/?text=<title+url>` | og:title, og:description, og:image | Картинка 300×200 min, ≤300 KB рекомендуем; наши 56 KB ок |
| **Telegram** | `https://t.me/share/url?url=<u>&text=<title>` | og:title, og:description, og:image (и twitter:* как фолбэк) | Кэш превью агрессивный — при смене картинки использовать `?v=2` в URL картинки |
| **Facebook** | `https://www.facebook.com/sharer/sharer.php?u=<u>` | og:* строго | Мин 200×200, макс 8 MB; 1200×630 идеал (наш случай). Требует **доступный домен без redirects** — превью появится только после оживления revoluttime.de. **Бизнес-верификация не влияет на шаринг** — только на логин |
| **X / Twitter** | `https://twitter.com/intent/tweet?url=<u>&text=<t>` | twitter:card, og:* | summary_large_image — большая карточка; лимит 5 MB |
| **E-Mail** | `mailto:?subject=<title>&body=<url>` | — | Без превью, текст в теле письма |

## Что НЕ попало (осознанно)

- LinkedIn/XING-специфичные метатеги — аудитория партнёрки не там; добавим
  по запросу (LinkedIn читает те же og:*).
- Отдельные OG-картинки на каждую страницу — сейчас одна общая. Список
  страниц под индивидуальные карточки соберём, когда появится домен.

## Проверка после запуска

- [ ] Telegram: вставить `https://revolut-time.vercel.app/ru/videos` в чат → превью с атомом
- [ ] WhatsApp: то же в диалог себе
- [ ] Facebook Sharing Debugger после оживления домена: `developers.facebook.com/tools/debug/`
- [ ] X Card Validator: `cards-dev.twitter.com/validator`

# One-off: rebrand data/config/meta layers to RevolutTIME (Phase 1b).
import io, glob, os

def patch(path, pairs, must=True):
    s = io.open(path, encoding='utf-8').read()
    missed = []
    for old, new in pairs:
        if old in s:
            s = s.replace(old, new)
        else:
            missed.append(old[:60])
    io.open(path, 'w', encoding='utf-8', newline='').write(s)
    print(path, '-> applied', len(pairs) - len(missed), 'missed', len(missed))
    for m in missed:
        print('   MISS:', m)

# ── 1. DEFAULT_SITE_CONFIG ──
patch('app/api/ultra/site-config/route.ts', [
    ('site: { name: "Ultra Proxy", domain: "www.ultra-proxy.pro" },',
     'site: { name: "RevolutTIME", domain: "revolut-time.vercel.app" },'),
    ('telegram_link: "https://t.me/ultraproxy_support",\n    telegram_text: "@ultraproxy_support",\n    email: "support@ultra-proxy.pro",',
     'telegram_link: "https://t.me/revoluttime",\n    telegram_text: "@revoluttime",\n    email: "+49 175 9590916 (WhatsApp)",'),
    ('email: { ru: "support@ultra-proxy.pro", en: "support@ultra-proxy.pro", url: "mailto:support@ultra-proxy.pro" },',
     'email: { ru: "+49 175 9590916 (WhatsApp)", en: "+49 175 9590916 (WhatsApp)", url: "https://wa.me/491759590916" },'),
    ('telegram: { ru: "@ultraproxy_support", en: "@ultraproxy_support", url: "https://t.me/ultraproxy_support" },',
     'telegram: { ru: "@revoluttime", en: "@revoluttime", url: "https://t.me/revoluttime" },'),
    ('schedule: { ru: "24/7, без выходных", en: "24/7, 365 days", url: "" },',
     'schedule: { ru: "Ежедневно, отвечаем в течение часа", en: "Daily, we reply within an hour", url: "" },'),
    ('email: "support@ultra-proxy.pro",\n    telegram_link: "https://t.me/ultraproxy_support",\n    telegram_text: "@ultraproxy_support",\n  },\n  footer_contacts:',
     'email: "https://wa.me/491759590916",\n    telegram_link: "https://t.me/revoluttime",\n    telegram_text: "@revoluttime",\n  },\n  footer_contacts:'),
    ('contact1: { ru: "Telegram: @ultraprxy_support", en: "Telegram: @ultraprxy_support", url: "https://t.me/ultraprxy_support" },',
     'contact1: { ru: "Telegram: @revoluttime", en: "Telegram: @revoluttime", url: "https://t.me/revoluttime" },'),
    ('contact2: { ru: "Email: support@ultra-proxy.pro", en: "Email: support@ultra-proxy.pro", url: "mailto:support@ultra-proxy.pro" },',
     'contact2: { ru: "WhatsApp: +49 175 9590916", en: "WhatsApp: +49 175 9590916", url: "https://wa.me/491759590916" },'),
    ('clients: { value: "2847", label_ru: "Активных клиентов", label_en: "Active Clients" },',
     'clients: { value: "1200", label_ru: "Клиентов", label_en: "Customers" },'),
    ('proxies: { value: "15230", label_ru: "Выдано прокси", label_en: "Proxies Issued" },',
     'proxies: { value: "8600", label_ru: "Наборов отправлено", label_en: "Packs Shipped" },'),
    ('countries: { value: "200", label_ru: "Стран покрытия", label_en: "Countries Covered" },',
     'countries: { value: "31", label_ru: "Стран доставки", label_en: "Shipping Countries" },'),
    ('uptime: { value: "99%", label_ru: "Аптайм", label_en: "Uptime" },',
     'uptime: { value: "68%", label_ru: "Повторных покупок", label_en: "Repeat Orders" },'),
    ('ips: { value: "120M+", label_ru: "IP-адресов", label_en: "IP Addresses" },',
     'ips: { value: "1,6 ppm", label_ru: "H₂ в воде", label_en: "Dissolved H₂" },'),
    ('geo: { value: "200+", label_ru: "Гео-локаций", label_en: "Geo-Locations" },',
     'geo: { value: "57–67 мг", label_ru: "Магния на таблетку", label_en: "Mg per tablet" },'),
    ('uptime: { value: "99.9%", label_ru: "Аптайм", label_en: "Uptime" },\n  },\n  top_locations:',
     'uptime: { value: "1–2 мин", label_ru: "до готовой воды", label_en: "to ready water" },\n  },\n  top_locations:'),
    ('top_locations: ["us", "gb", "de", "fr", "jp", "br", "in", "cn", "ca", "au", "it", "es", "nl", "se", "pl", "tr", "kr", "mx", "ar", "za", "ae", "sg", "ru", "ua", "kz", "cz", "ro", "id", "vn", "th", "ph", "ng", "eg"],',
     'top_locations: ["de", "at", "ch", "nl", "be", "fr", "it", "es", "pt", "pl", "cz", "sk", "hu", "se", "dk", "fi", "ie", "lu", "si", "hr", "ee", "lv", "lt", "ro", "bg", "gr"],'),
    ('proxy_types: [{ label: "Residential", weight: 35 }, { label: "Mobile", weight: 25 }, { label: "Datacenter", weight: 30 }, { label: "ISP Static", weight: 10 }],',
     'proxy_types: [{ label: "Magnesium + H₂ 90", weight: 55 }, { label: "Partner Pack ×10", weight: 30 }, { label: "Gift Pack", weight: 15 }],'),
    ('price_min: 0.08, price_max: 0.63, discount_min_percent: 10, discount_max_percent: 20,',
     'price_min: 60, price_max: 70, discount_min_percent: 10, discount_max_percent: 20,'),
    ('currency: "$", mask_email: true,', 'currency: "€", mask_email: true,'),
    ('{ label_ru: "Fast 35 (35 ГБ)", label_en: "Fast 35 (35 GB)", price: 35, weight: 30 },',
     '{ label_ru: "RevolutTIME 90", label_en: "RevolutTIME 90", price: 70, weight: 55 },'),
    ('{ label_ru: "Residential 15 (15 ГБ)", label_en: "Residential 15 (15 GB)", price: 31, weight: 25 },',
     '{ label_ru: "Партнёрский набор ×10", label_en: "Partner Pack ×10", price: 600, weight: 30 },'),
    ('{ label_ru: "Mobile 10 (10 ГБ)", label_en: "Mobile 10 (10 GB)", price: 39, weight: 20 },',
     '{ label_ru: "Подарочный набор", label_en: "Gift Pack", price: 70, weight: 15 },'),
    ('{ label_ru: "Datacenter 95 (95 ГБ)", label_en: "Datacenter 95 (95 GB)", price: 55, weight: 25 },',
     '{ label_ru: "RevolutTIME 90 (двойной)", label_en: "RevolutTIME 90 (double)", price: 140, weight: 10 },'),
    ('proxy_title_ru: "Прокси", proxy_title_en: "Proxies", plan_title_ru: "Тарифы", plan_title_en: "Plans",',
     'proxy_title_ru: "Заказы", proxy_title_en: "Orders", plan_title_ru: "Наборы", plan_title_en: "Packs",'),
    ('item_ru: "Товар", item_en: "Item",', 'item_ru: "Набор", item_en: "Pack",'),
    ('email: "mailto:support@ultra-proxy.pro",\n    telegram_link: "https://t.me/ultraproxy_support",',
     'email: "https://wa.me/491759590916",\n    telegram_link: "https://t.me/revoluttime",'),
])

# ── 2. DEFAULT_PRODUCTS ──
patch('app/api/ultra/products/route.ts', [
    ('{ id: 1, type: "fast", name_ru: "Fast 35", name_en: "Fast 35", traffic_ru: "35 ГБ трафика", traffic_en: "35 GB traffic", price: 35, oldPrice: 44, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: true, order: 0 },',
     '{ id: 1, type: "fast", name_ru: "RevolutTIME 90", name_en: "RevolutTIME 90", traffic_ru: "90 таблеток", traffic_en: "90 tablets", price: 70, oldPrice: 84, discount: 17, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: true, order: 0 },'),
    ('{ id: 2, type: "wifi", name_ru: "Residential 15", name_en: "Residential 15", traffic_ru: "15 ГБ трафика", traffic_en: "15 GB traffic", price: 31, oldPrice: 39, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_support"], popular: false, order: 1 },',
     '{ id: 2, type: "wifi", name_ru: "Партнёрский набор ×10", name_en: "Partner Pack ×10", traffic_ru: "900 таблеток", traffic_en: "900 tablets", price: 600, oldPrice: 700, discount: 14, features: ["plan_feat_locations", "plan_feat_support", "plan_feat_whitelist"], popular: false, order: 1 },'),
    ('{ id: 3, type: "mobile", name_ru: "Mobile 10", name_en: "Mobile 10", traffic_ru: "10 ГБ трафика", traffic_en: "10 GB traffic", price: 39, oldPrice: 49, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_whitelist"], popular: false, order: 2 },',
     '{ id: 3, type: "mobile", name_ru: "Двойной набор", name_en: "Double Pack", traffic_ru: "180 таблеток", traffic_en: "180 tablets", price: 140, oldPrice: 168, discount: 17, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: false, order: 2 },'),
    ('{ id: 4, type: "shared", name_ru: "Datacenter 95", name_en: "Datacenter 95", traffic_ru: "95 ГБ трафика", traffic_en: "95 GB traffic", price: 55, oldPrice: 69, discount: 20, features: ["plan_feat_locations", "plan_feat_uptime", "plan_feat_support"], popular: false, order: 3 },',
     '{ id: 4, type: "shared", name_ru: "Подарочный набор", name_en: "Gift Pack", traffic_ru: "90 таблеток", traffic_en: "90 tablets", price: 70, oldPrice: 84, discount: 17, features: ["plan_feat_uptime", "plan_feat_support", "plan_feat_whitelist"], popular: false, order: 3 },'),
])

# ── 3. metadata.ts ──
patch('app/[lang]/(ultra)/metadata.ts', [
    ('title:\n      "Ultra Proxy — Fast & Reliable Proxies | Residential, Mobile & Datacenter",',
     'title:\n      "RevolutTIME — Molecular Hydrogen, Biohacking & Partner Program",'),
    ('description:\n      "Elite residential, mobile and datacenter proxies. 120M+ IPs across 200+ countries. Instant activation, 99.9% uptime, crypto payments.",',
     'description:\n      "Effervescent magnesium + H₂ tablets — Eurofins-tested, made in Bavaria. Studio, equipment, recreation and a partner program for active longevity.",'),
    ('ogTitle: "Ultra Proxy — Fast & Reliable Proxies",', 'ogTitle: "RevolutTIME — Molecular Hydrogen & Biohacking",'),
    ('ogDescription:\n      "Elite residential, mobile and datacenter proxies. 120M+ IPs across 200+ countries.",',
     'ogDescription:\n      "Effervescent magnesium + H₂ tablets — Eurofins-tested, made in Bavaria.",'),
    ('applicationName: "Ultra Proxy",', 'applicationName: "RevolutTIME",'),
    ('title: "Ultra Proxy",', 'title: "RevolutTIME",'),
    ('siteName: "Ultra Proxy",', 'siteName: "RevolutTIME",'),
    ('alt: "Ultra Proxy",', 'alt: "RevolutTIME",'),
])

# ── 4. PwaRegistration copy ──
patch('components/ultra/PwaRegistration.tsx', [
    ('title: "Установить Ultra Proxy",', 'title: "Установить RevolutTIME",'),
    ('iosTitle: "Добавить Ultra Proxy на экран",', 'iosTitle: "Добавить RevolutTIME на экран",'),
    ('description: "Установите приложение для быстрого доступа к кабинету и прокси.",',
     'description: "Установите приложение для быстрого доступа к кабинету и наборам.",'),
    ('iosDescription: "Откройте меню браузера и добавьте Ultra Proxy на экран «Домой». ",',
     'iosDescription: "Откройте меню браузера и добавьте RevolutTIME на экран «Домой». ",'),
    ('title: "Install Ultra Proxy",', 'title: "Install RevolutTIME",'),
    ('iosTitle: "Add Ultra Proxy to Home Screen",', 'iosTitle: "Add RevolutTIME to Home Screen",'),
    ('description: "Install the app for quick access to your dashboard and proxies.",',
     'description: "Install the app for quick access to your dashboard and packs.",'),
    ('iosDescription: "Open your browser menu and add Ultra Proxy to the Home Screen.",',
     'iosDescription: "Open your browser menu and add RevolutTIME to the Home Screen.",'),
])

# ── 5. manifest ──
patch('public/ultra/manifest.webmanifest', [
    ('"name": "Ultra Proxy — Fast & Reliable Proxies",', '"name": "RevolutTIME — Molecular Hydrogen & Biohacking",'),
    ('"short_name": "Ultra Proxy",', '"short_name": "RevolutTIME",'),
    ('"description": "Fast residential, mobile and datacenter proxies.",', '"description": "Molecular hydrogen and biohacking for active longevity.",'),
])

# ── 6. TrustCounters fallback numbers ──
patch('components/ultra/home/TrustCounters.tsx', [
    ('{ target: 2847, suffix: "+", labelKey: "trust_clients" },', '{ target: 1200, suffix: "+", labelKey: "trust_clients" },'),
    ('{ target: 15230, suffix: "+", labelKey: "trust_proxies" },', '{ target: 8600, suffix: "+", labelKey: "trust_proxies" },'),
    ('{ target: 200, suffix: "", labelKey: "trust_countries" },', '{ target: 31, suffix: "", labelKey: "trust_countries" },'),
    ('{ target: 99, suffix: "%", labelKey: "trust_uptime" },', '{ target: 68, suffix: "%", labelKey: "trust_uptime" },'),
])

# ── 7. Global human-readable brand sweep across ultra dirs ──
targets = []
for root in ['components/ultra', 'lib/ultra', 'app/api/ultra', 'app/[lang]/(ultra)']:
    for dirpath, _, files in os.walk(root):
        for name in files:
            if name.endswith(('.ts', '.tsx')):
                targets.append(os.path.join(dirpath, name))
# identifiers (localStorage keys, css classes, pkg names) stay untouched:
brand_pairs = [
    ('Ultra Proxy', 'RevolutTIME'),
    ('ULTRA PROXY', 'REVOLUTTIME'),
    ('UltraProxy', 'RevolutTIME'),
    ('ultra-proxy.pro', 'revoluttime.de'),
    ('ultraproxy_support', 'revoluttime'),
    ('ultraprxy_support', 'revoluttime'),
    ('ultraproxybot_bot', 'revoluttime_bot'),
]
changed = 0
for f in targets:
    s = io.open(f, encoding='utf-8').read()
    orig = s
    for old, new in brand_pairs:
        s = s.replace(old, new)
    if s != orig:
        io.open(f, 'w', encoding='utf-8', newline='').write(s)
        changed += 1
print('brand sweep: files changed', changed, 'of', len(targets))

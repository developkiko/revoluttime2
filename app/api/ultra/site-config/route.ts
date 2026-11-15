import { connection, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { getDbSiteConfig } from "@/lib/ultra/db-data";


const DEFAULT_SITE_CONFIG: Record<string, any> = {
  site: { name: "RevolutTIME", domain: "revolut-time.vercel.app" },
  pswd_recovery: {
    telegram_link: "https://t.me/revoluttime",
    telegram_text: "@revoluttime",
    email: "+49 175 9590916 (WhatsApp)",
  },
  contact_section: {
    email: { ru: "+49 175 9590916 (WhatsApp)", en: "+49 175 9590916 (WhatsApp)", url: "https://wa.me/491759590916" },
    telegram: { ru: "@revoluttime", en: "@revoluttime", url: "https://t.me/revoluttime" },
    schedule: { ru: "Ежедневно, отвечаем в течение часа", en: "Daily, we reply within an hour", url: "" },
  },
  policy_footer: {
    email: "https://wa.me/491759590916",
    telegram_link: "https://t.me/revoluttime",
    telegram_text: "@revoluttime",
  },
  footer_contacts: {
    contact1: { ru: "Telegram: @revoluttime", en: "Telegram: @revoluttime", url: "https://t.me/revoluttime" },
    contact2: { ru: "WhatsApp: +49 175 9590916", en: "WhatsApp: +49 175 9590916", url: "https://wa.me/491759590916" },
  },
  trust_counters: {
    clients: { value: "1200", label_ru: "Клиентов", label_en: "Customers" },
    proxies: { value: "8600", label_ru: "Наборов отправлено", label_en: "Packs Shipped" },
    countries: { value: "31", label_ru: "Стран доставки", label_en: "Shipping Countries" },
    uptime: { value: "68%", label_ru: "Повторных покупок", label_en: "Repeat Orders" },
  },
  hero_stats: {
    ips: { value: "1,6 ppm", label_ru: "H₂ в воде", label_en: "Dissolved H₂" },
    geo: { value: "57–67 мг", label_ru: "Магния на таблетку", label_en: "Mg per tablet" },
    uptime: { value: "1–2 мин", label_ru: "до готовой воды", label_en: "to ready water" },
  },
  top_locations: ["de", "at", "ch", "nl", "be", "fr", "it", "es", "pt", "pl", "cz", "sk", "hu", "se", "dk", "fi", "ie", "lu", "si", "hr", "ee", "lv", "lt", "ro", "bg", "gr"],
  live_demo: {

    enabled: true, show_proxy: true, show_plans: true, initial_rows: 5, max_rows: 5,
    proxy_delay_min_ms: 8000, proxy_delay_max_ms: 15000, plan_delay_min_ms: 25000, plan_delay_max_ms: 45000,
    flash_duration_ms: 5000, use_products: true, currency: "€", mask_email: true,
    avoid_repeat_country: true, avoid_repeat_item: true, pause_when_hidden: true,
    domains: ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "mail.ru", "yandex.ru", "icloud.com", "hotmail.com", "gmx.de", "wp.pl", "t-online.de", "web.de", "free.fr", "orange.fr", "onet.pl", "seznam.cz", "inbox.lt", "rambler.ru", "bk.ru", "list.ru", "posteo.de", "fastmail.com", "zoho.com", "tutanota.com", "mail.com", "live.ru"],
    name_patterns: ["letters", "letters_digits", "short_name_digits"],
    countries: ["US", "DE", "GB", "FR", "JP", "BR", "IN", "NL", "IT", "ES", "SE", "PL", "AU", "CA", "KR"],
    proxy_types: [{ label: "Magnesium + H₂ 90", weight: 55 }, { label: "Partner Pack ×10", weight: 30 }, { label: "Gift Pack", weight: 15 }],
    price_min: 60, price_max: 70, discount_min_percent: 10, discount_max_percent: 20,
    fallback_plans: [
      { label_ru: "RevolutTIME 90", label_en: "RevolutTIME 90", price: 70, weight: 55 },
      { label_ru: "Партнёрский набор ×10", label_en: "Partner Pack ×10", price: 600, weight: 30 },
      { label_ru: "Подарочный набор", label_en: "Gift Pack", price: 70, weight: 15 },
      { label_ru: "RevolutTIME 90 (двойной)", label_en: "RevolutTIME 90 (double)", price: 140, weight: 10 },
    ],
    heading_ru: "Покупки в реальном времени", heading_en: "Live purchases",
    proxy_title_ru: "Заказы", proxy_title_en: "Orders", plan_title_ru: "Наборы", plan_title_en: "Packs",
    labels: { email_ru: "Email", email_en: "Email", item_ru: "Набор", item_en: "Pack", price_ru: "Цена", price_en: "Price", time_ru: "Время", time_en: "Time" },
  },
  stats_demo: {
    enabled: true, show_activity: true, show_hour: true, show_sparklines: true, show_incidents: true, refresh_interval_seconds: 60,
    history_days: 30, max_history_points: 30,
    total_pool_base: 118000000, total_pool_range: 4000000, online_share_base: 0.62, online_share_range: 0.18,
    servers_base: 4200, servers_range: 800, ping_base_ms: 38, ping_activity_delta_ms: 22, ping_noise_ms: 6,
    bandwidth_base_tbps: 1.8, bandwidth_activity_delta_tbps: 1.4, bandwidth_noise_tbps: 0.2,
    success_base_percent: 99.1, success_activity_delta_percent: 0.7, success_noise_percent: 0.15,
    uptime_base_percent: 99.92, uptime_noise_percent: 0.05,
    activity_baseline: 0.55, activity_amplitude: 0.35, activity_min: 0.45, activity_max: 1.05, activity_noise: 0.04,
    history_baseline_factor: 0.7, history_factor_range: 0.35, history_noise: 0.03,
    regions: [
      { key: "na", label_ru: "Северная Америка", label_en: "North America", server_share: 0.32, online_share: 0.30, load_base: 45, load_activity: 30, ping_base_ms: 28, ping_activity_delta_ms: 8, activity_multiplier: 1 },
      { key: "eu", label_ru: "Европа", label_en: "Europe", server_share: 0.34, online_share: 0.34, load_base: 50, load_activity: 28, ping_base_ms: 22, ping_activity_delta_ms: 6, activity_multiplier: 1 },
      { key: "apac", label_ru: "АТР", label_en: "APAC", server_share: 0.18, online_share: 0.20, load_base: 40, load_activity: 35, ping_base_ms: 55, ping_activity_delta_ms: 12, activity_multiplier: 0.95 },
      { key: "latam", label_ru: "Лат. Америка", label_en: "Latin America", server_share: 0.09, online_share: 0.09, load_base: 35, load_activity: 25, ping_base_ms: 70, ping_activity_delta_ms: 15, activity_multiplier: 0.90 },
      { key: "mea", label_ru: "Ближ. Восток и Африка", label_en: "Middle East & Africa", server_share: 0.07, online_share: 0.07, load_base: 30, load_activity: 25, ping_base_ms: 80, ping_activity_delta_ms: 18, activity_multiplier: 0.85 },
    ],
    incidents: [{ id: "i1", enabled: true, date_offset_days: 5, type: "info", text_ru: "Плановое расширение пула IP в регионе EU", text_en: "Scheduled IP pool expansion in EU region", status_ru: "Завершено", status_en: "Resolved" }],
  },
  telegram_auth_enabled: true,
  widget: {
    enabled: true,
    email: "https://wa.me/491759590916",
    telegram_link: "https://t.me/revoluttime",
  },
  captcha: { enabled: true, forms: { register: true, login: true, contact: true } },
  payment: {
    merchant_wallet: "TVMF3D8LCoYSR1jNF3bqkwHhn3N3wkrTo1",
    default_url: "https://cryptomus-maql-3bd5f24de3e3.herokuapp.com/pay/EoUT76iK",
    token: "USDT",
    network: "TRC20",
    validity_hours: 24,
    min_amount: 10,
    lock_amount: false,
    max_amount: 100000,
  },
};

function deepMerge(base: any, patch: any): any {
  const result = JSON.parse(JSON.stringify(base));
  for (const key of Object.keys(patch || {})) {
    if (patch[key] && typeof patch[key] === "object" && !Array.isArray(patch[key])) {
      result[key] = deepMerge(result[key] || {}, patch[key]);
    } else {
      result[key] = patch[key];
    }
  }
  return result;
}

export async function GET() {
  // Runtime data (Neon) — opt into dynamic rendering under cacheComponents.
  await connection();
  try {
    const stored = await kvGetJson<Record<string, unknown>>("site_config", {});
    let config = deepMerge(DEFAULT_SITE_CONFIG, stored);
    if (shadowReadsEnabled() || dbReadsEnabled()) {
      try {
        const dbConfig = await getDbSiteConfig();
        if (shadowReadsEnabled() && dbConfig && JSON.stringify(dbConfig) !== JSON.stringify(stored)) console.warn("[storage] shadow mismatch: public site config");
        if (dbReadsEnabled() && dbConfig) config = deepMerge(DEFAULT_SITE_CONFIG, dbConfig);
      } catch (error) { console.error("[storage] public site config DB read failed", error instanceof Error ? error.message : "unknown"); }
    }
    const flatStr = (v: any) => (typeof v === "string" ? v : v?.ru || v?.en || "");
    const cs = config.contact_section || {};
    const fc = config.footer_contacts || {};
    return NextResponse.json({
      ...config,
      contact_section: {
        email: flatStr(cs.email),
        telegram_link: (cs.telegram && cs.telegram.url) || flatStr(cs.telegram),
        telegram_text: flatStr(cs.telegram),
        workhours_ru: flatStr(cs.schedule?.ru || cs.workhours_ru),
        workhours_en: flatStr(cs.schedule?.en || cs.workhours_en),
      },
      footer_contacts: {
        email: flatStr(fc.contact2 || fc.email),
        telegram_link: (fc.contact1 && fc.contact1.url) || fc.telegram_link || "",
        telegram_text: flatStr(fc.contact1 || fc.telegram_text),
      },
    });
  } catch (e) {
    console.error("[site-config]", e);
    return NextResponse.json(DEFAULT_SITE_CONFIG);
  }
}

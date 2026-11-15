import { connection, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { getDbSiteConfig } from "@/lib/ultra/db-data";


const DEFAULT_SITE_CONFIG: Record<string, any> = {
  site: { name: "Ultra Proxy", domain: "www.ultra-proxy.pro" },
  pswd_recovery: {
    telegram_link: "https://t.me/ultraproxy_support",
    telegram_text: "@ultraproxy_support",
    email: "support@ultra-proxy.pro",
  },
  contact_section: {
    email: { ru: "support@ultra-proxy.pro", en: "support@ultra-proxy.pro", url: "mailto:support@ultra-proxy.pro" },
    telegram: { ru: "@ultraproxy_support", en: "@ultraproxy_support", url: "https://t.me/ultraproxy_support" },
    schedule: { ru: "24/7, без выходных", en: "24/7, 365 days", url: "" },
  },
  policy_footer: {
    email: "support@ultra-proxy.pro",
    telegram_link: "https://t.me/ultraproxy_support",
    telegram_text: "@ultraproxy_support",
  },
  footer_contacts: {
    contact1: { ru: "Telegram: @ultraprxy_support", en: "Telegram: @ultraprxy_support", url: "https://t.me/ultraprxy_support" },
    contact2: { ru: "Email: support@ultra-proxy.pro", en: "Email: support@ultra-proxy.pro", url: "mailto:support@ultra-proxy.pro" },
  },
  trust_counters: {
    clients: { value: "2847", label_ru: "Активных клиентов", label_en: "Active Clients" },
    proxies: { value: "15230", label_ru: "Выдано прокси", label_en: "Proxies Issued" },
    countries: { value: "200", label_ru: "Стран покрытия", label_en: "Countries Covered" },
    uptime: { value: "99%", label_ru: "Аптайм", label_en: "Uptime" },
  },
  hero_stats: {
    ips: { value: "120M+", label_ru: "IP-адресов", label_en: "IP Addresses" },
    geo: { value: "200+", label_ru: "Гео-локаций", label_en: "Geo-Locations" },
    uptime: { value: "99.9%", label_ru: "Аптайм", label_en: "Uptime" },
  },
  top_locations: ["us", "gb", "de", "fr", "jp", "br", "in", "cn", "ca", "au", "it", "es", "nl", "se", "pl", "tr", "kr", "mx", "ar", "za", "ae", "sg", "ru", "ua", "kz", "cz", "ro", "id", "vn", "th", "ph", "ng", "eg"],
  live_demo: {

    enabled: true, show_proxy: true, show_plans: true, initial_rows: 5, max_rows: 5,
    proxy_delay_min_ms: 8000, proxy_delay_max_ms: 15000, plan_delay_min_ms: 25000, plan_delay_max_ms: 45000,
    flash_duration_ms: 5000, use_products: true, currency: "$", mask_email: true,
    avoid_repeat_country: true, avoid_repeat_item: true, pause_when_hidden: true,
    domains: ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "mail.ru", "yandex.ru", "icloud.com", "hotmail.com", "gmx.de", "wp.pl", "t-online.de", "web.de", "free.fr", "orange.fr", "onet.pl", "seznam.cz", "inbox.lt", "rambler.ru", "bk.ru", "list.ru", "posteo.de", "fastmail.com", "zoho.com", "tutanota.com", "mail.com", "live.ru"],
    name_patterns: ["letters", "letters_digits", "short_name_digits"],
    countries: ["US", "DE", "GB", "FR", "JP", "BR", "IN", "NL", "IT", "ES", "SE", "PL", "AU", "CA", "KR"],
    proxy_types: [{ label: "Residential", weight: 35 }, { label: "Mobile", weight: 25 }, { label: "Datacenter", weight: 30 }, { label: "ISP Static", weight: 10 }],
    price_min: 0.08, price_max: 0.63, discount_min_percent: 10, discount_max_percent: 20,
    fallback_plans: [
      { label_ru: "Fast 35 (35 ГБ)", label_en: "Fast 35 (35 GB)", price: 35, weight: 30 },
      { label_ru: "Residential 15 (15 ГБ)", label_en: "Residential 15 (15 GB)", price: 31, weight: 25 },
      { label_ru: "Mobile 10 (10 ГБ)", label_en: "Mobile 10 (10 GB)", price: 39, weight: 20 },
      { label_ru: "Datacenter 95 (95 ГБ)", label_en: "Datacenter 95 (95 GB)", price: 55, weight: 25 },
    ],
    heading_ru: "Покупки в реальном времени", heading_en: "Live purchases",
    proxy_title_ru: "Прокси", proxy_title_en: "Proxies", plan_title_ru: "Тарифы", plan_title_en: "Plans",
    labels: { email_ru: "Email", email_en: "Email", item_ru: "Товар", item_en: "Item", price_ru: "Цена", price_en: "Price", time_ru: "Время", time_en: "Time" },
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
    email: "mailto:support@ultra-proxy.pro",
    telegram_link: "https://t.me/ultraproxy_support",
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

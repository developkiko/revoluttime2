// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — API клиент для CF Worker
// ══════════════════════════════════════════════════════════════

// ═══ Demo presentation config ═══
export interface LiveDemoPlan {
  label_ru: string;
  label_en: string;
  price: number;
  weight: number;
}
export interface LiveDemoProxyType {
  label: string;
  weight: number;
}
export interface LiveDemoConfig {
  enabled?: boolean;
  show_proxy?: boolean;
  show_plans?: boolean;
  initial_rows?: number;
  max_rows?: number;
  proxy_delay_min_ms?: number;
  proxy_delay_max_ms?: number;
  plan_delay_min_ms?: number;
  plan_delay_max_ms?: number;
  flash_duration_ms?: number;
  use_products?: boolean;
  currency?: string;
  mask_email?: boolean;
  avoid_repeat_country?: boolean;
  avoid_repeat_item?: boolean;
  pause_when_hidden?: boolean;
  domains?: string[];
  name_patterns?: string[];
  countries?: string[];
  proxy_types?: LiveDemoProxyType[];
  price_min?: number;
  price_max?: number;
  discount_min_percent?: number;
  discount_max_percent?: number;
  fallback_plans?: LiveDemoPlan[];
  heading_ru?: string;
  heading_en?: string;
  proxy_title_ru?: string;
  proxy_title_en?: string;
  plan_title_ru?: string;
  plan_title_en?: string;
  labels?: { email_ru?: string; email_en?: string; item_ru?: string; item_en?: string; price_ru?: string; price_en?: string; time_ru?: string; time_en?: string };
}
export interface StatsDemoRegion {
  key: string;
  label_ru: string;
  label_en: string;
  server_share: number;
  online_share: number;
  load_base: number;
  load_activity: number;
  ping_base_ms: number;
  ping_activity_delta_ms: number;
  activity_multiplier: number;
}
export interface StatsDemoIncident {
  id: string;
  enabled: boolean;
  date_offset_days: number;
  type: "info" | "minor" | "major";
  text_ru: string;
  text_en: string;
  status_ru: string;
  status_en: string;
}
export interface StatsDemoConfig {
  enabled?: boolean;
  show_activity?: boolean;
  show_hour?: boolean;
  show_sparklines?: boolean;
  show_incidents?: boolean;
  refresh_interval_seconds?: number;
  history_days?: number;
  max_history_points?: number;
  total_pool_base?: number;
  total_pool_range?: number;
  online_share_base?: number;
  online_share_range?: number;
  servers_base?: number;
  servers_range?: number;
  ping_base_ms?: number;
  ping_activity_delta_ms?: number;
  ping_noise_ms?: number;
  bandwidth_base_tbps?: number;
  bandwidth_activity_delta_tbps?: number;
  bandwidth_noise_tbps?: number;
  success_base_percent?: number;
  success_activity_delta_percent?: number;
  success_noise_percent?: number;
  uptime_base_percent?: number;
  uptime_noise_percent?: number;
  activity_baseline?: number;
  activity_amplitude?: number;
  activity_min?: number;
  activity_max?: number;
  activity_noise?: number;
  history_baseline_factor?: number;
  history_factor_range?: number;
  history_noise?: number;
  regions?: StatsDemoRegion[];
  incidents?: StatsDemoIncident[];
}

// ═══ Site Config ═══
export interface SiteConfig {
  site: {
    name: string;
    domain: string;
  };
  pswd_recovery: {
    telegram_link: string;
    telegram_text: string;
    email: string;
  };
  contact_section: {
    email: string;
    telegram_link: string;
    telegram_text: string;
    workhours_ru: string;
    workhours_en: string;
  };
  policy_footer: {
    email: string;
    telegram_link: string;
    telegram_text: string;
  };
  policies_contacts: {
    email: string;
    telegram: string;
  };
  footer_contacts: {
    telegram_link: string;
    telegram_text: string;
    email: string;
  };
  trust_counters: {
    clients: { value: string; label_ru: string; label_en: string };
    proxies: { value: string; label_ru: string; label_en: string };
    countries: { value: string; label_ru: string; label_en: string };
    uptime: { value: string; label_ru: string; label_en: string };
  };
  top_locations?: string[];
  live_demo?: LiveDemoConfig;
  stats_demo?: StatsDemoConfig;
  telegram_auth_enabled?: boolean;

  captcha?: {
    enabled?: boolean;
    forms?: {
      login?: boolean;
      register?: boolean;
      contact?: boolean;
    };
  };
  hero_stats: {
    ips: { value: string; label_ru: string; label_en: string };
    geo: { value: string; label_ru: string; label_en: string };
    uptime: { value: string; label_ru: string; label_en: string };
  };
  widget?: {
    enabled: boolean;
    email: string;
    telegram_link: string;
  };
  payment?: {
    merchant_wallet?: string;
    default_url?: string;
    token?: string;
    network?: string;
    validity_hours?: number;
    min_amount?: number;
    lock_amount?: boolean;
    max_amount?: number;
  };
}

export async function fetchSiteConfig(): Promise<SiteConfig> {
  const ts = Date.now();
  const res = await fetch(`/api/ultra/site-config?_=${ts}`, {
    cache: "no-store",
  });
  return res.json();
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: { email: string; login: string };
  error?: string;
  errors?: ValidationError[];
}

export interface LoginResponse {
  success: boolean;
  user?: {
    email: string;
    login: string;
    wallet_attached: boolean;
    error_state: boolean;
  };
  error?: string;
  errors?: ValidationError[];
}

export async function registerViaAPI(
  email: string,
  password: string,
  turnstileToken?: string
): Promise<RegisterResponse> {
  const body: Record<string, string> = { email, password };
  if (turnstileToken) body.turnstileToken = turnstileToken;

  const res = await fetch(`/api/ultra/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  const res = await fetch(`/api/ultra/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function checkLogin(email: string, password: string): Promise<{ valid: boolean; errors?: ValidationError[] }> {
  const res = await fetch(`/api/ultra/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.success) return { valid: true };
  return { valid: false, errors: data.errors };
}

export async function loginViaAPI(
  email: string,
  password: string,
  turnstileToken?: string
): Promise<LoginResponse> {
  const body: Record<string, string> = { email, password };
  if (turnstileToken) body.turnstileToken = turnstileToken;

  const res = await fetch(`/api/ultra/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

import { NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled } from "@/lib/ultra/storage-mode";
import { getDbSiteConfig } from "@/lib/ultra/db-data";


type StatsRegion = {
  key: string; label_ru: string; label_en: string; server_share: number; online_share: number;
  load_base: number; load_activity: number; ping_base_ms: number; ping_activity_delta_ms: number; activity_multiplier: number;
};
type StatsIncident = { id: string; enabled: boolean; date_offset_days: number; type: "info" | "minor" | "major"; text_ru: string; text_en: string; status_ru: string; status_en: string };
type StatsConfig = {
  enabled: boolean; show_activity: boolean; show_hour: boolean; show_sparklines: boolean; show_incidents: boolean; refresh_interval_seconds: number;
  history_days: number; max_history_points: number; total_pool_base: number; total_pool_range: number; online_share_base: number; online_share_range: number;
  servers_base: number; servers_range: number; ping_base_ms: number; ping_activity_delta_ms: number; ping_noise_ms: number;
  bandwidth_base_tbps: number; bandwidth_activity_delta_tbps: number; bandwidth_noise_tbps: number; success_base_percent: number; success_activity_delta_percent: number; success_noise_percent: number;
  uptime_base_percent: number; uptime_noise_percent: number; activity_baseline: number; activity_amplitude: number; activity_min: number; activity_max: number; activity_noise: number;
  history_baseline_factor: number; history_factor_range: number; history_noise: number; regions: StatsRegion[]; incidents: StatsIncident[];
};

const DEFAULT_STATS: StatsConfig = {
  enabled: true, show_activity: true, show_hour: true, show_sparklines: true, show_incidents: true, refresh_interval_seconds: 60, history_days: 30, max_history_points: 30,
  total_pool_base: 118000000, total_pool_range: 4000000, online_share_base: 0.62, online_share_range: 0.18, servers_base: 4200, servers_range: 800,
  ping_base_ms: 38, ping_activity_delta_ms: 22, ping_noise_ms: 6, bandwidth_base_tbps: 1.8, bandwidth_activity_delta_tbps: 1.4, bandwidth_noise_tbps: 0.2,
  success_base_percent: 99.1, success_activity_delta_percent: 0.7, success_noise_percent: 0.15, uptime_base_percent: 99.92, uptime_noise_percent: 0.05,
  activity_baseline: 0.55, activity_amplitude: 0.35, activity_min: 0.45, activity_max: 1.05, activity_noise: 0.04, history_baseline_factor: 0.7, history_factor_range: 0.35, history_noise: 0.03,
  regions: [
    { key: "na", label_ru: "Северная Америка", label_en: "North America", server_share: 0.32, online_share: 0.30, load_base: 45, load_activity: 30, ping_base_ms: 28, ping_activity_delta_ms: 8, activity_multiplier: 1 },
    { key: "eu", label_ru: "Европа", label_en: "Europe", server_share: 0.34, online_share: 0.34, load_base: 50, load_activity: 28, ping_base_ms: 22, ping_activity_delta_ms: 6, activity_multiplier: 1 },
    { key: "apac", label_ru: "АТР", label_en: "APAC", server_share: 0.18, online_share: 0.20, load_base: 40, load_activity: 35, ping_base_ms: 55, ping_activity_delta_ms: 12, activity_multiplier: 0.95 },
    { key: "latam", label_ru: "Лат. Америка", label_en: "Latin America", server_share: 0.09, online_share: 0.09, load_base: 35, load_activity: 25, ping_base_ms: 70, ping_activity_delta_ms: 15, activity_multiplier: 0.90 },
    { key: "mea", label_ru: "Ближ. Восток и Африка", label_en: "Middle East & Africa", server_share: 0.07, online_share: 0.07, load_base: 30, load_activity: 25, ping_base_ms: 80, ping_activity_delta_ms: 18, activity_multiplier: 0.85 },
  ],
  incidents: [{ id: "i1", enabled: true, date_offset_days: 5, type: "info", text_ru: "Плановое расширение пула IP в регионе EU", text_en: "Scheduled IP pool expansion in EU region", status_ru: "Завершено", status_en: "Resolved" }],
};

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}
function normalizeStats(raw: any): StatsConfig {
  const v = raw || {};
  const num = (key: keyof StatsConfig, min: number, max: number) => clamp(v[key], min, max, DEFAULT_STATS[key] as number) as never;
  const regions = (Array.isArray(v.regions) ? v.regions : DEFAULT_STATS.regions).map((r: any, i: number) => ({
    key: String(r?.key || `region-${i + 1}`).slice(0, 20), label_ru: String(r?.label_ru || "Регион").slice(0, 80), label_en: String(r?.label_en || "Region").slice(0, 80),
    server_share: clamp(r?.server_share, 0, 1, 0.2), online_share: clamp(r?.online_share, 0, 1, 0.2), load_base: clamp(r?.load_base, 0, 100, 50), load_activity: clamp(r?.load_activity, 0, 100, 25),
    ping_base_ms: clamp(r?.ping_base_ms, 0, 1000, 40), ping_activity_delta_ms: clamp(r?.ping_activity_delta_ms, 0, 1000, 10), activity_multiplier: clamp(r?.activity_multiplier, 0, 2, 1),
  })).slice(0, 20);
  const incidents = (Array.isArray(v.incidents) ? v.incidents : DEFAULT_STATS.incidents).map((x: any, i: number) => ({
    id: String(x?.id || `incident-${i + 1}`).slice(0, 40), enabled: x?.enabled !== false, date_offset_days: Math.round(clamp(x?.date_offset_days, 0, 90, 0)), type: ["info", "minor", "major"].includes(x?.type) ? x.type : "info",
    text_ru: String(x?.text_ru || "").slice(0, 300), text_en: String(x?.text_en || "").slice(0, 300), status_ru: String(x?.status_ru || "Завершено").slice(0, 80), status_en: String(x?.status_en || "Resolved").slice(0, 80),
  })).slice(0, 50);
  return {
    enabled: v.enabled !== false, show_activity: v.show_activity !== false, show_hour: v.show_hour !== false, show_sparklines: v.show_sparklines !== false, show_incidents: v.show_incidents !== false, refresh_interval_seconds: Math.round(clamp(v.refresh_interval_seconds, 5, 3600, DEFAULT_STATS.refresh_interval_seconds)),
    history_days: Math.round(num("history_days", 1, 90)), max_history_points: Math.round(num("max_history_points", 1, 90)), total_pool_base: Math.round(num("total_pool_base", 0, 1000000000)), total_pool_range: Math.round(num("total_pool_range", 0, 1000000000)), online_share_base: num("online_share_base", 0, 1), online_share_range: num("online_share_range", 0, 1), servers_base: Math.round(num("servers_base", 0, 1000000000)), servers_range: Math.round(num("servers_range", 0, 1000000000)),
    ping_base_ms: num("ping_base_ms", 0, 1000), ping_activity_delta_ms: num("ping_activity_delta_ms", 0, 1000), ping_noise_ms: num("ping_noise_ms", 0, 1000), bandwidth_base_tbps: num("bandwidth_base_tbps", 0, 1000), bandwidth_activity_delta_tbps: num("bandwidth_activity_delta_tbps", 0, 1000), bandwidth_noise_tbps: num("bandwidth_noise_tbps", 0, 1000), success_base_percent: num("success_base_percent", 0, 100), success_activity_delta_percent: num("success_activity_delta_percent", 0, 100), success_noise_percent: num("success_noise_percent", 0, 100), uptime_base_percent: num("uptime_base_percent", 0, 100), uptime_noise_percent: num("uptime_noise_percent", 0, 100),
    activity_baseline: num("activity_baseline", 0, 2), activity_amplitude: num("activity_amplitude", 0, 2), activity_min: num("activity_min", 0, 2), activity_max: num("activity_max", 0, 2), activity_noise: num("activity_noise", 0, 1), history_baseline_factor: num("history_baseline_factor", 0, 2), history_factor_range: num("history_factor_range", 0, 2), history_noise: num("history_noise", 0, 1), regions: regions.length ? regions : DEFAULT_STATS.regions, incidents: incidents.length ? incidents : DEFAULT_STATS.incidents,
  };
}

function hash(n: number) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildStats(now: Date, cfg: StatsConfig) {
  const hour = now.getUTCHours();
  const curve = cfg.activity_baseline + cfg.activity_amplitude * Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + cfg.activity_amplitude * 0.7 * Math.sin(((hour - 14) / 24) * Math.PI * 2) * 0.5;
  const factor = Math.max(cfg.activity_min, Math.min(cfg.activity_max, curve + (hash(hour + now.getUTCDate()) - 0.5) * cfg.activity_noise));
  const total_pool = Math.round(cfg.total_pool_base + hash(now.getUTCFullYear()) * cfg.total_pool_range);
  const online = Math.round(total_pool * Math.max(0, Math.min(1, cfg.online_share_base + cfg.online_share_range * factor)));
  const servers = Math.round(cfg.servers_base + cfg.servers_range * factor);
  const avg_ping_ms = Math.round(cfg.ping_base_ms + (1 - factor) * cfg.ping_activity_delta_ms + hash(hour * 3) * cfg.ping_noise_ms);
  const bandwidth_tbps = Math.round((cfg.bandwidth_base_tbps + cfg.bandwidth_activity_delta_tbps * factor + hash(hour) * cfg.bandwidth_noise_tbps) * 100) / 100;
  const success_rate = Math.round((cfg.success_base_percent + factor * cfg.success_activity_delta_percent + hash(hour + 1) * cfg.success_noise_percent) * 100) / 100;
  const uptime_30 = Math.round((cfg.uptime_base_percent + hash(now.getUTCDate()) * cfg.uptime_noise_percent) * 1000) / 1000;
  const serverSum = cfg.regions.reduce((s, r) => s + r.server_share, 0) || 1;
  const onlineSum = cfg.regions.reduce((s, r) => s + r.online_share, 0) || 1;
  const regions = cfg.regions.map((r) => ({ key: r.key, servers: Math.round(servers * r.server_share / serverSum), load: Math.round(r.load_base + r.load_activity * factor), ping: Math.round(r.ping_base_ms + r.ping_activity_delta_ms * (1 - factor)), online: Math.round(online * r.online_share / onlineSum), activity: Math.round(Math.max(0, Math.min(1, factor * r.activity_multiplier)) * 100) }));
  const history: any[] = [];
  const days = Math.min(cfg.history_days, cfg.max_history_points);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setUTCDate(d.getUTCDate() - i);
    const dayHash = hash(d.getUTCFullYear() * 1000 + d.getUTCMonth() * 40 + d.getUTCDate());
    const f = cfg.history_baseline_factor + dayHash * cfg.history_factor_range;
    history.push({ day: d.toISOString().slice(0, 10), total_pool: Math.round(total_pool * (0.98 + dayHash * cfg.history_noise)), online: Math.round(total_pool * (0.55 + 0.2 * f)), avg_ping_ms: Math.round(cfg.ping_base_ms + (1 - f) * cfg.ping_activity_delta_ms), bandwidth_tbps: Math.round((cfg.bandwidth_base_tbps + cfg.bandwidth_activity_delta_tbps * f) * 100) / 100, success_rate: Math.round((cfg.success_base_percent + f * cfg.success_activity_delta_percent) * 100) / 100, servers: Math.round(cfg.servers_base + cfg.servers_range * f), uptime_30: Math.round((cfg.uptime_base_percent + dayHash * cfg.uptime_noise_percent) * 1000) / 1000 });
  }
  const incidents = cfg.show_incidents ? cfg.incidents.filter((i) => i.enabled).map((i) => { const d = new Date(now); d.setUTCDate(d.getUTCDate() - i.date_offset_days); return { id: i.id, date: d.toISOString().slice(0, 10), type: i.type, text_ru: i.text_ru, text_en: i.text_en, status_ru: i.status_ru, status_en: i.status_en }; }) : [];
  return { presentation: { show_sparklines: cfg.show_sparklines, show_incidents: cfg.show_incidents, show_activity: cfg.show_activity, show_hour: cfg.show_hour, refresh_interval_seconds: cfg.refresh_interval_seconds }, stats: { total_pool, online, avg_ping_ms, bandwidth_tbps, success_rate, servers, regions, uptime_30, updated_at: now.toISOString(), hour_utc: cfg.show_hour ? hour : undefined, activity_factor: cfg.show_activity ? Math.round(factor * 1000) / 1000 : undefined }, history, incidents };
}

export async function GET() {
  let cfg = DEFAULT_STATS;
  try {
    const stored = await kvGetJson<any>("site_config", {});
    let raw = stored?.stats_demo;
    if (dbReadsEnabled()) {
      try { const dbConfig = await getDbSiteConfig(); if (dbConfig?.stats_demo) raw = dbConfig.stats_demo; } catch (error) { console.error("[stats] DB config read failed", error instanceof Error ? error.message : "unknown"); }
    }
    cfg = normalizeStats(raw);
  } catch (error) { console.error("[stats] config read failed", error instanceof Error ? error.message : "unknown"); }
  if (!cfg.enabled) return NextResponse.json({ stats: null, history: [], incidents: [], disabled: true }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  return NextResponse.json(buildStats(new Date(), cfg), { headers: { "Cache-Control": "no-store, max-age=0" } });
}

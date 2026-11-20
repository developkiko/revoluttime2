"use client";

import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/ultra/layout/Header";
import { Footer } from "@/components/ultra/layout/Footer";
import { SupportFAB } from "@/components/ultra/dashboard/SupportFAB";
import { useI18n } from "@/lib/ultra/i18n-context";
import { Server, Globe, Zap, Gauge, CheckCircle, Network, AlertTriangle, Clock } from "lucide-react";
import { AuthModalContent } from "@/components/ultra/auth/AuthModal";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

type Region = { key: string; servers: number; load: number; ping: number; online: number; activity?: number };
type HistPoint = { day: string; total_pool: number; online: number; avg_ping_ms: number; bandwidth_tbps: number; success_rate: number; servers: number; uptime_30: number };
type Incident = { id: string; date: string; type: string; text_ru: string; text_en: string; status_ru: string; status_en: string };
type NetworkStats = { total_pool: number; online: number; avg_ping_ms: number; bandwidth_tbps: number; success_rate: number; servers: number; regions: Region[]; uptime_30: number; updated_at?: string; hour_utc?: number; activity_factor?: number };
type StatsPresentation = { show_sparklines?: boolean; show_incidents?: boolean; show_activity?: boolean; show_hour?: boolean; refresh_interval_seconds?: number };

const regionLabels: Record<string, { ru: string; en: string }> = {
  na: { ru: "Северная Америка", en: "North America" },
  eu: { ru: "Европа", en: "Europe" },
  apac: { ru: "АТР", en: "APAC" },
  latam: { ru: "Лат. Америка", en: "Latin America" },
  mea: { ru: "Ближ. Восток и Африка", en: "Middle East & Africa" },
};

type Period = "today" | "yesterday" | "week";
function fmtNum(n: number) { return Math.round(n).toLocaleString("ru-RU"); }

function useCountUp(target: number, duration = 1400, enabled = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!enabled || !target) { setVal(target || 0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setVal(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);
  return val;
}

function Sparkline({ data, color = "#6366f1", height = 36, width = 120 }: { data: number[]; color?: string; height?: number; width?: number }) {
  if (!data.length) return <div style={{ width, height }} className="opacity-30" />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function StatsPage() {
  const { lang, t } = useI18n();
  const { openModal } = useModalEngine();

  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [history, setHistory] = useState<HistPoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [presentation, setPresentation] = useState<StatsPresentation>({ show_sparklines: true, show_incidents: true, show_activity: true, show_hour: true, refresh_interval_seconds: 60 });
  const [refreshSeconds, setRefreshSeconds] = useState(60);
  const [period, setPeriod] = useState<Period>("today");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab as "login" | "register" | undefined;
      openModal(<AuthModalContent initialTab={tab ?? "register"} />);
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [openModal]);

  useTrackVisit("/stats");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/network-stats", { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (data.stats) setStats(data.stats);
        if (data.history) setHistory(data.history);
        if (data.incidents) setIncidents(data.incidents);
        if (data.presentation) { setPresentation(data.presentation); setRefreshSeconds(Math.max(5, Number(data.presentation.refresh_interval_seconds) || 60)); }
        setReady(true);
      } catch { setReady(true); }
    };
    load();
    const timer = window.setInterval(load, Math.max(5, refreshSeconds) * 1000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [refreshSeconds]);

  const display = useMemo(() => {
    if (!stats) return null;
    if (period === "today") return stats;
    if (period === "yesterday") {
      const y = history[history.length - 1];
      if (!y) return stats;
      return { ...stats, total_pool: y.total_pool, online: y.online, avg_ping_ms: y.avg_ping_ms, bandwidth_tbps: y.bandwidth_tbps, success_rate: y.success_rate, servers: y.servers, uptime_30: y.uptime_30 };
    }
    const week = history.slice(-7);
    if (!week.length) return stats;
    const avg = (k: keyof HistPoint) => week.reduce((s, p) => s + (Number(p[k]) || 0), 0) / week.length;
    return { ...stats, total_pool: avg("total_pool"), online: avg("online"), avg_ping_ms: avg("avg_ping_ms"), bandwidth_tbps: avg("bandwidth_tbps"), success_rate: avg("success_rate"), servers: avg("servers"), uptime_30: avg("uptime_30") };
  }, [stats, history, period]);

  const onlineSeries = history.map((h) => h.online);
  const bwSeries = history.map((h) => h.bandwidth_tbps);
  const srSeries = history.map((h) => h.success_rate);
  const cPool = useCountUp(display?.total_pool || 0, 1500, ready && !!display);
  const cOnline = useCountUp(display?.online || 0, 1400, ready && !!display);
  const cServers = useCountUp(display?.servers || 0, 1200, ready && !!display);
  const cBw = useCountUp((display?.bandwidth_tbps || 0) * 100, 1300, ready && !!display);
  const cSr = useCountUp((display?.success_rate || 0) * 100, 1300, ready && !!display);
  const cPing = useCountUp(display?.avg_ping_ms || 0, 1100, ready && !!display);
  const cUp = useCountUp((display?.uptime_30 || 0) * 100, 1200, ready && !!display);

  const loadColor = (pct: number) => {
    if (pct >= 80) return "text-[var(--color-error)]";
    if (pct >= 65) return "text-[var(--color-warning)]";
    return "text-[var(--color-success)]";
  };

  const periods: { id: Period; ru: string; en: string }[] = [
    { id: "today", ru: "Сегодня", en: "Today" },
    { id: "yesterday", ru: "Вчера", en: "Yesterday" },
    { id: "week", ru: "За неделю", en: "This week" },
  ];

  const cards = [
    { icon: <Server className="w-7 h-7" />, value: display ? `${fmtNum(cPool)}+` : "…", label: t("stats_total_pool"), desc: t("stats_total_pool_desc"), spark: null as number[] | null, color: "#6366f1" },
    { icon: <Globe className="w-7 h-7" />, value: display ? fmtNum(cOnline) : "…", label: t("stats_online"), desc: t("stats_online_desc"), spark: onlineSeries, color: "#22c55e" },
    { icon: <Clock className="w-7 h-7" />, value: display ? `< ${Math.round(cPing)} мс` : "…", label: t("stats_avg_ping"), desc: t("stats_avg_ping_desc"), spark: null, color: "#f59e0b" },
    { icon: <Gauge className="w-7 h-7" />, value: display ? `${(cBw / 100).toFixed(2)} Тбит/с` : "…", label: t("stats_bandwidth"), desc: t("stats_bandwidth_desc"), spark: bwSeries, color: "#38bdf8" },
    { icon: <CheckCircle className="w-7 h-7" />, value: display ? `${(cSr / 100).toFixed(2)}%` : "…", label: t("stats_success_rate"), desc: t("stats_success_rate_desc"), spark: srSeries, color: "#a78bfa" },
    { icon: <Network className="w-7 h-7" />, value: display ? String(Math.round(cServers)) : "…", label: t("stats_servers_count"), desc: t("stats_servers_count_desc"), spark: null, color: "#f472b6" },
  ];

  const regions = stats?.regions || [];

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-height)] relative overflow-hidden">
        <div className="animate-bg-drift2 absolute inset-0 opacity-[0.05] -z-0" style={{ backgroundImage: "url('/ultra/bg-anim2.jpg')" }} />
        <div className="max-w-[var(--max-width)] mx-auto px-6 py-10 sm:py-16 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <Zap className="w-7 h-7 text-[var(--color-accent)]" />
              <h1 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[var(--text-heading)]">{t("stats_page_title")}</h1>
            </div>
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {periods.map((p) => (
                <button key={p.id} type="button" onClick={() => setPeriod(p.id)} className={`px-3 py-1.5 text-xs rounded-md transition-colors ${period === p.id ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)] hover:text-white"}`}>
                  {lang === "en" ? p.en : p.ru}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-[700px] mb-10">
            {t("stats_page_desc")}
            {(stats?.hour_utc != null || stats?.activity_factor != null) && (
              <span className="text-[var(--text-muted)]">{stats?.hour_utc != null ? ` · UTC ${String(stats.hour_utc).padStart(2, "0")}:00` : ""}{stats?.activity_factor != null ? ` · activity ${Math.round((stats.activity_factor || 1) * 100)}%` : ""}</span>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
            {cards.map((s) => (
              <div key={s.label} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-primary)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-[var(--color-primary)]">            {s.icon}</div>
                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{s.label}</span>
                  </div>
                  {presentation.show_sparklines !== false && s.spark && s.spark.length > 1 && <Sparkline data={s.spark} color={s.color} />}

                </div>
                <div className="text-[1.8rem] sm:text-[2rem] font-extrabold text-[var(--text-heading)] mb-1.5 tabular-nums">{s.value}</div>
                <p className="text-xs text-[var(--text-muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mb-14">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] mb-6">{t("stats_region_title")}</h2>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border-default)]">
                    {[t("stats_col_region"), t("stats_col_servers"), t("stats_col_load"), t("stats_col_ping"), t("stats_col_online")].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-[var(--text-secondary)] font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regions.map((r) => {
                    const label = regionLabels[r.key] ? (lang === "en" ? regionLabels[r.key].en : regionLabels[r.key].ru) : r.key;
                    return (
                      <tr key={r.key} className="border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02]">
                        <td className="px-6 py-3.5 text-[#ccc] font-medium whitespace-nowrap">
                          {label}
                          {r.activity != null && <span className="ml-2 text-[10px] text-[var(--text-muted)]">{Math.round(r.activity * 100)}%</span>}
                        </td>
                        <td className="px-6 py-3.5 text-[var(--text-heading)] font-semibold">{r.servers}</td>
                        <td className={`px-6 py-3.5 font-semibold ${loadColor(r.load)}`}>{r.load}%</td>
                        <td className="px-6 py-3.5 text-[#aaa]">{r.ping} мс</td>
                        <td className="px-6 py-3.5 text-[#aaa]">{r.online.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] mb-6">{t("stats_uptime_title")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 text-center">
              <CheckCircle className="w-10 h-10 text-[var(--color-success)] mx-auto mb-3" />
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">{t("stats_uptime_30")}</div>
              <div className="text-[2.2rem] font-extrabold text-[var(--color-success)] mb-1 tabular-nums">{display ? `${(cUp / 100).toFixed(2)}%` : "…"}</div>
              <div className="text-xs text-[var(--text-muted)]">{t("stats_no_critical")}</div>
            </div>
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
              <h3 className="text-base font-bold text-[var(--text-heading)] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />{t("stats_incidents")}
              </h3>
              <div className="space-y-3">
                {presentation.show_incidents === false && <p className="text-sm text-[var(--text-muted)]">{lang === "en" ? "Incidents are hidden" : "Инциденты скрыты настройками"}</p>}
                {presentation.show_incidents !== false && incidents.length === 0 && <p className="text-sm text-[var(--text-muted)]">{lang === "en" ? "No recent incidents" : "Нет недавних инцидентов"}</p>}
                {presentation.show_incidents !== false && incidents.map((inc) => (
                  <div key={inc.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${inc.type === "major" ? "bg-[var(--color-error)]" : inc.type === "minor" ? "bg-[var(--color-warning)]" : "bg-[var(--color-info)]"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-[var(--text-muted)] mb-0.5">{new Date(inc.date).toLocaleString(lang === "en" ? "en-GB" : "ru-RU")}</div>
                      <div className="text-sm text-[#ccc]">{lang === "en" ? inc.text_en : inc.text_ru}</div>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] px-2 py-1 rounded bg-white/[0.04] whitespace-nowrap">{lang === "en" ? inc.status_en : inc.status_ru}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SupportFAB />
    </>
  );
}

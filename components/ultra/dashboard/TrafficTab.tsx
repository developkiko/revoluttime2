"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — TrafficTab (с загрузкой из API)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";

interface TrafficItem {
  date: string;
  used: string;
  proxy: string;
  ip: string;
}

const WORKER_URL = process.env.NEXT_PUBLIC_UP_WORKER_URL || "https://ultra-proxy-api.pornorage.workers.dev";

interface TrafficTabProps {
  onGoProxies?: () => void;
}

export function TrafficTab({ onGoProxies }: TrafficTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [traffic, setTraffic] = useState<TrafficItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WORKER_URL}/api/user/traffic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email }),
    })
      .then((r) => r.json())
      .then((data) => setTraffic(data.traffic || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const thClass = "text-left px-3 py-2.5 text-[13px] text-[var(--text-secondary)] font-medium border-b border-[var(--border-default)]";
  const tdClass = "px-3 py-2.5 text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)]";

  return (
    <div>
      <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
        {t("dash_traffic_title")}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
        {t("dash_traffic_desc")}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>{t("dash_traffic_date")}</th>
              <th className={thClass}>{t("dash_traffic_used")}</th>
              <th className={thClass}>{t("dash_traffic_proxy")}</th>
              <th className={thClass}>{t("dash_traffic_ip")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center text-[var(--text-muted)] py-8 text-sm">...</td></tr>
            ) : traffic.length > 0 ? (
              traffic.map((t, i) => (
                <tr key={i}>
                  <td className={tdClass}>{t.date}</td>
                  <td className={tdClass}>{t.used}</td>
                  <td className={tdClass}>{t.proxy}</td>
                  <td className={tdClass}>{t.ip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-[var(--text-muted)] py-8 text-sm">
                  {t("dash_no_traffic")}{" "}
                  {onGoProxies ? (
                    <button onClick={onGoProxies} className="text-[var(--color-accent-soft)] hover:text-[var(--text-heading)] underline cursor-pointer">{t("dash_tab_proxies")}</button>
                  ) : (
                    <span className="text-[var(--color-accent-soft)]">{t("dash_tab_proxies")}</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

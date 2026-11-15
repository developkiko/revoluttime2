"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — ProxiesTab (с загрузкой из API)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";

interface ProxiesTabProps {
  onCreateProxy?: () => void;
}

interface ProxyItem {
  ip: string;
  port: string;
  login: string;
  password: string;
  country: string;
  status: string;
}

const WORKER_URL = process.env.NEXT_PUBLIC_UP_WORKER_URL || "https://ultra-proxy-api.pornorage.workers.dev";

export function ProxiesTab({ onCreateProxy }: ProxiesTabProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [proxies, setProxies] = useState<ProxyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${WORKER_URL}/api/user/proxies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user?.email }),
    })
      .then((r) => r.json())
      .then((data) => setProxies(data.proxies || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const thClass = "text-left px-3 py-2.5 text-[13px] text-[var(--text-secondary)] font-medium border-b border-[var(--border-default)]";
  const tdClass = "px-3 py-2.5 text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)]";

  const statusBadge = (s: string) => {
    const active = s === "active";
    return (
      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-400" : "bg-red-400"}`} />
        {active ? t("dash_proxy_active") : t("dash_proxy_inactive")}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
        {t("dash_proxies_title")}
      </h2>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
        {t("dash_proxies_desc")}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thClass}>IP</th>
              <th className={thClass}>{t("dash_proxy_port")}</th>
              <th className={thClass}>{t("dash_proxy_login")}</th>
              <th className={thClass}>{t("dash_proxy_pass")}</th>
              <th className={thClass}>{t("dash_proxy_country")}</th>
              <th className={thClass}>{t("dash_proxy_status")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-[var(--text-muted)] py-8 text-sm">...</td></tr>
            ) : proxies.length > 0 ? (
              proxies.map((p, i) => (
                <tr key={i}>
                  <td className={tdClass}>{p.ip}</td>
                  <td className={tdClass}>{p.port}</td>
                  <td className={tdClass}>{p.login}</td>
                  <td className={tdClass}>{p.password}</td>
                  <td className={tdClass}>{p.country}</td>
                  <td className={tdClass}>{statusBadge(p.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-[var(--text-muted)] py-8 text-sm">
                  {t("dash_no_proxies")}{" "}
                  {onCreateProxy ? (
                    <button onClick={onCreateProxy} className="text-[var(--color-accent-soft)] hover:text-[var(--text-heading)] underline cursor-pointer">{t("dash_tab_create_proxy").toLowerCase()}</button>
                  ) : (
                    <span className="text-[var(--color-accent-soft)]">{t("dash_tab_create_proxy").toLowerCase()}</span>
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

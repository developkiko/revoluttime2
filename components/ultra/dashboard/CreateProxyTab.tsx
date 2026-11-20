"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — CreateProxyTab (Создать прокси)
// Адаптировано из snippets/page-ready-v2 + оверлей «Тариф не выбран»
// ══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { AlertTriangle, Search, Plus, Server, Home, Smartphone } from "lucide-react";

interface CreateProxyTabProps {
  onDeposit?: () => void;
}

type DeviceType = "server" | "client" | "mobile";
type SubTab = "country" | "region" | "city" | "asn" | "settings";

const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "ru", name: "Russia" },
  { code: "br", name: "Brazil" },
  { code: "de", name: "Germany" },
  { code: "fr", name: "France" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "ua", name: "Ukraine" },
  { code: "nl", name: "Netherlands" },
  { code: "vn", name: "Vietnam" },
  { code: "pl", name: "Poland" },
  { code: "ar", name: "Argentina" },
  { code: "tr", name: "Turkey" },
  { code: "mx", name: "Mexico" },
  { code: "it", name: "Italy" },
  { code: "in", name: "India" },
  { code: "es", name: "Spain" },
  { code: "ae", name: "United Arab Emirates" },
  { code: "jp", name: "Japan" },
  { code: "kr", name: "South Korea" },
  { code: "au", name: "Australia" },
  { code: "sg", name: "Singapore" },
  { code: "se", name: "Sweden" },
  { code: "cz", name: "Czech Republic" },
  { code: "ro", name: "Romania" },
  { code: "th", name: "Thailand" },
  { code: "id", name: "Indonesia" },
  { code: "ph", name: "Philippines" },
  { code: "za", name: "South Africa" },
  { code: "eg", name: "Egypt" },
  { code: "ng", name: "Nigeria" },
  { code: "cn", name: "China" },
  { code: "kz", name: "Kazakhstan" },
] as const;

const FLAG_CODES = new Set([
  "ae", "ar", "au", "br", "ca", "cn", "cz", "de", "eg", "es", "fr", "gb",
  "id", "in", "it", "jp", "kr", "kz", "mx", "ng", "nl", "ph", "pl", "ro",
  "ru", "se", "sg", "th", "tr", "ua", "us", "vn", "za",
]);

const OVERLAY_DELAY_MS = 2500;

export function CreateProxyTab({ onDeposit }: CreateProxyTabProps) {
  const { t } = useI18n();
  const [proxyName, setProxyName] = useState("");
  const [device, setDevice] = useState<DeviceType>("server");
  const [subTab, setSubTab] = useState<SubTab>("country");
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setShowOverlay(false);
    const timer = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [search]);

  const canCreate = Boolean(proxyName.trim() && selectedCountry);

  const deviceBtn = (type: DeviceType, label: string, Icon: typeof Server) => {
    const active = device === type;
    return (
      <button
        type="button"
        onClick={() => setDevice(type)}
        className={
          "flex-1 flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border transition-all " +
          (active
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
            : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/40")
        }
      >
        <Icon className="w-5 h-5" />
        <span className="text-[11px] font-medium">{label}</span>
      </button>
    );
  };

  const subTabBtn = (id: SubTab, label: string, enabled: boolean) => {
    const active = subTab === id;
    return (
      <button
        type="button"
        disabled={!enabled}
        onClick={() => enabled && setSubTab(id)}
        className={
          "relative px-3.5 py-3 text-sm whitespace-nowrap transition-colors " +
          (active
            ? "text-[var(--color-primary)] font-semibold"
            : enabled
              ? "text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
              : "text-[var(--text-muted)] opacity-40 cursor-not-allowed")
        }
      >
        {label}
        {active && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
        )}
      </button>
    );
  };

  return (
    <div className="relative">
      {/* All content — initially interactive, then dimmed under overlay */}
      <div
        className={
          "transition-opacity duration-500 " +
          (showOverlay ? "opacity-30 pointer-events-none select-none" : "opacity-100")
        }
      >
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("dash_tab_create_proxy")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
          {t("dash_create_proxy_desc")}
        </p>

        <div className="max-w-[900px] mx-auto">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden">
            {/* Header: name + device type */}
            <div className="bg-[var(--bg-elevated)] border-b border-[var(--border-default)] p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t("dash_create_name")}
                </label>
                <input
                  type="text"
                  value={proxyName}
                  onChange={(e) => setProxyName(e.target.value.slice(0, 100))}
                  placeholder={t("dash_create_name_ph")}
                  maxLength={100}
                  className="w-full h-11 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-heading)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary)] transition-colors"
                />
              </div>

              <div className="hidden sm:block w-px self-stretch bg-[var(--border-default)] shrink-0" />

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t("dash_create_device")}
                </label>
                <div className="flex gap-2">
                  {deviceBtn("server", t("dash_create_device_server"), Server)}
                  {deviceBtn("client", t("dash_create_device_client"), Home)}
                  {deviceBtn("mobile", t("dash_create_device_mobile"), Smartphone)}
                </div>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex flex-wrap gap-1 px-4 sm:px-6 border-b border-[var(--border-default)]">
              {subTabBtn("country", t("dash_create_tab_country"), true)}
              {subTabBtn("region", t("dash_create_tab_region"), Boolean(selectedCountry))}
              {subTabBtn("city", t("dash_create_tab_city"), Boolean(selectedCountry))}
              {subTabBtn("asn", t("dash_create_tab_asn"), Boolean(selectedCountry))}
              {subTabBtn("settings", t("dash_create_tab_settings"), Boolean(selectedCountry))}
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6">
              {subTab === "country" && (
                <div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("dash_create_search_country")}
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-heading)] text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-[380px] overflow-y-auto border border-[var(--border-default)] rounded-lg p-2 bg-[var(--bg-base)]/50">
                    {filteredCountries.map((c) => {
                      const selected = selectedCountry === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c.code);
                            setSubTab("country");
                          }}
                          className={
                            "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors " +
                            (selected
                              ? "bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40"
                              : "hover:bg-[var(--hover-bg)] border border-transparent")
                          }
                        >
                          {FLAG_CODES.has(c.code) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/ultra/flags/${c.code}.svg`}
                              alt=""
                              className="w-6 h-[18px] rounded-[2px] object-cover shrink-0"
                            />
                          ) : (
                            <span className="w-6 h-[18px] rounded-[2px] bg-[var(--border-default)] shrink-0 flex items-center justify-center text-[10px] uppercase text-[var(--text-muted)]">
                              {c.code}
                            </span>
                          )}
                          <span className="flex-1 text-sm text-[var(--text-primary)] truncate">{c.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[var(--color-success)]/50 text-[var(--color-success)] shrink-0">
                            {t("dash_create_signal_many")}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-3 w-full h-10 rounded-lg border border-[var(--border-default)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:border-[var(--color-primary)]/40 transition-colors"
                    >
                      {t("dash_create_show_all")}
                    </button>
                  )}
                </div>
              )}

              {(subTab === "region" || subTab === "city" || subTab === "asn" || subTab === "settings") && (
                <div className="text-center py-14 text-[var(--text-secondary)]">
                  <p className="text-sm">
                    {subTab === "region" && t("dash_create_need_country")}
                    {subTab === "city" && t("dash_create_need_region")}
                    {subTab === "asn" && t("dash_create_need_asn")}
                    {subTab === "settings" && t("dash_create_need_settings")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex justify-end">
              <button
                type="button"
                disabled={!canCreate}
                className={
                  "inline-flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold transition-all " +
                  (canCreate
                    ? "bg-[var(--primary)] text-white hover:bg-[var(--color-primary-hover)]"
                    : "bg-[var(--border-default)] text-[var(--text-muted)] cursor-not-allowed")
                }
              >
                <Plus className="w-4 h-4" />
                {t("dash_tab_create_proxy")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay — appears after delay, covers title + form */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-start md:items-center justify-center z-10 pt-8 md:pt-0">
          <div
            className="bg-[var(--bg-card)]/95 backdrop-blur-sm border border-orange-500/30 rounded-[var(--radius-lg)] p-8 text-center max-w-[500px] w-full mx-4 shadow-2xl"
            style={{ pointerEvents: "auto" }}
          >
            <div className="text-[2.5rem] text-[var(--color-warning)] mb-3">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-orange-400 mb-2">{t("dash_no_plan_title")}</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-[400px] mx-auto">
              {t("dash_no_plan_desc")}
            </p>
            <button
              type="button"
              onClick={onDeposit}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              {t("nav_balance")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

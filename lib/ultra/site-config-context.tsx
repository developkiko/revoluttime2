"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — SiteConfigContext
// Загружает site_config из KV раз в сессию
// ══════════════════════════════════════════════════════════════

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { fetchSiteConfig, type SiteConfig } from "@/lib/ultra/api";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    fetchSiteConfig().then(setConfig).catch(() => {});
    // Счётчик посетителей — локальный API (KV), без CF Worker
    fetch(`/api/ultra/visitors`, { method: "POST" }).catch(() => {});
  }, []);

  return (
    <SiteConfigContext.Provider value={config}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig(): SiteConfig | null {
  return useContext(SiteConfigContext);
}

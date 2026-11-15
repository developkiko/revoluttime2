"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — LocationsSection (бесконечная лента флагов)
// ══════════════════════════════════════════════════════════════

import Image from "next/image";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { allLocations } from "@/lib/ultra/products";
import { LiveOut } from "./LiveOut";
import { Globe, ChevronDown } from "lucide-react";

export function LocationsSection() {
  const { lang, t } = useI18n();
  const { isLoggedIn } = useAuth();
  const siteConfig = useSiteConfig();

  const configuredCodes = Array.isArray(siteConfig?.top_locations) ? siteConfig.top_locations : [];
  const configured = configuredCodes
    .map((code) => allLocations.find((loc) => loc.code === code))
    .filter((loc): loc is (typeof allLocations)[number] => Boolean(loc));
  const sourceLocations = configured.length ? configured : allLocations;
  const items = sourceLocations.map((loc) => ({
    code: loc.code,
    label: loc.label[lang],
  }));
  const doubled = [...items, ...items];

  const handleAuthAction = () => {
    if (!isLoggedIn) window.dispatchEvent(new CustomEvent("open-auth"));
    else window.location.href = "/dashboard";
  };

  return (
    <section id="locations" className="py-20 bg-[var(--hover-bg)] overflow-hidden">
      <div className="max-w-[var(--max-width)] mx-auto px-6 mb-12">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("loc_title")}
        </h2>
      </div>

      <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:linear-gradient(90deg,#0000_0%,#000_15%_85%,#0000_100%)]">
        <div className="flex items-center animate-band-scroll loc-band"
          style={{ cursor: "default", userSelect: "none" }}
        >
          {doubled.map((loc, i) => (
            <span
              key={i}
              className="flex-shrink-0 mx-2 sm:mx-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg px-4 py-2.5 flex items-center gap-2.5 whitespace-nowrap"
            >
              <Image
                src={`/ultra/flags/${loc.code}.svg`}
                alt={loc.label}
                width={20}
                height={20}
                className="w-5 h-5 rounded-[2px] object-cover flex-shrink-0"
              />
              <span className="text-sm text-[var(--text-primary)]">{loc.label}</span>
            </span>
          ))}
        </div>
      </div>

      <LiveOut />

      {/* Кнопки действий — под LIVE */}
      <div className="max-w-[var(--max-width)] mx-auto px-6 mt-10">
        <div className="text-center flex flex-wrap justify-center gap-3">
          <button
            onClick={handleAuthAction}
            className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
          >
            <Globe className="w-4 h-4" />
            {t("btn_connect")}
          </button>
          <button
            onClick={() => document.getElementById("trust")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
          >
            {t("scroll_to_trust")}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

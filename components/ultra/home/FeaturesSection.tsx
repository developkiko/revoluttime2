"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — FeaturesSection
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { Link } from "@/i18n/navigation";
import { Globe, Zap, Shield, CreditCard, ChevronDown } from "lucide-react";

const features = [
  { icon: Globe, titleKey: "f_global_title", descKey: "f_global_desc" },
  { icon: Zap, titleKey: "f_speed_title", descKey: "f_speed_desc" },
  { icon: Shield, titleKey: "f_anon_title", descKey: "f_anon_desc" },
  { icon: CreditCard, titleKey: "f_crypto_title", descKey: "f_crypto_desc" },
];

export function FeaturesSection() {
  const { t } = useI18n();

  return (
    <section id="features" className="py-20 relative">
      <div
        className="absolute inset-0 opacity-[0.06] bg-fixed bg-cover bg-center bg-no-repeat -z-0"
        style={{ backgroundImage: "url('/ultra/why-bg.jpg')" }}
      />
      <div className="max-w-[var(--max-width)] mx-auto px-6 relative z-10">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("features_title")}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-12">
          {t("features_desc")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((f) => (
            <div
              key={f.titleKey}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-6 py-8 text-center transition-colors hover:border-[var(--color-primary)]/30"
            >
              <f.icon className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">
                {t(f.titleKey)}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t(f.descKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center flex flex-wrap justify-center gap-3">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            {t("features_cta_now")}
          </Link>
          <button
            onClick={() => document.getElementById("locations")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
          >
            {t("scroll_to_locations")}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

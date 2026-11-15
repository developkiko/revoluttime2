"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — HeroSection
// ══════════════════════════════════════════════════════════════

import { Link } from "@/i18n/navigation";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { ChevronDown, Rocket } from "lucide-react";

export function HeroSection() {
  const { t, lang } = useI18n();
  const cfg = useSiteConfig();
  const { isLoggedIn } = useAuth();
  const hs = cfg?.hero_stats;
  const labelSuffix = lang === "en" ? "label_en" : "label_ru";

  return (
    <section
      className="pt-[120px] sm:pt-[160px] pb-[60px] sm:pb-[100px] text-center relative"
      style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(99,102,241,0.12), transparent)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.07] bg-fixed bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/ultra/hero-bg.jpg')" }}
      />
      <div className="relative z-10 max-w-[var(--max-width)] mx-auto px-6">
        <div
          className="hero-logo mx-auto mb-6"
          data-cursor-logo
          style={{
            width: "min-content",
            textWrapMode: "nowrap",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #6366f1, #a78bfa, #f59e0b, #6366f1)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}
        >
          {t("logo_text")}
        </div>
        <h1 className="text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-extrabold text-[var(--text-heading)] leading-tight mb-5">
          {t("hero_title")}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-[600px] mx-auto mb-10">
          {t("hero_desc")}
        </p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-10">
          {hs?.ips && (
            <div className="text-center">
              <span className="block text-[1.8rem] sm:text-[2.2rem] font-bold text-[var(--color-primary)]">
                {hs.ips.value}
              </span>
              <span className="text-[13px] sm:text-sm text-[var(--text-muted)] mt-1 block">{hs.ips[labelSuffix as "label_ru" | "label_en"]}</span>
            </div>
          )}
          {hs?.geo && (
            <div className="text-center">
              <span className="block text-[1.8rem] sm:text-[2.2rem] font-bold text-[var(--color-primary)]">
                {hs.geo.value}
              </span>
              <span className="text-[13px] sm:text-sm text-[var(--text-muted)] mt-1 block">{hs.geo[labelSuffix as "label_ru" | "label_en"]}</span>
            </div>
          )}
          {hs?.uptime && (
            <div className="text-center">
              <span className="block text-[1.8rem] sm:text-[2.2rem] font-bold text-[var(--color-primary)]">
                {hs.uptime.value}
              </span>
              <span className="text-[13px] sm:text-sm text-[var(--text-muted)] mt-1 block">{hs.uptime[labelSuffix as "label_ru" | "label_en"]}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Link
            href="/features"
            className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base sm:text-lg font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
          >
            <Rocket className="w-4 h-4" />
            {t("hero_advantages")}
          </Link>
          <a
            href="#products"
            className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base sm:text-lg font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
          >
            {t("hero_start")}
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — TrustCounters
// ══════════════════════════════════════════════════════════════

import { Link } from "@/i18n/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { Server, ChevronDown } from "lucide-react";

interface Counter {
  target: number;
  suffix?: string;
  labelKey: string;
}

export function TrustCounters() {
  const { t, lang } = useI18n();
  const cfg = useSiteConfig();
  const lk = lang === "en" ? ("label_en" as const) : ("label_ru" as const);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);
  const [values, setValues] = useState<number[]>([0, 0, 0, 0]);

  const tc = cfg?.trust_counters;
  const counters: Counter[] = tc ? [
    { target: parseInt(tc.clients.value) || 0, suffix: "+", labelKey: tc.clients[lk] },
    { target: parseInt(tc.proxies.value) || 0, suffix: "+", labelKey: tc.proxies[lk] },
    { target: parseInt(tc.countries.value) || 0, suffix: "", labelKey: tc.countries[lk] },
    { target: parseInt(tc.uptime.value) || 99, suffix: "%", labelKey: tc.uptime[lk] },
  ] : [
    { target: 2847, suffix: "+", labelKey: "trust_clients" },
    { target: 15230, suffix: "+", labelKey: "trust_proxies" },
    { target: 200, suffix: "", labelKey: "trust_countries" },
    { target: 99, suffix: "%", labelKey: "trust_uptime" },
  ];

  const animateCounters = useCallback(() => {
    if (animated) return;
    setAnimated(true);
    const duration = 2000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(
        counters.map((c) => Math.floor(c.target * eased))
      );
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [animated, counters]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animateCounters]);

  return (
    <section id="trust" className="py-20 relative" ref={sectionRef}>
      <div
        className="absolute inset-0 opacity-[0.06] bg-fixed bg-cover bg-center bg-no-repeat -z-0"
        style={{ backgroundImage: "url('/ultra/trust-bg.jpg')" }}
      />
      <div className="max-w-[var(--max-width)] mx-auto px-6 relative z-10">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("trust_title")}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-12">
          {t("trust_desc")}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {counters.map((c, i) => (
            <div
              key={c.labelKey}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] px-4 py-8 text-center transition-all hover:border-[var(--color-primary)]/30 hover:-translate-y-0.5"
            >
              <span className="block text-[1.8rem] sm:text-[2rem] font-bold text-[var(--color-primary)] mb-[0.4rem]">
                {values[i]}
                {c.suffix && <small className="text-[1.3rem]">{c.suffix}</small>}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {t(c.labelKey)}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center flex flex-wrap justify-center gap-3">
          <Link
            href="/stats"
            className="inline-flex items-center gap-2 py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
          >
            <Server className="w-4 h-4" />
            {t("trust_btn")}
          </Link>
          <button
            onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
          >
            {t("scroll_to_reviews_read")}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

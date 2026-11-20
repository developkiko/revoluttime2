"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — PlansTab (Тарифы)
// Блок затемнения поверх тарифов с главной
// ══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { products as DEFAULT_PRODUCTS, type Product } from "@/lib/ultra/products";
import { AlertTriangle } from "lucide-react";

const PROTOCOL_TABS = ["plan_proto_http", "plan_proto_https", "plan_proto_socks5"] as const;

interface PlansTabProps {
  onDeposit?: () => void;
}

function mapApiProduct(r: any): Product {
  return {
    type: (r.type || "fast") as Product["type"],
    name: { ru: r.name_ru || r.name?.ru || "", en: r.name_en || r.name?.en || "" },
    traffic: {
      ru: r.traffic_ru || r.traffic?.ru || "",
      en: r.traffic_en || r.traffic?.en || "",
    },
    price: Number(r.price) || 0,
    oldPrice: Number(r.oldPrice) || 0,
    discount: Number(r.discount) || 0,
    features: Array.isArray(r.features) ? r.features.map(String) : [],
    popular: Boolean(r.popular),
  };
}

const OVERLAY_DELAY_MS = 2500;

export function PlansTab({ onDeposit }: PlansTabProps) {
  const { t, lang } = useI18n();
  const [proto, setProto] = useState<string>(PROTOCOL_TABS[0]);
  const [plans, setPlans] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setShowOverlay(false);
    const timer = setTimeout(() => setShowOverlay(true), OVERLAY_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/ultra/products", { cache: "no-store" });
        const data = await res.json();
        if (
          !cancelled &&
          data.products &&
          Array.isArray(data.products) &&
          data.products.length > 0
        ) {
          setPlans(data.products.map(mapApiProduct));
        }
      } catch {
        /* keep defaults */
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardBase =
    "relative bg-[var(--bg-card)] border border-[var(--border-default)] " +
    "rounded-[var(--radius-lg)] p-7 text-center transition-all";

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
          {t("dash_plans_title")}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-8">
          {t("dash_plans_desc")}
        </p>

        {/* Protocol tabs */}
        <div className="flex justify-center gap-1.5 mb-8">
          {PROTOCOL_TABS.map((pt) => (
            <button
              key={pt}
              onClick={() => setProto(pt)}
              tabIndex={showOverlay ? -1 : 0}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                proto === pt
                  ? "border-[var(--color-primary-border)] bg-[var(--primary)] text-white"
                  : "border-[var(--border-default)] bg-transparent text-[var(--text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--text-secondary)]"
              }`}
            >
              {t(pt)}
            </button>
          ))}
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p, idx) => {
            const typeKey = `plan_type_${p.type}`;
            return (
              <div
                key={`${p.type}-${idx}`}
                className={p.popular ? cardBase + " !border-[var(--color-primary)]" : cardBase}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-[var(--text-heading)] text-[11px] font-extrabold tracking-widest px-4 py-1 rounded-full shadow-lg z-10">
                    TOP
                  </div>
                )}
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">
                  {t(typeKey)}
                </div>
                <div className="text-lg font-bold text-[var(--text-heading)] mb-2">{p.name[lang]}</div>
                <div className="text-sm text-[var(--text-secondary)] mb-4">{p.traffic[lang]}</div>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-[2rem] font-extrabold text-[var(--text-heading)]">${p.price}</span>
                  <span className="text-base text-[var(--text-muted)] line-through">${p.oldPrice}</span>
                  <span className="text-xs font-semibold text-[var(--color-success)] bg-[var(--color-success)]/10 px-1.5 py-0.5 rounded">
                    -{p.discount}%
                  </span>
                </div>
                <ul className="text-left mb-5 space-y-0">
                  {p.features.map((fk) => (
                    <li
                      key={fk}
                      className="text-[13px] text-[var(--text-secondary)] py-[0.3rem] border-b border-[var(--border-subtle)] before:content-['✓_'] before:text-[var(--color-success)] before:font-bold"
                    >
                      {fk.startsWith("plan_feat_") ? t(fk) : fk}
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 text-sm font-semibold rounded-lg transition-all bg-[var(--primary)] text-white"
                  tabIndex={showOverlay ? -1 : 0}
                >
                  {t("plan_select_btn")}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overlay — appears after delay, covers title + protocols + cards */}
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

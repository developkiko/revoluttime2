"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — PlansGrid (тарифы с API + fallback)
// ══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { products as DEFAULT_PRODUCTS, type Product } from "@/lib/ultra/products";
import { CreditCard, ChevronDown } from "lucide-react";

const PROTOCOL_TABS = ["plan_proto_http", "plan_proto_https", "plan_proto_socks5"] as const;

interface PlansGridProps {
  onOpenAuth: () => void;
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

export function PlansGrid({ onOpenAuth }: PlansGridProps) {
  const { lang, t } = useI18n();
  const { isLoggedIn } = useAuth();
  const [proto, setProto] = useState<string>(PROTOCOL_TABS[0]);
  const [plans, setPlans] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);

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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuy = () => {
    if (!isLoggedIn) onOpenAuth();
    else window.location.href = "/dashboard";
  };

  const cardBase =
    "relative bg-[var(--bg-card)] border border-[var(--border-default)] " +
    "rounded-[var(--radius-lg)] p-7 text-center transition-all " +
    "hover:border-[var(--color-primary)]/40 hover:-translate-y-0.5";

  return (
    <>
      <section id="products" className="py-20 bg-[var(--hover-bg)]">
        <div className="max-w-[var(--max-width)] mx-auto px-6">
          <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
            {t("products_title")}
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-6">
            {t("products_desc")}
          </p>

          <div className="flex justify-center gap-1.5 mb-8">
            {PROTOCOL_TABS.map((pt) => (
              <button
                key={pt}
                onClick={() => setProto(pt)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  proto === pt
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                    : "border-[var(--border-default)] bg-transparent text-[var(--text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--text-secondary)]"
                }`}
              >
                {t(pt)}
              </button>
            ))}
          </div>

          {loading && plans === DEFAULT_PRODUCTS ? (
            <p className="text-center text-[var(--text-muted)] mb-8 text-sm">Загрузка тарифов…</p>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
                  <div className="text-lg font-bold text-[var(--text-heading)] mb-2">
                    {p.name[lang]}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mb-4">
                    {p.traffic[lang]}
                  </div>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-[2rem] font-extrabold text-[var(--text-heading)]">
                      ${p.price}
                    </span>
                    <span className="text-base text-[var(--text-muted)] line-through">
                      ${p.oldPrice}
                    </span>
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
                    onClick={handleBuy}
                    className="w-full py-3 text-sm font-semibold rounded-lg transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
                  >
                    {t("plan_btn")}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={handleBuy}
              className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              {t("scroll_to_plans")}
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-all border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 whitespace-nowrap"
            >
              {t("scroll_to_why")}
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

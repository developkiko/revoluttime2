"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Pricing Model Policy
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function PricingModelPage() {
  const { t } = useI18n();

  useTrackVisit("/pricing-model");

  return (
    <PolicyLayout titleKey="pricing_title">
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("pricing_intro")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("pricing_how_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed mb-6 space-y-3 list-none">
        <li><strong className="text-[var(--text-heading)]">{t("pricing_how_fixed")}</strong> – {t("pricing_how_fixed_text")}</li>
        <li><strong className="text-[var(--text-heading)]">{t("pricing_how_period")}</strong> – {t("pricing_how_period_text")}</li>
        <li><strong className="text-[var(--text-heading)]">{t("pricing_how_overpay")}</strong> – {t("pricing_how_overpay_text")}</li>
        <li><strong className="text-[var(--text-heading)]">{t("pricing_how_discount")}</strong> – {t("pricing_how_discount_text")}</li>
      </ul>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("pricing_regions_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("pricing_regions_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("pricing_why_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed space-y-2 list-none">
        <li>• {t("pricing_why_1")}</li>
        <li>• {t("pricing_why_2")}</li>
        <li>• {t("pricing_why_3")}</li>
      </ul>
    </PolicyLayout>
  );
}

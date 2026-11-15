"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Refund Policy
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function RefundPage() {
  const { t } = useI18n();

  useTrackVisit("/refund");

  return (
    <PolicyLayout titleKey="refund_title">
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("refund_intro")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_rules_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed mb-6 space-y-2 list-none">
        <li>• {t("refund_rule_1")}</li>
        <li>• {t("refund_rule_2")}</li>
        <li>• {t("refund_rule_3")}</li>
      </ul>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_exceptions_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed mb-6 space-y-2 list-none">
        <li>• {t("refund_except_1")}</li>
        <li>• {t("refund_except_2")}</li>
      </ul>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_how_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("refund_how_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_legal_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed">{t("refund_legal_text")}</p>
    </PolicyLayout>
  );
}

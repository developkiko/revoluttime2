"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — SLA Policy
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function SlaPage() {
  const { t } = useI18n();

  useTrackVisit("/sla");

  return (
    <PolicyLayout titleKey="sla_title">
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("sla_intro")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("sla_covered_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed mb-6 space-y-2 list-none">
        <li>• {t("sla_covered_1")}</li>
        <li>• {t("sla_covered_2")}</li>
        <li>• {t("sla_covered_3")}</li>
      </ul>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("sla_not_covered_title")}</h2>
      <ul className="text-sm text-[#bbb] leading-relaxed mb-6 space-y-2 list-none">
        <li>• {t("sla_not_1")}</li>
        <li>• {t("sla_not_2")}</li>
        <li>• {t("sla_not_3")}</li>
      </ul>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("sla_comp_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-4">{t("sla_comp_text")}</p>
      <p className="text-sm text-[#bbb] leading-relaxed">{t("sla_comp_how")}</p>
    </PolicyLayout>
  );
}

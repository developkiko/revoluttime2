"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Terms of Service
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";
import type { ReactNode } from "react";

export default function TermsPage() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const p = cfg?.policy_footer;

  useTrackVisit("/terms");

  return (
    <PolicyLayout titleKey="terms_title">
      <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("terms_subject_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("terms_subject_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_duties_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("terms_duties_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_payment_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("terms_payment_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_liability_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("terms_liability_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_termination_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-2">{t("terms_termination_text")}</p>
      {footerLinkText(p)}
    </PolicyLayout>
  );
}

function footerLinkText(p: any) {
  const parts: ReactNode[] = [];
  if (p?.email) {
    parts.push(
      <span key="em">{p.email}</span>,
      <span key="sep">&nbsp;|&nbsp;</span>
    );
  }
  if (p?.telegram_link) {
    parts.push(<>Telegram: {p.telegram_text || p.telegram_link}</>);
  }
  return <p className="text-sm text-[#888]">{parts}</p>;
}

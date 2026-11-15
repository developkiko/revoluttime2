"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Privacy Policy
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";
import type { ReactNode } from "react";

export default function PrivacyPage() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const p = cfg?.policy_footer;

  useTrackVisit("/privacy");

  return (
    <PolicyLayout titleKey="privacy_title" updatedKey="privacy_updated">
      <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("privacy_collect_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("privacy_collect_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_use_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("privacy_use_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_store_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("privacy_store_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_rights_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("privacy_rights_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_contact_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-2">{t("privacy_contact_text")}</p>
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

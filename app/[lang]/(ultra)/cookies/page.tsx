"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Cookie Policy
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { PolicyLayout } from "@/components/ultra/layout/PolicyLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";
import type { ReactNode } from "react";

export default function CookiesPage() {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const p = cfg?.policy_footer;

  useTrackVisit("/cookies");

  return (
    <PolicyLayout titleKey="cookies_title">
      <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("cookies_what_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("cookies_what_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_use_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("cookies_use_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_disable_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-6">{t("cookies_disable_text")}</p>
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_contact_title")}</h2>
      <p className="text-sm text-[#bbb] leading-relaxed mb-2">{t("cookies_contact_text")}</p>
      {footerLinkText(p)}
    </PolicyLayout>
  );
}

function footerLinkText(p: any) {
  const parts: ReactNode[] = [];
  if (p?.email) {
    parts.push(<span key="em">{p.email}</span>, <span key="sep">&nbsp;|&nbsp;</span>);
  }
  if (p?.telegram_link) parts.push(<>Telegram: {p.telegram_text || p.telegram_link}</>);
  return <p className="text-sm text-[#888]">{parts}</p>;
}

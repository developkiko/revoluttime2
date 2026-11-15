"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Proxy Comparison Page (full page)
// ══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { Header } from "@/components/ultra/layout/Header";
import { Footer } from "@/components/ultra/layout/Footer";
import { SupportFAB } from "@/components/ultra/dashboard/SupportFAB";
import { AuthModalContent } from "@/components/ultra/auth/AuthModal";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

const comparisonRows = [
  { featureKey: "cmp_speed", res: "cmp_medium", mob: "cmp_low", dc: "cmp_high" },
  { featureKey: "cmp_trust", res: "cmp_high", mob: "cmp_high", dc: "cmp_low" },
  { featureKey: "cmp_rotation", res: "cmp_auto", mob: "cmp_auto", dc: "cmp_manual" },
  { featureKey: "cmp_blocks", res: "cmp_rare", mob: "cmp_rare", dc: "cmp_frequent" },
  { featureKey: "cmp_anonymity", res: "cmp_high", mob: "cmp_high", dc: "cmp_medium2" },
  { featureKey: "cmp_price", res: "cmp_medium", mob: "cmp_high2", dc: "cmp_low2" },
  { featureKey: "cmp_use_case", res: "cmp_res_use", mob: "cmp_mob_use", dc: "cmp_dc_use" },
];

export default function ComparePage() {
  const { t } = useI18n();
  const { openModal } = useModalEngine();

  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab as "login" | "register" | undefined;
      openModal(<AuthModalContent initialTab={tab ?? "register"} />);
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
  }, [openModal]);

  useTrackVisit("/compare");

  return (
    <>
      <Header />
      <main className="flex-1 pt-[var(--header-height)]">
        <div className="max-w-[var(--max-width)] mx-auto px-6 py-10 sm:py-16">
          <h1 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[var(--text-heading)] mb-4">
            {t("cmp_title")}
          </h1>
          <p className="text-sm sm:text-base text-[#888] mb-10 max-w-[700px]">
            {t("cmp_intro")}
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: "🏠", titleKey: "cmp_res_title", descKey: "cmp_res_desc" },
              { icon: "📱", titleKey: "cmp_mob_title", descKey: "cmp_mob_desc" },
              { icon: "🖥️", titleKey: "cmp_dc_title", descKey: "cmp_dc_desc" },
            ].map((item) => (
              <div
                key={item.titleKey}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5"
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-base font-bold text-[var(--text-heading)] mb-2">
                  {t(item.titleKey)}
                </h3>
                <p className="text-[13px] text-[#888] leading-relaxed">
                  {t(item.descKey)}
                </p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-x-auto mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="text-left px-6 py-4 text-[var(--text-secondary)] font-semibold">
                    {t("cmp_feature")}
                  </th>
                  <th className="text-center px-6 py-4 text-[var(--color-primary)] font-semibold">
                    {t("cmp_res_col")}
                  </th>
                  <th className="text-center px-6 py-4 text-[var(--color-warning)] font-semibold">
                    {t("cmp_mob_col")}
                  </th>
                  <th className="text-center px-6 py-4 text-[var(--color-info)] font-semibold">
                    {t("cmp_dc_col")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.featureKey}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-6 py-3.5 text-[#ccc] font-medium whitespace-nowrap">
                      {t(row.featureKey)}
                    </td>
                    <td className="px-6 py-3.5 text-center text-[#aaa]">{t(row.res)}</td>
                    <td className="px-6 py-3.5 text-center text-[#aaa]">{t(row.mob)}</td>
                    <td className="px-6 py-3.5 text-center text-[#aaa]">{t(row.dc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Why mobile costs more */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">
              {t("cmp_why_mobile_title")}
            </h2>
            <p className="text-sm text-[#888] leading-relaxed">
              {t("cmp_why_mobile_text")}
            </p>
          </div>
        </div>
      </main>
      <Footer />
      <SupportFAB />
    </>
  );
}

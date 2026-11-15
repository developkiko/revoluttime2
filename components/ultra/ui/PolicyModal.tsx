"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — PolicyModal
// Полностью автономная модалка поверх текущей страницы.
// - Overlay = затемнение + клик = закрыть
// - Escape key = закрыть
// - Body scroll lock
// - Sticky header с фиксированными ссылками (На главную | Назад | язык)
// - Scrollable контент внутри
// ══════════════════════════════════════════════════════════════

import { useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { LangSwitcher } from "@/components/ultra/layout/LangSwitcher";
import { Mail, Send } from "lucide-react";
import type { ReactNode } from "react";

export type PolicyType = "privacy" | "terms" | "cookies" | "refund" | "sla" | "pricing-model";

interface PolicyContent {
  titleKey: string;
  updatedKey?: string;
  render: (t: (key: string) => string) => ReactNode;
}

const policies: Record<PolicyType, PolicyContent> = {
  privacy: {
    titleKey: "privacy_title",
    updatedKey: "privacy_updated",
    render: t => (
      <>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("privacy_collect_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("privacy_collect_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_use_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("privacy_use_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_store_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("privacy_store_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_rights_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("privacy_rights_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("privacy_contact_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">{t("privacy_contact_text")}</p>
      </>
    ),
  },
  terms: {
    titleKey: "terms_title",
    render: t => (
      <>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("terms_subject_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("terms_subject_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_duties_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("terms_duties_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_payment_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("terms_payment_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_liability_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("terms_liability_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("terms_termination_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">{t("terms_termination_text")}</p>
      </>
    ),
  },
  cookies: {
    titleKey: "cookies_title",
    render: t => (
      <>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mt-0 mb-2">{t("cookies_what_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("cookies_what_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_use_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("cookies_use_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_disable_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("cookies_disable_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("cookies_contact_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">{t("cookies_contact_text")}</p>
      </>
    ),
  },
  refund: {
    titleKey: "refund_title",
    render: t => (
      <>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("refund_intro")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_rules_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 space-y-2 list-none">
          <li>• {t("refund_rule_1")}</li>
          <li>• {t("refund_rule_2")}</li>
          <li>• {t("refund_rule_3")}</li>
        </ul>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_exceptions_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 space-y-2 list-none">
          <li>• {t("refund_except_1")}</li>
          <li>• {t("refund_except_2")}</li>
        </ul>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_how_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("refund_how_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("refund_legal_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t("refund_legal_text")}</p>
      </>
    ),
  },
  sla: {
    titleKey: "sla_title",
    render: t => (
      <>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("sla_intro")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("sla_covered_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 space-y-2 list-none">
          <li>• {t("sla_covered_1")}</li>
          <li>• {t("sla_covered_2")}</li>
          <li>• {t("sla_covered_3")}</li>
        </ul>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("sla_not_covered_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 space-y-2 list-none">
          <li>• {t("sla_not_1")}</li>
          <li>• {t("sla_not_2")}</li>
          <li>• {t("sla_not_3")}</li>
        </ul>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("sla_comp_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{t("sla_comp_text")}</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{t("sla_comp_how")}</p>
      </>
    ),
  },
  "pricing-model": {
    titleKey: "pricing_title",
    render: t => (
      <>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("pricing_intro")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("pricing_how_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 space-y-3 list-none">
          <li><strong className="text-[var(--text-heading)]">{t("pricing_how_fixed")}</strong> – {t("pricing_how_fixed_text")}</li>
          <li><strong className="text-[var(--text-heading)]">{t("pricing_how_period")}</strong> – {t("pricing_how_period_text")}</li>
          <li><strong className="text-[var(--text-heading)]">{t("pricing_how_overpay")}</strong> – {t("pricing_how_overpay_text")}</li>
          <li><strong className="text-[var(--text-heading)]">{t("pricing_how_discount")}</strong> – {t("pricing_how_discount_text")}</li>
        </ul>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-2">{t("pricing_regions_title")}</h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">{t("pricing_regions_text")}</p>
        <h2 className="text-lg font-bold text-[var(--text-heading)] mb-3">{t("pricing_why_title")}</h2>
        <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2 list-none">
          <li>• {t("pricing_why_1")}</li>
          <li>• {t("pricing_why_2")}</li>
          <li>• {t("pricing_why_3")}</li>
        </ul>
      </>
    ),
  },
};

/* ────────────────────────────────────────────────────── */

interface PolicyModalProps {
  policy: PolicyType;
  onClose: () => void;
}

export function PolicyModal({ policy, onClose }: PolicyModalProps) {
  const { t } = useI18n();
  const cfg = useSiteConfig();
  const pc = cfg?.policies_contacts;
  const config = policies[policy];

  // Hooks run unconditionally — the early return comes after them.
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!config) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
      style={{ animation: "policyModalFadeIn 0.15s ease-out" }}
    >
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] w-full max-w-[900px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* ── Sticky Header (fixed, doesn't scroll) ── */}
        <div className="sticky top-0 z-10 bg-[var(--bg-card)] border-b border-[var(--border-default)] px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/ultra-home"
              onClick={(e) => { e.preventDefault(); onClose(); }}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors whitespace-nowrap flex-shrink-0"
            >
              {t("nav_home")}
            </Link>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors whitespace-nowrap flex-shrink-0"
            >
              ← {t("nav_back")}
            </button>
          </div>
          <LangSwitcher />
        </div>

        {/* ── Scrollable Content ── */}
        <div className="overflow-y-auto px-6 sm:px-10 py-6 sm:py-10 flex-1 min-h-0" style={{ scrollBehavior: "smooth" }}>
          <h1 className="text-[1.5rem] sm:text-[1.75rem] font-extrabold text-[var(--text-heading)] mb-6">
            {t(config.titleKey)}
          </h1>
          <div className="prose-p:text-sm prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-5">
            {config.render(t)}
          </div>
          {pc && (pc.email || pc.telegram) && (
            <div className="mt-6 pt-6 border-t border-[var(--border-default)]">
              <div className="flex flex-wrap gap-4">
                {pc.email && (
                  <a href={`mailto:${pc.email}`} className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                    <Mail className="w-4 h-4" />
                    {pc.email}
                  </a>
                )}
                {pc.telegram && (
                  <a href={`https://t.me/${pc.telegram.replace(/^@|^https?:\/\/t\.me\//, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                    <Send className="w-4 h-4" />
                    @{pc.telegram.replace(/^@|^https?:\/\/t\.me\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}
          {config.updatedKey && (
            <p className="text-xs text-[var(--text-muted)] mt-6 text-center pb-4">
              {t(config.updatedKey)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

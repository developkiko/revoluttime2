"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — SupportModal (Поддержка 24/7)
// Связаться с нами — Telegram + email, без отсылок к паролю
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";

export function SupportContent() {
  const { t, lang } = useI18n();
  const cfg = useSiteConfig();
  const { closeModal } = useModalEngine();

  const c = cfg?.contact_section;
  const hoursText = lang === "ru" ? c?.workhours_ru : c?.workhours_en;

  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px]">
      <button
        onClick={closeModal}
        className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
      >
        &times;
      </button>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("support_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t("support_desc")}</p>
        <div className="space-y-4 mb-4">
          {c?.telegram_link && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <span className="text-2xl flex-shrink-0">💬</span>
              <div>
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">Telegram</strong>
                <a href={c.telegram_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {c.telegram_text || c.telegram_link}
                </a>
              </div>
            </div>
          )}
          {c?.email && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <span className="text-2xl flex-shrink-0">📧</span>
              <div>
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">E-mail</strong>
                <a href={`mailto:${c.email}`} className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {c.email}
                </a>
              </div>
            </div>
          )}
          {hoursText && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <span className="text-2xl flex-shrink-0">🕐</span>
              <div>
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">{t("contact_workhours")}</strong>
                <span className="text-sm text-[var(--text-muted)]">{hoursText}</span>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">{t("support_hint")}</p>
        <button
          onClick={closeModal}
          className="w-full py-3 text-base font-semibold rounded-xl bg-[var(--color-primary)]/12 text-[var(--color-primary)] border border-[var(--border-active)] hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          {t("support_close")}
        </button>
      </div>
    </div>
  );
}

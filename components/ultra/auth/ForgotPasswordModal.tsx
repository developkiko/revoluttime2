"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — ForgotPasswordModal (Tailwind-версия)
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const { t, lang } = useI18n();
  const cfg = useSiteConfig();
  if (!open) return null;

  const p = cfg?.pswd_recovery;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px]">
        <button
          onClick={onClose}
          className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
        >
          &times;
        </button>
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2 text-center">{t("forgot_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4 text-center">{t("forgot_desc")}</p>
        <div className="space-y-4 mb-4">
          {p?.telegram_link && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <MessageCircleIcon />
              <div className="min-w-0">
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">Telegram</strong>
                <a href={p.telegram_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {p.telegram_text || p.telegram_link}
                </a>
              </div>
            </div>
          )}
          {p?.email && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <MailIcon />
              <div className="min-w-0">
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">E-mail</strong>
                <a href={`mailto:${p.email}`} className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {p.email}
                </a>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed text-center">{t("forgot_hint")}</p>
        <button
          onClick={onClose}
          className="w-full py-3 text-base font-semibold rounded-xl bg-[var(--color-primary)]/12 text-[var(--color-primary)] border border-[var(--border-active)] hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          {t("forgot_close")}
        </button>
      </div>
    </div>
  );
}

function MessageCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-primary)]">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[var(--color-primary)]">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

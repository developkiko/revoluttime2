"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — AuthModal (ModalEngine-версия)
// ══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { LogIn, UserPlus, X } from "lucide-react";

export function AuthModalContent({ initialTab = "register" }: { initialTab?: "login" | "register" }) {
  const { t } = useI18n();
  const { openModal, closeModal } = useModalEngine();
  const [tab, setTab] = useState<"login" | "register">(initialTab);

  const handleSuccess = () => {
    closeModal();
    if (typeof window !== "undefined") window.location.href = "/dashboard";
  };

  const tabClass =
    "flex-1 py-2.5 text-sm font-semibold rounded-lg border transition-all text-center cursor-pointer inline-flex items-center justify-center gap-1.5 " +
    "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/30 hover:text-[var(--text-heading)]";

  const tabActive =
    tabClass + " bg-[var(--color-primary)]/12 border-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/20";

  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px] max-h-[90vh] overflow-y-auto">
      <button
        onClick={closeModal}
        className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex gap-2 mb-6">
        <button
          className={tab === "login" ? tabActive : tabClass}
          onClick={() => setTab("login")}
        >
          <LogIn className="w-4 h-4" />
          {t("modal_tab_login")}
        </button>
        <button
          className={tab === "register" ? tabActive : tabClass}
          onClick={() => setTab("register")}
        >
          <UserPlus className="w-4 h-4" />
          {t("modal_tab_register")}
        </button>
      </div>

      <div className="text-center">
        {tab === "login" ? (
          <LoginForm onSuccess={handleSuccess} onForgotPassword={() =>
            openModal(<ForgotPasswordContent />, { overlay: true })
          } />
        ) : (
          <RegisterForm onSuccess={handleSuccess} />
        )}
      </div>
    </div>
  );
}

export function ForgotPasswordContent() {
  const { t } = useI18n();
  const { closeModal } = useModalEngine();
  const cfg = useSiteConfig();
  const pr = cfg?.pswd_recovery;

  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px]">
      <button
        onClick={closeModal}
        className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("forgot_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{t("forgot_desc")}</p>
        <div className="space-y-4 mb-4">
          {pr?.telegram_link && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <MessageCircleIcon />
              <div>
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">Telegram</strong>
                <a href={pr.telegram_link} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {pr.telegram_text || pr.telegram_link}
                </a>
              </div>
            </div>
          )}
          {pr?.email && (
            <div className="flex items-center gap-3 p-3 bg-[var(--color-primary)]/8 border border-[var(--border-default)] rounded-[var(--radius-md)]">
              <MailIcon />
              <div>
                <strong className="block text-sm text-[var(--text-primary)] mb-0.5">E-mail</strong>
                <a href={`mailto:${pr.email}`} className="text-sm text-[var(--color-primary)] hover:text-[#818cf8] word-break-all">
                  {pr.email}
                </a>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">{t("forgot_hint")}</p>
        <button
          onClick={closeModal}
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

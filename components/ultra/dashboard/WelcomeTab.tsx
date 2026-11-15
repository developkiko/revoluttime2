"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — WelcomeTab (Страница приветствия)
// Шаг 1 ✅ зелёный, Шаг 2 🟠 оранжевый, Шаг 3 🔴 красный
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { CheckCircle, CircleDot, CircleAlert, ShieldCheck, Loader2 } from "lucide-react";

interface WelcomeTabProps {
  onSelectPlan?: () => void;
  onDeposit?: () => void;
}

export function WelcomeTab({ onSelectPlan, onDeposit }: WelcomeTabProps) {
  const { t } = useI18n();
  const { openModal } = useModalEngine();

  const openDepositModal = () => {
    openModal(
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[520px]">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xl font-bold text-[#f59e0b]">Пополнение баланса</span>
          <button
            onClick={() => openModal(null)}
            className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
          >
            &times;
          </button>
        </div>
        <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 mb-5 border border-[var(--border-default)] text-center">
          <span className="text-sm text-[var(--text-muted)]">Сумма пополнения</span>
          <div className="text-4xl font-bold text-[var(--text-heading)] mt-1">10 USDT</div>
        </div>
        <button className="w-full bg-[#f59e0b] border-none text-[#0d0d1a] font-bold text-lg py-4 rounded-full cursor-default flex items-center justify-center gap-3 hover:bg-[#d97706] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <path d="M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
          </svg>
          Подключить кошелёк
        </button>
        <div className="mt-4 text-sm text-[var(--text-muted)] text-center">
          <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />{t("dash_deposit_waiting")}
        </div>
        <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
          <p className="text-[13px] text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {t("dash_deposit_secure")}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-[2rem] sm:text-[2.5rem] font-bold text-[var(--text-heading)] text-center mb-3">
        {t("dash_welcome_title")}
      </h1>
      <h2 className="text-base sm:text-lg font-medium text-[var(--text-secondary)] text-center mb-10">
        {t("dash_welcome_subtitle")}
      </h2>

      {/* Steps */}
      <div className="max-w-[640px] mx-auto space-y-4">
        {/* Step 1 — Registration ✅ green (semi-transparent like step 3) */}
        <div className="flex items-center gap-4 p-5 rounded-xl border border-green-500/20 bg-green-500/[0.03] opacity-70">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
            <span className="text-green-400"><CheckCircle className="w-6 h-6" /></span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-green-400">{t("dash_step1_title")}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t("dash_step1_desc")}</div>
          </div>
          <span className="text-xs text-green-500/70 font-mono whitespace-nowrap inline-flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> {t("dash_step_done")}</span>
        </div>

        {/* Step 2 — Deposit 🟠 orange */}
        <div className="flex items-center gap-4 p-5 rounded-xl border border-orange-500/30 bg-orange-500/[0.06]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center">
            <span className="text-orange-400"><CircleDot className="w-6 h-6" /></span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-orange-400">{t("dash_step2_title")}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t("dash_step2_desc")}</div>
          </div>
          <button
            onClick={onDeposit || openDepositModal}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 transition-colors"
          >
            {t("dash_deposit_btn")}
          </button>
        </div>

        {/* Step 3 — Choose proxy 🔴 red (semi-transparent) */}
        <div className="flex items-center gap-4 p-5 rounded-xl border border-red-500/20 bg-red-500/[0.03] opacity-70">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400/70"><CircleAlert className="w-6 h-6" /></span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-red-400/70">{t("dash_step3_title")}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{t("dash_step3_desc")}</div>
          </div>
          <button
            onClick={onSelectPlan || openDepositModal}
            className="flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-lg bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25 transition-colors"
          >
            {t("dash_step3_btn")}
          </button>
        </div>
      </div>
    </div>
  );
}

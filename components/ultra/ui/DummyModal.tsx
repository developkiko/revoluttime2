"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — DummyModal (Tailwind-версия)
// ══════════════════════════════════════════════════════════════

import { useI18n } from "@/lib/ultra/i18n-context";

interface DummyModalProps {
  open: boolean;
  onClose: () => void;
}

export function DummyModal({ open, onClose }: DummyModalProps) {
  const { t } = useI18n();
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[440px] text-center">
        <button
          onClick={onClose}
          className="absolute top-1.5 right-3 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
        >
          &times;
        </button>
        <div className="text-[2.5rem] text-[var(--color-warning)] mb-3">⚠️</div>
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("dummy_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">{t("dummy_desc")}</p>
        <button
          onClick={onClose}
          className="w-full py-3 text-base font-semibold rounded-xl transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
        >
          {t("dummy_ok")}
        </button>
      </div>
    </div>
  );
}

"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — PolicyLayout: обёртка для страниц политик
// ══════════════════════════════════════════════════════════════

import { Link } from "@/i18n/navigation";
import { useI18n } from "@/lib/ultra/i18n-context";
import { LangSwitcher } from "@/components/ultra/layout/LangSwitcher";
import { UltraThemeToggle } from "@/components/ultra/ui/ThemeToggle";
import type { ReactNode } from "react";

interface PolicyLayoutProps {
  titleKey: string;
  updatedKey?: string;
  children: ReactNode;
}

export function PolicyLayout({ titleKey, updatedKey, children }: PolicyLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[var(--max-width)] mx-auto px-6 py-10 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/ultra-home"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
            >
              {t("policy_back")}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              ← {t("nav_back")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <UltraThemeToggle />
            <LangSwitcher />
          </div>
        </div>
        <h1 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold text-[var(--text-heading)] mb-8">
          {t(titleKey)}
        </h1>
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 sm:p-10 max-w-none prose-p:text-sm prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-5">
          {children}
        </div>
        {updatedKey && (
          <p className="text-xs text-[var(--text-muted)] mt-6 text-center">
            {t(updatedKey)}
          </p>
        )}
      </div>
    </div>
  );
}

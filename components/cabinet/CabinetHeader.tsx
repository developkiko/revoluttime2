"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CreditCardIcon, LogOutIcon, UsersIcon } from "lucide-react";

/**
 * Dashboard-style status bar (Ultra dashboard header row): balance chip +
 * partners chip + accent action + user + logout. Rendered at the top of the
 * cabinet page, above the tabs.
 */
export function CabinetHeader({
  balanceLabel,
  partnersCount,
  userName,
}: {
  balanceLabel: string;
  partnersCount: number;
  userName: string;
}) {
  const t = useTranslations("cabinet.header");

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.assign("/");
  };

  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/30 rounded-full text-sm font-bold text-[var(--text-primary, var(--foreground))] tabular-nums whitespace-nowrap">
        <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
          {t("balance")}
        </span>
        <span>{balanceLabel}</span>
        <span className="text-[var(--border-default)] mx-0.5">|</span>
        <span className="inline-flex items-center gap-1">
          <UsersIcon className="w-3.5 h-3.5" />
          {partnersCount}
        </span>
      </span>

      <a
        href="/shop"
        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
      >
        <CreditCardIcon className="w-4 h-4" />
        {t("shopCta")}
      </a>

      <span className="inline-flex items-center gap-1.5 text-sm text-foreground font-medium whitespace-nowrap">
        {userName}
      </span>

      <button
        onClick={logout}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-[var(--border-default)] text-[var(--text-secondary, var(--muted-foreground))] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/40 hover:bg-[var(--color-error)]/10 transition-colors whitespace-nowrap"
      >
        <LogOutIcon className="w-4 h-4" />
        {t("logout")}
      </button>
    </div>
  );
}

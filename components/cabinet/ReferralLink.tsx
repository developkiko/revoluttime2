"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnalyticsEvents, track } from "@/lib/analytics/events";

import { CopyIcon, TrendingUpIcon, UserPlusIcon, UsersIcon } from "lucide-react";
import { useNotice } from "@/components/ui/notice";

/** Deterministic demo referral code from the account email (FNV-1a). */
function referralCode(email: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < email.length; i++) {
    hash ^= email.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `RT-${(hash >>> 0).toString(16).toUpperCase().slice(0, 6).padStart(6, "0")}`;
}

export interface ReferralStats {
  /** Everyone in the referral network (direct + downline). */
  total: number;
  /** Signed up yesterday. */
  yesterday: number;
  /** Signed up during the last 7 days. */
  lastWeek: number;
}

export function ReferralLink({
  email,
  stats,
}: {
  email: string;
  stats: ReferralStats;
}) {
  const t = useTranslations("cabinet.referral");
  const locale = useLocale();
  const { notice } = useNotice();
  const [copied, setCopied] = React.useState(false);

  const code = referralCode(email);
  // SSR-safe client-only value: server snapshot is "", client one reads origin
  // (stable for the page lifetime, so a noop subscribe is enough).
  const origin = React.useSyncExternalStore(
    React.useCallback(() => () => {}, []),
    () => window.location.origin,
    () => "",
  );
  const link = `${origin}/${locale}?ref=${code}`;

  async function copy() {
    track(AnalyticsEvents.PARTNER_LINK_CLICK, { code });
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      notice({ text: t("copied"), variant: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notice({ text: t("copyError"), variant: "error" });
    }
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-4 flex items-stretch gap-2">
        {/* Real readonly input (spec ui.md 3.1): text scrolls horizontally,
            is selectable by mouse and copyable via Ctrl+C / context menu. */}
        <input
          type="text"
          readOnly
          value={link}
          aria-label={t("title")}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border bg-muted/60 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
        />
        <button
          type="button"
          onClick={copy}
          aria-label={t("copy")}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors whitespace-nowrap"
        >
          <CopyIcon className="w-4 h-4" />
          {copied ? t("copied") : t("copy")}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("codeNote", { code })}
      </p>

      {/* Referral dynamics — headline total plus recent intake; mt-auto pins
          it to the card bottom so equal-height columns stay aligned */}
      <div className="mt-auto border-t pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <UsersIcon className="size-7 text-primary" />
          </div>
          <div>
            <p className="text-4xl font-bold tabular-nums leading-none">
              {stats.total}
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {t("statsTotal")}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <UserPlusIcon className="size-3.5 text-primary" />
              {t("statsYesterday")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.yesterday}</p>
          </div>
          <div className="rounded-xl border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <TrendingUpIcon className="size-3.5 text-primary" />
              {t("statsWeek")}
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{stats.lastWeek}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

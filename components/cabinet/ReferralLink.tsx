"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

/** Deterministic demo referral code from the account email (FNV-1a). */
function referralCode(email: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < email.length; i++) {
    hash ^= email.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `RT-${(hash >>> 0).toString(16).toUpperCase().slice(0, 6).padStart(6, "0")}`;
}

export function ReferralLink({ email }: { email: string }) {
  const t = useTranslations("cabinet.referral");
  const locale = useLocale();
  const [copied, setCopied] = React.useState(false);

  const code = referralCode(email);
  const link = `${window.location.origin}/${locale}?ref=${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6">
      <h2 className="text-xl font-bold tracking-tight">{t("title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-4 flex items-stretch gap-2">
        <code className="flex min-w-0 flex-1 items-center overflow-hidden rounded-lg border bg-muted/60 px-3 py-2.5 text-sm">
          <span className="truncate">{link}</span>
        </code>
        <Button onClick={copy} aria-label={t("copy")}>
          <CopyIcon />
          {copied ? t("copied") : t("copy")}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("codeNote", { code })}
      </p>
    </div>
  );
}

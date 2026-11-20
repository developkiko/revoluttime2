"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  CheckIcon,
  LinkIcon,
  MailIcon,
  UnlinkIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useNotice } from "@/components/ui/notice";
import { FacebookIcon, GoogleIcon, TelegramIcon } from "@/components/layout/auth-icons";
import { TgCodeFlow } from "@/components/layout/TgCodeFlow";

/**
 * Способы входа (cabinet profile): привязка/отвязка Google / Telegram /
 * Facebook + email-пустышка. Owner rule: единственный оставшийся способ
 * (пока не указан email) отвязать нельзя — показывается нотис со ссылкой
 * на раздел Профиль (удаление аккаунта там).
 */
interface Links {
  google: boolean;
  telegram: boolean;
  facebook: boolean;
  loginEmail: string | null;
}

const ROW_CLASS =
  "flex items-center justify-between gap-3 rounded-xl border bg-[var(--bg-elevated)] px-3 py-2.5";

const LINK_BTN_CLASS =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-heading)] transition-colors hover:bg-[var(--hover-bg)]";

const UNLINK_BTN_CLASS =
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--color-error)]/50 hover:text-[var(--color-error)]";

const CHIP_CLASS =
  "inline-flex items-center gap-1 rounded-full bg-[var(--color-success)]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-success)]";

export function LinkedAccounts() {
  const t = useTranslations("auth");
  const { notice } = useNotice();
  const [links, setLinks] = React.useState<Links | null>(null);
  const [lastMethodAlert, setLastMethodAlert] = React.useState(false);
  const [tgFlow, setTgFlow] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/links", { cache: "no-store" });
      if (!res.ok) return;
      setLinks((await res.json()) as Links);
    } catch {
      /* leave skeleton */
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function unlink(provider: "google" | "telegram" | "facebook") {
    setLastMethodAlert(false);
    try {
      const res = await fetch("/api/auth/links/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        notice({ text: t("unlinkedToast"), variant: "success" });
        await load();
        return;
      }
      const data = (await res.json()) as { error?: string };
      if (data.error === "last_method") {
        setLastMethodAlert(true);
      } else {
        notice({ text: t("unlinkFailed"), variant: "error" });
      }
    } catch {
      notice({ text: t("unlinkFailed"), variant: "error" });
    }
  }

  const rows: Array<{
    key: "google" | "telegram" | "facebook" | "email";
    label: string;
    icon: React.ReactNode;
    linked: boolean;
  }> = [
    { key: "google", label: "Google", icon: <GoogleIcon />, linked: !!links?.google },
    { key: "telegram", label: "Telegram", icon: <TelegramIcon />, linked: !!links?.telegram },
    { key: "facebook", label: "Facebook", icon: <FacebookIcon />, linked: !!links?.facebook },
    { key: "email", label: "Email", icon: <MailIcon className="w-4 h-4" />, linked: !!links?.loginEmail },
  ];

  return (
    <div className="mt-6 flex flex-col gap-3 border-t pt-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--text-heading)]">
        <LinkIcon className="size-4 text-primary" />
        {t("linkedTitle")}
      </h3>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {t("linkedHint")}
      </p>

      {lastMethodAlert && (
        <div className="rounded-xl border border-[var(--color-error)]/40 bg-[var(--color-error)]/10 p-3 text-xs leading-relaxed text-[var(--color-error)]">
          <p className="font-semibold">{t("lastMethodTitle")}</p>
          <p className="mt-1">
            {t("lastMethodText")}{" "}
            <Link
              href="/cabinet#profile"
              className="font-semibold underline underline-offset-2"
            >
              {t("profile")}
            </Link>
            .
          </p>
        </div>
      )}

      {tgFlow ? (
        <TgCodeFlow
          linkMode
          onBack={() => setTgFlow(false)}
          onDone={() => {
            setTgFlow(false);
            load();
          }}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.key} className={ROW_CLASS}>
              <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-[var(--text-heading)]">
                {row.icon}
                {row.label}
              </span>
              {row.linked ? (
                <span className="flex items-center gap-2">
                  <span className={CHIP_CLASS}>
                    <CheckIcon className="size-3" />
                    {t("linkedChip")}
                  </span>
                  {/* Owner rule: the last remaining method cannot be unlinked
                      (email placeholder does not count until it is real). */}
                  {row.key !== "email" && (
                    <button
                      type="button"
                      className={UNLINK_BTN_CLASS}
                      onClick={() => unlink(row.key as "google" | "telegram" | "facebook")}
                    >
                      <UnlinkIcon className="size-3.5" />
                      {t("unlinkCta")}
                    </button>
                  )}
                </span>
              ) : (
                <button
                  type="button"
                  className={LINK_BTN_CLASS}
                  onClick={() => {
                    setLastMethodAlert(false);
                    if (row.key === "google") {
                      window.location.href = "/api/auth/google/start?link=1";
                    } else if (row.key === "facebook") {
                      window.location.href = "/api/auth/facebook/start?link=1";
                    } else if (row.key === "telegram") {
                      setTgFlow(true);
                    } else {
                      // Email sign-in lands with the accounts API (owner).
                      notice({ text: t("emailLaterHint"), variant: "info" });
                    }
                  }}
                >
                  {t("linkCta")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

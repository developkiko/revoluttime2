"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { LoaderIcon, ShieldAlertIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { refreshSessionUser } from "@/lib/auth-store";
import { useNotice } from "@/components/ui/notice";

/**
 * Landing for the link the Telegram bot sends after "/start <code>" —
 * exchanges the one-time token for a site session (or completes account
 * linking) and redirects to the cabinet.
 */
export function AuthTelegramClient() {
  const t = useTranslations("auth");
  const { notice } = useNotice();
  const router = useRouter();
  const [state, setState] = React.useState<"working" | "error">("working");
  const [errorText, setErrorText] = React.useState<string>("");

  React.useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setErrorText(t("tgTokenMissing"));
      setState("error");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/tg/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = (await res.json()) as { ok?: boolean; linked?: boolean; error?: string };
        if (cancelled) return;
        if (!res.ok || !data.ok) {
          setErrorText(
            data.error === "expired" ? t("tgTokenExpired") : t("loginUnconfigured")
          );
          setState("error");
          return;
        }
        await refreshSessionUser();
        if (data.linked) {
          notice({ text: t("linkedToast"), variant: "success" });
          router.replace("/cabinet#profile");
        } else {
          notice({ text: t("welcomeToast"), variant: "success" });
          router.replace("/cabinet");
        }
      } catch {
        if (!cancelled) {
          setErrorText(t("loginUnconfigured"));
          setState("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [t, notice, router]);

  if (state === "error") {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
        <ShieldAlertIcon className="size-10 text-[var(--color-error)]" />
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {errorText}
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-[var(--text-link)] underline underline-offset-4 hover:text-[var(--text-heading)]"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <LoaderIcon className="size-10 animate-spin text-primary" />
      <p className="text-sm text-[var(--text-secondary)]">{t("tgFinishing")}</p>
    </div>
  );
}

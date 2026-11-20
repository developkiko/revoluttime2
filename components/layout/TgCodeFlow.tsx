"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";

import { useAuthUser, refreshSessionUser } from "@/lib/auth-store";
import { useNotice } from "@/components/ui/notice";

/**
 * Обходной Telegram-вход (замена Login Widget, которому нужен verify-домен):
 * показываем одноразовый код, кнопка открывает бота с предзаполненной
 * командой `/start <code>` (t.me/bot?start=code), бот подтверждает и шлёт
 * ссылку на сайт — по ней выставляется сессия (или привязка в link-режиме).
 * Пока пользователь ждёт, опрашиваем статус раз в 3 с.
 */
export function TgCodeFlow({
  linkMode = false,
  onBack,
  onDone,
}: {
  linkMode?: boolean;
  onBack?: () => void;
  onDone?: () => void;
}) {
  const t = useTranslations("auth");
  const { notice } = useNotice();
  const user = useAuthUser();
  const [state, setState] = React.useState<{ code: string; bot: string } | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/tg/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link: linkMode }),
        });
        const data = (await res.json()) as { code?: string; bot?: string };
        if (cancelled) return;
        if (!res.ok || !data.code || !data.bot) {
          setFailed(true);
          return;
        }
        setState({ code: data.code, bot: data.bot });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [linkMode]);

  // Status polling: login completes in another tab (bot link) — the shared
  // cookie makes /api/auth/me (login) or /api/auth/links (link mode) flip.
  React.useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      if (attempts > 40) {
        clearInterval(timer);
        return;
      }
      try {
        if (linkMode) {
          const res = await fetch("/api/auth/links", { cache: "no-store" });
          if (!res.ok) return;
          const data = (await res.json()) as { telegram?: boolean };
          if (!cancelled && data.telegram) {
            clearInterval(timer);
            setDone(true);
            notice({ text: t("linkedToast"), variant: "success" });
            onDone?.();
          }
        } else {
          if (user) {
            clearInterval(timer);
            setDone(true);
            notice({ text: t("welcomeToast"), variant: "success" });
            onDone?.();
          }
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [linkMode, user, notice, t, onDone]);

  // Login mode: refresh the shared store the moment the cookie lands.
  React.useEffect(() => {
    if (!linkMode && user) refreshSessionUser();
  }, [user, linkMode]);

  if (failed) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--color-error)]">{t("tgCodeError")}</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="self-start inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
          >
            <ArrowLeftIcon className="size-3.5" />
            {t("tgBack")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="self-start inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-heading)]"
        >
          <ArrowLeftIcon className="size-3.5" />
          {t("tgBack")}
        </button>
      )}

      <p className="font-semibold">{t("tgCodeTitle")}</p>
      <ol className="flex flex-col gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
        <li>1. {t("tgCodeStep1")}</li>
        <li>2. {t("tgCodeStep2")}</li>
      </ol>

      {state ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            title={t("tgCopyCmd")}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`/start ${state.code}`);
                notice({ text: t("tgCopied"), variant: "info" });
              } catch {
                /* clipboard unavailable */
              }
            }}
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border-active)] bg-[var(--bg-elevated)] px-4 py-2.5 font-mono text-base font-bold tracking-widest transition-colors hover:border-[var(--color-primary)]"
          >
            /start {state.code}
            <CopyIcon className="size-4 text-[var(--text-muted)]" />
          </button>

          <a
            href={`https://t.me/${state.bot}?start=${state.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary-border)]"
          >
            {t("tgOpenBot")}
            <ExternalLinkIcon className="size-4" />
          </a>

          {!done && (
            <p className="text-[11px] text-[var(--text-muted)]">{t("tgWaiting")}</p>
          )}
        </div>
      ) : (
        <div className="h-24 animate-pulse rounded-lg bg-[var(--hover-bg)]" />
      )}
    </div>
  );
}

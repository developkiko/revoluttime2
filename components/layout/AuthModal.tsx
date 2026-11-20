"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { LogInIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotice } from "@/components/ui/notice";
import { FacebookIcon, GoogleIcon, TelegramIcon } from "./auth-icons";
import { TgCodeFlow } from "./TgCodeFlow";

type AuthTab = "login" | "register";

const TAB_CLASS =
  "flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors";

const TAB_ACTIVE_CLASS = `${TAB_CLASS} bg-[var(--primary)] text-white border border-[var(--color-primary-border)]`;

const TAB_IDLE_CLASS = `${TAB_CLASS} border border-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]`;

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 text-sm text-[var(--text-heading)] outline-none transition-colors focus:border-[var(--color-primary)]";

/** Equal-size social row (owner spec): одинаковые по размерам и типам кнопки. */
const SOCIAL_CLASS =
  "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-default)] text-sm font-semibold text-[var(--text-heading)] transition-colors hover:bg-[var(--hover-bg)]";

/**
 * Site auth modal (owner request): tabs Вход/Регистрация, email+password
 * fields by default (email backend is a placeholder for now), and an equal
 * Google / Telegram / Facebook row. Telegram uses the deep-link code flow —
 * the old Login Widget stays mothballed in TelegramLoginWidget.tsx (needs a
 * verified domain).
 */
export function AuthModal({
  open,
  onOpenChange,
  initialTab = "login",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: AuthTab;
}) {
  const t = useTranslations("auth");
  const { notice } = useNotice();
  const [tab, setTab] = React.useState<AuthTab>(initialTab);
  const [tgStep, setTgStep] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setTab(initialTab);
      setTgStep(false);
    }
  }, [open, initialTab]);

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    // Email auth lands with the accounts API (owner: "по почте сделаем позже").
    notice({ text: t("emailLaterHint"), variant: "info" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        {tgStep ? (
          <div className="pt-2">
            <TgCodeFlow
              onBack={() => setTgStep(false)}
              onDone={() => onOpenChange(false)}
            />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {tab === "login" ? t("signInTitle") : t("registerTitle")}
              </DialogTitle>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-[var(--hover-bg)] p-1">
              <button
                type="button"
                className={tab === "login" ? TAB_ACTIVE_CLASS : TAB_IDLE_CLASS}
                onClick={() => setTab("login")}
              >
                <LogInIcon className="size-4" />
                {t("tabLogin")}
              </button>
              <button
                type="button"
                className={tab === "register" ? TAB_ACTIVE_CLASS : TAB_IDLE_CLASS}
                onClick={() => setTab("register")}
              >
                {t("tabRegister")}
              </button>
            </div>

            {/* Email / login + password — placeholder until the accounts API */}
            <form className="flex flex-col gap-3" onSubmit={submitEmail}>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {t("emailLabel")}
                </span>
                <input
                  type="text"
                  autoComplete="username"
                  className={FIELD_CLASS}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {t("passwordLabel")}
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={FIELD_CLASS}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary-border)]"
              >
                {t("emailSubmit")}
              </button>
              <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                {t("emailLaterHint")}
              </p>
            </form>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
              <span className="h-px flex-1 bg-[var(--border-default)]" />
              {t("or")}
              <span className="h-px flex-1 bg-[var(--border-default)]" />
            </div>

            {/* Equal Google / Telegram / Facebook row */}
            <div className="grid grid-cols-3 gap-2">
              <a href="/api/auth/google/start" className={SOCIAL_CLASS}>
                <GoogleIcon />
                Google
              </a>
              <button
                type="button"
                className={SOCIAL_CLASS}
                onClick={() => setTgStep(true)}
              >
                <TelegramIcon />
                Telegram
              </button>
              {/* Owner 21.11: Facebook требует подтверждения бизнеса — кнопка выключена. */}
              <button
                type="button"
                disabled
                title={t("fbSoon")}
                className={`${SOCIAL_CLASS} cursor-not-allowed opacity-50`}
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

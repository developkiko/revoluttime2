"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CircleHelpIcon, LogInIcon, UserPlusIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotice } from "@/components/ui/notice";
import { Link } from "@/i18n/navigation";
import { FacebookIcon, GoogleIcon, TelegramIcon } from "./auth-icons";
import { TgCodeFlow } from "./TgCodeFlow";

type AuthTab = "login" | "register";

const FIELD_CLASS =
  "h-10 w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 text-sm text-[var(--text-heading)] outline-none transition-colors focus:border-[var(--color-primary)]";

/** Equal-size social row (owner spec): одинаковые по размерам и типам кнопки. */
const SOCIAL_CLASS =
  "flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border-default)] text-sm font-semibold text-[var(--text-heading)] transition-colors hover:bg-[var(--hover-bg)]";

/**
 * Вкладки-«глайдер» модалки — те же классы `.tabs/.tab/.tabs-glider`, что и у
 * вкладок кабинета (владелец: «сделай как в личном кабинете»). Управляемый
 * вариант без хеш-роутинга: замер активной кнопки → позиция пилюли.
 */
function ModalGliderTabs({
  tabs,
  active,
  onChange,
  ariaLabel,
}: {
  tabs: { id: AuthTab; label: string; icon: React.ReactNode }[];
  active: AuthTab;
  onChange: (id: AuthTab) => void;
  ariaLabel: string;
}) {
  const navRef = React.useRef<HTMLElement>(null);
  const btnRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const [glider, setGlider] = React.useState<{ left: number; width: number } | null>(null);

  const measure = React.useCallback(() => {
    const btn = btnRefs.current.get(active);
    if (!btn) return;
    setGlider({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active]);

  React.useLayoutEffect(measure, [measure]);
  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(nav);
    btnRefs.current.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [measure]);

  return (
    <nav ref={navRef} className="tabs w-full" role="tablist" aria-label={ariaLabel}>
      <span
        aria-hidden="true"
        className="tabs-glider"
        style={
          glider
            ? { transform: `translateX(${glider.left}px)`, width: glider.width, opacity: 1 }
            : { transform: "translateX(0.375rem)", width: "6rem", opacity: 0 }
        }
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          ref={(el) => {
            if (el) btnRefs.current.set(tab.id, el);
            else btnRefs.current.delete(tab.id);
          }}
          onClick={() => onChange(tab.id)}
          className={active === tab.id ? "tab tab--on flex-1 justify-center" : "tab flex-1 justify-center"}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Site auth modal (owner request): glider tabs Вход/Регистрация (как в
 * кабинете), email+password fields by default (email backend is a
 * placeholder for now), «забыли пароль» + «нужна помощь» → /contact с
 * темой «проблема с аккаунтом», and an equal Google / Telegram / Facebook
 * row. Telegram uses the deep-link code flow — the old Login Widget stays
 * mothballed in TelegramLoginWidget.tsx (needs a verified domain).
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

            {/* Glider tabs — cabinet component look (owner 21.11) */}
            <ModalGliderTabs
              ariaLabel={t("signInTitle")}
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "login", label: t("tabLogin"), icon: <LogInIcon /> },
                { id: "register", label: t("tabRegister"), icon: <UserPlusIcon /> },
              ]}
            />

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
                  autoComplete={tab === "login" ? "current-password" : "new-password"}
                  className={FIELD_CLASS}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              {tab === "login" && (
                <Link
                  href="/contact?topic=account"
                  className="self-start text-xs text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--color-primary)] hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              )}
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] border border-[var(--color-primary-border)]"
              >
                {tab === "login" ? t("emailSubmit") : t("registerTitle")}
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

            {/* «Нужна помощь?» → контакты с темой «проблема с аккаунтом» */}
            <Link
              href="/contact?topic=account"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-1.5 self-center text-xs text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--color-primary)] hover:underline"
            >
              <CircleHelpIcon className="size-3.5" />
              {t("needHelp")}
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

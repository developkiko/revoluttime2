"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — LoginForm
// email + password → optional Turnstile (site_config) → auth
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, FormEvent, useRef, useCallback } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { loginViaAPI } from "@/lib/ultra/api";
import { useNotice } from "@/components/ui/notice";
import { LogIn, Mail, Lock, KeyRound } from "lucide-react";
import { SocialAuthButtons, AuthDivider, EmailDisclosureButton } from "./SocialAuthButtons";

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";

const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)] mb-3";
const errorInputClass =
  "w-full pl-9 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--color-error)] rounded-lg text-[var(--text-heading)] text-sm outline-none mb-1";
const labelClass = "block text-left text-[13px] text-[var(--text-secondary)] mb-1.5";

export function LoginForm({ onSuccess, onForgotPassword }: { onSuccess: () => void; onForgotPassword: () => void }) {
  const { t } = useI18n();
  const { login } = useAuth();
  const { notice } = useNotice();
  const cfg = useSiteConfig();
  const captchaEnabled = cfg?.captcha?.enabled !== false && cfg?.captcha?.forms?.login !== false;
  const telegramAuthEnabled = cfg?.telegram_auth_enabled !== false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "captcha" | "submitting">("form");
  // Email login stays available but collapses behind a muted link under the
  // social buttons (Google → Telegram → Facebook → email last).
  const [emailOpen, setEmailOpen] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>("");
  const doSubmitRef = useRef<(token: string) => void>(() => {});

  const resetCaptcha = useCallback(() => {
    if (widgetId.current && (window as any).turnstile) {
      try {
        (window as any).turnstile.remove(widgetId.current);
      } catch {
        /* */
      }
    }
    widgetId.current = "";
    setTurnstileToken("");
  }, []);

  const doSubmit = useCallback(
    async (token: string) => {
      setStep("submitting");
      setLoading(true);
      try {
        const data = await loginViaAPI(email.trim(), password.trim(), token);
        if (data.success && data.user) {
          login(data.user);
          notice({ text: t("success_title") || "Успешный вход", variant: "success" });
          onSuccess();
        } else {
          const msg =
            data.errors?.[0]?.message || data.error || t("login_error") || "Неверный email или пароль";
          notice({ text: msg, variant: "error" });
          setErrors({ credentials: msg });
          resetCaptcha();
          setStep("form");
        }
      } catch {
        notice({ text: t("server_unavailable") || "Сервер недоступен", variant: "error" });
        setErrors({ credentials: "Ошибка соединения" });
        resetCaptcha();
        setStep("form");
      } finally {
        setLoading(false);
      }
    },
    [email, password, login, onSuccess, t, notice, resetCaptcha]
  );

  // Keep the latest submitter reachable for the captcha callback (no render-time ref writes).
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  });

  const loadCaptcha = useCallback(() => {
    if (!TURNSTILE_SITEKEY) {
      doSubmitRef.current("");
      return;
    }
    setStep("captcha");
    setTurnstileToken("");

    const renderWidget = () => {
      if (!turnstileRef.current) return;
      const tw = (window as any).turnstile;
      if (!tw) return;
      if (widgetId.current) {
        try {
          tw.remove(widgetId.current);
        } catch {
          /* */
        }
      }
      widgetId.current = tw.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        theme: "dark",
        callback: (tok: string) => {
          setTurnstileToken(tok);
          doSubmitRef.current(tok);
        },
        "error-callback": () => {
          try {
            tw.remove(widgetId.current);
          } catch {
            /* */
          }
          widgetId.current = "";
        },
        "expired-callback": () => {
          try {
            tw.remove(widgetId.current);
          } catch {
            /* */
          }
          widgetId.current = "";
          setStep("form");
        },
      });
    };

    if ((window as any).turnstile) {
      renderWidget();
    } else {
      const existing = document.querySelector('script[src*="turnstile"]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => setStep("form");
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (step === "captcha" && turnstileToken) {
      doSubmit(turnstileToken);
      return;
    }
    if (step === "captcha") return;

    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = t("err_email_empty") || "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = t("err_email_format") || "Некорректный формат email";
    if (!password.trim()) errs.password = t("err_password_empty") || "Пароль обязателен";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!captchaEnabled || !TURNSTILE_SITEKEY) {
      doSubmit("");
      return;
    }
    loadCaptcha();
  };

  return (
    <>
      <SocialAuthButtons telegramEnabled={telegramAuthEnabled} />
      <AuthDivider />
      <EmailDisclosureButton
        label={`${t("form_login_btn") || "Войти"} · email`}
        open={emailOpen}
        onClick={() => setEmailOpen(true)}
      />
      {emailOpen && (
      <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="loginEmail" className={labelClass}>
          {t("form_email_label")}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" style={{ top: "28%" }} />
          <input
            type="email"
            id="loginEmail"
            name="email"
            required
            placeholder="your@email.com"
            autoComplete="username"
            className={errors.email || errors.credentials ? errorInputClass : inputClass}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((p) => {
                const n = { ...p };
                delete n.email;
                delete n.credentials;
                return n;
              });
            }}
            disabled={loading || step === "captcha" || step === "submitting"}
          />
        </div>
        {errors.email && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="loginPassword" className={labelClass}>
          {t("form_pass_label")}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" style={{ top: "28%" }} />
          <input
            type="password"
            id="loginPassword"
            name="password"
            required
            placeholder="••••••••"
            autoComplete="current-password"
            className={errors.password || errors.credentials ? errorInputClass : inputClass}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => {
                const n = { ...p };
                delete n.password;
                delete n.credentials;
                return n;
              });
            }}
            disabled={loading || step === "captcha" || step === "submitting"}
          />
        </div>
        {errors.password && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.password}</p>}
        {errors.credentials && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.credentials}</p>}
      </div>

      {step === "captcha" && captchaEnabled && TURNSTILE_SITEKEY && (
        <div className="mb-3 flex justify-center">
          <div ref={turnstileRef} />
        </div>
      )}

      <button
        type="submit"
        disabled={loading || step === "submitting" || (step === "captcha" && !turnstileToken)}
        className="w-full py-3 text-base font-semibold rounded-xl transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
      >
        {loading || step === "submitting" ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {(t("loading") as string) || "Вхожу..."}
          </>
        ) : step === "captcha" ? (
          <>{(t("form_submit") as string) || "Подтвердите капчу"}</>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            {t("form_login_btn") || "Войти"}
          </>
        )}
      </button>
      <a
        href="#"
        className="block text-center text-[13px] text-[var(--text-secondary)] mt-2.5 hover:text-[var(--color-accent-soft)] transition-colors inline-flex items-center justify-center gap-1"
        onClick={(e) => {
          e.preventDefault();
          onForgotPassword();
        }}
      >
        <KeyRound className="w-3 h-3" />
        {t("forgot_password")}
      </a>
      </form>
      )}
    </>
  );
}

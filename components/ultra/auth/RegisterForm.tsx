"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — RegisterForm
// Порядок: валидация → проверка email (не занят) без капчи → капча → сабмит
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, FormEvent, useRef, useCallback } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { registerViaAPI, checkEmail } from "@/lib/ultra/api";
import { useToast } from "@/components/ultra/ui/Toast";
import { UserPlus, Mail, Lock, CheckCircle } from "lucide-react";
import { SocialAuthButtons, AuthDivider, EmailDisclosureButton } from "./SocialAuthButtons";

interface RegisterFormProps {
  onSuccess: () => void;
}

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";

const inputClass =
  "w-full pl-9 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)] mb-3";
const errorInputClass =
  "w-full pl-9 pr-4 py-2.5 bg-[var(--bg-input)] border border-[var(--color-error)] rounded-lg text-[var(--text-heading)] text-sm outline-none mb-1";
const labelClass = "block text-left text-[13px] text-[var(--text-secondary)] mb-1.5";

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { t } = useI18n();
  const { login } = useAuth();
  const { toast } = useToast();
  const cfg = useSiteConfig();
  const captchaEnabled = cfg?.captcha?.enabled !== false && cfg?.captcha?.forms?.register !== false;
  const telegramAuthEnabled = cfg?.telegram_auth_enabled !== false;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [regState, setRegState] = useState<"form" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<"form" | "captcha" | "submitting">("form");
  // Email registration collapses behind a muted link under the social buttons.
  const [emailOpen, setEmailOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>("");

  const validate = useCallback((): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = t("err_email_empty") || "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = t("err_email_format") || "Некорректный формат email";
    if (!password.trim()) e.password = t("err_password_empty") || "Пароль обязателен";
    else if (password.length < 8) e.password = t("err_password_short") || "Пароль должен быть не менее 8 символов";
    if (password !== confirm) e.confirm = t("err_confirm_mismatch") || "Пароли не совпадают";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [email, password, confirm, t]);

  const doSubmitRef = useRef<any>(null);

  const loadCaptcha = useCallback(() => {
    if (!TURNSTILE_SITEKEY) return;
    setStep("captcha");
    setTurnstileToken("");

    const renderWidget = () => {
      if (!turnstileRef.current) return;
      const tw = (window as any).turnstile;
      if (!tw) return;

      if (widgetId.current) {
        try { tw.remove(widgetId.current); } catch {}
      }

      widgetId.current = tw.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        theme: "dark",
        callback: (token: string) => {
          setTurnstileToken(token);
          doSubmitRef.current(token);
        },
        "error-callback": () => {
          try { tw.remove(widgetId.current); } catch {}
          widgetId.current = "";
        },
        "expired-callback": () => {
          try { tw.remove(widgetId.current); } catch {}
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

  const resetCaptcha = useCallback(() => {
    if (widgetId.current && (window as any).turnstile) {
      try { (window as any).turnstile.remove(widgetId.current); } catch {}
    }
    widgetId.current = "";
    setTurnstileToken("");
  }, []);

  const doSubmit = useCallback(async (token: string) => {
    setStep("submitting");
    try {
      const data = await registerViaAPI(email, password, token);
      if (data.success && data.user) {
        login(data.user);
        setRegState("success");
        setTimeout(() => onSuccess(), 2000);
      } else {
        const msg = data.errors?.[0]?.message || data.error || t("error_desc");
        setErrorMsg(msg);
        setRegState("error");
        resetCaptcha();
        setStep("form");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || t("error_desc") || "Ошибка соединения");
      setRegState("error");
      resetCaptcha();
      setStep("form");
    }
  }, [email, password, login, onSuccess, t, resetCaptcha]);

  // Keep the latest submitter reachable for the captcha callback (no render-time ref writes).
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Если капча уже пройдена — сабмит
    if (step === "captcha" && turnstileToken) {
      doSubmit(turnstileToken);
      return;
    }
    // Капча уже показана — ждём прохождения
    if (step === "captcha") return;

    if (!validate()) return;

    // 1) Сначала проверяем что email не занят БЕЗ капчи
    try {
      const checkRes = await checkEmail(email.trim().toLowerCase());
      if (checkRes.exists) {
        setErrors({ email: t("err_email_taken") || "Email уже зарегистрирован" });
        setStep("form");
        return;
      }
    } catch {
      setErrors({ email: "Ошибка соединения" });
      setStep("form");
      return;
    }

    // 2) Email свободен — запрашиваем капчу
    if (!captchaEnabled || !TURNSTILE_SITEKEY) {
      doSubmit("");
      return;
    }

    loadCaptcha();
  };

  const retry = () => {
    setRegState("form");
    setEmail("");
    setPassword("");
    setConfirm("");
    setErrors({});
    setStep("form");
    resetCaptcha();
    setAgreed(false);
  };

  const clearError = (field: string) => {
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const checkboxClass =
    "flex items-start gap-2 text-left cursor-pointer select-none group";
  const checkboxInputClass =
    "mt-0.5 w-4 h-4 min-w-[16px] min-h-[16px] rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] accent-[var(--color-primary)] cursor-pointer";
  const checkboxLabelBase = "text-[12px] leading-relaxed";
  const checkboxAgreed = "text-[var(--text-primary)]";
  const checkboxNotAgreed = "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]";

  if (regState === "success") {
    return (
      <div className="text-center">
        <div className="text-[2.5rem] text-[var(--color-success)] mb-3">
          <CheckCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("success_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {t("success_desc")}<strong className="text-[var(--text-heading)]">{email.split("@")[0]}</strong>
        </p>
      </div>
    );
  }

  if (regState === "error") {
    return (
      <div className="text-center">
        <div className="text-[2.5rem] text-[var(--color-warning)] mb-3">⚠️</div>
        <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">{t("error_title")}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">{errorMsg}</p>
        <button
          onClick={retry}
          className="w-full py-3 text-base font-semibold rounded-xl bg-[var(--color-primary)]/12 text-[var(--color-primary)] border border-[var(--border-active)] hover:bg-[var(--color-primary)]/20 transition-colors"
        >
          {t("error_retry")}
        </button>
      </div>
    );
  }

  return (
    <>
      <SocialAuthButtons telegramEnabled={telegramAuthEnabled} />
      <AuthDivider />
      <EmailDisclosureButton
        label={`${t("form_submit") || "Создать аккаунт"} · email`}
        open={emailOpen}
        onClick={() => setEmailOpen(true)}
      />
      {emailOpen && (
      <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="regEmail" className={labelClass}>{t("form_email_label")}</label>
        <div className="relative">
          <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" style={{ top: '28%' }} />
          <input type="email" id="regEmail" name="email" required
            className={errors.email ? errorInputClass : inputClass}
            placeholder="your@email.com" autoComplete="username"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
            disabled={step === "submitting"}
          />
        </div>
        {errors.email && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.email}</p>}
      </div>
      <div>
        <label htmlFor="regPassword" className={labelClass}>{t("form_pass_label")}</label>
        <div className="relative">
          <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" style={{ top: '28%' }} />
          <input type="password" id="regPassword" name="password" required
            className={errors.password ? errorInputClass : inputClass}
            placeholder="••••••••" autoComplete="new-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
            disabled={step === "submitting"}
          />
        </div>
        {errors.password && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.password}</p>}
      </div>
      <div>
        <label htmlFor="regConfirm" className={labelClass}>{t("form_confirm_label")}</label>
        <div className="relative">
          <CheckCircle className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" style={{ top: '28%' }} />
          <input type="password" id="regConfirm" name="confirm" required
            className={errors.confirm ? errorInputClass : inputClass}
            placeholder="••••••••" autoComplete="new-password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); clearError("confirm"); }}
            disabled={step === "submitting"}
          />
        </div>
        {errors.confirm && <p className="text-[11px] text-[var(--color-error)] mb-2">{errors.confirm}</p>}
      </div>

      {/* Капча — только после нажатия "Продолжить" */}
      {step === "captcha" && captchaEnabled && TURNSTILE_SITEKEY && (
        <div className="mb-3 flex justify-center">
          <div ref={turnstileRef} />
        </div>
      )}

      {/* Чекбокс согласия с правилами */}
      <label className={checkboxClass} onClick={(e) => { e.preventDefault(); setAgreed(!agreed); }}>
        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
          className={checkboxInputClass} tabIndex={-1} />
        <span className={agreed ? checkboxAgreed : checkboxNotAgreed}>
          {t("reg_consent_prefix")}{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer"
            className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] underline decoration-1 underline-offset-2 transition-colors">
            {t("reg_consent_link")}
          </a>
        </span>
      </label>

      <button
        type="submit"
        disabled={step === "submitting" || !agreed}
        className="w-full py-3 text-base font-semibold rounded-xl transition-colors bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 mt-3"
      >
        <UserPlus className="w-4 h-4" />
        {step === "submitting" ? (t("loading") as string || "...") :
         step === "captcha" ? t("form_submit") :
         t("form_submit")}
      </button>
      </form>
      )}
    </>
  );
}

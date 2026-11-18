"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — ContactForm
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, FormEvent, useRef, useCallback } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { Mail, MessageCircle, Clock, Send } from "lucide-react";

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "";

export function ContactForm() {
  const { t, lang } = useI18n();
  const cfg = useSiteConfig();
  const c = cfg?.contact_section;
  const captchaEnabled = cfg?.captcha?.enabled !== false && cfg?.captcha?.forms?.contact !== false;
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    message: string;
  }>({ type: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState<"form" | "ready" | "captcha" | "submitting">("form");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string>("");

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t("err_name_empty") || "Имя обязательно";
    if (!email.trim()) e.email = t("err_email_empty") || "Email обязателен";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      e.email = t("err_email_format") || "Некорректный формат email";
    if (!message.trim()) e.message = t("err_msg_empty") || "Сообщение обязательно";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  };

  const doSubmitRef = useRef<any>(null);

  const loadCaptcha = useCallback(() => {
    if (!captchaEnabled || !TURNSTILE_SITEKEY) {
      doSubmit("");
      return;
    }
    setStep("captcha");
    setTurnstileToken("");

    const renderWidget = () => {
      if (!turnstileRef.current) return;
      const tw = (window as any).turnstile;
      if (!tw) return;
      if (widgetId.current) { try { tw.remove(widgetId.current); } catch {} }
      widgetId.current = tw.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITEKEY,
        theme: "dark",
        callback: (token: string) => {
          setTurnstileToken(token);
          doSubmitRef.current(token);
        },
        "error-callback": () => { try { tw.remove(widgetId.current); } catch {} widgetId.current = ""; },
        "expired-callback": () => { try { tw.remove(widgetId.current); } catch {} widgetId.current = ""; setStep("form"); },
      });
    };

    if ((window as any).turnstile) { renderWidget(); }
    else {
      const existing = document.querySelector('script[src*="turnstile"]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = renderWidget;
      script.onerror = () => setStep("ready");
      document.head.appendChild(script);
    }
  }, []);

  const doSubmit = useCallback(async (token: string) => {
    setStep("submitting");
    try {
      const res = await fetch("/api/ultra/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, turnstile_token: token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      setStatus({ type: "success", message: t("contact_success") });
      setName(""); setEmail(""); setMessage("");
      setStep("form");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || t("contact_error") });
      setStep("form");
    }
  }, [name, email, message, t]);

  // Keep the latest submitter reachable for the captcha callback (no render-time ref writes).
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setErrors({});

    if (step === "captcha" && turnstileToken) { doSubmit(turnstileToken); return; }
    // Капча уже показана — ждём прохождения, не пересоздаём
    if (step === "captcha") return;

    if (!validate()) return;

    // Валидация ок — сразу показываем капчу
    loadCaptcha();
  };

  const inputBase =
    "w-full px-4 py-3 bg-[var(--bg-input)] border rounded-lg text-[var(--text-heading)] text-sm outline-none transition-colors focus:border-[var(--color-primary)] placeholder:text-[var(--text-muted)]";
  const inputClass = `${inputBase} border-[var(--border-default)]`;
  const errorInput = `${inputBase} border-[var(--color-error)]`;

  return (
    <section id="contacts" className="py-20 relative">
      <div
        className="absolute inset-0 opacity-[0.06] bg-cover bg-center bg-no-repeat -z-0"
        style={{ backgroundImage: "url('/ultra/contact-bg.jpg')" }}
      />
      <div className="max-w-[var(--max-width)] mx-auto px-6 relative z-10">
        <h2 className="text-[1.5rem] sm:text-[2rem] font-bold text-[var(--text-heading)] text-center mb-3">
          {t("contact_title")}
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] text-center max-w-[600px] mx-auto mb-12">
          {t("contact_desc")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8 items-stretch">
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contactName" className="block text-[13px] text-[var(--text-secondary)] mb-1.5">
                  {t("contact_name_label")}
                </label>
                <input
                  type="text" id="contactName" name="name" value={name}
                  className={errors.name ? errorInput : inputClass} placeholder="John"
                  onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  disabled={step === "submitting"}
                />
                {errors.name && <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-[13px] text-[var(--text-secondary)] mb-1.5">
                  {t("contact_email_label")}
                </label>
                <input
                  type="email" id="contactEmail" name="email" value={email}
                  className={errors.email ? errorInput : inputClass} placeholder="john@example.com"
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  disabled={step === "submitting"}
                />
                {errors.email && <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="contactMessage" className="block text-[13px] text-[var(--text-secondary)] mb-1.5">
                {t("contact_msg_label")}
              </label>
              <textarea
                id="contactMessage" name="message" rows={5} value={message}
                className={(errors.message ? errorInput : inputClass) + " resize-y min-h-[100px]"}
                placeholder="Your message..."
                onChange={(e) => { setMessage(e.target.value); clearError("message"); }}
                disabled={step === "submitting"}
              />
              {errors.message && <p className="text-[11px] text-[var(--color-error)] mt-1">{errors.message}</p>}
            </div>

            {step === "captcha" && captchaEnabled && TURNSTILE_SITEKEY && (
              <div className="mb-3 flex justify-center">
                <div ref={turnstileRef} />
              </div>
            )}

            <button
              type="submit"
              disabled={step === "submitting"}
              className="inline-flex items-center gap-2 justify-center py-[0.85rem] px-8 text-base font-semibold rounded-[10px] transition-colors bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] whitespace-nowrap disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {step === "submitting" ? (t("loading") as string || "...") :
               step === "captcha" ? t("contact_btn") :
               t("contact_btn")}
            </button>
            {status.message && (
              <p className={`mt-4 text-sm p-3 rounded-lg ${
                status.type === "success"
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              }`}>
                {status.message}
              </p>
            )}
          </form>

          {/* Info */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6">
            {[{
              // WhatsApp (was Email in the Ultra template): supports wa.me links.
              show: Boolean(c?.email),
              icon: Mail,
              label: "WhatsApp",
              value: typeof c?.email === "string" ? c.email : "",
              href: (() => {
                const raw = typeof c?.email === "string" ? c.email : "";
                if (!raw || raw === "#") return undefined;
                return raw.startsWith("http") || raw.startsWith("mailto:") || raw.startsWith("tel:")
                  ? raw
                  : `mailto:${raw}`;
              })(),
            }, {
              show: Boolean(c?.telegram_link),
              icon: MessageCircle,
              label: "Telegram",
              value: c?.telegram_text || c?.telegram_link || "",
              href: (c?.telegram_link && c.telegram_link !== "#") ? c.telegram_link : undefined,
            }, {
              // Schedule / work hours — NEVER a link
              show: Boolean(c),
              icon: Clock,
              label: t("contact_workhours"),
              value: lang === "ru" ? (c?.workhours_ru || "") : (c?.workhours_en || ""),
              href: undefined as string | undefined,
            }].filter((item) => item.show).map((item) => {
              const isLink = Boolean(item.href && item.href !== "#");
              const textClass = "text-[13px] text-[var(--text-secondary)]";
              return (
              <div
                key={item.label}
                className="flex gap-4 py-4 border-b border-[var(--border-subtle)] last:border-b-0 rounded-lg -mx-2 px-2 transition-colors hover:bg-[var(--hover-bg)]"
              >
                <item.icon className="w-5 h-5 flex-shrink-0 text-[var(--text-muted)]" />
                <div>
                  <strong className="block text-sm text-[var(--text-heading)] mb-0.5">{item.label}</strong>
                  {isLink ? (
                    <a href={item.href!} target="_blank" rel="noopener noreferrer" className={`${textClass} hover:text-[var(--color-primary)] transition-colors underline underline-offset-2`}>
                      {item.value}
                    </a>
                  ) : (
                    <span className={textClass}>{item.value}</span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — PaymentModal
// Пополнение баланса через USDT (manual flow via admin)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef } from "react";
import { useI18n } from "@/lib/ultra/i18n-context";
import type { Lang } from "@/lib/ultra/i18n";
import { t as translate } from "@/lib/ultra/i18n";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { useAuth } from "@/lib/ultra/auth-store";
import { useSiteConfig } from "@/lib/ultra/site-config-context";
import { ShieldCheck, Loader2, ExternalLink, Copy, Check, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

type Step = "form" | "generating" | "polling" | "payment" | "success" | "error" | "expired";

interface PaymentModalProps {
  initialAmount?: number;
}

const STORAGE_KEY = "payment_session";

function saveSession(sessionId: string, amount: number, expiresAt: string, url?: string, email?: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ session_id: sessionId, amount, expires_at: expiresAt, url: url || null, email: email || null }));
  } catch {}
}

interface SavedSession {
  session_id: string;
  amount: number;
  expires_at: string;
  url: string | null;
  email?: string | null;
}

function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Email текущего юзера напрямую из localStorage —
// auth-store гидрируется асинхронно и на mount `user` может быть ещё null
function currentAuthEmail(): string | null {
  try {
    const raw = localStorage.getItem("ultra_proxy_session");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return typeof u?.email === "string" && u.email ? u.email : null;
  } catch {
    return null;
  }
}

function clearSession() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function PaymentModal({ initialAmount }: PaymentModalProps) {
  const { t, lang } = useI18n();
  const { closeModal } = useModalEngine();
  const { user } = useAuth();
  const cfg = useSiteConfig();
  const pm = cfg?.payment;
  const minAmount = pm?.min_amount || 10;
  const maxAmount = pm?.max_amount || 100000;
  const lockAmount = !!(pm as any)?.lock_amount;
  const validityHours = pm?.validity_hours || 24;

  // Helper: translate with params (e.g. "Минимальная сумма: $%s")
  const tp = (key: string, params?: string[]) => {
    return lang === "en" ? translate("en", key, params) : translate("ru", key, params);
  };
  const [amount, setAmount] = useState(pm?.min_amount || 10);

  useEffect(() => {
    if (lockAmount) setAmount(minAmount);
  }, [lockAmount, minAmount]);
  const [step, setStep] = useState<Step>("form");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const texts = lang === "en" ? {
    title: "Top Up Balance",
    amountLabel: "Top-up amount",
    connect: "Top Up",
    generating: "Creating payment request...",
    generatingHint: "Please wait while we set up your session...",
    polling: "Waiting for admin to prepare payment link...",
    pollingHint: "This usually takes a few minutes. You can close this window and come back.",
    paymentTitle: "Payment via USDT",
    paymentDesc: "Click the button below to pay. You will be redirected to the payment page.",
    openPayment: "Open Payment Page",
    copyLink: "Copy Link",
    copied: "Copied!",
    secure: "Connection is secure. Funds will be credited after admin confirmation.",
    successTitle: "Payment Confirmed!",
    successDesc: "Your balance has been updated. Thank you for your payment.",
    errorTitle: "Error",
    errorDesc: "Failed to create payment request. Please try again.",
    expiredTitle: "Link Expired",
    expiredDesc: "The payment link has expired. Please create a new request.",
    tryAgain: "Try Again",
    close: "Close",
    min: "Min",
    max: "Max",
    currency: "USDT",
    countdown: "Link expires in",
  } : {
    title: "Пополнение баланса",
    amountLabel: "Сумма пополнения",
    connect: "Пополнить",
    generating: "Создание запроса на оплату...",
    generatingHint: "Пожалуйста, подождите — создаём вашу сессию...",
    polling: "Ожидаем подготовки платёжной ссылки...",
    pollingHint: "Обычно это занимает несколько минут. Можете закрыть окно и вернуться позже.",
    paymentTitle: "Оплата через USDT",
    paymentDesc: "Нажмите кнопку ниже для оплаты. Вы будете перенаправлены на страницу оплаты.",
    openPayment: "Открыть страницу оплаты",
    copyLink: "Копировать ссылку",
    copied: "Скопировано!",
    secure: "Подключение защищено. Средства будут зачислены после подтверждения администратором.",
    successTitle: "Платёж подтверждён!",
    successDesc: "Ваш баланс обновлён. Спасибо за оплату.",
    errorTitle: "Ошибка",
    errorDesc: "Не удалось создать запрос на оплату. Попробуйте ещё раз.",
    expiredTitle: "Ссылка истекла",
    expiredDesc: "Платёжная ссылка больше не действует. Создайте новый запрос.",
    tryAgain: "Попробовать снова",
    close: "Закрыть",
    min: "Мин",
    max: "Макс",
    currency: "USDT",
    countdown: "Ссылка действительна ещё",
  };

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }, []);

  const startCountdown = useCallback((expiresAt: string) => {
    stopCountdown();
    const calcRemaining = () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    setCountdown(calcRemaining());

    countdownRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      const remaining = calcRemaining();
      setCountdown(remaining);
      if (remaining <= 0) {
        stopCountdown();
        stopPolling();
        clearSession();
        if (mountedRef.current) setStep("expired");
      }
    }, 1000);
  }, [stopCountdown, stopPolling]);

  const pollStatus = useCallback((sid: string) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const res = await fetch(`/api/ultra/payment/status/${sid}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "ready" && data.url) {
          stopPolling();
          setPaymentUrl(data.url);
          setStep("payment");
        } else if (data.status === "completed") {
          stopPolling();
          stopCountdown();
          clearSession();
          if (mountedRef.current) setStep("success");
        } else if (data.status === "expired" || data.status === "error") {
          stopPolling();
          stopCountdown();
          clearSession();
          if (mountedRef.current) setStep(data.status === "expired" ? "expired" : "error");
        }
      } catch {}
    }, 5000);
  }, [stopPolling, stopCountdown]);

  // On mount: restore session from localStorage
  useEffect(() => {
    mountedRef.current = true;
    const saved = loadSession();
    const currentEmail = user?.email || currentAuthEmail();
    // Незалогиненный юзер или чужая сессия — не восстанавливаем
    if (saved && (!currentEmail || (saved.email && saved.email !== currentEmail))) {
      clearSession();
      return;
    }
    if (saved) {
      // Check if already expired client-side
      const remaining = Math.max(0, Math.floor((new Date(saved.expires_at).getTime() - Date.now()) / 1000));
      if (remaining <= 0) {
        clearSession();
        stopPolling();
        stopCountdown();
        return;
      }

      setSessionId(saved.session_id);
      setAmount(saved.amount);

      if (saved.url) {
        // URL already known — show payment immediately, no API call
        setPaymentUrl(saved.url);
        startCountdown(saved.expires_at);
        setStep("payment");
      } else {
        // No URL yet — poll until admin sets one
        startCountdown(saved.expires_at);
        setStep("polling");
        pollStatus(saved.session_id);
      }
    } else {
      // No saved session
      clearSession();
      stopPolling();
      stopCountdown();
    }
    return () => {
      mountedRef.current = false;
      stopPolling();
      stopCountdown();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePayment = useCallback(async () => {
    // Проверка на клиенте при нажатии кнопки
    if (amount < minAmount) {
      setErrorMsg(tp("err_payment_amount_min", [String(minAmount)]));
      setStep("error");
      return;
    }
    if (amount > maxAmount) {
      setErrorMsg(tp("err_payment_amount_max", [String(maxAmount)]));
      setStep("error");
      return;
    }
    // Без email платеж не создаём — иначе уйдёт init с пустым email
    // (user может быть ещё не гидрирован из localStorage — читаем и напрямую)
    const email = user?.email || currentAuthEmail() || "";
    if (!email) {
      setErrorMsg(tp("err_auth_required") || "Необходимо войти в аккаунт");
      setStep("error");
      return;
    }
    // Чистим старую сессию (если была)
    clearSession();
    stopPolling();
    stopCountdown();
    setStep("generating");
    try {
      const res = await fetch("/api/ultra/payment/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.session_id) {
        throw new Error(data.error || tp("err_server"));
      }
      setSessionId(data.session_id);
      saveSession(data.session_id, amount, data.expires_at, data.url || undefined, email);
      if (data.url) {
        // Admin pre-filled the default URL — show payment immediately
        setPaymentUrl(data.url);
        startCountdown(data.expires_at);
        setStep("payment");
      } else {
        // No default URL — poll until admin sets one
        startCountdown(data.expires_at);
        setStep("polling");
        pollStatus(data.session_id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || tp("err_server"));
      setStep("error");
    }
  }, [amount, minAmount, maxAmount, startCountdown, pollStatus, clearSession, stopPolling, stopCountdown]);

  const formatCountdown = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}ч ${m.toString().padStart(2, "0")}м`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const inputClass =
    "w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-[var(--text-heading)] text-2xl font-bold text-center outline-none transition-colors focus:border-[var(--color-primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-8 w-full max-w-[520px]">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-2xl text-[var(--text-secondary)] hover:text-[var(--text-heading)] leading-none p-0.5 bg-transparent"
      >
        &times;
      </button>

      {/* ═══ ШАГ: Форма ввода суммы ═══ */}
      {step === "form" && (
        <>
          <h3 className="text-xl font-bold text-[#f59e0b] mb-6">{texts.title}</h3>
          <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 mb-5 border border-[var(--border-default)]">
            <label className="block text-sm text-[var(--text-muted)] text-center mb-3">
              {texts.amountLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={1000000}
                step={1}
                value={amount}
                readOnly={lockAmount}
                disabled={lockAmount}
                onChange={(e) => {
                  if (lockAmount) return;
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setAmount(v);
                }}
                className={inputClass + (lockAmount ? " opacity-80 cursor-not-allowed" : "")}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[var(--text-muted)]">
                {texts.currency}
              </span>
            </div>
            {!lockAmount ? (
              <div className="flex justify-between mt-3 text-xs text-[var(--text-muted)]">
                <button
                  type="button"
                  onClick={() => setAmount(minAmount)}
                  className="hover:text-[var(--color-primary)] transition-colors cursor-pointer bg-transparent border-none text-[var(--text-muted)]"
                >
                  {texts.min}: {minAmount}
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(maxAmount)}
                  className="hover:text-[var(--color-primary)] transition-colors cursor-pointer bg-transparent border-none text-[var(--text-muted)]"
                >
                  {texts.max}: {maxAmount.toLocaleString()}
                </button>
              </div>
            ) : (
              <p className="mt-3 text-xs text-center text-[var(--text-muted)]">
                {lang === "en" ? "Amount is fixed by administrator" : "Сумма зафиксирована администратором"}
              </p>
            )}
          </div>
          <button
            onClick={generatePayment}
            className="w-full bg-[#f59e0b] border-none text-[#0d0d1a] font-bold text-lg py-4 rounded-full cursor-pointer flex items-center justify-center gap-3 hover:bg-[#d97706] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path d="M18 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
            </svg>
            {texts.connect}
          </button>
          <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
            <p className="text-[13px] text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> {texts.secure}
            </p>
          </div>
        </>
      )}

      {/* ═══ ШАГ: Генерация ═══ */}
      {step === "generating" && (
        <div className="py-12 text-center">
          <Loader2 className="w-10 h-10 text-[#f59e0b] animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-[var(--text-heading)] mb-2">{texts.generating}</p>
          <p className="text-sm text-[var(--text-muted)]">{texts.generatingHint}</p>
        </div>
      )}

      {/* ═══ ШАГ: Ожидание (polling) ═══ */}
      {step === "polling" && (
        <div className="py-8 text-center">
          <Loader2 className="w-10 h-10 text-[#f59e0b] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-heading)] mb-2">{texts.polling}</h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">{texts.pollingHint}</p>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mb-4 border border-[var(--border-default)]">
            <span className="text-2xl font-bold text-[var(--text-heading)]">{amount}</span>
            <span className="text-sm font-bold text-[var(--text-muted)] ml-2">{texts.currency}</span>
          </div>
          {countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
              <Clock className="w-4 h-4" />
              <span>{texts.countdown} <span className="text-[#f59e0b] font-mono font-bold">{formatCountdown(countdown)}</span></span>
            </div>
          )}
          <div className="mt-5 pt-4 border-t border-[var(--border-default)]">
            <button
              onClick={() => { clearSession(); stopPolling(); stopCountdown(); setStep("form"); }}
              className="px-6 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] transition-colors cursor-pointer"
            >
              {texts.close}
            </button>
          </div>
        </div>
      )}

      {/* ═══ ШАГ: Оплата (URL ready) ═══ */}
      {step === "payment" && (
        <>
          <h3 className="text-xl font-bold text-[#f59e0b] mb-2">{texts.paymentTitle}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">{texts.paymentDesc}</p>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-4 mb-4 border border-[var(--border-default)] text-center">
            <span className="text-3xl font-bold text-[var(--text-heading)]">{amount}</span>
            <span className="text-lg font-bold text-[var(--text-muted)] ml-2">{texts.currency}</span>
          </div>
          {countdown > 0 && (
            <div className="text-center mb-4">
              <span className="text-xs text-[var(--text-muted)]">
                {texts.countdown}: <span className="text-[#f59e0b] font-mono font-bold">{formatCountdown(countdown)}</span>
              </span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              type="button"
              onClick={() => {
                if (!paymentUrl) return;
                const w = 578;
                const h = 902;
                const left = Math.max(0, Math.round((window.screen.width - w) / 2));
                const top = Math.max(0, Math.round((window.screen.height - h) / 2));
                const features = `popup=yes,width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no`;
                const win = window.open(paymentUrl, "ultra_proxy_pay", features);
                if (!win) window.open(paymentUrl, "_blank", "noopener,noreferrer");
              }}
              className="w-full sm:flex-1 bg-[#f59e0b] border-none text-[#0d0d1a] font-bold text-base py-3.5 rounded-xl cursor-pointer flex items-center justify-center gap-2 hover:bg-[#d97706] transition-colors"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span className="text-center leading-tight">{texts.openPayment}</span>
            </button>
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto sm:shrink-0 px-4 py-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
              {copied ? texts.copied : texts.copyLink}
            </button>
          </div>
          <div className="pt-4 border-t border-[var(--border-default)]">
            <p className="text-[13px] text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> {texts.secure}
            </p>
          </div>
        </>
      )}

      {/* ═══ ШАГ: Успех ═══ */}
      {step === "success" && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">{texts.successTitle}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{texts.successDesc}</p>
          <button
            onClick={closeModal}
            className="px-8 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white font-semibold hover:bg-[var(--color-primary)]/12 transition-colors cursor-pointer"
          >
            {texts.close}
          </button>
        </div>
      )}

      {/* ═══ ШАГ: Истекла ═══ */}
      {step === "expired" && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f59e0b]/15 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-[#f59e0b]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">{texts.expiredTitle}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{texts.expiredDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { setErrorMsg(""); setStep("form"); }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#f59e0b] text-[#0d0d1a] font-bold hover:bg-[#d97706] transition-colors cursor-pointer border-none"
            >
              {texts.tryAgain}
            </button>
            <button
              onClick={closeModal}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white font-semibold hover:bg-[var(--color-primary)]/12 transition-colors cursor-pointer"
            >
              {texts.close}
            </button>
          </div>
        </div>
      )}

      {/* ═══ ШАГ: Ошибка ═══ */}
      {step === "error" && (
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/15 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-[var(--color-error)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2">{texts.errorTitle}</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">{texts.errorDesc}</p>
          {errorMsg && (
            <p className="text-xs text-[var(--color-error)] mb-4 bg-[var(--color-error)]/8 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStep("form"); setErrorMsg(""); }}
              className="px-6 py-3 rounded-xl bg-[#f59e0b] text-[#0d0d1a] font-bold hover:bg-[#d97706] transition-colors cursor-pointer border-none"
            >
              {texts.tryAgain}
            </button>
            <button
              onClick={closeModal}
              className="px-6 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white font-semibold hover:bg-[var(--color-primary)]/12 transition-colors cursor-pointer"
            >
              {texts.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

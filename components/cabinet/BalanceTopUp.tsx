"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { WalletIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { formatPrice, type Locale } from "@/lib/products";
import { BALANCE_TOPUP_AMOUNTS_CENTS } from "@/lib/pricing";
import { track, AnalyticsEvents } from "@/lib/analytics/events";

/**
 * Balance top-up entry: opens the amount picker (600 € / 700 €) and hands
 * off to Stripe Checkout directly — no cart involved. Payment-safety rules
 * baked in: only whitelisted amounts are ever sent, one request in flight,
 * and every fallible step is wrapped so failures surface as toasts.
 */
export function BalanceTopUp({ className }: { className?: string }) {
  const t = useTranslations("cabinet.topup");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState<number | null>(null);
  const [pending, setPending] = React.useState(false);

  // Come back from Stripe with ?topup=success|cancel → toast + clean the URL.
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const result = params.get("topup");
    if (!result) return;
    params.delete("topup");
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}`,
    );
    if (result === "success") toast.success(t("successToast"));
    else toast.error(t("cancelToast"));
  }, [t]);

  async function startTopup() {
    if (pending) return;
    if (amount === null) {
      toast.error(t("chooseAmount"));
      return;
    }
    setPending(true);
    track(AnalyticsEvents.CHECKOUT_START, { kind: "balance_topup", total_cents: amount });
    try {
      const response = await fetch("/api/balance/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: amount, locale }),
      });
      // Exhaust the body even on failure so the connection is never left open.
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (response.ok && data.url) {
        window.location.assign(data.url);
        return; // navigation takes over; keep `pending` set
      }
      if (response.status === 401) {
        toast.error(t("loginRequired"));
      } else if (response.status === 503) {
        toast.error(tCheckout("notConfigured"));
      } else {
        toast.error(t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setPending(false);
    }
  }

  function closeModal() {
    if (pending) return; // don't leave a started payment half-open
    setOpen(false);
    setAmount(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        <WalletIcon className="w-4 h-4" />
        {t("label")}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("title")}
          className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/50 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[420px] rounded-2xl border bg-card p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight">{t("title")}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t("desc")}</p>
              </div>
              <button
                type="button"
                aria-label="×"
                onClick={closeModal}
                disabled={pending}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2">
              {BALANCE_TOPUP_AMOUNTS_CENTS.map((cents) => (
                <button
                  key={cents}
                  type="button"
                  onClick={() => setAmount(cents)}
                  aria-pressed={amount === cents}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    amount === cents
                      ? "border-primary bg-primary/10"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg font-bold tabular-nums">
                    {formatPrice(cents, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {cents === BALANCE_TOPUP_AMOUNTS_CENTS[0]
                      ? t("amount600")
                      : t("amount700")}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={startTopup}
              disabled={pending || amount === null}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
            >
              {pending ? t("paying") : t("pay")}
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {t("note")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

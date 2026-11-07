"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";

/** Clears the cart only after a real Stripe redirect back with a session id. */
export function CheckoutSuccess() {
  const t = useTranslations("checkout");
  const { clear } = useCart();
  const sessionId = useSearchParams().get("session_id");

  React.useEffect(() => {
    if (sessionId) clear();
  }, [sessionId, clear]);

  return (
    <div className="mx-auto max-w-xl rounded-xl border bg-card p-8 text-center">
      <CheckCircle2Icon className="mx-auto size-10 text-emerald-500" />
      <h2 className="mt-4 text-xl font-bold">{t("successTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("successText")}</p>
      {sessionId && (
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          {t("orderId")}: {sessionId.slice(-12).toUpperCase()}
        </p>
      )}
      <Button asChild className="mt-6">
        <Link href="/shop">{t("backToShop")}</Link>
      </Button>
    </div>
  );
}

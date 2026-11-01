"use client";

import { ArrowDownToLineIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Demo withdrawal: real payout requests will be wired to the
 * balances/payouts API together with the partner billing backend.
 */
export function WithdrawButton() {
  const t = useTranslations("cabinet");

  return (
    <button
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      onClick={() => toast.info(t("withdrawDemo"))}
    >
      <ArrowDownToLineIcon className="size-4" />
      {t("withdraw")}
    </button>
  );
}

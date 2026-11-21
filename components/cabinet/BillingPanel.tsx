"use client";

/** «Оплата» (владелец 22.11 №7): последний способ оплаты + таблица всех
 *  оплат, где каждая строка — закрытый спойлер: по нажатию разворачивается
 *  полная информация о платеже с чеком (BrandedQr с атомом). Данные —
 *  демо-покупки (как и вся витрина кабинета) до подключения живых заказов. */

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDownIcon, CreditCardIcon } from "lucide-react";

import { DEMO_PURCHASES, type DemoPurchase } from "@/lib/partner-demo";
import { formatPrice, type Locale } from "@/lib/products";
import { ReceiptPrint } from "@/components/checkout/ReceiptPrint";

const STATUS_CHIP: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  confirmed: "bg-sky-500/10 text-sky-600 dark:text-sky-600",
  processing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function BillingPanel({ onDemoNote }: { onDemoNote: string }) {
  const t = useTranslations("cabinet.billing");
  const locale = useLocale() as Locale;
  const [openId, setOpenId] = React.useState<string | null>(null);

  const rows = [...DEMO_PURCHASES].sort((a, b) => b.date.localeCompare(a.date));
  const last = rows[0];
  const lastMethodLabel = t("methodCard");

  return (
    <div className="flex flex-col gap-6">
      {/* Последний способ оплаты */}
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <CreditCardIcon className="size-5 text-primary" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("lastMethod")}
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {last ? `${lastMethodLabel} · ${t("methodMask")}` : t("noPayments")}
          </p>
        </div>
      </div>

      {/* Таблица оплат — строки-спойлеры */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">{t("date")}</th>
              <th className="px-4 py-2.5 font-medium">{t("item")}</th>
              <th className="px-4 py-2.5 text-right font-medium">{t("amount")}</th>
              <th className="w-10 px-4 py-2.5" aria-label={t("toggle")} />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((purchase) => (
              <BillingRow
                key={purchase.id}
                purchase={purchase}
                open={openId === purchase.id}
                onToggle={() => setOpenId((id) => (id === purchase.id ? null : purchase.id))}
                locale={locale}
                onDemoNote={onDemoNote}
              />
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">{onDemoNote}</p>
    </div>
  );
}

function BillingRow({
  purchase,
  open,
  onToggle,
  locale,
  onDemoNote,
}: {
  purchase: DemoPurchase;
  open: boolean;
  onToggle: () => void;
  locale: Locale;
  onDemoNote: string;
}) {
  const t = useTranslations("cabinet.billing");

  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer bg-card transition-colors hover:bg-muted/40 ${open ? "bg-muted/40" : ""}`}
        aria-expanded={open}
      >
        <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
          {new Intl.DateTimeFormat(locale).format(new Date(`${purchase.date}T00:00:00`))}
        </td>
        <td className="px-4 py-3">
          <span className="font-medium">{purchase.title[locale]}</span>
          <span className={`ms-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CHIP[purchase.status]}`}>
            {t(`status_${purchase.status}`)}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
          {formatPrice(purchase.amountCents, locale)}
        </td>
        <td className="px-4 py-3 text-right">
          <ChevronDownIcon
            className={`ms-auto size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </td>
      </tr>
      {open && (
        <tr className="bg-muted/30">
          <td colSpan={4} className="px-4 py-4">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("orderId")}</dt>
                  <dd className="font-mono font-medium">{`RT-${purchase.id.toUpperCase()}`}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("qty")}</dt>
                  <dd className="tabular-nums">{purchase.qty}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("status_label")}</dt>
                  <dd>{t(`status_${purchase.status}`)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("methodLabel")}</dt>
                  <dd className="font-medium">{t("methodCard")}</dd>
                </div>
              </dl>
              {/* Чек с брендированным QR (печать по кнопке в чеке) */}
              <div className="w-fit max-w-full">
                <ReceiptPrint
                  code={`RT-${purchase.id.toUpperCase()}`}
                  lines={[
                    { label: purchase.title[locale], value: `×${purchase.qty}` },
                  ]}
                  total={formatPrice(purchase.amountCents, locale)}
                  thanks={onDemoNote}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

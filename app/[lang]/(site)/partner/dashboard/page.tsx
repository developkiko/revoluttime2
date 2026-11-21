import type { Metadata } from "next";
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  CircleDotIcon,
  CoinsIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  PercentIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  DEMO_BALANCE_CENTS,
  DEMO_BONUSES,
  DEMO_NETWORK_CHILDREN,
  DEMO_OWN_OPS,
  DEMO_PARTNERS,
  DEMO_PURCHASES,
} from "@/lib/partner-demo";
import { formatPrice, type Locale } from "@/lib/products";
import { ReferralLink } from "@/components/cabinet/ReferralLink";
import { WithdrawButton } from "@/components/cabinet/WithdrawButton";
import { CabinetStatusBridge } from "@/components/cabinet/CabinetStatusBridge";
import { BalanceTopUp } from "@/components/cabinet/BalanceTopUp";
import { CabinetTabs, type CabinetTabDef } from "@/components/cabinet/CabinetTabs";
import { PartnerNetworkLazy } from "@/components/partner/PartnerNetworkLazy";
import { getSessionUser } from "@/lib/auth-session";

const LEVEL_CHIP: Record<string, string> = {
  I: "bg-sky-500",
  II: "bg-violet-500",
  III: "bg-amber-500",
  IV: "bg-emerald-500",
  V: "bg-rose-500",
};

const STATUS_CHIP: Record<string, string> = {
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  confirmed: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  processing: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export async function generateMetadata(
  props: PageProps<"/[lang]/partner/dashboard">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "cabinet.meta" });
  return { title: t("title"), robots: { index: false } };
}

/**
 * Кабинет партнёра (владелец 22.11 №7): выделен из /cabinet на отдельную
 * страницу — Сводка (бывший «Обзор») / Сеть (без начислений) / Платежи
 * (начисления из бывшей Сети + собственные пополнения и выводы).
 */
export default async function PartnerDashboardPage({
  params,
}: PageProps<"/[lang]/partner/dashboard">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const locale = lang as Locale;
  const t = await getTranslations("partnerDash");
  const tc = await getTranslations("cabinet");
  const user = await getSessionUser();

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <UsersIcon className="size-10 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold tracking-tight">{tc("loginRequired")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">{tc("loginHint")}</p>
      </section>
    );
  }

  const activePartners = DEMO_PARTNERS.filter((p) => p.status === "active").length;
  const totalEarned = DEMO_BONUSES.reduce((s, b) => s + b.amountCents, 0);

  const tabs: CabinetTabDef[] = [
    {
      id: "summary",
      hash: "summary",
      extraHashes: ["balance", "overview"],
      label: t("tabs.summary"),
      icon: <LayoutDashboardIcon className="size-4" />,
      content: (
        // Бывшая вкладка «Обзор» кабинета (№7)
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="mb-3 text-center text-[2rem] font-bold text-foreground sm:text-[2.5rem]">
              {tc("title")}
            </h1>
            <h2 className="mb-10 text-center text-base font-medium text-muted-foreground sm:text-lg">
              {tc("subtitle")}
            </h2>

            <div className="mx-auto grid max-w-[1100px] gap-4 md:grid-cols-3 md:items-stretch">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/[0.03] p-5 text-center opacity-70">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2Icon className="size-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-green-400">{tc("steps.done.title")}</div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{tc("steps.done.desc")}</div>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 whitespace-nowrap font-mono text-xs text-green-500/70">
                  <CheckCircle2Icon className="size-3" /> {tc("steps.done.flag")}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3 rounded-xl border border-orange-500/30 bg-orange-500/[0.06] p-5 text-center">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15">
                  <CircleDotIcon className="size-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-orange-400">{tc("steps.activate.title")}</div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{tc("steps.activate.desc")}</div>
                </div>
                <BalanceTopUp className="mt-auto inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/20 px-4 py-2 text-sm font-semibold text-orange-400 transition-colors hover:bg-orange-500/30" />
              </div>

              <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5 text-center opacity-70">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <CircleAlertIcon className="size-6 text-red-400/70" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-red-400/70">{tc("steps.invite.title")}</div>
                  <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{tc("steps.invite.desc")}</div>
                </div>
                <a
                  href="#network"
                  className="mt-auto shrink-0 rounded-lg border border-red-500/25 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/25"
                >
                  {tc("steps.invite.btn")}
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {tc("balance")}
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums">
                {formatPrice(DEMO_BALANCE_CENTS, locale)}
              </p>
              <WithdrawButton />
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {tc("partnersCount")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold tabular-nums">
                <UsersIcon className="size-6 text-primary" />
                {DEMO_PARTNERS.length}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("partnersActive", { count: activePartners })}
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {tc("ordersCount")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold tabular-nums">
                <ShoppingBagIcon className="size-6 text-primary" />
                {DEMO_PURCHASES.length}
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {tc("earnedTotal")}
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-bold tabular-nums">
                <TrendingUpIcon className="size-6 text-emerald-500" />
                {formatPrice(totalEarned, locale)}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <PercentIcon className="size-3" />
                {tc("commissionNote")}
              </p>
            </div>
          </div>

          {/* Рефссылка — карточка из бывшего «Профиля» партнёрки */}
          <ReferralLink email={user.email} stats={{ total: DEMO_PARTNERS.length, yesterday: 0, lastWeek: 1 }} />
        </div>
      ),
    },
    {
      id: "network",
      hash: "network",
      extraHashes: ["partners"],
      label: t("tabs.network"),
      icon: <NetworkIcon className="size-4" />,
      content: (
        // №7: Сеть как была, но БЕЗ блока «Партнёрские начисления» (уехал в Платежи)
        <>
          <PartnerNetworkLazy
            me={{
              id: "you",
              name: user.name ?? "RevolutTIME",
              joined: "2026-09-01",
              avatar: user.picture,
            }}
            childrenByNode={DEMO_NETWORK_CHILDREN}
            profileHref="/partner/dashboard#network"
            youActions={[
              { label: tc("balance"), href: "/partner/dashboard#summary" },
              { label: t("payments"), href: "/partner/dashboard#payments" },
              { label: tc("myPartners"), href: "/partner/dashboard#network" },
            ]}
          />

          <h2 className="mt-8 text-xl font-bold tracking-tight">{tc("myPartners")}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_PARTNERS.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <span className={`flex size-9 items-center justify-center rounded-full text-sm font-bold text-white ${LEVEL_CHIP[p.level]}`}>
                  {p.level}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(locale).format(new Date(`${p.joined}T00:00:00`))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {formatPrice(p.earnedCents, locale)}
                  </p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CHIP[p.status]}`}>
                    {tc(`status_${p.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      id: "payments",
      hash: "payments",
      extraHashes: ["bonuses"],
      label: t("tabs.payments"),
      icon: <WalletIcon className="size-4" />,
      content: (
        <>
          {/* №7: начисления переехали из «Сети» */}
          <h2 className="text-xl font-bold tracking-tight">{tc("partnerAccruals")}</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{tc("date")}</th>
                  <th className="px-4 py-2.5 font-medium">{tc("from")}</th>
                  <th className="px-4 py-2.5 font-medium">{tc("level")}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{tc("amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {DEMO_BONUSES.map((b) => (
                  <tr key={b.id} className="bg-card">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                      {new Intl.DateTimeFormat(locale).format(new Date(`${b.date}T00:00:00`))}
                    </td>
                    <td className="px-4 py-3 font-medium">{b.fromName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-bold text-white ${LEVEL_CHIP[b.level]}`}>
                        {b.level}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatPrice(b.amountCents, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Собственные пополнения и выводы (№7) */}
          <h2 className="mt-10 flex items-center gap-2 text-xl font-bold tracking-tight">
            <CoinsIcon className="size-5 text-primary" />
            {t("ownOps")}
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">{tc("date")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("kind")}</th>
                  <th className="px-4 py-2.5 font-medium">{t("status")}</th>
                  <th className="px-4 py-2.5 text-right font-medium">{tc("amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...DEMO_OWN_OPS]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((op) => (
                    <tr key={op.id} className="bg-card">
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                        {new Intl.DateTimeFormat(locale).format(new Date(`${op.date}T00:00:00`))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          {op.kind === "topup" ? (
                            <TrendingUpIcon className="size-4 text-primary" />
                          ) : (
                            <WalletIcon className="size-4 text-muted-foreground" />
                          )}
                          {op.kind === "topup" ? t("kindTopup") : t("kindWithdraw")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CHIP[op.status]}`}>
                          {t(`op_${op.status}`)}
                        </span>
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums ${
                          op.kind === "topup"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {op.kind === "topup" ? "+" : "−"}
                        {formatPrice(op.amountCents, locale)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{tc("demoNote")}</p>
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Кабинет-режим шапки и здесь (№13 — «Главное меню» сворачивает) */}
      <CabinetStatusBridge
        balanceLabel={formatPrice(DEMO_BALANCE_CENTS, locale)}
        partnersCount={DEMO_PARTNERS.length}
        userName={user.name ?? user.email}
      />

      <CabinetTabs ariaLabel={tc("title")} tabs={tabs} />
    </div>
  );
}

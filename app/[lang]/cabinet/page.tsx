import type { Metadata } from "next";
import {
  PercentIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  DEMO_BALANCE_CENTS,
  DEMO_BONUSES,
  DEMO_PARTNERS,
  DEMO_PURCHASES,
} from "@/lib/partner-demo";
import { formatPrice, type Locale } from "@/lib/products";
import { ProfileCard } from "@/components/cabinet/ProfileCard";
import { ReferralLink } from "@/components/cabinet/ReferralLink";
import { WithdrawButton } from "@/components/cabinet/WithdrawButton";
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
};

export async function generateMetadata(
  props: PageProps<"/[lang]/cabinet">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "cabinet.meta" });
  return { title: t("title"), robots: { index: false } };
}

export default async function CabinetPage({
  params,
}: PageProps<"/[lang]/cabinet">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const locale = lang as Locale;
  const t = await getTranslations("cabinet");
  const user = await getSessionUser();

  if (!user) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <UsersIcon className="size-10 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold tracking-tight">{t("loginRequired")}</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {t("loginHint")}
        </p>
      </section>
    );
  }

  const activePartners = DEMO_PARTNERS.filter((p) => p.status === "active").length;
  const totalEarned = DEMO_BONUSES.reduce((s, b) => s + b.amountCents, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {t("title")}
      </h1>

      {/* Balance + stats */}
      <div id="balance" className="mt-6 grid scroll-mt-20 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("balance")}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {formatPrice(DEMO_BALANCE_CENTS, locale)}
          </p>
          <WithdrawButton />
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("partnersCount")}
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
            {t("ordersCount")}
          </p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold tabular-nums">
            <ShoppingBagIcon className="size-6 text-primary" />
            {DEMO_PURCHASES.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("earnedTotal")}
          </p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-bold tabular-nums">
            <TrendingUpIcon className="size-6 text-emerald-500" />
            {formatPrice(totalEarned, locale)}
          </p>
          <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <PercentIcon className="size-3" />
            {t("commissionNote")}
          </p>
        </div>
      </div>

      {/* Profile + referral link */}
      <div id="profile" className="mt-8 grid scroll-mt-20 gap-6 lg:grid-cols-2">
        <ProfileCard user={user} />
        <ReferralLink email={user.email} />
      </div>

      {/* Interactive partner network (You + 5 direct lines) */}
      <section id="network" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold tracking-tight">{t("network")}</h2>
        <PartnerNetworkLazy
          className="mt-4"
          me={{
            id: "you",
            name: user.name ?? "RevolutTIME",
            joined: "2026-09-01", // TODO(profile API): real registration date
          }}
          partners={DEMO_PARTNERS.map((partner) => ({
            id: partner.id,
            name: partner.name,
            joined: partner.joined,
            badge: `${partner.level}`,
          }))}
          profileHref="/cabinet#partners"
          youActions={[
            { label: t("balance"), href: "/cabinet#balance" },
            { label: t("purchases"), href: "/cabinet#purchases" },
            { label: t("bonuses"), href: "/cabinet#bonuses" },
            { label: t("myPartners"), href: "/cabinet#partners" },
          ]}
        />
      </section>

      {/* Purchase history */}
      <section id="purchases" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold tracking-tight">{t("purchases")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("date")}</th>
                <th className="px-4 py-2.5 font-medium">{t("item")}</th>
                <th className="px-4 py-2.5 font-medium">{t("qty")}</th>
                <th className="px-4 py-2.5 font-medium">{t("status")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {DEMO_PURCHASES.map((p) => (
                <tr key={p.id} className="bg-card">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                    {new Intl.DateTimeFormat(locale).format(new Date(`${p.date}T00:00:00`))}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title[locale]}</td>
                  <td className="px-4 py-3 tabular-nums">{p.qty}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CHIP[p.status]}`}>
                      {t(`status_${p.status}`)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums">
                    {formatPrice(p.amountCents, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bonus history */}
      <section id="bonuses" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold tracking-tight">{t("bonuses")}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">{t("date")}</th>
                <th className="px-4 py-2.5 font-medium">{t("from")}</th>
                <th className="px-4 py-2.5 font-medium">{t("level")}</th>
                <th className="px-4 py-2.5 text-right font-medium">{t("amount")}</th>
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
      </section>

      {/* Partners */}
      <section id="partners" className="mt-10 scroll-mt-20">
        <h2 className="text-xl font-bold tracking-tight">{t("myPartners")}</h2>
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
                  {t(`status_${p.status}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t("demoNote")}</p>
      </section>
    </div>
  );
}

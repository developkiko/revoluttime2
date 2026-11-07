import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BarChart3Icon,
  InfinityIcon,
  PercentIcon,
  ZapIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CtaBanner } from "@/components/layout/CtaBanner";
import { PartnerStepsLazy } from "@/components/partner/PartnerStepsLazy";
import { LevelsCascadeLazy } from "@/components/partner/LevelsCascadeLazy";
import { SITE, formatPrice, type Locale } from "@/lib/products";
import {
  LEVEL_SHARES,
  MLM_LEVELS,
  PARTNER_FUND_RATIO,
  payoutTable,
} from "@/lib/mlm-calculator";

const BENEFITS = [
  { key: "commission", icon: PercentIcon },
  { key: "lifetime", icon: InfinityIcon },
  { key: "instant", icon: ZapIcon },
  { key: "transparent", icon: BarChart3Icon },
] as const;

export async function generateMetadata(
  props: PageProps<"/[lang]/partner">
): Promise<Metadata> {
  const { lang } = await props.params;
  const t = await getTranslations({ locale: lang, namespace: "meta.partner" });
  return { title: t("title"), description: t("description") };
}

export default async function PartnerPage({
  params,
}: PageProps<"/[lang]/partner">) {
  const { lang } = await params;
  setRequestLocale(lang);
  const t = await getTranslations("partner");
  const payouts = payoutTable();

  return (
    <>
      <section className="relative overflow-hidden bg-muted/40">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] size-[32rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <p className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {t("hero.badge")}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.titleAccent")}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("how.title")}
          </h2>
          <div className="mt-8 sm:max-w-2xl">
            <PartnerStepsLazy />
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("benefits.title")}
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ key, icon: Icon }) => (
              <Card key={key}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">
                    {t(`benefits.items.${key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`benefits.items.${key}.text`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("levels.title")}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {t("levels.subtitle")}
            </p>
            <div className="mt-8 rounded-2xl border bg-card p-6">
              <h3 className="font-semibold">{t("payouts.title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("payouts.text")}
              </p>
            </div>
          </div>
          <div className="self-center lg:self-end">
            <LevelsCascadeLazy />
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("fund.title")}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("fund.subtitle")}
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t("fund.colLevel")}</th>
                  <th className="px-4 py-3 font-medium">{t("fund.colShare")}</th>
                  {payouts.map((sku) => (
                    <th key={sku.packId} className="px-4 py-3 font-medium">
                      {sku.tablets} · {formatPrice(sku.priceCents, lang as Locale)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {MLM_LEVELS.map((level) => (
                  <tr key={level}>
                    <td className="px-4 py-3 font-semibold">
                      {t("fund.levelName", { level })}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {LEVEL_SHARES[level] * 100} %
                    </td>
                    {payouts.map((sku) => (
                      <td
                        key={`${sku.packId}-${level}`}
                        className="px-4 py-3 tabular-nums font-medium"
                      >
                        {formatPrice(sku.payouts[level], lang as Locale)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t bg-muted/50 font-semibold">
                  <td className="px-4 py-3">{t("fund.fundRow")}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {PARTNER_FUND_RATIO * 100} %
                  </td>
                  {payouts.map((sku) => (
                    <td key={`fund-${sku.packId}`} className="px-4 py-3 tabular-nums">
                      {formatPrice(sku.fundCents, lang as Locale)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {t("fund.footnote")}
          </p>
        </div>
      </section>

      <CtaBanner
        title={t("cta.title")}
        text={t("cta.text")}
        buttonLabel={t("cta.button")}
        href={SITE.whatsapp}
        external
      />
    </>
  );
}

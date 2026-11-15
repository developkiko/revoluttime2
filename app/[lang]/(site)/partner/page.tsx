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
import { PartnerNetworkLazy } from "@/components/partner/PartnerNetworkLazy";
import { LevelsCascadeLazy } from "@/components/partner/LevelsCascadeLazy";
import { SITE, formatPrice, type Locale } from "@/lib/products";
import { payoutTable } from "@/lib/mlm-calculator";

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
  const tDiagram = await getTranslations("home.diagram");

  // The same referral-tree demo data as on the home page (ui.md 2.1):
  // referral-1 -> 2 subs (one with its own sub), referral-3 -> 1 sub.
  const partners = [1, 2, 3, 4, 5].map((index) => ({
    id: `referral-${index}`,
    name: tDiagram(`referral${index}`),
    joined: `2026-10-${String(index * 4).padStart(2, "0")}`,
  }));
  const networkChildren = {
    you: partners,
    "referral-1": [
      { id: "referral-1a", name: tDiagram("sub1"), joined: "2026-11-02" },
      { id: "referral-1b", name: tDiagram("sub2"), joined: "2026-11-05" },
    ],
    "referral-1a": [
      { id: "referral-1a1", name: tDiagram("sub3"), joined: "2026-11-09" },
    ],
    "referral-3": [
      { id: "referral-3a", name: tDiagram("sub4"), joined: "2026-11-07" },
    ],
  };
  const { rows: planRows, totals: planTotals } = payoutTable();

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
          {/* Steps left, live referral-tree module right (spec ui.md 2.1) —
              the same component as on the home page and in the cabinet. */}
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="sm:max-w-2xl">
              <PartnerStepsLazy />
            </div>
            <PartnerNetworkLazy
              me={{ id: "you", name: tDiagram("you"), joined: "2026-09-01" }}
              childrenByNode={networkChildren}
              colored
              profileHref="/cabinet#network"
            />
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
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">{t("fund.colLevel")}</th>
                  <th className="px-4 py-3 font-medium">{t("fund.colShare")}</th>
                  <th className="px-4 py-3 font-medium">{t("fund.colPartners")}</th>
                  <th className="px-4 py-3 font-medium">{t("fund.colPerPerson")}</th>
                  <th className="px-4 py-3 font-medium">{t("fund.colSubtotal")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {planRows.map((row) => (
                  <tr key={row.level}>
                    <td className="px-4 py-3 font-semibold">
                      {t("fund.levelName", { level: row.level })}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {row.share * 100} %
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {row.partners.toLocaleString(lang)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">
                      {formatPrice(row.perPersonCents, lang as Locale)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">
                      {formatPrice(row.subtotalCents, lang as Locale)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t bg-muted/50 font-semibold">
                  <td className="px-4 py-3">{t("fund.totalRow")}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 tabular-nums">
                    {planTotals.partnersTotal.toLocaleString(lang)}
                  </td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 tabular-nums text-primary">
                    {formatPrice(planTotals.potentialCents, lang as Locale)}
                  </td>
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

import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  BarChart3Icon,
  InfinityIcon,
  PercentIcon,
  ZapIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PartnerNetworkLazy } from "@/components/partner/PartnerNetworkLazy";
import { PartnerStepsLazy } from "@/components/partner/PartnerStepsLazy";
import { SITE } from "@/lib/products";

const BENEFITS = [
  { key: "commission", icon: PercentIcon },
  { key: "lifetime", icon: InfinityIcon },
  { key: "instant", icon: ZapIcon },
  { key: "transparent", icon: BarChart3Icon },
] as const;

export async function PartnerSection() {
  const t = await getTranslations("partner");
  const tTeaser = await getTranslations("home.partnerTeaser");
  const tDiagram = await getTranslations("home.diagram");

  const partners = [1, 2, 3, 4, 5].map((index) => ({
    id: `referral-${index}`,
    name: tDiagram(`referral${index}`),
    joined: `2026-10-${String(index * 4).padStart(2, "0")}`,
  }));

  return (
    <section id="partner" className="scroll-mt-16 border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {tTeaser("title")}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {tTeaser("text")}
            </p>
          </div>
          <Button size="lg" className="shrink-0" asChild>
            <Link href="/partner">
              {tTeaser("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <PartnerStepsLazy />

            <ul className="grid gap-2 sm:grid-cols-2">
              {BENEFITS.map(({ key, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm text-muted-foreground"
                >
                  <Icon className="size-4 shrink-0 text-primary" />
                  {t(`benefits.items.${key}.title`)}
                </li>
              ))}
            </ul>
          </div>

          <PartnerNetworkLazy
            me={{ id: "you", name: tDiagram("you"), joined: "2026-09-01" }}
            partners={partners}
            profileHref="/partner"
            youActions={[
              { label: t("cta.button"), href: SITE.whatsapp },
              { label: tTeaser("cta"), href: "/partner" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

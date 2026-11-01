import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  BarChart3Icon,
  InfinityIcon,
  LinkIcon,
  PercentIcon,
  Share2Icon,
  UserPlusIcon,
  WalletIcon,
  ZapIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ReferralDiagram } from "@/components/home/ReferralDiagram";

const HOW_STEPS = [
  { key: "step1", icon: UserPlusIcon },
  { key: "step2", icon: LinkIcon },
  { key: "step3", icon: Share2Icon },
  { key: "step4", icon: WalletIcon },
] as const;

const BENEFITS = [
  { key: "commission", icon: PercentIcon },
  { key: "lifetime", icon: InfinityIcon },
  { key: "instant", icon: ZapIcon },
  { key: "transparent", icon: BarChart3Icon },
] as const;

export async function PartnerSection() {
  const t = await getTranslations("partner");
  const tTeaser = await getTranslations("home.partnerTeaser");

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
            <ol className="grid gap-3 sm:grid-cols-2">
              {HOW_STEPS.map(({ key, icon: Icon }, index) => (
                <li key={key} className="rounded-2xl border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {index + 1}/4
                    </span>
                  </div>
                  <h3 className="mt-2 font-semibold">
                    {t(`how.steps.${key}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t(`how.steps.${key}.text`)}
                  </p>
                </li>
              ))}
            </ol>

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

          <ReferralDiagram />
        </div>
      </div>
    </section>
  );
}

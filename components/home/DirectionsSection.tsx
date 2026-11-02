import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  CoinsIcon,
  DropletsIcon,
  MountainIcon,
  SparklesIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface Direction {
  key: string;
  href: string;
  icon: LucideIcon;
}

/** The five company directions as defined by the owner. */
const DIRECTIONS: Direction[] = [
  { key: "tablets", href: "/shop", icon: DropletsIcon },
  { key: "studio", href: "/studio", icon: SparklesIcon },
  { key: "equipment", href: "/equipment", icon: WrenchIcon },
  { key: "recreation", href: "/recreation", icon: MountainIcon },
  { key: "partner", href: "/partner", icon: CoinsIcon },
];

export async function DirectionsSection() {
  const t = await getTranslations("home.directions");

  return (
    <section id="directions" className="scroll-mt-16 border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIRECTIONS.map(({ key, href, icon: Icon }) => (
            <Card key={key} className="group transition-shadow hover:shadow-md">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <h3 className="font-semibold leading-snug">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.text`)}
                </p>
                <Link
                  href={href}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {t(`items.${key}.cta`)}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

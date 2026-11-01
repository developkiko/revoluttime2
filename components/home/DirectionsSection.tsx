import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  BikeIcon,
  DropletsIcon,
  MountainIcon,
  PillIcon,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface Direction {
  key: string;
  href: string;
  icon: LucideIcon;
  /** Card 2 is a sub-page of card 1 → visually grouped. */
  sub?: boolean;
}

const DIRECTIONS: Direction[] = [
  { key: "hydrogen", href: "/hydrogen", icon: DropletsIcon },
  { key: "tablets", href: "/hydrogen/tablets", icon: PillIcon, sub: true },
  { key: "recreation", href: "/recreation", icon: MountainIcon },
  { key: "tourism", href: "/tourism", icon: BikeIcon },
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

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DIRECTIONS.map(({ key, href, icon: Icon, sub }) => (
            <Card
              key={key}
              className={sub ? "border-dashed bg-transparent shadow-none" : undefined}
            >
              <CardContent className="flex h-full flex-col gap-3 p-6">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${
                    sub
                      ? "bg-card text-primary ring-1 ring-border"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold leading-snug">
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

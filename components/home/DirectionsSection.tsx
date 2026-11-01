import { getTranslations } from "next-intl/server";
import {
  ArrowRightIcon,
  DropletsIcon,
  DumbbellIcon,
  UsersIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

const DIRECTIONS = [
  {
    key: "hydrogen",
    href: "/hydrogen",
    icon: DropletsIcon,
  },
  {
    key: "studio",
    href: "/studio",
    icon: DumbbellIcon,
  },
  {
    key: "partner",
    href: "/partner",
    icon: UsersIcon,
  },
] as const;

export async function DirectionsSection() {
  const t = await getTranslations("home.directions");

  return (
    <section id="directions" className="scroll-mt-16 border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {DIRECTIONS.map(({ key, href, icon: Icon }) => (
            <Card key={key} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`items.${key}.text`)}
                </p>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
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

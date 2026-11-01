"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice, PACK_VARIANTS, type Locale } from "@/lib/products";

export function ProductTeaser() {
  const t = useTranslations("home.shopTeaser");
  const tVariants = useTranslations("variants");
  const locale = useLocale() as Locale;

  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <Button asChild>
            <Link href="/shop">
              {t("cta")}
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PACK_VARIANTS.map((pack) => (
            <Link
              key={pack.id}
              href="/shop"
              className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="size-20 shrink-0 overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={pack.image}
                  alt=""
                  width={959}
                  height={1280}
                  sizes="5rem"
                  className="size-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium">
                  {tVariants(`packs.${pack.id}.name` as never)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("details", { tablets: pack.tablets })}
                </p>
                <p className="mt-1 font-semibold">
                  {formatPrice(pack.priceCents, locale)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

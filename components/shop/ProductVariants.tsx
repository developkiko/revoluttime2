"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { GiftIcon, MinusIcon, PlusIcon, ShoppingCartIcon, SparklesIcon } from "lucide-react";
import * as React from "react";

import { useCart } from "@/components/cart/CartProvider";
import { AnalyticsEvents, track } from "@/lib/analytics/events";
import { formatPrice, PACK_VARIANTS, type Locale, type PackId } from "@/lib/products";
import { pricePacks } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNotice } from "@/components/ui/notice";

function PackCard({ packId }: { packId: PackId }) {
  const t = useTranslations("variants");
  const tCart = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { addPack, openCart } = useCart();
  const { notice } = useNotice();

  const pack = PACK_VARIANTS.find((variant) => variant.id === packId)!;
  const [quantity, setQuantity] = React.useState(1);

  // overflow-visible: the featured badge rides on top of the card edge and
  // FX (tilt/spotlight) must not be clipped.
  const pricing = pricePacks(pack, quantity);
  const unitCents = pricing.qualifies ? pack.partnerPriceCents : pack.priceCents;
  const perTablet = formatPrice(Math.round(unitCents / pack.tablets), locale);

  function handleAdd() {
    addPack(pack.id, quantity);
    notice({
      text: tCart("addedToast", { name: t(`packs.${pack.id}.name` as never) }),
      variant: "success",
      action: {
        label: tCart("title"),
        onClick: () => openCart(),
      },
    });
  }

  return (
    <Card className="relative flex flex-col overflow-visible">
      {pack.featured && (
        <p className="absolute -top-3 left-4 z-10 inline-flex items-center gap-1 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-primary-foreground">
          <SparklesIcon className="size-3" />
          {t("featured")}
        </p>
      )}

      <CardHeader className="gap-3">
        <div className="overflow-hidden rounded-xl border bg-muted">
          <Image
            src={pack.image}
            alt={t(`packs.${pack.id}.name` as never)}
            width={959}
            height={1280}
            sizes="(min-width: 768px) 24rem, 90vw"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold">
            {t(`packs.${pack.id}.name` as never)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t(`packs.${pack.id}.note` as never)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="mt-auto">
        <div className="flex flex-wrap items-baseline gap-2">
          {pricing.qualifies && (
            <span className="text-xl font-medium text-muted-foreground line-through decoration-primary/60 decoration-2">
              {formatPrice(pack.priceCents, locale)}
            </span>
          )}
          <span className="text-3xl font-bold tracking-tight">
            {formatPrice(unitCents, locale)}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("perTablet", { price: perTablet })}
          </span>
        </div>
        {pricing.qualifies && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary">
            <GiftIcon className="size-3.5" />
            {t("bonusPack", { count: pricing.bonusPacks })}
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-3">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="−"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => q - 1)}
          >
            <MinusIcon />
          </Button>
          <span
            aria-label={t("packsLabel")}
            className="w-9 text-center font-medium tabular-nums"
          >
            {quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label="+"
            onClick={() => setQuantity((q) => q + 1)}
          >
            <PlusIcon />
          </Button>
        </div>
        <Button className="flex-1" size="lg" onClick={handleAdd}>
          <ShoppingCartIcon />
          {t("cta")}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductVariants() {
  const t = useTranslations("variants");

  React.useEffect(() => {
    track(AnalyticsEvents.PRODUCT_VIEW);
  }, []);

  return (
    <section id="variants" className="scroll-mt-16">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {PACK_VARIANTS.map((pack) => (
            <PackCard key={pack.id} packId={pack.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

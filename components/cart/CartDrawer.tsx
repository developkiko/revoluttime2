"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  Trash2Icon,
  TruckIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, getPack, type Locale } from "@/lib/products";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const t = useTranslations("cart");
  const tVariants = useTranslations("variants");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, add, setQuantity, remove, totalPriceCents } =
    useCart();

  const cartItems = items ?? [];
  const isEmpty = cartItems.length === 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBagIcon className="size-5" />
            {t("title")}
          </SheetTitle>
          {!isEmpty && <SheetDescription>{t("shippingNote")}</SheetDescription>}
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground/40" />
            <p className="font-medium">{t("empty")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyHint")}</p>
            <Button className="mt-4" onClick={closeCart}>
              {tVariants("cta")}
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y overflow-y-auto">
              {cartItems.map((item) => {
                const pack = getPack(item.packId);
                return (
                  <li key={item.packId} className="flex gap-3 p-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pack.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {tVariants(`packs.${item.packId}.name` as never)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(pack.priceCents, locale)}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold tabular-nums">
                          {formatPrice(pack.priceCents * item.quantity, locale)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label={t("remove")}
                            onClick={
                              item.quantity <= 1
                                ? () => remove(item.packId)
                                : () => setQuantity(item.packId, item.quantity - 1)
                            }
                          >
                            {item.quantity <= 1 ? <Trash2Icon /> : <MinusIcon />}
                          </Button>
                          <span
                            className="w-8 text-center font-medium tabular-nums"
                            data-testid={`cart-qty-${item.packId}`}
                          >
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon-sm"
                            aria-label="+"
                            onClick={() => add(item.packId)}
                          >
                            <PlusIcon />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <SheetFooter className="border-t">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t("total")}</span>
                <span className="tabular-nums">
                  {formatPrice(totalPriceCents, locale)}
                </span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">{t("checkout")}</Link>
              </Button>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TruckIcon className="size-3.5 shrink-0" />
                {t("shippingNote")}
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

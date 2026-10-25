"use client";

import { useTranslations } from "next-intl";
import { DropletsIcon, MenuIcon, ShoppingCartIcon } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { localeLabels, routing } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/#variants", key: "product" },
  { href: "/#usage", key: "usage" },
  { href: "/#contact", key: "contact" },
] as const;

function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="language" className={className}>
      {routing.locales.map((locale) => (
        <Button key={locale} variant="ghost" size="sm" asChild>
          <Link href={pathname} locale={locale} className="px-1.5">
            {localeLabels[locale]}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

function CartButton() {
  const t = useTranslations("header");
  const { totalCount, openCart } = useCart();

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative gap-1.5"
      onClick={openCart}
      aria-label={t("cart")}
    >
      <ShoppingCartIcon className="size-4" />
      <span className="sr-only">{t("cart")}</span>
      <span aria-hidden className="hidden sm:inline">
        {t("cart")}
      </span>
      {totalCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}    </Button>
  );
}

function Logo() {
  const t = useTranslations("brand");
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <DropletsIcon className="size-4" />
      </span>
      <span className="text-base font-bold tracking-tight">
        Revolut
        <span className="text-primary">TIME</span>
        <span className="ml-1.5 hidden text-xs font-medium text-muted-foreground sm:inline">
          {t("product")}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Button key={item.key} variant="ghost" size="sm" asChild>
              <a href={item.href}>{t(`nav.${item.key}`)}</a>
            </Button>
          ))}
        </nav>

        <LanguageSwitcher className="ml-auto hidden items-center md:ml-2 md:flex" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <CartButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("openMenu")}
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="pt-2">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {NAV_ITEMS.map((item) => (
                  <SheetClose key={item.key} asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href={item.href}>{t(`nav.${item.key}`)}</a>
                    </Button>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto px-4 pb-6">
                <LanguageSwitcher className="flex gap-1" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

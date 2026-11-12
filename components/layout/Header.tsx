"use client";

import { useLocale, useTranslations } from "next-intl";
import { GlobeIcon, MenuIcon, ShoppingCartIcon } from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { AuthPanel } from "@/components/layout/AuthPanel";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { routing } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { href: "/encyclopedia", key: "encyclopedia" },
  { href: "/shop", key: "tablets" },
  { href: "/studio", key: "studio" },
  { href: "/equipment", key: "equipment" },
  { href: "/recreation", key: "recreation" },
  { href: "/partner", key: "partner" },
] as const;

const LOCALE_NAMES: Record<string, string> = {
  de: "Deutsch",
  ru: "Русский",
  en: "English",
};

function LanguageSwitcher({ compact = true }: { compact?: boolean }) {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 px-2" aria-label={t("language")}>
            <GlobeIcon className="size-4" />
            <span className="text-xs font-semibold uppercase">{locale}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {routing.locales.map((loc) => (
            <DropdownMenuItem
              key={loc}
              disabled={loc === locale}
              onClick={() => router.replace(pathname, { locale: loc })}
            >
              {LOCALE_NAMES[loc]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Expanded variant for the mobile menu.
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("language")}
      </p>
      <div className="flex flex-wrap gap-2">
        {routing.locales.map((loc) => (
          <Button
            key={loc}
            variant={loc === locale ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={pathname} locale={loc}>
              {LOCALE_NAMES[loc]}
            </Link>
          </Button>
        ))}
      </div>
    </div>
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
      <span aria-hidden className="hidden sm:inline">
        {t("cart")}
      </span>
      {totalCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground tabular-nums">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </Button>
  );
}

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4">
        <Link href="/" aria-label="RevolutTIME">
          <Logo size={22} />
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map((item) => (
            <Button key={item.key} variant="ghost" size="sm" asChild>
              <Link href={item.href}>{t(`nav.${item.key}`)}</Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
          {/* Desktop-only controls — on mobile they live inside the menu sheet
              so the menu button can never be pushed off-screen. */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <ThemeToggle />
            <LanguageSwitcher />
            <AuthPanel />
          </div>
          <CartButton />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 lg:hidden"
                aria-label={t("openMenu")}
              >
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col">
              <SheetHeader>
                <SheetTitle className="pt-2 text-left">
                  <Logo size={22} />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/">{t("home")}</Link>
                  </Button>
                </SheetClose>
                {NAV_ITEMS.map((item) => (
                  <SheetClose key={item.key} asChild>
                    <Button variant="ghost" className="justify-start" asChild>
                      <Link href={item.href}>{t(`nav.${item.key}`)}</Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link href="/#contact">{t("nav.contact")}</Link>
                  </Button>
                </SheetClose>
              </nav>
              <div className="mt-auto flex flex-col gap-4 px-4 pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("theme")}
                  </span>
                  <ThemeToggle />
                </div>
                <LanguageSwitcher compact={false} />
                <AuthPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

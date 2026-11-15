"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { AuthPanel } from "@/components/layout/AuthPanel";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { routing } from "@/lib/products";
import { ShoppingCartIcon } from "lucide-react";
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

const LOCALE_CODES: Record<string, string> = {
  de: "DE",
  ru: "RU",
  en: "EN",
};

/* ═══ Exact Ultra template styles (Header.tsx / LangSwitcher.tsx) ═══ */

const NAV_LINK_CLASS =
  "text-sm text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] font-medium whitespace-nowrap";

const ICON_CONTROL_CLASS =
  "inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--hover-bg)] transition-colors shrink-0";

const LANG_PILL_CLASS =
  "text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300";

/** Language pill — template LangSwitcher, adapted to the 3 site locales. */
function LanguageSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex items-center rounded-full p-[2px] bg-[var(--color-primary)]/10 transition-colors">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          className={`${LANG_PILL_CLASS} ${
            loc === locale
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "text-[var(--text-muted)] hover:text-[var(--text-heading)]"
          }`}
          aria-label={loc === locale ? undefined : t("language")}
          disabled={loc === locale}
          onClick={() => router.replace(pathname, { locale: loc })}
        >
          {LOCALE_CODES[loc]}
        </button>
      ))}
    </div>
  );
}

/** Cart — icon only (no label), control styled like the template icon buttons. */
function CartButton() {
  const t = useTranslations("header");
  const { totalCount, openCart } = useCart();

  return (
    <button type="button" className={ICON_CONTROL_CLASS} onClick={openCart} aria-label={t("cart")}>
      <ShoppingCartIcon className="w-4 h-4" />
      {totalCount > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-semibold text-white tabular-nums">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </button>
  );
}

export function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-40 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--border-subtle)]">
      <nav className="relative flex items-center justify-between h-[var(--header-height)] max-w-[var(--max-width)] mx-auto px-6">
        {/* Logo — left (template wordmark) */}
        <Link href="/" className="shrink-0" aria-label="RevolutTIME" data-cursor-logo>
          <Logo />
        </Link>

        {/* Centered nav — template link styles; long site labels need flex
            centering (template's absolute center collides with the user pill) */}
        <div className="hidden xl:flex flex-1 items-center justify-center gap-1 min-w-0">
          {NAV_ITEMS.map((item) => (
            <Link key={item.key} href={item.href} className={NAV_LINK_CLASS}>
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </div>

        {/* Desktop controls — template layout: auth + divider + theme + lang, cart last */}
        <div className="hidden xl:flex items-center gap-2">
          <AuthPanel />
          <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="w-px h-6 bg-[var(--border-default)]" />
          <CartButton />
        </div>

        {/* Mobile: cart + burger (controls live inside the menu sheet) */}
        <div className="flex xl:hidden items-center gap-2">
          <CartButton />
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className="rt-burger shrink-0" aria-label={t("openMenu")}>
                <span className="rt-burger-line" />
                <span className="rt-burger-line" />
                <span className="rt-burger-line" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-72 flex-col max-h-[100dvh] overflow-y-auto pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <SheetHeader>
                <SheetTitle className="pt-2 text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                <SheetClose asChild>
                  <Link href="/" className={NAV_LINK_CLASS}>
                    {t("home")}
                  </Link>
                </SheetClose>
                {NAV_ITEMS.map((item) => (
                  <SheetClose key={item.key} asChild>
                    <Link href={item.href} className={NAV_LINK_CLASS}>
                      {t(`nav.${item.key}`)}
                    </Link>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link href="/#contact" className={NAV_LINK_CLASS}>
                    {t("nav.contact")}
                  </Link>
                </SheetClose>
              </nav>
              <div className="mt-auto flex flex-col gap-4 px-4 pb-6">
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
                <AuthPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

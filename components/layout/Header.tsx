"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { signOut, useAuthUser } from "@/lib/auth-store";
import { AuthPanel } from "@/components/layout/AuthPanel";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { routing } from "@/lib/products";
import { ShoppingCartIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotice } from "@/components/ui/notice";

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

const LOCALE_NAMES: Record<string, string> = {
  de: "Deutsch",
  ru: "Русский",
  en: "English",
};

/* ═══ Exact Ultra template styles (Header.tsx / LangSwitcher.tsx) ═══ */

const NAV_LINK_CLASS =
  "text-sm text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] font-medium whitespace-nowrap";

const ICON_CONTROL_CLASS =
  "inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--hover-bg)] transition-colors shrink-0";

/* Mobile drawer rows — template .mobile-nav .nav-link (see globals.css) */
const MOBILE_LINK_CLASS = "rt-mobile-link";
const MOBILE_ACCENT_CLASS =
  "rt-mobile-link !bg-[var(--color-accent)] !text-white !font-semibold";
const MOBILE_LOGOUT_CLASS =
  "rt-mobile-link !text-[var(--text-secondary)] !border !border-[var(--border-default)]";

/** Language select — closed square button (current code) + template dropdown. */
function LanguageSelect() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("language")}
          data-tip={LOCALE_NAMES[locale]}
          data-tip-pos="bottom"
          className={`${ICON_CONTROL_CLASS} text-xs font-semibold uppercase tracking-wide`}
        >
          {LOCALE_CODES[locale]}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-36 gap-1 p-1.5">
        {routing.locales.map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => {
              setOpen(false);
              if (loc !== locale) router.replace(pathname, { locale: loc });
            }}
            className={
              loc === locale
                ? "flex w-full items-center rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
                : "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-link)] transition-colors text-left hover:bg-[var(--hover-bg)] hover:text-[var(--text-heading)]"
            }
          >
            {LOCALE_NAMES[loc]}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** Cart — icon only (no label), control styled like the template icon buttons. */
function CartButton() {
  const t = useTranslations("header");
  const { totalCount, openCart } = useCart();

  return (
    <button
      type="button"
      className={`${ICON_CONTROL_CLASS} relative`}
      onClick={openCart}
      aria-label={t("cart")}
      data-tip={t("cart")}
      data-tip-pos="bottom"
    >
      <ShoppingCartIcon className="w-4 h-4" />
      {totalCount > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-semibold text-white tabular-nums">
          {totalCount > 99 ? "99+" : totalCount}
        </span>
      )}
    </button>
  );
}

export function Header() {
  const t = useTranslations("header");
  const ta = useTranslations("auth");
  const user = useAuthUser();
  const { notice } = useNotice();
  const { openCart } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  const handleLogout = async () => {
    closeMenu();
    await signOut();
    notice({ text: ta("signedOutToast"), variant: "success" });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--border-subtle)]">
        <nav className="relative flex items-center justify-between h-[var(--header-height)] max-w-[var(--max-width)] mx-auto px-6 gap-2">
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
            <LanguageSelect />
            <div className="w-px h-6 bg-[var(--border-default)]" />
            <CartButton />
          </div>

          {/* Mobile header row — template: theme + lang + burger. Cart lives in
              the drawer for signed-out users (owner request): the icon is easy
              to misclick on touch, and the drawer row is labeled. */}
          <div className="flex xl:hidden items-center gap-2">
            <ThemeToggle />
            <LanguageSelect />
            {user && <CartButton />}
            <button
              type="button"
              className={`rt-burger shrink-0 ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
            >
              <span className="rt-burger-line" />
              <span className="rt-burger-line" />
              <span className="rt-burger-line" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile nav drawer — template .mobile-nav: full-screen below the header */}
      <div className={`rt-mobile-nav xl:hidden ${menuOpen ? "open" : ""}`}>
        <Link href="/" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
          {t("home")}
        </Link>
        {NAV_ITEMS.map((item) => (
          <Link key={item.key} href={item.href} className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}
        <Link href="/#contact" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
          {t("nav.contact")}
        </Link>

        {!user && (
          <button
            type="button"
            className={MOBILE_LINK_CLASS}
            onClick={() => {
              closeMenu();
              openCart();
            }}
          >
            <ShoppingCartIcon className="w-4 h-4" />
            {t("cart")}
          </button>
        )}

        {!user ? (
          <div className="mt-2 w-full max-w-[300px] [&_button]:w-full [&_button]:justify-center [&_button]:!py-3.5 [&_button]:!text-lg">
            <AuthPanel />
          </div>
        ) : (
          <>
            <Link
              href="/cabinet"
              className={`${MOBILE_ACCENT_CLASS} gap-2`}
              onClick={closeMenu}
            >
              <LayoutDashboardIcon className="w-4 h-4" />
              {ta("cabinet")}
            </Link>
            <button type="button" className={MOBILE_LOGOUT_CLASS} onClick={handleLogout}>
              <LogOutIcon className="w-4 h-4" />
              {ta("logout")}
            </button>
          </>
        )}
      </div>
    </>
  );
}

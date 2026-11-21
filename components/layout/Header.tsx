"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ArrowLeftIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ShoppingCartIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { signOut, useAuthUser } from "@/lib/auth-store";
import { useCabinetStatus } from "@/lib/cabinet-status";
import { AuthPanel } from "@/components/layout/AuthPanel";
import { BalanceTopUp } from "@/components/cabinet/BalanceTopUp";
import { LanguageMenu } from "@/components/layout/LanguageMenu";
import { LegalModal, type LegalSlug } from "@/components/layout/LegalModal";
import { Logo } from "@/components/layout/Logo";
import { NavDropdown, type NavDropdownItem } from "@/components/layout/NavDropdown";
import { NavPulseLabel } from "@/components/layout/NavPulseLabel";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useNotice } from "@/components/ui/notice";

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

/* ── Навигация (Фаза D, решение владельца 21.11) ─────────────────────────
   Плоский список → 3 дропдауна + «Правовая информация» (существующие
   legal-модалки) + прямая «Контакты». Триггер «Программы» — динамическая
   кнопка (пул слов из owner_settings.nav_pulse). Цели — существующие
   страницы; «Основатель» и FAQ встанут, когда будут целевые страницы. */
const DIRECTION_NAV = [
  { href: "/shop", key: "tablets" },
  { href: "/studio", key: "studio" },
  { href: "/equipment", key: "equipment" },
  { href: "/recreation", key: "recreation" },
  { href: "/journey", key: "journey" },
] as const;

const ABOUT_NAV = [
  { href: "/encyclopedia", key: "encyclopedia" },
  { href: "/certificates", key: "certificates" },
  { href: "/videos", key: "videos" },
  { href: "/streams", key: "streams" },
] as const;

const PROGRAM_NAV = [
  { href: "/partner", key: "partner" },
  { href: "/partner#benefits", key: "cashback" },
  { href: "/partner#levels", key: "levels" },
] as const;

const LEGAL_NAV = ["impressum", "datenschutz", "agb", "widerruf"] as const;

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

/** Заголовок группы в мобильном drawer (те же 300px колонки, что у ссылок). */
function DrawerLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-full max-w-[300px] pt-4 pb-0.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

export function Header() {
  const t = useTranslations("header");
  const ta = useTranslations("auth");
  const tLegal = useTranslations("legal");
  const tCabinetBar = useTranslations("cabinet.header");
  const user = useAuthUser();
  const status = useCabinetStatus();
  const { notice } = useNotice();
  const { openCart } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [policy, setPolicy] = React.useState<LegalSlug | null>(null);
  const closeMenu = React.useCallback(() => setMenuOpen(false), []);

  /* Кабинет-режим шапки («← Главное меню» + баланс/пополнить/имя/выйти —
     решение владельца): стор наполняет страница кабинета через мост.
     usePathname здесь нельзя — он вне Suspense валит пререндер [slug]
     (project.md, грабли Next 16 №7). */
  const cabinetMode = status !== null && user !== null;

  const handleLogout = async () => {
    closeMenu();
    await signOut();
    notice({ text: ta("signedOutToast"), variant: "success" });
  };

  const toItems = (rows: readonly { href: string; key: string }[]): NavDropdownItem[] =>
    rows.map((row) => ({ label: t(`nav.${row.key}`), href: row.href }));

  const legalItems: NavDropdownItem[] = LEGAL_NAV.map((slug) => ({
    label: tLegal(`${slug}.title`),
    onSelect: () => setPolicy(slug),
  }));

  return (
    <>
      {policy && <LegalModal slug={policy} onClose={() => setPolicy(null)} />}

      <header className="sticky top-0 z-40 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--border-subtle)]">
        <nav className="relative flex items-center justify-between h-[var(--header-height)] max-w-[var(--max-width)] mx-auto px-6 gap-2">
          {/* Logo — left (template wordmark) */}
          <Link href="/" className="shrink-0" aria-label="RevolutTIME" data-cursor-logo>
            <Logo />
          </Link>

          {/* Desktop center — кабинет-режим или дропдауны */}
          {cabinetMode ? (
            <div className="hidden xl:flex flex-1 items-center gap-1 min-w-0">
              <Link href="/" className={`${NAV_LINK_CLASS} inline-flex items-center gap-1`}>
                <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
                {t("cabinetBack")}
              </Link>
            </div>
          ) : (
            <div className="hidden xl:flex flex-1 items-center justify-center gap-1 min-w-0">
              <NavDropdown label={t("nav.directions")} items={toItems(DIRECTION_NAV)} />
              <NavDropdown label={t("nav.about")} items={toItems(ABOUT_NAV)} />
              {/* Динамическая кнопка «Программы» — слово-пульс из админки */}
              <NavDropdown
                label={<NavPulseLabel />}
                items={toItems(PROGRAM_NAV)}
                triggerClassName={`${NAV_LINK_CLASS} !text-[var(--text-heading)] font-semibold inline-flex items-center gap-1`}
              />
              <NavDropdown label={t("nav.legal")} items={legalItems} />
              <Link href="/contact" className={NAV_LINK_CLASS}>
                {t("nav.contact")}
              </Link>
            </div>
          )}

          {/* Desktop controls — template layout: auth/cabinet + divider + theme + lang, cart last */}
          <div className="hidden xl:flex items-center gap-2">
            {cabinetMode ? (
              <>
                {status.balanceLabel && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/30 rounded-full text-sm font-bold text-[var(--text-heading)] tabular-nums whitespace-nowrap">
                    <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">
                      {tCabinetBar("balance")}
                    </span>
                    <span>{status.balanceLabel}</span>
                  </span>
                )}
                <BalanceTopUp className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]" />
                {(status.userName ?? user.name) && (
                  <span className="max-w-[160px] truncate text-sm font-medium text-foreground whitespace-nowrap">
                    {status.userName ?? user.name}
                  </span>
                )}
                <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
              </>
            ) : (
              <AuthPanel />
            )}
            <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
            <ThemeToggle />
            <LanguageMenu />
            <div className="w-px h-6 bg-[var(--border-default)]" />
            <CartButton />
            {cabinetMode && (
              <button
                type="button"
                className={ICON_CONTROL_CLASS}
                onClick={handleLogout}
                aria-label={ta("logout")}
                data-tip={ta("logout")}
                data-tip-pos="bottom"
              >
                <LogOutIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile header row — template: theme + lang + burger. Cart lives in
              the drawer for signed-out users (owner request): the icon is easy
              to misclick on touch, and the drawer row is labeled. */}
          <div className="flex xl:hidden items-center gap-2">
            <ThemeToggle />
            <LanguageMenu />
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

      {/* Mobile nav drawer — template .mobile-nav: full-screen below the header.
          Фаза D: полная навигация группами (те же пункты, что на десктопе). */}
      <div className={`rt-mobile-nav xl:hidden ${menuOpen ? "open" : ""}`}>
        {cabinetMode && (
          <Link href="/" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            <ArrowLeftIcon className="w-4 h-4" />
            {t("cabinetBack")}
          </Link>
        )}
        {!cabinetMode && (
          <Link href="/" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            {t("home")}
          </Link>
        )}

        <DrawerLabel>{t("nav.directions")}</DrawerLabel>
        {DIRECTION_NAV.map((item) => (
          <Link key={item.key} href={item.href} className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}

        <DrawerLabel>{t("nav.about")}</DrawerLabel>
        {ABOUT_NAV.map((item) => (
          <Link key={item.key} href={item.href} className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}

        <DrawerLabel>{t("nav.program")}</DrawerLabel>
        {PROGRAM_NAV.map((item) => (
          <Link key={item.key} href={item.href} className={MOBILE_LINK_CLASS} onClick={closeMenu}>
            {t(`nav.${item.key}`)}
          </Link>
        ))}

        <DrawerLabel>{t("nav.legal")}</DrawerLabel>
        {LEGAL_NAV.map((slug) => (
          <button
            key={slug}
            type="button"
            className={MOBILE_LINK_CLASS}
            onClick={() => {
              closeMenu();
              setPolicy(slug);
            }}
          >
            {tLegal(`${slug}.title`)}
          </button>
        ))}

        <Link href="/contact" className={MOBILE_LINK_CLASS} onClick={closeMenu}>
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
            {cabinetMode && (
              <BalanceTopUp className={`${MOBILE_LINK_CLASS} mt-2`} />
            )}
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

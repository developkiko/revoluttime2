"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Header (реструктурированный)
// Лого слева | Навигация по центру | Авторизация + Lang справа
// ══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { LangSwitcher } from "./LangSwitcher";
import { LogIn, User, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";

/** Dark/light switch (next-themes mounted at the app root): system default, light fallback. */
function UltraThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // false during SSR/prerender, true after hydration — no setState loops.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--hover-bg)] transition-colors shrink-0"
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4 opacity-0" aria-hidden />
      )}
    </button>
  );
}

export function Header() {
  const { t } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingVisible, setLoadingVisible] = useState(false);

  // ── Loading bar ──────────────────────────────────
  const startLoading = useCallback(() => {
    setLoadingVisible(true);
    setLoadingProgress(0);
    const steps = [15, 35, 55, 72, 85, 92];
    steps.forEach((p, i) => {
      setTimeout(() => setLoadingProgress(p), (i + 1) * 80);
    });
  }, []);

  const finishLoading = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => {
      setLoadingVisible(false);
      setLoadingProgress(0);
    }, 250);
  }, []);

  // Listen for route changes
  useEffect(() => {
    startLoading();
    const t = setTimeout(finishLoading, 600);
    return () => clearTimeout(t);
  }, [pathname, startLoading, finishLoading]);

  // Listen for custom loading triggers
  useEffect(() => {
    const onLoadStart = () => startLoading();
    const onLoadEnd = () => finishLoading();
    window.addEventListener("page-loading-start", onLoadStart);
    window.addEventListener("page-loading-end", onLoadEnd);
    return () => {
      window.removeEventListener("page-loading-start", onLoadStart);
      window.removeEventListener("page-loading-end", onLoadEnd);
    };
  }, [startLoading, finishLoading]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    router.push("/");
  };

  const openAuth = (tab?: "login" | "register") => {
    closeMenu();
    window.dispatchEvent(new CustomEvent("open-auth", { detail: { tab } }));
  };

  const linkClass =
    "text-sm text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] font-medium whitespace-nowrap";

  const btnPrimaryClass =
    "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap " +
    "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]";

  const btnAccentClass =
    "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap " +
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]";

  const btnLogoutClass =
    "inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-[var(--border-default)] transition-colors whitespace-nowrap " +
    "text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/40 hover:bg-[var(--color-error)]/8";

  return (
    <>
      <header className="header">
        <nav className="flex items-center justify-between h-[var(--header-height)] max-w-[var(--max-width)] mx-auto px-6">
          {/* Logo — left */}
          <Link href="/ultra-home" className="logo" data-cursor-logo>
            {t("logo_text")}
          </Link>

          {/* Desktop nav — center */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            <Link href="/#products" className={linkClass}>{t("nav_products")}</Link>
            <Link href="/#features" className={linkClass}>{t("nav_features")}</Link>
            <Link href="/#locations" className={linkClass}>{t("nav_locations")}</Link>
            <Link href="/#reviews" className={linkClass}>{t("nav_reviews")}</Link>
            <Link href="/#contacts" className={linkClass}>{t("nav_contacts")}</Link>
          </div>

          {/* Desktop auth + lang — right */}
          <div className="hidden md:flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <button className={btnPrimaryClass} onClick={() => openAuth("login")}>
                  <LogIn className="w-4 h-4" />
                  {t("nav_login")}
                </button>
                <div className="w-px h-6 bg-[var(--border-default)] mx-1" />
                <UltraThemeToggle />
                <LangSwitcher />
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`${linkClass} header-user-link border border-[var(--color-primary)]/40 hover:border-[var(--color-primary)]/70 inline-flex items-center gap-1.5`}
                  title={user?.login ?? user?.email ?? ""}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="header-user-name">{user?.login ?? user?.email}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-2.5 py-2 rounded-lg transition-colors text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
                  title={t("nav_logout")}
                  aria-label={t("nav_logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-[var(--border-default)]" />
                <UltraThemeToggle />
                <LangSwitcher />
              </>
            )}
          </div>

          {/* Mobile: theme + lang + burger */}
          <div className="flex md:hidden items-center gap-3">
            <UltraThemeToggle />
            <LangSwitcher mobile />
            <button
              className={`burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </button>
          </div>

          {/* Mobile nav drawer */}
          <div className={`mobile-nav md:hidden ${menuOpen ? "open" : ""}`}>
            <Link href="/#products" className="nav-link" onClick={closeMenu}>
              {t("nav_products")}
            </Link>
            <Link href="/#features" className="nav-link" onClick={closeMenu}>
              {t("nav_features")}
            </Link>
            <Link href="/#locations" className="nav-link" onClick={closeMenu}>
              {t("nav_locations")}
            </Link>
            <Link href="/#reviews" className="nav-link" onClick={closeMenu}>
              {t("nav_reviews")}
            </Link>
            <Link href="/#contacts" className="nav-link" onClick={closeMenu}>
              {t("nav_contacts")}
            </Link>

            {!isLoggedIn ? (
              <button
                className={`${btnPrimaryClass} !w-full !max-w-[300px] !justify-center !text-lg !py-3.5 !mt-2`}
                onClick={() => openAuth("login")}
              >
                <LogIn className="w-5 h-5" />
                {t("nav_login")}
              </button>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="nav-link !bg-[var(--color-accent)] !text-white !font-semibold"
                  onClick={closeMenu}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("dash_button")}
                </Link>
                <button
                  className="nav-link !text-[var(--text-secondary)] !border !border-[var(--border-default)]"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  {t("nav_logout")}
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Loading bar — fixed at bottom of header */}
      <div
        className="fixed top-[var(--header-height)] left-0 h-[2px] z-[1001] transition-opacity duration-200 pointer-events-none"
        style={{
          width: `${loadingProgress}%`,
          opacity: loadingVisible ? 1 : 0,
          background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-warning))",
          transition: loadingProgress === 100
            ? "width 0.15s ease-out, opacity 0.25s ease-out"
            : "width 0.3s ease-out",
        }}
      />
    </>
  );
}

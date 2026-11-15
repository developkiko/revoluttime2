"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — DashboardLayout (полная версия)
// Табы: Главная • Тарифы • Настройки • Создать прокси • Мои прокси • Трафик • Транзакции
// + кнопка «Поддержка 24/7» (модалка Telegram + email)
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useI18n } from "@/lib/ultra/i18n-context";
import { useAuth } from "@/lib/ultra/auth-store";
import { LangSwitcher } from "@/components/ultra/layout/LangSwitcher";
import { WelcomeTab } from "./WelcomeTab";
import { ProxiesTab } from "./ProxiesTab";
import { PlansTab } from "./PlansTab";
import { CreateProxyTab } from "./CreateProxyTab";
import { TrafficTab } from "./TrafficTab";
import { TransactionsTab } from "./TransactionsTab";
import { SettingsTab } from "./SettingsTab";
import { SupportFAB } from "./SupportFAB";
import { PaymentModal } from "./PaymentModal";
import { useModalEngine } from "@/components/ultra/ui/ModalEngine";
import { Globe, Package, BarChart3, Wallet, Settings, User, LogOut, CreditCard, ChevronLeft, PlusCircle } from "lucide-react";

type DashboardTab = "welcome" | "proxies" | "plans" | "create-proxy" | "traffic" | "transactions" | "settings";

const navBtnClass =
  "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap " +
  "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]";

export function DashboardLayout() {
  const { t, lang } = useI18n();
  const { user, isLoggedIn, logout } = useAuth();
  const { openModal, closeModal } = useModalEngine();
  const [tab, setTab] = useState<DashboardTab>("welcome");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingVisible, setLoadingVisible] = useState(false);

  useEffect(() => {
    setLoadingVisible(true);
    setLoadingProgress(0);
    const steps = [20, 50, 75, 90];
    const timers = steps.map((p, i) => setTimeout(() => setLoadingProgress(p), (i + 1) * 100));
 const finish = setTimeout(() => { setLoadingProgress(100); setTimeout(() => { setLoadingVisible(false); setLoadingProgress(0); }, 300); }, 700);
    return () => { timers.forEach(clearTimeout); clearTimeout(finish); };
  }, [tab]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn && typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, [mounted, isLoggedIn]);

  if (!mounted || !isLoggedIn) return null;

  const openDepositModal = () => {
    openModal(<PaymentModal />);
  };

  const tabClass =
    "inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap " +
    "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--color-primary)]/30 hover:text-white";
  const tabActiveClass = tabClass + " bg-[var(--color-primary)]/12 border-[var(--color-primary)] !text-white hover:bg-[var(--color-primary)]/20";

  const supportBtnClass =
    "inline-flex items-center gap-1.5 px-4 lg:px-5 py-2.5 text-sm font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap " +
    "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:border-[var(--color-primary)]/30";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="header">
        <nav className="flex items-center justify-between h-[var(--header-height)] max-w-[var(--max-width)] mx-auto px-6">
          <Link href="/ultra-home" className="logo" data-cursor-logo>{t("logo_text")}</Link>

          {/* Desktop — center buttons */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <Link href="/ultra-home" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-link)] hover:text-[var(--text-heading)] transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] whitespace-nowrap">
              <ChevronLeft className="w-4 h-4" />
              {t("nav_home")}
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-accent)]/12 border border-[var(--color-accent)]/30 rounded-full text-sm font-bold text-[var(--text-primary)] tabular-nums whitespace-nowrap">
              <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">USDT</span>
              <span>$0.00</span>
              <span className="text-[var(--border-default)] mx-0.5">|</span>
              <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-wider">Traffic</span>
              <span>0B</span>
            </div>
            <button onClick={openDepositModal} className={navBtnClass}>
              <CreditCard className="w-4 h-4" />
              {t("dash_deposit_btn")}
            </button>
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-primary)] font-medium whitespace-nowrap">
              <User className="w-4 h-4" />
              {user?.login ?? user?.email}
            </span>
            <button
              onClick={() => { logout(); window.location.href = "/"; }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]/40 hover:bg-[var(--color-error)]/8 transition-colors whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" />
              {t("nav_logout")}
            </button>
            <div className="w-px h-6 bg-[var(--border-default)]" />
            <LangSwitcher />
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3">
            <LangSwitcher mobile />
            <button
              className={`burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <span className="burger-line" /><span className="burger-line" /><span className="burger-line" />
            </button>
          </div>

          {/* Mobile drawer */}
          <div className={`mobile-nav md:hidden ${menuOpen ? "open" : ""}`}>
            <Link href="/ultra-home" className="nav-link" onClick={() => setMenuOpen(false)}>{t("nav_home")}</Link>
            <button className="nav-link !bg-[var(--color-accent)] !text-white !font-semibold" onClick={() => { openDepositModal(); setMenuOpen(false); }}>
              {t("dash_deposit_btn")}
            </button>
            <button className="nav-link !text-[var(--text-secondary)] !border !border-[var(--border-default)]" onClick={() => { logout(); window.location.href = "/"; }}>
              {t("nav_logout")}
            </button>
          </div>
        </nav>
      </header>

      {/* Dashboard loading bar */}
      <div
        className="fixed top-[var(--header-height)] left-0 h-[2px] z-[1001] pointer-events-none"
        style={{
          width: `${loadingProgress}%`,
          opacity: loadingVisible ? 1 : 0,
          background: "linear-gradient(90deg, var(--color-primary), var(--color-accent), var(--color-warning))",
          transition: loadingProgress === 100
            ? "width 0.15s ease-out, opacity 0.3s ease-out"
            : "width 0.3s ease-out, opacity 0.2s ease-out",
        }}
      />

      {/* Main */}
      <main className="flex-1 flex flex-col pt-[120px] pb-12">
        <div className="max-w-[var(--max-width)] mx-auto px-6 w-full">
          {/* Tabs: Мои прокси • Создать прокси • Тарифы • Трафик • Транзакции • Настройки */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button className={tab === "proxies" ? tabActiveClass : tabClass} onClick={() => setTab("proxies")}>
              <Globe className="w-4 h-4" /> {t("dash_tab_proxies")}
            </button>
            <button className={tab === "create-proxy" ? tabActiveClass : tabClass} onClick={() => setTab("create-proxy")}>
              <PlusCircle className="w-4 h-4" /> {t("dash_tab_create_proxy")}
            </button>
            <button className={tab === "plans" ? tabActiveClass : tabClass} onClick={() => setTab("plans")}>
              <Package className="w-4 h-4" /> {t("dash_tab_plans")}
            </button>
            <button className={tab === "traffic" ? tabActiveClass : tabClass} onClick={() => setTab("traffic")}>
              <BarChart3 className="w-4 h-4" /> {t("dash_tab_traffic")}
            </button>
            <button className={tab === "transactions" ? tabActiveClass : tabClass} onClick={() => setTab("transactions")}>
              <Wallet className="w-4 h-4" /> {t("dash_tab_transactions")}
            </button>
            <button className={tab === "settings" ? tabActiveClass : tabClass} onClick={() => setTab("settings")}>
              <Settings className="w-4 h-4" /> {t("dash_tab_settings")}
            </button>
          </div>
          {tab === "welcome" && <WelcomeTab onDeposit={openDepositModal} onSelectPlan={() => setTab("plans")} />}
          {tab === "proxies" && <ProxiesTab onCreateProxy={() => setTab("create-proxy")} />}
          {tab === "create-proxy" && <CreateProxyTab onDeposit={openDepositModal} />}
          {tab === "plans" && <PlansTab onDeposit={openDepositModal} />}
          {tab === "traffic" && <TrafficTab onGoProxies={() => setTab("proxies")} />}
          {tab === "transactions" && <TransactionsTab onSelectPlans={() => setTab("plans")} />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] py-5 mt-auto">
        <div className="max-w-[var(--max-width)] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[13px] text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">{t("privacy_title")}</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">{t("terms_title")}</Link>
            <Link href="/cookies" className="hover:text-[var(--text-primary)] transition-colors">{t("cookies_title")}</Link>
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">&copy; 2026 Ultra Proxy. {t("footer_rights")}</p>
        </div>
      </footer>
      {/* Плавающая кнопка поддержки */}
      <SupportFAB />
    </div>
  );
}

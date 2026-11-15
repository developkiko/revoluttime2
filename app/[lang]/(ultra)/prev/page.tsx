"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — /prev — Превью всех кастомных CSS-стилей
// ══════════════════════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";

export default function PrevPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-12 px-6">
      <div className="max-w-[900px] mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-heading)] mb-2">CSS Style Preview</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">
          Все кастомные стили из <code className="text-[var(--color-primary)]">globals.css</code> — по одному экземпляру каждого элемента.
        </p>

        {/* ═══ 1. Header (glass + blur) ═══ */}
        <Section title="1. Header" desc="position: fixed, glass-blur фон, border-bottom">
          <div className="header" style={{ position: "relative", top: "auto" }}>
            <div className="flex items-center h-14 max-w-[1200px] mx-auto px-6">
              <span className="logo" data-cursor-logo>REVOLUTTIME</span>
              <span className="ml-auto text-sm text-[var(--text-secondary)]">Header sample</span>
            </div>
          </div>
        </Section>

        {/* ═══ 2. Logo (gradient shimmer) ═══ */}
        <Section title="2. Logo" desc="Gradient shimmer анимация, background-clip: text">
          <div className="flex items-center gap-8">
            <span className="logo" data-cursor-logo>REVOLUTTIME</span>
            <span className="logo" data-cursor-logo style={{ fontSize: "2rem" }}>BIG</span>
            <span className="logo" data-cursor-logo style={{ fontSize: "0.875rem" }}>small</span>
          </div>
        </Section>

        {/* ═══ 3. Hero Logo ═══ */}
        <Section title="3. Hero Logo" desc="Увеличенный shimmer logo для hero-секции">
          <div
            className="hero-logo mx-auto"
            data-cursor-logo
            style={{
              width: "min-content",
              fontSize: "3rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1, #a78bfa, #f59e0b, #6366f1)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            REVOLUTTIME
          </div>
        </Section>

        {/* ═══ 4. Custom Selection ═══ */}
        <Section title="4. Custom Selection" desc="::selection — фиолетовый фон при выделении текста">
          <p className="text-[var(--text-secondary)]">
            Выдели этот текст мышкой — увидишь кастомный цвет выделения (фиолетовый фон, белый текст).
          </p>
        </Section>

        {/* ═══ 5. Custom Scrollbar ═══ */}
        <Section title="5. Custom Scrollbar" desc="::-webkit-scrollbar — тонкий тёмный скроллбар">
          <div className="h-32 overflow-y-auto border border-[var(--border-default)] rounded-lg p-4 text-sm text-[var(--text-secondary)]">
            <p>Прокрути этот блок вниз чтобы увидеть кастомный скроллбар.</p>
            <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p className="mt-4">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p className="mt-4">Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
            <p className="mt-4">Duis aute irure dolor in reprehenderit in voluptate velit esse.</p>
            <p className="mt-4">Excepteur sint occaecat cupidatat non proident, sunt in culpa.</p>
            <p className="mt-4">Qui officia deserunt mollit anim id est laborum.</p>
            <p className="mt-4">End of scroll content.</p>
          </div>
        </Section>

        {/* ═══ 6. Burger ═══ */}
        <Section title="6. Burger Menu" desc="Анимация трёх линий → крестик при открытии">
          <div className="flex items-center gap-6">
            <button
              className={`burger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: "flex" }}
              aria-label="Menu"
            >
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </button>
            <span className="text-sm text-[var(--text-muted)]">
              {menuOpen ? "Открыто (крестик)" : "Закрыто (бургер)"}
            </span>
          </div>
        </Section>

        {/* ═══ 7. Mobile Nav ═══ */}
        <Section title="7. Mobile Nav" desc="Фиксированное меню, slide-in справа, nav-link кнопки">
          <button
            className="nav-link"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: "inline-flex",
              fontSize: "1rem",
              padding: "0.75rem 1.5rem",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Toggle Mobile Nav
          </button>
          <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
            <a className="nav-link" onClick={() => setMenuOpen(false)}>Главная</a>
            <a className="nav-link" onClick={() => setMenuOpen(false)}>Тарифы</a>
            <a className="nav-link" onClick={() => setMenuOpen(false)}>Контакты</a>
            <button className="nav-link !bg-[var(--color-accent)] !text-white !font-semibold" onClick={() => setMenuOpen(false)}>
              Войти
            </button>
          </div>
        </Section>

        {/* ═══ 8. Custom Cursor ═══ */}
        <Section title="8. Custom Cursor" desc="Кольцо + точка, states: hover / click / logo-glow">
          <div className="flex gap-8 items-center">
            <div className="p-4 border border-[var(--border-default)] rounded-lg text-center">
              <p className="text-xs text-[var(--text-muted)] mb-2">Обычный</p>
              <div className="custom-cursor-ring" style={{ position: "relative", margin: 0, top: "auto", left: "auto", display: "inline-block" }} />
            </div>
            <div className="p-4 border border-[var(--border-default)] rounded-lg text-center">
              <p className="text-xs text-[var(--text-muted)] mb-2">Hover</p>
              <div className="custom-cursor-ring is-hover" style={{ position: "relative", margin: 0, top: "auto", left: "auto", display: "inline-block" }} />
            </div>
            <div className="p-4 border border-[var(--border-default)] rounded-lg text-center">
              <p className="text-xs text-[var(--text-muted)] mb-2">Logo Glow</p>
              <div className="custom-cursor-ring is-logo" style={{ position: "relative", margin: 0, top: "auto", left: "auto", display: "inline-block" }} />
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3">* Реальный кастомный курсор работает только на desktop с pointer.</p>
        </Section>

        {/* ═══ 9. Cookie Consent ═══ */}
        <Section title="9. Cookie Consent" desc="Фиксированная панелька, slide-in, кнопки">
          <div className="cookie-consent" style={{ position: "relative", bottom: "auto", right: "auto", animation: "none" }}>
            <p className="cookie-consent-text">Нажимая «Принять все», вы соглашаетесь с хранением cookies на вашем устройстве. Подробнее — в нашей cookie политике.</p>
            <div className="cookie-consent-actions">
              <Link href="/cookies" className="cookie-btn cookie-btn-link">cookie политике</Link>
              <button className="cookie-btn cookie-btn-reject">Отклонить</button>
              <button className="cookie-btn cookie-btn-accept">Принять все</button>
            </div>
          </div>
        </Section>

        {/* ═══ 10. Cookie Buttons ═══ */}
        <Section title="10. Cookie Buttons" desc="Варианты кнопок: link / reject / accept">
          <div className="flex flex-wrap gap-3">
            <button className="cookie-btn cookie-btn-link">Link Button</button>
            <button className="cookie-btn cookie-btn-reject">Reject Button</button>
            <button className="cookie-btn cookie-btn-accept">Accept Button</button>
          </div>
        </Section>

        {/* ═══ 11. Band Scroll ═══ */}
        <Section title="11. Band Scroll" desc="Бесконечная горизонтальная лента (ленточный скролл)">
          <div className="overflow-hidden rounded-lg border border-[var(--border-default)]">
            <div className="animate-band-scroll flex whitespace-nowrap py-3 px-4 gap-8 text-sm text-[var(--text-muted)]">
              <span>🇷🇺 Россия</span>
              <span>🇺🇸 США</span>
              <span>🇩🇪 Германия</span>
              <span>🇬🇧 Великобритания</span>
              <span>🇫🇷 Франция</span>
              <span>🇯🇵 Япония</span>
              <span>🇰🇷 Корея</span>
              <span>🇧🇷 Бразилия</span>
              <span>🇷🇺 Россия</span>
              <span>🇺🇸 США</span>
              <span>🇩🇪 Германия</span>
              <span>🇬🇧 Великобритания</span>
              <span>🇫🇷 Франция</span>
              <span>🇯🇵 Япония</span>
              <span>🇰🇷 Корея</span>
              <span>🇧🇷 Бразилия</span>
            </div>
          </div>
        </Section>

        {/* ═══ 12. BG Drift ═══ */}
        <Section title="12. BG Drift" desc="Бесконечный дрейф фоновой текстуры">
          <div className="relative h-32 rounded-lg border border-[var(--border-default)] overflow-hidden">
            <div
              className="absolute inset-0 animate-bg-drift opacity-30"
              style={{ backgroundImage: "url('/ultra/hero-bg.jpg')" }}
            />
            <div className="relative z-10 flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
              Фон дрейфует вниз-вправо
            </div>
          </div>
        </Section>

        {/* ═══ 13. BG Drift 2 ═══ */}
        <Section title="13. BG Drift 2" desc="Дрейф неквадратной картинки (горизонтальный)">
          <div className="relative h-32 rounded-lg border border-[var(--border-default)] overflow-hidden">
            <div
              className="absolute inset-0 animate-bg-drift2 opacity-30"
              style={{ backgroundImage: "url('/ultra/contact-bg.jpg')" }}
            />
            <div className="relative z-10 flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
              Фон дрейфует горизонтально
            </div>
          </div>
        </Section>

        {/* ═══ 14. FadeInUp ═══ */}
        <Section title="14. FadeInUp" desc="Анимация появления снизу вверх">
          <div className="flex gap-4">
            {[0, 200, 400, 600].map((delay) => (
              <div
                key={delay}
                className="w-16 h-16 rounded-lg bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30 flex items-center justify-center text-xs text-[var(--color-primary)]"
                style={{ animation: `fadeInUp 0.6s ease ${delay}ms both` }}
              >
                {delay}ms
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ 15. Design Tokens ═══ */}
        <Section title="15. Design Tokens" desc="Цвета и радиусы из CSS-переменных">
          <div className="grid grid-cols-5 gap-3">
            {[
              { name: "--color-primary", value: "var(--color-primary)" },
              { name: "--color-accent", value: "var(--color-accent)" },
              { name: "--color-success", value: "var(--color-success)" },
              { name: "--color-error", value: "var(--color-error)" },
              { name: "--color-warning", value: "var(--color-warning)" },
            ].map((c) => (
              <div key={c.name} className="text-center">
                <div className="w-full h-12 rounded-lg mb-2" style={{ background: c.value }} />
                <span className="text-[10px] text-[var(--text-muted)]">{c.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            {["var(--radius-sm)", "var(--radius-md)", "var(--radius-lg)", "var(--radius-xl)"].map((r) => (
              <div key={r} className="text-center">
                <div className="w-14 h-14 bg-[var(--bg-card)] border border-[var(--border-default)] mb-2" style={{ borderRadius: r }} />
                <span className="text-[10px] text-[var(--text-muted)]">{r}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ 16. Glass tokens ═══ */}
        <Section title="16. Glass / Border Tokens" desc="Фоны и границы из переменных">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)]" style={{ background: "var(--bg-base)", border: "1px solid var(--border-default)" }}>
              bg-base
            </div>
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)]" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
              bg-card
            </div>
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)]" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}>
              bg-elevated
            </div>
            <div className="w-24 h-24 rounded-lg flex items-center justify-center text-xs text-[var(--text-muted)]" style={{ background: "var(--glass-bg)", border: "1px solid var(--border-subtle)" }}>
              glass-bg
            </div>
          </div>
        </Section>

        <div className="mt-12 text-center">
          <Link href="/ultra-home" className="text-sm text-[var(--color-primary)] hover:underline">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
      <h2 className="text-lg font-bold text-[var(--text-heading)] mb-1">{title}</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">{desc}</p>
      {children}
    </div>
  );
}

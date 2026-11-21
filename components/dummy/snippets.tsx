"use client";

import { useState, type CSSProperties } from "react";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   1. ЗАГРУЗКА КАРТИНОК — clip-path reveal
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetImageLoader() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Загрузка картинок</h2>
      <div className="mt-6 flex flex-col items-center gap-8">
        <div className="flex gap-4">
          <div className="relative w-64 h-40 rounded-xl overflow-hidden border border-[var(--border-default)]">
            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover grayscale blur-sm"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover animate-[reveal_8s_ease-in-out_infinite]"
              style={{ clipPath: "inset(0 100% 0 0)" }}
              loading="lazy"
            />
          </div>
          <div className="relative w-40 h-40 rounded-full overflow-hidden border border-[var(--border-default)]">
            <img
              src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover grayscale blur-sm"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600&q=80"
              alt=""
              className="absolute inset-0 w-full h-full object-cover animate-[circle_6s_ease-in-out_infinite]"
              style={{ clipPath: "circle(0% at 50% 50%)" }}
              loading="lazy"
            />
          </div>
        </div>
        <style>{`
          @keyframes reveal { to { clip-path: inset(0 0% 0 0); } }
          @keyframes circle { to { clip-path: circle(100% at 50% 50%); } }
        `}</style>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   2. СВЕЧЕНИЕ БЛОКОС — вращающийся градиентный бордюр + spotlight от курсора
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetGlowCards() {
  const cards = [
    { label: "Свечение", base: 80, anim: "float" },
    { label: "Скорость", base: 220, anim: "pulse" },
    { label: "Слои", base: 160, anim: "float" },
    { label: "Курсор", base: 300, anim: "pulse" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Свечение блоков</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="relative w-full aspect-[3/4] rounded-xl border border-[var(--border-default)] bg-[#17171d] p-2 group isolation"
            style={{
              "--base": c.base,
              "--spread": c.anim === "float" ? 500 : 200,
            } as CSSProperties}
          >
            {/* Вращающийся градиентный бордюр */}
            <span
              className="absolute inset-[-1px] rounded-xl -z-10 bg-[conic-gradient(from_var(--beam-angle),transparent_12%,hsl(var(--base)_90%_62%_/_.35)_26%,transparent_65%)] animate-[spin_5s_linear_infinite]"
              style={{ "--beam-angle": "0deg" } as CSSProperties}
              aria-hidden
            />
            {/* Тело карточки */}
            <div className="absolute inset-[1px] rounded-xl bg-[#17171d] flex flex-col items-center justify-center overflow-hidden relative">
              {/* Spotlight от курсора */}
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mx)_var(--my)_var(--size)_var(--size)_hsl(var(--base)_90%_62%_/_.18)_transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  "--mx": "50%",
                  "--my": "50%",
                  "--size": "180px",
                } as CSSProperties}
              />
              <div className="relative z-10 grid place-items-center h-[64px] w-[64px] rounded-xl border border-[var(--border-default)] bg-[#17171d]/60 text-white mb-2 animate-[float_3s_ease-in-out_infinite]">
                <span className="text-2xl">✦</span>
              </div>
              <span className="text-xs text-white/72 text-center">{c.label}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { from { transform: translateY(-4px); } to { transform: translateY(4px); } }
      `}</style>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. АККОРДЕОНЫ — single / multi режим
   ══════════════════════════════════════════════════════════════════════ */
const ACCORDION_ITEMS = [
  { q: "Что такое дизайн-инженерия?", a: "Где интуиция дизайна встречается с кодом — вы видите проблемы UI и строите решения с нуля." },
  { q: "В чём мастерство UI?", a: "Курс о том, как строить вещи хорошо — владеть веб-платформой, чтобы не зависеть от инструментов." },
  { q: "Почему веб-платформа?", a: "Работая с вебом, а не против него, вы получаете производительность, доступность и долговечность." },
];

export function SnippetAccordions() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Аккордеоны</h2>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SnippetAccordion title="Single — только один открыт" mode="single" defaultOpen={1} />
        <SnippetAccordion title="Multi — можно открыть все" mode="multi" defaultOpen={[0, 2]} />
      </div>
    </section>
  );
}

function SnippetAccordion({ title, mode, defaultOpen }: { title: string; mode: "single" | "multi"; defaultOpen: number | number[] }) {
  const [open, setOpen] = useState<Set<number>>(
    new Set(Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen])
  );
  const isOpen = (i: number) => open.has(i);
  const toggle = (i: number) => setOpen((p) => {
    const n = new Set(p);
    if (mode === "single") n.has(i) ? n.delete(i) : (n.clear(), n.add(i));
    else n.has(i) ? n.delete(i) : n.add(i);
    return n;
  });

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      {ACCORDION_ITEMS.map((item, i) => {
        const o = isOpen(i);
        return (
          <div
            key={item.q}
            className={`rounded-xl border border-[var(--border-default)] bg-card p-4 transition-all ${o ? "shadow-[0_6px_18px_rgb(0_0_0_/_0_._1)]" : ""}`}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between text-left text-sm font-medium text-foreground hover:text-[var(--color-primary)] transition-colors"
              aria-expanded={o}
            >
              <span>{item.q}</span>
              <span className={`size-4 transition-transform duration-300 ${o ? "rotate-180" : ""}`} aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" d="M19 9l-7 7-7-7" /></svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${o ? "max-h-[200px] mt-2 pt-2 border-t border-[var(--border-default)]/50" : "max-h-0 mt-0 pt-0 border-0"}`}
              style={{ maxHeight: o ? 200 : 0 }}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   4. ПАГИНАЦИЯ — якорная активная пилюля
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetPagination() {
  const pages = [1, 4, 5, 6, 10];
  const [current, setCurrent] = useState(1);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Пагинация</h2>
      <nav className="mt-6 flex items-center gap-1" aria-label="Пагинация">
        <button
          type="button"
          onClick={() => setCurrent((p) => Math.max(p - 1, 0))}
          disabled={current === 0}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Предыдущая"
        >
          <ChevronLeft className="size-4" />
        </button>
        {pages.map((page) => {
          const isCurrent = current === page;
          return (
            <button
              key={page}
              type="button"
              onClick={() => setCurrent(page)}
              aria-current={isCurrent ? "page" : undefined}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                isCurrent
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--bg-elevated)] text-foreground hover:bg-[var(--border-default)]"
              }`}
            >
              {page}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCurrent((p) => Math.min(p + 1, pages.length - 1))}
          disabled={current === pages[pages.length - 1]}
          className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-sm text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Следующая"
        >
          <ChevronRight className="size-4" />
        </button>
      </nav>
      <p className="mt-4 text-sm text-muted-foreground">Страница {current + 1} из {pages.length}</p>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   5. ТОРГОВАЯ КАРТОЧКА — переворот лицевой/оборотной стороны
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetTradingCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Торговая карточка</h2>
      <div className="mt-6 flex items-center justify-center min-h-[400px]">
        <div
          className="relative w-48 h-64 perspective-1000 cursor-pointer"
          onClick={() => setFlipped((f) => !f)}
        >
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl border border-[var(--border-default)] transition-transform duration-500 preserve-3d ${
              flipped ? "rotate-y-180" : ""
            }`}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Лицевая сторона */}
            <div
              className="absolute inset-0 rounded-2xl bg-[var(--bg-elevated)] p-6 flex flex-col items-center justify-center backface-hidden shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=400&q=80"
                alt=""
                className="w-24 h-24 rounded-lg object-cover mb-4 grayscale group-hover:grayscale-0 transition-all"
                loading="lazy"
              />
              <h3 className="font-semibold text-foreground">Jhey Tompkins</h3>
              <p className="text-xs text-muted-foreground mt-1">Staff Design Engineer</p>
            </div>
            {/* Оборотная сторона */}
            <div
              className="absolute inset-0 rounded-2xl bg-[#17171d] text-white p-6 flex flex-col items-center justify-center backface-hidden shadow-lg rotate-y-180"
            >
              <h3 className="font-semibold text-white">Задняя сторона</h3>
              <p className="text-xs text-white/60 mt-2 text-center">Информация на оборотной стороне карточки.</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground text-center">Кликните на карточку, чтобы перевернуть.</p>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   6. ЭФФЕКТ ИКОНОК — scale на ховер + ч/б → цвет reveal
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetIconHovers() {
  const icons = [
    { label: "Maps", src: "https://assets.codepen.io/605876/ios-maps.png" },
    { label: "Health", src: "https://assets.codepen.io/605876/ios-health.png" },
    { label: "Clock", src: "https://assets.codepen.io/605876/ios-clock.png" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Эффект иконок</h2>
      <div className="mt-6 flex items-center gap-4">
        {icons.map((icon) => (
          <a
            key={icon.label}
            href="#"
            className="relative group inline-flex items-center justify-center rounded-[44px] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm transition-transform duration-300 hover:scale-105 focus-visible:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
            aria-label={icon.label}
          >
            <span className="relative overflow-hidden rounded-[44px]">
              {/* Ч/Б версия */}
              <img
                src={icon.src}
                alt=""
                className="w-16 h-16 grayscale brightness-80 contrast-120 invert"
                loading="lazy"
              />
              {/* Цветная версия — появляется по ховеру через clip-path */}
              <img
                src={icon.src}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-[clip-path] duration-650 ease-[cubic-bezier(.22,1,.36,.94)]"
                style={{ clipPath: "circle(0% at 50% 50%)" }}
                loading="lazy"
              />
            </span>
            <span className="sr-only">{icon.label}</span>
          </a>
        ))}
      </div>
      <style>{`
        a:hover img:last-child { clip-path: circle(100% at 50% 50%); }
      `}</style>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   7. ПОЛЕ СЧЁТЧИКА — минус / поле / плюс (без панели параметров)
   ══════════════════════════════════════════════════════════════════════ */
export function SnippetQuantityPicker() {
  const [value, setValue] = useState(1);
  const min = 1;
  const max = 10;
  const step = 1;

  const decrement = () => setValue((v) => Math.max(v - step, min));
  const increment = () => setValue((v) => Math.min(v + step, max));

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <h2 className="text-xl font-bold tracking-tight">Поле счётчика</h2>
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 py-1.5">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="rounded-lg p-1.5 text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Уменьшить"
        >
          <Minus className="size-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!isNaN(n)) setValue(Math.min(Math.max(n, min), max));
          }}
          className="w-12 text-center text-foreground bg-transparent border-0 focus:ring-0 disabled:opacity-50"
          min={min}
          max={max}
          readOnly
        />
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="rounded-lg p-1.5 text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors"
          aria-label="Увеличить"
        >
          <Plus className="size-4" />
        </button>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">Значение: {value}</p>
    </section>
  );
}
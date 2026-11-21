"use client";

import * as React from "react";

export interface CabinetTabDef {
  /** Stable tab id. */
  id: string;
  /** Primary hash that activates this tab (deep links keep working). */
  hash: string;
  /** Extra legacy hashes that map to this tab (#balance -> overview etc.). */
  extraHashes?: string[];
  label: string;
  icon: React.ReactNode;
  /** Server-rendered panel content. */
  content: React.ReactNode;
}

/**
 * Tab shell for the cabinet — «глайдер» (порт codepen vExjZBE / старый dummy
 * components/my/my-tabs.tsx): подложка-пилюля не перескакивает, а плавно
 * переезжает под активную вкладку (замер offsetLeft/offsetWidth — ширины
 * разные; на resize переснимает ResizeObserver). До гидрации глайдер скрыт.
 *
 * Панели остаются смонтированными (hidden), чтобы серверный контент и
 * клиентское состояние (поля профиля, таблицы) переживали переключение.
 * Хеш-роутинг сохранён (#profile, #purchases, #network, …).
 */
export function CabinetTabs({ tabs, ariaLabel }: { tabs: CabinetTabDef[]; ariaLabel: string }) {
  const [active, setActive] = React.useState<string>(tabs[0]?.id ?? "");
  const navRef = React.useRef<HTMLElement>(null);
  const btnRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = React.useRef(new Map<string, HTMLDivElement>());
  const prevActiveRef = React.useRef<string | null>(null);
  const [glider, setGlider] = React.useState<{ left: number; width: number } | null>(null);

  React.useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      const found = tabs.find(
        (tab) => tab.hash === hash || tab.extraHashes?.includes(hash)
      );
      setActive(found ? found.id : tabs[0]?.id ?? "");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [tabs]);

  // замер активной кнопки → позиция глайдера (layout: до первой отрисовки)
  const measure = React.useCallback(() => {
    const btn = btnRefs.current.get(active);
    if (!btn) return;
    setGlider({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active]);

  React.useLayoutEffect(measure, [measure]);

  React.useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(nav);
    btnRefs.current.forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [measure]);

  const select = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    setActive(id);
    window.history.replaceState(null, "", `#${tab.hash}`);
  };

  /* Контент едет НАВСТРЕЧУ глайдеру (владелец 22.11 №5): глайдер ушёл
     слева-направо → панель въезжает справа-налево. Панели остаются
     смонтированными (состояние форм не теряется) — анимацию перезапускаем
     классом + reflow, а не перемонтированием. */
  React.useEffect(() => {
    const prev = prevActiveRef.current;
    prevActiveRef.current = active;
    if (prev === null || prev === active) return;
    const panel = panelRefs.current.get(active);
    if (!panel) return;
    const prevIdx = tabs.findIndex((tb) => tb.id === prev);
    const nextIdx = tabs.findIndex((tb) => tb.id === active);
    const dir = nextIdx > prevIdx ? "right" : "left"; // куда уехал глайдер
    panel.classList.remove("tab-panel--in-right", "tab-panel--in-left");
    // reflow — чтобы анимация перезапускалась при повторном открытии панели
    void panel.offsetWidth;
    panel.classList.add(dir === "right" ? "tab-panel--in-right" : "tab-panel--in-left");
  }, [active, tabs]);

  return (
    <div>
      <nav ref={navRef} className="tabs" role="tablist" aria-label={ariaLabel}>
        <span
          aria-hidden="true"
          className="tabs-glider"
          style={
            glider
              ? { transform: `translateX(${glider.left}px)`, width: glider.width, opacity: 1 }
              : { transform: "translateX(0.375rem)", width: "6rem", opacity: 0 }
          }
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            ref={(el) => {
              if (el) btnRefs.current.set(tab.id, el);
              else btnRefs.current.delete(tab.id);
            }}
            onClick={() => select(tab.id)}
            className={active === tab.id ? "tab tab--on" : "tab"}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={tab.id !== active}
          className="mt-8"
          ref={(el) => {
            if (el) panelRefs.current.set(tab.id, el);
            else panelRefs.current.delete(tab.id);
          }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

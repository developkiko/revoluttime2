"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Spotlight Cursor: у блоков с data-spotlight подсветка следует за курсором
 * (порт с revoluttime.vercel.app/ru/dummy, пен codepen.io/karakym/pen/wBJjeoe).
 * Observer лишь пишет координаты в CSS-переменные --spot-x/--spot-y, сам
 * градиент — CSS на ::before (см. globals.css, блок data-spotlight).
 * Только мышь; при reduced-motion остаётся, но появляется мгновенно
 * (глобальное правило гасит transition, автодвижения тут нет).
 */
export function SpotlightObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight]"));
    if (els.length === 0) return;

    const cleanups = els.map((el) => {
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--spot-x", `${(e.clientX - r.left).toFixed(1)}px`);
        el.style.setProperty("--spot-y", `${(e.clientY - r.top).toFixed(1)}px`);
      };
      el.addEventListener("pointermove", onMove, { passive: true });
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.style.removeProperty("--spot-x");
        el.style.removeProperty("--spot-y");
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

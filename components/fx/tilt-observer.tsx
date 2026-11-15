"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 3D Tilt: блоки с data-tilt наклоняются за курсором
 * (порт с revoluttime.vercel.app/ru/dummy, пен codepen.io/karakym/pen/wBJjeoe).
 * Наблюдатель рендерит null: после смены маршрута навешивает листенеры
 * на все [data-tilt] заново — разметке ничего знать про JS не нужно.
 * Только мышь (hover + fine pointer), при reduced-motion отключён совсем.
 */
export function TiltObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    if (els.length === 0) return;

    const cleanups = els.map((el) => {
      let resetTimer: ReturnType<typeof setTimeout> | undefined;

      const onEnter = () => {
        // Короткий переход пока курсор внутри — наклон «липнет» без запаздывания
        window.clearTimeout(resetTimer);
        el.style.transition = "transform 0.12s ease, box-shadow 0.4s ease";
      };
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateY(${(x * 14).toFixed(2)}deg) rotateX(${(-y * 14).toFixed(2)}deg) scale(1.03)`;
      };
      const onLeave = () => {
        // Возврат — долгий мягкий easing, после возврата отдаём transition классам
        el.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease";
        el.style.transform = "";
        resetTimer = setTimeout(() => {
          el.style.transition = "";
        }, 600);
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave);
      return () => {
        window.clearTimeout(resetTimer);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.style.transform = "";
        el.style.transition = "";
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

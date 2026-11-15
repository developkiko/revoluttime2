"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Custom Cursor (moonshot-style ring + dot)
// ══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

const HOVER_TARGETS =
  'a[href], button, input, textarea, select, [data-cursor-hover], [role="button"], label, .nav-link, .btn, .card, .image-card, .tag, .toggle, .link';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    const cursorEl = cursorRef.current!;
    const dotEl = dotRef.current!;

    const speed = 0.18;
    const smoothFactor = 1 - speed;
    const fastSmoothFactor = 1 - Math.min(4 * speed, 0.8);
    const threshold = 0.5;

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursorPos = { x: mouse.x, y: mouse.y };
    const dotPos = { x: mouse.x, y: mouse.y };

    let lastTime = performance.now();
    let rafId = 0;
    let isActive = false;

    cursorEl.style.opacity = "0";
    dotEl.style.opacity = "0";

    const style = document.createElement("style");
    style.textContent = "body.custom-cursor-active * { cursor: none !important; }";
    document.head.appendChild(style);
    document.body.classList.add("custom-cursor-active");

    function animate() {
      const now = performance.now();
      const delta = (60 * (now - lastTime)) / 1000;
      lastTime = now;

      const cs = 1 - Math.pow(smoothFactor, delta);
      cursorPos.x += (mouse.x - cursorPos.x) * cs;
      cursorPos.y += (mouse.y - cursorPos.y) * cs;
      cursorEl.style.translate = `${cursorPos.x}px ${cursorPos.y}px 0`;

      const ds = 1 - Math.pow(fastSmoothFactor, delta);
      dotPos.x += (mouse.x - dotPos.x) * ds;
      dotPos.y += (mouse.y - dotPos.y) * ds;
      dotEl.style.translate = `${dotPos.x}px ${dotPos.y}px 0`;

      const settled =
        Math.abs(mouse.x - cursorPos.x) < threshold &&
        Math.abs(mouse.y - cursorPos.y) < threshold &&
        Math.abs(mouse.x - dotPos.x) < threshold &&
        Math.abs(mouse.y - dotPos.y) < threshold;

      rafId = settled ? 0 : requestAnimationFrame(animate);
    }

    function onMouseMove(e: MouseEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!rafId) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(animate);
      }
      if (!isActive) {
        isActive = true;
        cursorPos.x = dotPos.x = mouse.x;
        cursorPos.y = dotPos.y = mouse.y;
        cursorEl.style.opacity = "1";
        dotEl.style.opacity = "1";
      }
    }

    function onMouseLeave() {
      isActive = false;
      cursorEl.style.opacity = "0";
      dotEl.style.opacity = "0";
    }

    function onMouseOver(e: MouseEvent) {
      if ((e.target as HTMLElement).closest(HOVER_TARGETS)) {
        cursorEl.classList.add("is-hover");
      }
      if ((e.target as HTMLElement).closest("[data-cursor-logo]")) {
        cursorEl.classList.add("is-logo");
      }
    }

    function onMouseOut(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const related = e.relatedTarget as HTMLElement | null;
      const interactive = target.closest(HOVER_TARGETS);
      if (interactive && (!related || !interactive.contains(related))) {
        cursorEl.classList.remove("is-hover");
      }
      const logo = target.closest("[data-cursor-logo]");
      if (logo && (!related || !logo.contains(related))) {
        cursorEl.classList.remove("is-logo");
      }
    }

    function onMouseDown() {
      cursorEl.classList.add("is-click");
    }

    function onMouseUp() {
      cursorEl.classList.remove("is-click");
    }

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
      style.remove();
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor-ring" />
      <div ref={dotRef} className="custom-cursor-dot" />
    </>
  );
}

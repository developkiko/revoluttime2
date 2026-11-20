"use client";

// REVOLUTTIME — shared ultra theme switch (next-themes mounted at the app
// root): system default, light fallback. Used in the ultra Header, policy
// pages (PolicyLayout) and PolicyModal.

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function UltraThemeToggle() {
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

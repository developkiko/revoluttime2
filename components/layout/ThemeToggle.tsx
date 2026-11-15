"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

const noopSubscribe = () => () => {};

/**
 * Theme switch — exact Ultra template control: 36px bordered rounded-lg
 * button, w-4 icons (UltraThemeToggle in the template Header).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // false during SSR/prerender pass, true after hydration — no setState.
  const mounted = React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "light" : "dark"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      data-tip={isDark ? "Light" : "Dark"}
      data-tip-pos="bottom"
      className="inline-flex items-center justify-center size-9 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-heading)] hover:bg-[var(--hover-bg)] transition-colors shrink-0"
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )
      ) : (
        <MoonIcon className="w-4 h-4 opacity-0" aria-hidden />
      )}
    </button>
  );
}

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

// Tab styling mirrors the Ultra dashboard (indigo tint for the active pill).
const tabClass =
  "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-all whitespace-nowrap " +
  "bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground";
const tabActiveClass =
  tabClass + " bg-primary/12 border-primary text-primary";

/**
 * Tab shell for the cabinet. Panels stay mounted (hidden) so server-rendered
 * content and client state (profile inputs, demo tables) survive switching.
 * Hash routing keeps the existing deep links (#profile, #purchases, …).
 */
export function CabinetTabs({ tabs, ariaLabel }: { tabs: CabinetTabDef[]; ariaLabel: string }) {
  const [active, setActive] = React.useState<string>(tabs[0]?.id ?? "");

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

  const select = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (!tab) return;
    setActive(id);
    window.history.replaceState(null, "", `#${tab.hash}`);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => select(tab.id)}
            className={active === tab.id ? tabActiveClass : tabClass}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={tab.id !== active}
          className="mt-8"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}

"use client";

import * as React from "react";

import {
  NAV_PULSE_DEFAULT_INTERVAL_SECONDS,
  NAV_PULSE_DEFAULT_WORDS,
  normalizeNavPulse,
  type NavPulseConfig,
} from "@/lib/nav-pulse";

/**
 * Слова динамической кнопки «Программа» в шапке (Фаза D, решение владельца
 * 21.11: «Энергия, Долголетие, Молодость, Выносливость, Биохакинг»).
 * Пул и интервал — из owner_settings (adm-rt), фолбэк — дефолтный пул.
 * Конфиг грузится один раз на сессию; ротация раз в interval секунд,
 * анимация слова — только при motion-safe.
 */

let configCache: NavPulseConfig | null = null;

async function loadNavPulse(): Promise<NavPulseConfig> {
  if (configCache) return configCache;
  try {
    const response = await fetch("/api/site-config", { cache: "no-store" });
    const data = (await response.json()) as { ownerSettings?: { nav_pulse?: unknown } };
    configCache = normalizeNavPulse(data?.ownerSettings?.nav_pulse);
  } catch {
    configCache = normalizeNavPulse(null);
  }
  return configCache;
}

export function NavPulseLabel() {
  const [config, setConfig] = React.useState<NavPulseConfig>(() => ({
    words: [...NAV_PULSE_DEFAULT_WORDS],
    seconds: NAV_PULSE_DEFAULT_INTERVAL_SECONDS,
  }));
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    loadNavPulse().then((cfg) => {
      if (!cancelled) setConfig(cfg);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((value) => value + 1), config.seconds * 1000);
    return () => clearInterval(id);
  }, [config.seconds]);

  const word = config.words[index % config.words.length];

  return (
    <span
      key={word}
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
    >
      {word}
    </span>
  );
}

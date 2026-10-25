"use client";

import * as React from "react";

const noopSubscribe = () => () => {};

/**
 * Cache Components cannot prerender `new Date()` (server or SSR pass),
 * so the year is resolved on the client via useSyncExternalStore.
 */
export function CurrentYear() {
  const year = React.useSyncExternalStore(
    noopSubscribe,
    () => new Date().getFullYear(),
    () => null
  );

  return <>{year ?? ""}</>;
}

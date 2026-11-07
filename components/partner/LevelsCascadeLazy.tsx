"use client";

import dynamic from "next/dynamic";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const LevelsCascadeInner = dynamic(
  () => import("./LevelsCascade").then((m) => m.LevelsCascade),
  { ssr: false },
);

export function LevelsCascadeLazy() {
  return <LevelsCascadeInner />;
}

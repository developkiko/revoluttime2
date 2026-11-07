"use client";

import dynamic from "next/dynamic";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const PartnerStepsInner = dynamic(
  () => import("./PartnerSteps").then((m) => m.PartnerSteps),
  { ssr: false },
);

export function PartnerStepsLazy() {
  return <PartnerStepsInner />;
}

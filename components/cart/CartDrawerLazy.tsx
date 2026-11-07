"use client";

import dynamic from "next/dynamic";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const CartDrawerInner = dynamic(
  () => import("./CartDrawer").then((m) => m.CartDrawer),
  { ssr: false },
);

export function CartDrawerLazy() {
  return <CartDrawerInner />;
}

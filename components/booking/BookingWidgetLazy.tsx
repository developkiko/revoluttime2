"use client";

import dynamic from "next/dynamic";

import type { CatalogOffer } from "@/lib/catalog";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const BookingWidgetInner = dynamic(
  () => import("./BookingWidget").then((m) => m.BookingWidget),
  { ssr: false },
);

export function BookingWidgetLazy({ offer }: { offer: CatalogOffer }) {
  return <BookingWidgetInner offer={offer} />;
}

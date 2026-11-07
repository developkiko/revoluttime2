"use client";

import dynamic from "next/dynamic";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const ContactWidgetInner = dynamic(
  () => import("./ContactWidget").then((m) => m.ContactWidget),
  { ssr: false },
);

export function ContactWidgetLazy() {
  return <ContactWidgetInner />;
}

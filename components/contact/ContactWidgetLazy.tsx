"use client";

import dynamic from "next/dynamic";
import type { TopicKey } from "./ContactWidget";

// Lazy split (P1 bundle diet): the component (and its heavy deps) loads after
// hydration instead of riding in the route's first-load JS.
const ContactWidgetInner = dynamic(
  () => import("./ContactWidget").then((m) => m.ContactWidget),
  { ssr: false },
);

export function ContactWidgetLazy({ initialTopic }: { initialTopic?: TopicKey }) {
  return <ContactWidgetInner initialTopic={initialTopic} />;
}

// Глобальная «форма обратной связи» (владелец 21.11) — ленивая загрузка с
// параметрами: name/title, поля, обязательные, темы.
const FeedbackFormInner = dynamic(
  () => import("./ContactWidget").then((m) => m.FeedbackForm),
  { ssr: false },
);

export type { FeedbackFormProps } from "./ContactWidget";

export function FeedbackFormLazy(props: import("./ContactWidget").FeedbackFormProps) {
  return <FeedbackFormInner {...props} />;
}

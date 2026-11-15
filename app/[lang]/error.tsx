"use client";

import { NfScreen } from "@/components/layout/NfScreen";

/** 500 внутри локали: экран с повтором (reset) и уходом на главную. */
export default function LangError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <NfScreen code="500" kind="error" onReset={reset} />;
}

"use client";

// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — I18nText (Tailwind-версия)
// ══════════════════════════════════════════════════════════════

import type React from "react";
import { useI18n } from "@/lib/ultra/i18n-context";

interface I18nTextProps {
  id: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

export function I18nText({ id, as: Tag = "span", className }: I18nTextProps) {
  const { t } = useI18n();
  return <Tag className={className}>{t(id)}</Tag>;
}

export function T(props: I18nTextProps) {
  return <I18nText {...props} />;
}

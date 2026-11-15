"use client";

// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Дашборд
// ══════════════════════════════════════════════════════════════

import { useEffect } from "react";
import { DashboardLayout } from "@/components/ultra/dashboard/DashboardLayout";
import { useTrackVisit } from "@/lib/ultra/use-track-visit";

export default function DashboardPage() {
  useTrackVisit("/dashboard");
  return <DashboardLayout />;
}

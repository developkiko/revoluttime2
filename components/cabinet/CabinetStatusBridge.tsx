"use client";

import * as React from "react";

import {
  CABINET_STATUS_EMPTY,
  writeCabinetStatus,
  type CabinetStatus,
} from "@/lib/cabinet-status";

/**
 * Мост страница кабинета → шапка (Фаза D): кабинет кладёт свои значения в
 * стор, Header рисует ими кабинет-режим. При размонтировании (уход с
 * кабинета, разлогин) — сбрасывает стор, шапка возвращается в обычный вид.
 * Рендерит null.
 */
export function CabinetStatusBridge(props: CabinetStatus) {
  React.useEffect(() => {
    writeCabinetStatus(props);
    return () => writeCabinetStatus(CABINET_STATUS_EMPTY);
  }, [props]);
  return null;
}

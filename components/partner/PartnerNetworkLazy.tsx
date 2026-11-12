"use client";

import dynamic from "next/dynamic";

import type { PartnerNetworkProps } from "./PartnerNetwork";

// framer-motion rides in the lazy chunk — the static skeleton keeps the slot.
const PartnerNetworkInner = dynamic(
  () => import("./PartnerNetwork").then((m) => m.PartnerNetwork),
  {
    ssr: false,
    loading: () => (
      <div aria-hidden>
        <div className="h-[320px] rounded-3xl border bg-card shadow-lg md:h-[360px]" />
        <div className="mt-3 flex justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="h-7 w-20 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    ),
  },
);

export function PartnerNetworkLazy(props: PartnerNetworkProps) {
  return <PartnerNetworkInner {...props} />;
}

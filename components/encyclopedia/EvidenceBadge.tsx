import { useTranslations } from "next-intl";

import type { EvidenceStatus } from "@/lib/encyclopedia";

const STATUS_STYLES: Record<EvidenceStatus, string> = {
  high_consensus: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  preliminary_promising: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  insufficient_data: "border-border bg-muted/60 text-muted-foreground",
};

const STATUS_LABEL_KEYS: Record<EvidenceStatus, string> = {
  high_consensus: "highConsensus",
  preliminary_promising: "preliminaryPromising",
  insufficient_data: "insufficientData",
};

/** Claim-level evidence status chip (blueprint evidence_level enum). */
export function EvidenceBadge({ status }: { status: EvidenceStatus }) {
  const t = useTranslations("encyclopedia.evidence");

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  );
}

import { ExternalLinkIcon, FlaskConicalIcon } from "lucide-react";

import {
  STUDY_TYPE_LABEL_KEYS,
  type ResearchPaper,
} from "@/lib/encyclopedia";
import { useTranslations } from "next-intl";

/** Evidence-per-claim card (blueprint § 4.2/4.3): a PubMed paper as a badge. */
export function ResearchCard({ paper }: { paper: ResearchPaper }) {
  const t = useTranslations("encyclopedia");

  return (
    <a
      href={paper.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <FlaskConicalIcon className="size-3 text-primary" />
          {t(`studyTypes.${STUDY_TYPE_LABEL_KEYS[paper.studyType]}`)}
        </span>
        <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
      </div>

      <h4 className="mt-2 text-sm font-semibold leading-snug group-hover:text-primary">
        {paper.title}
      </h4>
      <p className="mt-1 text-xs text-muted-foreground">
        {paper.authors.join(", ")} · {paper.year} · {paper.journal}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        DOI: {paper.doiPmid}
        {paper.sampleSize != null && ` · n = ${paper.sampleSize}`}
      </p>
    </a>
  );
}

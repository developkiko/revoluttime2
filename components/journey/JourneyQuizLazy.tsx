"use client";

import dynamic from "next/dynamic";

// The quiz pulls form logic into the client bundle — split it into a lazy
// chunk so the /journey shell stays static; the skeleton holds the slot
// while the quiz hydrates.
const JourneyQuizInner = dynamic(
  () => import("./JourneyQuiz").then((m) => m.JourneyQuiz),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto w-full max-w-2xl" aria-hidden>
        <div className="mb-6 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-lg md:p-8">
          <div className="h-7 w-2/3 rounded bg-muted" />
          <div className="mt-5 grid gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="h-14 rounded-2xl border bg-muted/40" />
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

export function JourneyQuizLazy() {
  return <JourneyQuizInner />;
}

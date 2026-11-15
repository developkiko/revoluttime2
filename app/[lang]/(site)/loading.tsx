import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading skeleton — shown by the app while a segment is being
 * fetched/streamed during navigation (partial prefetching enabled).
 */
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      {/* Hero area */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-52 rounded-full" />
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-10 w-4/5 max-w-sm" />
              <div className="mt-2 flex flex-col gap-2">
                <Skeleton className="h-4 w-full max-w-lg" />
                <Skeleton className="h-4 w-3/4 max-w-md" />
              </div>
              <div className="mt-4 flex gap-3">
                <Skeleton className="h-10 w-40 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>
            </div>
            <Skeleton className="mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Cards area */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-5">
              <Skeleton className="size-11 rounded-xl" />
              <Skeleton className="mt-4 h-5 w-3/4" />
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
              <Skeleton className="mt-5 h-4 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

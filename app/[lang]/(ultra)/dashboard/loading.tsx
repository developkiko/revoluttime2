// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Loading skeleton для дашборда
// ══════════════════════════════════════════════════════════════

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Header skeleton */}
      <header className="header">
        <nav className="nav container">
          <div className="h-5 w-32 bg-[#1a1a2e] rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-[#1a1a2e] rounded animate-pulse" />
            <div className="h-8 w-20 bg-[#1a1a2e] rounded animate-pulse" />
          </div>
        </nav>
      </header>
      {/* Content skeleton */}
      <main className="flex-1 pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 mb-8">
            <div className="h-10 w-36 bg-[#14141f] border border-[#2a2a3a] rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-[#14141f] border border-[#2a2a3a] rounded-lg animate-pulse" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-[#14141f] border border-[#2a2a3a] rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

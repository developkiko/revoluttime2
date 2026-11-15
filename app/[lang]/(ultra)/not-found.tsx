// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Кастомная 404
// ══════════════════════════════════════════════════════════════

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] text-[#e0e0e0] px-8 text-center">
      <h1 className="text-[6rem] font-extrabold text-[#6366f1] leading-none mb-2">404</h1>
      <p className="text-xl text-[#888] mb-4">Страница не найдена</p>
      <p className="text-sm text-[#666] mb-10 max-w-md">
        Возможно, страница была удалена, перемещена, или вы ошиблись адресом.
      </p>
      <Link
        href="/ultra-home"
        className="inline-flex items-center justify-center py-[0.85rem] px-8 bg-[var(--color-primary)]/12 text-[var(--color-primary)] border border-[var(--color-primary)]/25 hover:bg-[var(--color-primary)]/20 rounded-[10px] font-semibold text-base transition-colors"
      >
        На главную
      </Link>
    </div>
  );
}

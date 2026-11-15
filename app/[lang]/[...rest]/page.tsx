import { notFound } from "next/navigation";

/**
 * Catch-all неизвестных путей внутри валидной локали → localized 404
 * (app/[lang]/not-found.tsx). Незнакомые префиксы без локали посредник
 * (proxy.ts) сначала отправляет на дефолтную локаль, поэтому сюда попадают
 * все реальные опечатки вида /ru/typo.
 */
export default function CatchAllPage() {
  notFound();
}

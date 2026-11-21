import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { EarningsFeed } from "@/components/home/EarningsFeed";
import {
  anonymizeLedgerEmail,
  generateEarningsFeed,
  randomEarningsSeed,
  type EarningEntry,
  type EarningsConfig,
} from "@/lib/earnings";
import { readOwnerSettings } from "@/lib/owner-settings";
import { db, dbConfigured } from "@/lib/ultra/db";

/** Сколько шагов dummy-ленты генерирует сервер при SSR. */
const FEED_STEPS = 8;
/** Сколько реальных записей ledger показываем. */
const REAL_LIMIT = 8;

/**
 * «Зарабатывают уже сейчас» на главной (Фаза C, решение владельца 21.11).
 * Режим задаётся в adm-rt (owner_settings.income_block, default dummy):
 *  • real — реальные начисления из financial_ledger (kind fund/cashback,
 *    кроме cancelled), персональные данные анонимизированы (маска имени,
 *    аватар из пула отзывов);
 *  • dummy — детерминированная лента по seed, клиент тикает раз в
 *    случайный интервал из настроек (2–15 мин), паузные веса пропускаются.
 * Заголовок блока берётся из админ-настройки `label`, фолбэк — i18n.
 * Рантайм-данные (cacheComponents): `await connection()` внутри Suspense.
 */
async function IncomeList() {
  await connection();
  const t = await getTranslations("home.earnings");

  const settings = await readOwnerSettings();
  const mode = settings.income_block?.mode ?? "dummy";
  const cfg: EarningsConfig = {
    minMinutes: settings.income_block?.interval_min_minutes ?? 2,
    maxMinutes: settings.income_block?.interval_max_minutes ?? 15,
    weights: settings.income_weights ?? {},
  };

  let entries: EarningEntry[] = [];
  let live = false;
  let renderSeed = 0;

  if (mode === "real" && dbConfigured()) {
    try {
      const rows = await db<{
        id: string;
        amount: string;
        kind: string;
        beneficiary_email: string | null;
        created_at: string;
      }>(
        `SELECT id, amount, kind, beneficiary_email, created_at
         FROM financial_ledger
         WHERE status <> 'cancelled' AND kind IN ('fund', 'cashback')
         ORDER BY created_at DESC
         LIMIT ${REAL_LIMIT}`
      );
      entries = rows.map((row) => ({
        index: 0,
        type: row.kind === "cashback" ? "cashback" : "percent",
        amountCents: Math.round(Number(row.amount) * 100),
        ...anonymizeLedgerEmail(row.beneficiary_email),
        ts: new Date(row.created_at).getTime(),
      }));
    } catch (error) {
      console.error("[income] ledger read failed", error);
    }
    // Реальных начислений ещё нет — вместо фейка показываем честный подпис.
    if (entries.length === 0) {
      return (
        <section data-spotlight className="border-t">
          <div className="mx-auto w-full max-w-6xl px-4 py-16">
            <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-2">
              {settings.income_block?.label || t("title")}
            </h2>
            <p className="text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto">
              {t("realEmpty")}
            </p>
          </div>
        </section>
      );
    }
  } else {
    // dummy (или real без БД → деградация в dummy, блок не должен пустовать)
    // Seed рендера передаётся клиенту — тикер продолжает ту же
    // последовательность (см. lib/earnings.ts).
    const seed = randomEarningsSeed();
    entries = generateEarningsFeed(seed, Date.now(), FEED_STEPS, cfg);
    live = true;
    renderSeed = seed;
  }

  return (
    <section data-spotlight className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-2">
          {settings.income_block?.label || t("title")}
        </h2>
        <p className="text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto mb-8">
          {t("subtitle")}
        </p>
        <EarningsFeed initialEntries={entries} config={cfg} baseSeed={renderSeed} live={live} />
        <p className="mt-6 text-center text-xs text-muted-foreground">{t("note")}</p>
      </div>
    </section>
  );
}

/** Скелет на время стриминга рантайм-части (PPR). */
function IncomeSkeleton() {
  return (
    <section className="border-t" aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 h-8 w-72 animate-pulse rounded-full bg-muted/70" />
        <div className="mx-auto flex max-w-2xl flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function IncomeSection() {
  return (
    <Suspense fallback={<IncomeSkeleton />}>
      <IncomeList />
    </Suspense>
  );
}

import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { CalendarCheckIcon, MapPinIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dateLocaleFor } from "@/lib/i18n-date";
import { db, dbConfigured } from "@/lib/ultra/db";

import { EarningsFeed } from "@/components/home/EarningsFeed";
import {
  anonymizeLedgerEmail,
  generateEarningsFeed,
  randomEarningsSeed,
  type EarningEntry,
  type EarningsConfig,
} from "@/lib/earnings";
import { readOwnerSettings } from "@/lib/owner-settings";

/** Свежесть события для подсветки (решение владельца: 24 ч). */
const FRESH_MS = 24 * 60 * 60 * 1000;
const FEED_STEPS = 8;
const REAL_LIMIT = 8;

interface HomeEvent {
  id: string;
  title: string;
  location: string;
  date: string | null;
  costEuros: number | null;
  status: string;
  createdAt: string;
  maxPlayers: number | null;
}

/**
 * Общая секция главной (владелец 22.11 №11): «Прямо сейчас» + «Зарабатывают
 * уже сейчас» — В ОДНОЙ секции, две колонки. Слева события списком с
 * иконочными кнопками «Бронировать»/«Участвовать» (тултипы), справа лента
 * выплат с кнопкой «добавить событие» (тестовая запись с анимацией).
 * Рантайм-данные (cacheComponents): `await connection()` внутри Suspense.
 */
async function LiveNow({ lang }: { lang: string }) {
  await connection();
  const tE = await getTranslations("home.events");
  const tI = await getTranslations("home.earnings");
  const t = await getTranslations("home.live");

  /* ── События (бывшая EventsSection) ── */
  let events: HomeEvent[] = [];
  if (dbConfigured()) {
    try {
      const rows = await db<{
        id: string;
        title: string;
        court_location: string | null;
        event_date: string | null;
        total_court_cost: string | null;
        status: string;
        created_at: string;
        max_players: number | null;
      }>(
        `SELECT id, title, court_location, event_date, total_court_cost,
                status, created_at, max_players
         FROM badminton_events
         ORDER BY created_at DESC
         LIMIT 10`
      );
      events = rows.map((row) => ({
        id: row.id,
        title: row.title,
        location: row.court_location ?? "",
        date: row.event_date,
        costEuros: row.total_court_cost ? Number(row.total_court_cost) : null,
        status: row.status,
        createdAt: row.created_at,
        maxPlayers: row.max_players,
      }));
    } catch (error) {
      console.error("[events-home] read failed", error);
    }
  }

  /* ── Доходы (бывшая IncomeSection) ── */
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
      entries = rows.map((row, i) => ({
        index: i,
        type: row.kind === "cashback" ? "cashback" : "percent",
        amountCents: Math.round(Number(row.amount) * 100),
        ...anonymizeLedgerEmail(row.beneficiary_email),
        ts: new Date(row.created_at).getTime(),
      }));
    } catch (error) {
      console.error("[income] ledger read failed", error);
    }
  }
  if (entries.length === 0) {
    // dummy (или real без данных → деградация в dummy, блок не пустует)
    const seed = randomEarningsSeed();
    entries = generateEarningsFeed(seed, Date.now(), FEED_STEPS, cfg);
    live = true;
    renderSeed = seed;
  }

  const dateFmt = new Intl.DateTimeFormat(dateLocaleFor(lang), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const now = Date.now();

  return (
    <section data-spotlight className="border-t">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-8">
          {t("title")}
        </h2>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          {/* ── Колонка «Прямо сейчас»: список событий ── */}
          <div className="flex flex-col">
            <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {tE("title")}
            </h3>

            {events.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {t("eventsEmpty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {events.map((event) => {
                  const isFresh = now - new Date(event.createdAt).getTime() < FRESH_MS;
                  const isOpen = event.status === "open";
                  return (
                    <li
                      key={event.id}
                      className={`relative flex flex-col gap-1.5 rounded-2xl border bg-card px-4 py-3 transition-shadow hover:shadow-md ${
                        isFresh ? "border-primary/50 ring-1 ring-primary/30" : ""
                      }`}
                    >
                      {isFresh && (
                        <span className="absolute -top-2.5 end-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          {tE("newBadge")}
                        </span>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isOpen
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isOpen ? tE("statusOpen") : tE("statusClosed")}
                        </span>
                        {event.costEuros != null && (
                          <p className="text-sm font-medium text-foreground">
                            {tE("costTotal", { cost: event.costEuros })}
                          </p>
                        )}
                      </div>
                      <h4 className="font-semibold leading-snug">{event.title}</h4>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {event.date && (
                          <span className="inline-flex items-center gap-1">
                            {dateFmt.format(new Date(event.date))}
                          </span>
                        )}
                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPinIcon className="size-3.5 shrink-0" aria-hidden />
                            {event.location}
                          </span>
                        )}
                        {event.maxPlayers != null && (
                          <span className="inline-flex items-center gap-1">
                            <UsersIcon className="size-3.5" aria-hidden />
                            {tE("maxPlayers", { count: event.maxPlayers })}
                          </span>
                        )}
                      </p>
                      {/* Иконочные кнопки с тултипами (№11) */}
                      <div className="mt-1 flex items-center gap-2">
                        <Link
                          href="/recreation/badminton"
                          aria-label={t("booking")}
                          data-tip={t("booking")}
                          data-tip-pos="top"
                          className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${
                            isOpen
                              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                              : "pointer-events-none border-border text-muted-foreground opacity-40"
                          }`}
                        >
                          <CalendarCheckIcon className="size-4" />
                        </Link>
                        <Link
                          href="/recreation/badminton"
                          aria-label={t("join")}
                          data-tip={t("join")}
                          data-tip-pos="top"
                          className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${
                            isOpen
                              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                              : "pointer-events-none border-border text-muted-foreground opacity-40"
                          }`}
                        >
                          <UserPlusIcon className="size-4" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 text-center">
              <Link
                href="/recreation"
                className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                {tE("seeAll")}
              </Link>
            </div>
          </div>

          {/* ── Колонка «Зарабатывают уже сейчас» ── */}
          <div className="flex flex-col">
            <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {settings.income_block?.label || tI("title")}
            </h3>
            <EarningsFeed
              initialEntries={entries}
              config={cfg}
              baseSeed={renderSeed}
              live={live}
              allowTestAdd
            />
            <p className="mt-4 text-center text-xs text-muted-foreground">{tI("note")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Скелет на время стриминга рантайм-части (PPR). */
function LiveNowSkeleton() {
  return (
    <section className="border-t" aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 h-8 w-72 animate-pulse rounded-full bg-muted/70" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted/50" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiveNowSection({ lang }: { lang: string }) {
  return (
    <Suspense fallback={<LiveNowSkeleton />}>
      <LiveNow lang={lang} />
    </Suspense>
  );
}

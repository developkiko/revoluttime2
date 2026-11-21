import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { connection } from "next/server";
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dateLocaleFor } from "@/lib/i18n-date";
import { db, dbConfigured } from "@/lib/ultra/db";

/** Свежесть события для подсветки (решение владельца: 24 ч). */
const FRESH_MS = 24 * 60 * 60 * 1000;

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
 * «Прямо сейчас» на главной (Фаза C, решение владельца 21.11): последние
 * 10 событий из badminton_events (сид + админ-CRUD в adm-rt). События,
 * добавленные за последние 24 ч, подсвечиваются бейджем «новое».
 * БД пуста/недоступна → секция не рендерится.
 * Рантайм-данные (cacheComponents): `await connection()` внутри Suspense.
 */
async function EventsList({ lang }: { lang: string }) {
  await connection();
  const t = await getTranslations("home.events");

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

  if (events.length === 0) return null;

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
        <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-2">
          {t("title")}
        </h2>
        <p className="text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto mb-8">
          {t("subtitle")}
        </p>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const isFresh = now - new Date(event.createdAt).getTime() < FRESH_MS;
            const isOpen = event.status === "open";
            return (
              <li
                key={event.id}
                data-tilt
                className={`relative flex flex-col gap-2 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md ${
                  isFresh ? "border-primary/50 ring-1 ring-primary/30" : ""
                }`}
              >
                {isFresh && (
                  <span className="absolute -top-2.5 end-4 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    {t("newBadge")}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isOpen
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isOpen ? t("statusOpen") : t("statusClosed")}
                  </span>
                </div>
                <h3 className="font-semibold leading-snug">{event.title}</h3>
                {event.date && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarIcon className="size-4 shrink-0" aria-hidden />
                    {dateFmt.format(new Date(event.date))}
                  </p>
                )}
                {event.location && (
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPinIcon className="size-4 shrink-0" aria-hidden />
                    {event.location}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  {event.costEuros != null && (
                    <p className="text-sm font-medium text-foreground">
                      {t("costTotal", { cost: event.costEuros })}
                    </p>
                  )}
                  {event.maxPlayers != null && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <UsersIcon className="size-3.5" aria-hidden />
                      {t("maxPlayers", { count: event.maxPlayers })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/recreation"
            className="inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {t("seeAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Скелет на время стриминга рантайм-части (PPR). */
function EventsSkeleton() {
  return (
    <section className="border-t" aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mx-auto mb-8 h-8 w-64 animate-pulse rounded-full bg-muted/70" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted/50" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventsSection({ lang }: { lang: string }) {
  return (
    <Suspense fallback={<EventsSkeleton />}>
      <EventsList lang={lang} />
    </Suspense>
  );
}

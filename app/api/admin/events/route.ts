import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

/**
 * CRUD событий «Конференция и отдых» для админки adm-rt:
 *   GET            → все события (новые сверху)
 *   POST           → создать {title, courtLocation, eventDate, cost?, min?, max?, status?}
 *   PATCH          → обновить {id, …поля}
 *   DELETE {id}    → удалить
 * Auth: Bearer adm_api-токен (бридж /api/admin/ticket) или админ-сессия сайта.
 */

interface EventFields {
  title?: string;
  court_location?: string;
  event_date?: string;
  total_court_cost?: number;
  min_players?: number;
  max_players?: number;
  status?: string;
}

const STATUSES = new Set(["open", "closed", "cancelled", "completed"]);

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }
  try {
    const rows = await db(
      `SELECT id, title, court_location, event_date, total_court_cost,
              min_players, max_players, status, created_at
       FROM badminton_events ORDER BY created_at DESC LIMIT 100`
    );
    return NextResponse.json({ events: rows });
  } catch (error) {
    console.error("[admin/events] read failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: EventFields = {};
  try {
    body = (await request.json()) as EventFields;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const title = (body.title ?? "").trim();
  if (title.length < 3) {
    return NextResponse.json({ error: "title_required" }, { status: 400 });
  }
  const eventDate = body.event_date ? new Date(body.event_date) : null;
  if (!eventDate || Number.isNaN(eventDate.getTime())) {
    return NextResponse.json({ error: "event_date_required" }, { status: 400 });
  }

  try {
    const inserted = await dbOne<{ id: string }>(
      `INSERT INTO badminton_events
         (title, court_location, event_date, total_court_cost, min_players, max_players, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        title,
        body.court_location ?? null,
        eventDate.toISOString(),
        body.total_court_cost ?? null,
        Math.max(2, body.min_players ?? 4),
        Math.max(2, body.max_players ?? 8),
        STATUSES.has(body.status ?? "") ? body.status : "open",
      ]
    );
    return NextResponse.json({ ok: true, id: inserted?.id ?? null });
  } catch (error) {
    console.error("[admin/events] insert failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: EventFields & { id?: string } = {};
  try {
    body = (await request.json()) as EventFields & { id?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  const sets: string[] = [];
  const values: unknown[] = [];
  let n = 1;
  if (body.title !== undefined) { sets.push(`title = $${n++}`); values.push(body.title.trim()); }
  if (body.court_location !== undefined) { sets.push(`court_location = $${n++}`); values.push(body.court_location); }
  if (body.event_date !== undefined) {
    const d = new Date(body.event_date);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: "bad_event_date" }, { status: 400 });
    }
    sets.push(`event_date = $${n++}`);
    values.push(d.toISOString());
  }
  if (body.total_court_cost !== undefined) { sets.push(`total_court_cost = $${n++}`); values.push(body.total_court_cost); }
  if (body.min_players !== undefined) { sets.push(`min_players = $${n++}`); values.push(Math.max(2, body.min_players)); }
  if (body.max_players !== undefined) { sets.push(`max_players = $${n++}`); values.push(Math.max(2, body.max_players)); }
  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) return NextResponse.json({ error: "bad_status" }, { status: 400 });
    sets.push(`status = $${n++}`);
    values.push(body.status);
  }
  if (sets.length === 0) return NextResponse.json({ error: "nothing_to_update" }, { status: 400 });
  values.push(body.id);

  try {
    await db(`UPDATE badminton_events SET ${sets.join(", ")} WHERE id = $${n}`, values);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/events] update failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!dbConfigured()) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  let body: { id?: string } = {};
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });

  try {
    await db(`DELETE FROM badminton_events WHERE id = $1`, [body.id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/events] delete failed", error);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
}

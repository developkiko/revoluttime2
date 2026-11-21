import { connection, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/ultra/db";

/**
 * Публичный список событий «Конференция и отдых» для блока «Прямо сейчас»
 * на главной: последние 10 добавленных, новое сверху. Читается из
 * badminton_events (Supabase); при недоступной БД — пустой список
 * (фолбэк-сид отдаёт статичный каталог событий).
 */
export async function GET() {
  await connection();
  if (!dbConfigured()) {
    return NextResponse.json({ events: [], source: "unconfigured" });
  }
  try {
    const rows = await db<{
      id: string;
      title: string;
      court_location: string | null;
      event_date: string | null;
      total_court_cost: string | null;
      status: string;
      created_at: string;
    }>(
      `SELECT id, title, court_location, event_date, total_court_cost, status, created_at
       FROM badminton_events
       ORDER BY created_at DESC
       LIMIT 10`
    );
    return NextResponse.json({
      events: rows.map((row) => ({
        id: row.id,
        title: row.title,
        location: row.court_location ?? "",
        date: row.event_date,
        cost: row.total_court_cost ? Number(row.total_court_cost) : null,
        status: row.status,
        createdAt: row.created_at,
      })),
      source: "db",
    });
  } catch (error) {
    console.error("[events] read failed", error);
    return NextResponse.json({ events: [], source: "error" });
  }
}

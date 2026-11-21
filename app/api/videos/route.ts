import { connection, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/ultra/db";

/**
 * Публичный список видео и записей стримов (Фаза B) для страниц /videos
 * и /streams. Возвращает только активные записи (active = true), новые
 * сверху. on_home/home_until (Онлайн-блок главной) поднимаются в Фазе C —
 * здесь они просто видны в выдаче, блок главной их фильтрует сам.
 */
export async function GET() {
  await connection();
  if (!dbConfigured()) {
    return NextResponse.json({ videos: [], source: "unconfigured" });
  }
  try {
    const rows = await db<{
      id: string;
      title: string;
      description: string | null;
      provider: string;
      url: string;
      kind: string;
      poster: string | null;
      duration_seconds: number | null;
      created_at: string;
    }>(
      `SELECT id, title, description, provider, url, kind, poster,
              duration_seconds, created_at
       FROM site_videos
       WHERE active = true
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return NextResponse.json({
      videos: rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        provider: row.provider,
        url: row.url,
        kind: row.kind,
        poster: row.poster,
        durationSeconds: row.duration_seconds,
        createdAt: row.created_at,
      })),
      source: "db",
    });
  } catch (error) {
    console.error("[videos] read failed", error);
    return NextResponse.json({ videos: [], source: "error" });
  }
}

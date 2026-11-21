import { connection, NextResponse } from "next/server";
import { db, dbConfigured } from "@/lib/ultra/db";

/**
 * Публичный список альбомов галереи (владелец 22.11 №6) для страницы
 * /gallery: активные альбомы с количеством элементов и обложкой.
 */
export async function GET() {
  await connection();
  if (!dbConfigured()) {
    return NextResponse.json({ albums: [], source: "unconfigured" });
  }
  try {
    const rows = await db<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      cover: string | null;
      items_count: string | number;
    }>(
      `SELECT a.id, a.slug, a.title, a.description, a.cover,
              COUNT(i.id) FILTER (WHERE i.active) AS items_count
       FROM gallery_albums a
       LEFT JOIN gallery_items i ON i.album_id = a.id
       WHERE a.active
       GROUP BY a.id
       ORDER BY a.sort, a.created_at DESC
       LIMIT 100`
    );
    return NextResponse.json({
      albums: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        cover: row.cover,
        itemsCount: Number(row.items_count ?? 0),
      })),
      source: "db",
    });
  } catch (error) {
    console.error("[gallery] read failed", error);
    return NextResponse.json({ albums: [], source: "error" });
  }
}

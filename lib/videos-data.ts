import "server-only";

import { db, dbConfigured } from "@/lib/ultra/db";

/** Серверное чтение видеозаписей для страниц /videos и /streams (Фаза B).
 *  Фолбэк при недоступной БД — пустой список (страницы рисуют empty-state
 *  с атомом-лоадером). Сортировка: новые сверху. */

export interface SiteVideo {
  id: string;
  title: string;
  description: string | null;
  provider: "blob" | "youtube";
  url: string;
  kind: "video" | "stream";
  poster: string | null;
  durationSeconds: number | null;
  createdAt: string;
}

interface Row {
  id: string;
  title: string;
  description: string | null;
  provider: string;
  url: string;
  kind: string;
  poster: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export async function listSiteVideos(kind: "video" | "stream"): Promise<SiteVideo[]> {
  if (!dbConfigured()) return [];
  try {
    const rows = await db<Row>(
      `SELECT id, title, description, provider, url, kind, poster,
              duration_seconds, created_at
       FROM site_videos
       WHERE active = true AND kind = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [kind]
    );
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      provider: row.provider === "youtube" ? "youtube" : "blob",
      url: row.url,
      kind: row.kind === "stream" ? "stream" : "video",
      poster: row.poster,
      durationSeconds: row.duration_seconds,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("[videos-data] read failed", error);
    return [];
  }
}

/** Формат длительности «3:24» для карточек (null — не показывать). */
export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0
    ? `${h}:${mm}:${String(s).padStart(2, "0")}`
    : `${mm}:${String(s).padStart(2, "0")}`;
}

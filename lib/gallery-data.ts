import "server-only";

import { db, dbConfigured } from "@/lib/ultra/db";

/** Чтение галереи для страниц /gallery и /gallery/[slug] (№6).
 *  Грейсфул: без БД/ошибка → пустые списки (страницы рисуют empty-state). */

export interface GalleryAlbum {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  itemsCount: number;
}

export interface GalleryItem {
  id: string;
  title: string | null;
  type: "photo" | "video";
  url: string;
  poster: string | null;
}

export async function listAlbums(): Promise<GalleryAlbum[]> {
  if (!dbConfigured()) return [];
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
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      cover: row.cover,
      itemsCount: Number(row.items_count ?? 0),
    }));
  } catch (error) {
    console.error("[gallery-data] albums failed", error);
    return [];
  }
}

export async function listItems(albumSlug: string): Promise<GalleryItem[]> {
  if (!dbConfigured()) return [];
  try {
    const rows = await db<{
      id: string;
      title: string | null;
      type: string;
      url: string;
      poster: string | null;
    }>(
      `SELECT i.id, i.title, i.type, i.url, i.poster
       FROM gallery_items i
       JOIN gallery_albums a ON a.id = i.album_id
       WHERE a.slug = $1 AND i.active AND a.active
       ORDER BY i.sort, i.created_at DESC
       LIMIT 500`,
      [albumSlug]
    );
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type === "video" ? "video" : "photo",
      url: row.url,
      poster: row.poster,
    }));
  } catch (error) {
    console.error("[gallery-data] items failed", error);
    return [];
  }
}

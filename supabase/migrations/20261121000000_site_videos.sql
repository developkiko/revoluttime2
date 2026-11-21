-- ── Видео и записи стримов (Фаза B, 21.11.2026) ─────────────────────────────
-- provider: blob (Vercel Blob) | youtube (встроенное, без скачивания)
-- kind:     video (галерея /videos) | stream (записи стримов /streams)
-- on_home + home_until: Онлайн-блок главной (Фаза C) — одно видео «на главную»,
-- авто-гашение через настраиваемые часы (12 ч по умолчанию).
-- Эта же схема продублирована в self-heal SCHEMA_DDL (lib/ultra/db.ts).

CREATE TABLE IF NOT EXISTS site_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  provider text NOT NULL DEFAULT 'blob',
  url text NOT NULL,
  kind text NOT NULL DEFAULT 'video',
  on_home boolean NOT NULL DEFAULT false,
  home_until timestamptz,
  poster text,
  duration_seconds integer,
  size_bytes bigint,
  content_type text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "videos_public_read" ON site_videos;
CREATE POLICY "videos_public_read" ON site_videos FOR SELECT USING (true);

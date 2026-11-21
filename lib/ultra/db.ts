/** Supabase Postgres access layer (pg driver via the Supabase pooler).
 *  Owner decision 21.11: ONE database — the ultra/auth stack (users,
 *  auth_links, ultra_kv, …) lives in the same Supabase `revtime` project as
 *  the encyclopedia/orders, instead of a separate Neon. DATABASE_URL is the
 *  Supabase pooler connection string (transaction pooler port 6543). */

import { Client } from "pg";

function connectionString(): string {
  return process.env.DATABASE_URL || "";
}

export function dbConfigured(): boolean {
  return Boolean(connectionString());
}

/**
 * Self-healing schema for the Ultra APIs (ported from ultra-proxy-next-main).
 * Runs once per process before the first query, so a fresh database
 * works without a separate migration step.
 */
const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS users (
  email text PRIMARY KEY,
  id text NOT NULL,
  password_hash text NOT NULL DEFAULT '',
  password_scheme text NOT NULL DEFAULT 'plaintext',
  login text NOT NULL DEFAULT '',
  balance double precision NOT NULL DEFAULT 0,
  wallet_attached boolean,
  payment_status text,
  payment_updated_at timestamptz,
  error_state text,
  ip text,
  geo jsonb,
  ua jsonb,
  referer text,
  created_at timestamptz,
  updated_at timestamptz,
  telegram_id text,
  telegram_username text,
  telegram_photo_url text,
  auth_provider text NOT NULL DEFAULT 'email'
);
CREATE TABLE IF NOT EXISTS visits (
  id text PRIMARY KEY,
  date text NOT NULL,
  ts timestamptz,
  user_id text,
  visitor_id text,
  page text,
  ip text,
  geo jsonb,
  ua text,
  referer text,
  legacy_kv_key text,
  legacy_array_index integer DEFAULT 0
);
CREATE TABLE IF NOT EXISTS payments (
  session_id text PRIMARY KEY,
  email text,
  amount double precision,
  status text,
  url text,
  token text,
  network text,
  wallet text,
  created_at timestamptz,
  expires_at timestamptz,
  updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS telegram_clients (
  chat_id text PRIMARY KEY,
  first_name text,
  last_name text,
  username text,
  started_at timestamptz,
  last_seen_at timestamptz
);
CREATE TABLE IF NOT EXISTS telegram_messages (
  legacy_kv_key text PRIMARY KEY,
  chat_id text,
  from_id text,
  first_name text,
  last_name text,
  username text,
  text text,
  at timestamptz
);
CREATE TABLE IF NOT EXISTS ultra_products (
  id text PRIMARY KEY,
  type text,
  name_ru text,
  name_en text,
  traffic_ru text,
  traffic_en text,
  price double precision,
  old_price double precision,
  discount text,
  features jsonb,
  popular boolean,
  sort_order integer,
  updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS ultra_reviews (
  id text PRIMARY KEY,
  name_ru text,
  name_en text,
  role_ru text,
  role_en text,
  text_ru text,
  text_en text,
  stars integer,
  avatar text,
  created_at timestamptz,
  updated_at timestamptz
);
CREATE TABLE IF NOT EXISTS site_config (
  id integer PRIMARY KEY DEFAULT 1,
  config jsonb
);
CREATE TABLE IF NOT EXISTS admin_chats (
  chat_id text,
  kind text,
  source text,
  updated_at timestamptz,
  PRIMARY KEY (chat_id, kind)
);
CREATE TABLE IF NOT EXISTS ultra_kv (
  key text PRIMARY KEY,
  value text NOT NULL,
  expires_at timestamptz
);
CREATE TABLE IF NOT EXISTS auth_links (
  email text PRIMARY KEY,
  google_id text UNIQUE,
  telegram_id text UNIQUE,
  facebook_id text UNIQUE,
  login_email text UNIQUE,
  display_name text,
  picture text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
/* Финансовый леджер и партнёрские коды (владелец 21.11 — кеш-бэк 300 €):
   kind разделяет «фонд 64 %» и «кеш-бэк за приведённого», beneficiary_email —
   получатель (ref_code → anchor), статус pending размораживается по
   unlocks_at (lazy, без крона — холдинг под возвраты Stripe). */
ALTER TABLE financial_ledger ADD COLUMN IF NOT EXISTS kind text DEFAULT 'fund';
ALTER TABLE financial_ledger ADD COLUMN IF NOT EXISTS ref_code text;
ALTER TABLE financial_ledger ADD COLUMN IF NOT EXISTS beneficiary_email text;
ALTER TABLE auth_links ADD COLUMN IF NOT EXISTS ref_code text;
/* Избранное (Фаза G — владелец: «локально всем + синк в БД
   авторизованным»): список id (видео, статьи) прямо на юзере —
   объём маленький, отдельная таблица не нужна. */
ALTER TABLE users ADD COLUMN IF NOT EXISTS favorites jsonb NOT NULL DEFAULT '[]'::jsonb;
/* Видео и записи стримов (Фаза B — владелец 21.11): provider разделяет
   Blob-файлы и YouTube-ссылки (без скачивания), kind — видео или запись
   стрима. on_home + home_until — «Онлайн»-блок главной (Фаза C): одно видео
   с галочкой «на главную», авто-гашение через настраиваемые 12 ч. */
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
`;

let schemaPromise: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = rawQuery(SCHEMA_DDL)
      .then(() => undefined)
      .catch((error) => {
        schemaPromise = null;
        throw error;
      });
  }
  return schemaPromise;
}

export async function db<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const url = connectionString();
  if (!url) throw new Error("ULTRA_DB_NOT_CONFIGURED: DATABASE_URL is not set");
  await ensureSchema();
  return rawQuery<T>(text, params);
}

async function rawQuery<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const client = new Client({ connectionString: connectionString() });
  await client.connect();
  try {
    const result = await client.query(text, params);
    // Multi-statement queries (no params → simple protocol) return an array.
    if (Array.isArray(result)) {
      return result.flatMap((r) => (r.rows ?? [])) as T[];
    }
    return result.rows as T[];
  } finally {
    await client.end().catch(() => {});
  }
}

export async function dbOne<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await db<T>(text, params);
  return rows[0] || null;
}

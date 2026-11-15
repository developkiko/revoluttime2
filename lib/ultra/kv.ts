/**
 * KV-compatible store backed by Neon Postgres (`ultra_kv` table).
 * Replaces the original Cloudflare KV HTTP client so the Ultra APIs run on
 * Vercel with only DATABASE_URL configured. Reads degrade to an empty store
 * when DATABASE_URL is missing; writes throw (auth/payments need the DB).
 */

import { db, dbConfigured } from "./db";

export async function kvGet(key: string): Promise<string | null> {
  if (!dbConfigured()) return null;
  const rows = await db<{ value: string; expired: boolean }>(
    `SELECT value, (expires_at IS NOT NULL AND expires_at <= now()) AS expired
     FROM ultra_kv WHERE key = $1`,
    [key]
  );
  const row = rows[0];
  if (!row) return null;
  if (row.expired) {
    // Lazy TTL cleanup, mirrors Cloudflare KV expiration semantics.
    await db(`DELETE FROM ultra_kv WHERE key = $1`, [key]).catch(() => {});
    return null;
  }
  return row.value;
}

export async function kvGetJson<T = unknown>(key: string, fallback: T): Promise<T> {
  const raw = await kvGet(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function kvPut(
  key: string,
  value: string,
  expirationTtl?: number
): Promise<void> {
  const expiresAt =
    expirationTtl && expirationTtl > 0
      ? new Date(Date.now() + expirationTtl * 1000).toISOString()
      : null;
  await db(
    `INSERT INTO ultra_kv (key, value, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at`,
    [key, value, expiresAt]
  );
}

export async function kvDelete(key: string): Promise<void> {
  await db(`DELETE FROM ultra_kv WHERE key = $1`, [key]);
}

export async function kvList(prefix: string, limit = 1000): Promise<string[]> {
  if (!dbConfigured()) return [];
  const rows = await db<{ key: string }>(
    `SELECT key FROM ultra_kv
     WHERE starts_with(key, $1) AND (expires_at IS NULL OR expires_at > now())
     LIMIT $2`,
    [prefix, limit]
  );
  return rows.map((row) => row.key);
}

export async function requireAdminToken(tokenParam: string | null): Promise<boolean> {
  if (!tokenParam) return false;
  const session = await kvGet("admin_token:" + tokenParam);
  return !!session;
}

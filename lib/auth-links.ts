/**
 * Cross-provider account linking (site stack).
 *
 * Sessions are stateless HMAC cookies keyed by email; linking data lives in
 * the Neon `auth_links` table (self-healing schema in lib/ultra/db.ts). The
 * anchor identity is the canonical email of whichever provider authenticated
 * first; every other provider id attaches to that anchor, so the cabinet can
 * list and unlink sign-in methods. graceful: without DATABASE_URL every call
 * resolves to the provider email and no linking is stored.
 */

import { db, dbConfigured, dbOne } from "@/lib/ultra/db";

export type AuthProvider = "google" | "telegram" | "facebook";

const PROVIDER_COL: Record<AuthProvider, string> = {
  google: "google_id",
  telegram: "telegram_id",
  facebook: "facebook_id",
};

export interface AuthLinkRow {
  email: string;
  google_id: string | null;
  telegram_id: string | null;
  facebook_id: string | null;
  login_email: string | null;
}

function isAuthProvider(value: string): value is AuthProvider {
  return value === "google" || value === "telegram" || value === "facebook";
}

export function parseProvider(value: string): AuthProvider | null {
  return isAuthProvider(value) ? value : null;
}

/** Find (or create by email) the anchor identity for a provider login. */
export async function resolveAnchor(
  provider: AuthProvider,
  providerId: string,
  email: string
): Promise<string> {
  if (!dbConfigured()) return email;
  const col = PROVIDER_COL[provider];
  const byProvider = await db<{ email: string }>(
    `SELECT email FROM auth_links WHERE ${col} = $1 LIMIT 1`,
    [providerId]
  ).catch(() => []);
  if (byProvider[0]) return byProvider[0].email;

  const byEmail = await dbOne<{ email: string }>(
    `SELECT email FROM auth_links WHERE email = $1`,
    [email]
  ).catch(() => null);
  if (byEmail) return email;

  // Fresh anchor for a brand-new identity.
  await db(
    `INSERT INTO auth_links (email, updated_at) VALUES ($1, now())
     ON CONFLICT (email) DO NOTHING`,
    [email]
  ).catch(() => {});
  return email;
}

/** Attach a provider id to the anchor (moves it from any other anchor first).
 *  Optionally stores the display name + avatar URL (Telegram flow 21.11). */
export async function attachProvider(
  anchorEmail: string,
  provider: AuthProvider,
  providerId: string,
  profile?: { displayName?: string; picture?: string }
): Promise<void> {
  if (!dbConfigured()) return;
  const col = PROVIDER_COL[provider];
  await db(
    `UPDATE auth_links SET ${col} = NULL, updated_at = now() WHERE ${col} = $1 AND email <> $2`,
    [providerId, anchorEmail]
  ).catch(() => {});
  await db(
    `INSERT INTO auth_links (email, ${col}, display_name, picture, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (email) DO UPDATE SET ${col} = $2,
       display_name = COALESCE($3, auth_links.display_name),
       picture = COALESCE($4, auth_links.picture),
       updated_at = now()`,
    [anchorEmail, providerId, profile?.displayName ?? null, profile?.picture ?? null]
  ).catch(() => {});
}

export async function getAuthLinks(anchorEmail: string): Promise<AuthLinkRow | null> {
  if (!dbConfigured()) return null;
  return dbOne<AuthLinkRow>(
    `SELECT email, google_id, telegram_id, facebook_id, login_email
     FROM auth_links WHERE email = $1`,
    [anchorEmail]
  );
}

export interface UnlinkResult {
  ok: boolean;
  /** "last_method" — the owner-requested guard for the only remaining method. */
  error?: "last_method" | "not_found";
}

export async function unlinkProvider(
  anchorEmail: string,
  provider: AuthProvider
): Promise<UnlinkResult> {
  if (!dbConfigured()) return { ok: false, error: "not_found" };
  const row = await getAuthLinks(anchorEmail);
  if (!row) return { ok: false, error: "not_found" };

  const methods = [
    row.google_id ? "google" : null,
    row.telegram_id ? "telegram" : null,
    row.facebook_id ? "facebook" : null,
    row.login_email ? "email" : null,
  ].filter(Boolean) as string[];

  // Owner rule: the last remaining method (with no email set) cannot go.
  if (methods.length <= 1 && !(methods.length === 1 && methods[0] !== provider)) {
    return { ok: false, error: "last_method" };
  }

  const col = PROVIDER_COL[provider];
  await db(
    `UPDATE auth_links SET ${col} = NULL, updated_at = now() WHERE email = $1`,
    [anchorEmail]
  );
  return { ok: true };
}

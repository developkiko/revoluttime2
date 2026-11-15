// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — серверные сессии (KV: session:{token})
// Cookie: up_session (httpOnly) — ставится только сервером
// ══════════════════════════════════════════════════════════════

import { kvDelete, kvGet, kvPut } from "./kv";

export interface Session {
  token: string;
  email: string;
  login: string;
  expiresAt: number;
}

export const SESSION_COOKIE = "up_session";
export const SESSION_TTL = 7 * 24 * 60 * 60; // seconds

export async function createSession(email: string, login: string): Promise<Session> {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const session: Session = { token, email, login, expiresAt: Date.now() + SESSION_TTL * 1000 };
  await kvPut("session:" + token, JSON.stringify(session), SESSION_TTL);
  return session;
}

export async function getSession(token: string | null | undefined): Promise<Session | null> {
  if (!token) return null;
  const raw = await kvGet("session:" + token);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s?.email || !s?.expiresAt || s.expiresAt < Date.now()) return null;
    return s as Session;
  } catch {
    return null;
  }
}

export function sessionFromRequest(request: Request): Promise<Session | null> {
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(new RegExp("(?:^|;\\s*)" + SESSION_COOKIE + "=([^;]+)"));
  return getSession(m ? decodeURIComponent(m[1]) : null);
}

export async function deleteSession(token: string | null | undefined): Promise<void> {
  if (token) await kvDelete("session:" + token);
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") || "";
  const m = cookie.match(new RegExp("(?:^|;\\s*)" + SESSION_COOKIE + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

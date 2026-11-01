import * as crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Stateless signed session: base64url(JSON payload) + "." + HMAC-SHA256.
 * No database required — swap for Supabase sessions once the users table lands.
 */

export interface SessionUser {
  email: string;
  name: string;
  provider: "telegram" | "google";
}

const COOKIE_NAME = "rt_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function sessionSecret(): string | undefined {
  const secret = process.env.AUTH_SESSION_SECRET;
  return secret && secret.length >= 16 ? secret : undefined;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionCookieValue(user: SessionUser): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = base64url(
    JSON.stringify({ ...user, exp: Date.now() + MAX_AGE_SECONDS * 1000 })
  );
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySession(
  cookieValue: string | undefined
): SessionUser | null {
  if (!cookieValue) return null;
  const secret = sessionSecret();
  if (!secret) return null;
  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as
      | (SessionUser & { exp: number })
      | null;
    if (!data?.email || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }
    return { email: data.email, name: data.name, provider: data.provider };
  } catch {
    return null;
  }
}

/** Read the current session user from the request cookies (server components/routes). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get(COOKIE_NAME)?.value);
}

export async function setSessionCookie(user: SessionUser): Promise<boolean> {
  const value = createSessionCookieValue(user);
  if (!value) return false;
  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

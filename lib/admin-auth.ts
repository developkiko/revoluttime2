/** Админ-авторизация для server-to-server API adm-rt:
 *  1) Bearer <adm_api.v1 token> — выдается бриджем /api/admin/ticket (7 дней),
 *  2) либо сессия сайта с флагом/env админа (браузерные вызовы с этого домена).
 *  Секрет никогда не покидает сайт — adm-rt хранит только выданный токен. */

import * as crypto from "node:crypto";
import { getSessionUser, isAdminEmail } from "./auth-session";

const TOKEN_PREFIX = "adm_api.v1.";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 дней

function secret(): string | undefined {
  const s = process.env.AUTH_SESSION_SECRET;
  return s && s.length >= 16 ? s : undefined;
}

function sign(payload: string, key: string): string {
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

export function mintAdminApiToken(email: string): string | null {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({ email: email.toLowerCase(), exp: Date.now() + TOKEN_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(TOKEN_PREFIX + payload, key)}`;
}

export function verifyAdminApiToken(token: string): { email: string } | null {
  const key = secret();
  if (!key) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(TOKEN_PREFIX + payload, key);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      email?: string;
      exp?: number;
    };
    if (!data?.email || typeof data.exp !== "number" || data.exp < Date.now()) {
      return null;
    }
    return { email: data.email };
  } catch {
    return null;
  }
}

/** Gate для админ-API: Bearer-токен adm-rt или админ-сессия сайта. */
export async function requireAdmin(request: Request): Promise<{ email: string } | null> {
  const auth = request.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) {
    const tokenAuth = verifyAdminApiToken(auth.slice(7).trim());
    if (tokenAuth) return tokenAuth;
  }
  const user = await getSessionUser();
  if (user && (user.isAdmin === true || isAdminEmail(user.email))) {
    return { email: user.email };
  }
  return null;
}

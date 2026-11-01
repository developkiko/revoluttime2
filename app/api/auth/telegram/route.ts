import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { setSessionCookie, type SessionUser } from "@/lib/auth-session";

interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Verifies Telegram Login Widget data per
 * https://core.telegram.org/widgets/login#checking-authorization:
 * secret_key = SHA256(bot_token); hash = HMAC-SHA256(data_check_string, secret_key).
 */
function verifyTelegramAuth(
  data: TelegramAuthData,
  botToken: string
): boolean {
  const { hash, ...fields } = data;
  const checkString = Object.keys(fields)
    .sort()
    .map((key) => `${key}=${fields[key as keyof typeof fields]}`)
    .join("\n");
  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const computed = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");
  const a = Buffer.from(computed);
  const b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  let data: TelegramAuthData;
  try {
    data = (await request.json()) as TelegramAuthData;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!data?.id || !data.hash || !data.auth_date) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // reject payloads older than 24h (replay protection)
  if (Date.now() / 1000 - data.auth_date > 86400) {
    return NextResponse.json({ error: "expired" }, { status: 401 });
  }

  if (!verifyTelegramAuth(data, botToken)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const user: SessionUser = {
    email: `${data.id}@telegram.revoluttime`,
    name: [data.first_name, data.last_name].filter(Boolean).join(" ") || data.username || `tg:${data.id}`,
    provider: "telegram",
  };

  const ok = await setSessionCookie(user);
  if (!ok) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  return NextResponse.json({ user });
}

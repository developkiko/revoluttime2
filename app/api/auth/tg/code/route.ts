import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { kvGetJson, kvPut } from "@/lib/ultra/kv";

interface TgCodeRecord {
  purpose: "login" | "link";
  anchor?: string;
}

/**
 * Deep-link Telegram auth, step 1 (обходной флоу вместо Login Widget —
 * widget требует verify-домен, которого пока нет).
 *
 * Mints a one-time auth code stored in ultra_kv (15 min TTL). The client
 * opens `https://t.me/<bot>?start=<code>`; the bot webhook receives
 * "/start <code>", binds a one-time link token to the Telegram identity and
 * replies with the site URL that completes sign-in (or account linking
 * when link:true and a session exists).
 */
export async function POST(request: Request) {
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  if (!bot) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  let body: { link?: boolean } = {};
  try {
    body = (await request.json()) as { link?: boolean };
  } catch {
    // empty body is fine — default login mode
  }

  let anchor: string | undefined;
  if (body.link) {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "not_authorized" }, { status: 401 });
    }
    anchor = session.email;
  }

  // Unambiguous alphabet (no 0/O/1/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");

  await kvPut(
    `auth_tg_code:${code}`,
    JSON.stringify({ purpose: body.link ? "link" : "login", anchor }),
    900
  ).catch(() => {
    /* DATABASE_URL missing — respond below */
  });

  // If the KV write failed (no DB), the code can never be confirmed by the
  // bot — report auth_not_configured instead of handing out a dead code.
  const stored = await kvGetJson<TgCodeRecord | null>(
    `auth_tg_code:${code}`,
    null
  ).catch(() => null);
  if (!stored) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  return NextResponse.json({ code, bot, ttl: 900 });
}

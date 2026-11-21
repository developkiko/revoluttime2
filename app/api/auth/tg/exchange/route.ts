import { NextResponse } from "next/server";
import {
  setSessionCookie,
  type SessionUser,
} from "@/lib/auth-session";
import { attachProvider, resolveAnchor } from "@/lib/auth-links";
import { kvDelete, kvGetJson } from "@/lib/ultra/kv";

interface TgLinkPayload {
  purpose: "login" | "link";
  anchor?: string;
  telegram: { id: string; name?: string; username?: string; photoPath?: string };
}

/**
 * Deep-link Telegram auth, step 3: the /auth-telegram page (opened from the
 * bot message) exchanges the one-time link token for a site session, or — in
 * link mode — attaches the Telegram identity to the current account.
 */
export async function POST(request: Request) {
  let body: { token?: string } = {};
  try {
    body = (await request.json()) as { token?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const token = body.token;
  if (!token || !/^[a-f0-9]{32,64}$/.test(token)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const payload = await kvGetJson<TgLinkPayload | null>(
    `auth_tg_link:${token}`,
    null
  );
  if (!payload?.telegram?.id) {
    return NextResponse.json({ error: "expired" }, { status: 401 });
  }
  await kvDelete(`auth_tg_link:${token}`).catch(() => {});

  const { id, name, username, photoPath } = payload.telegram;
  const displayName = name || username || `tg:${id}`;
  const anchorBase = `${id}@telegram.revoluttime`;
  // Аватар отдаётся через прокси-роут (URL файла Bot API содержит токен бота)
  const picture = photoPath ? `/api/tg-avatar/${id}` : undefined;

  if (payload.purpose === "link" && payload.anchor) {
    await attachProvider(payload.anchor, "telegram", id, { displayName, picture });
    return NextResponse.json({ ok: true, linked: true, redirect: "/cabinet#profile" });
  }

  const anchor = await resolveAnchor("telegram", id, anchorBase);
  await attachProvider(anchor, "telegram", id, { displayName, picture });

  const user: SessionUser = {
    email: anchor,
    name: displayName,
    provider: "telegram",
    picture,
  };
  const ok = await setSessionCookie(user);
  if (!ok) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, redirect: "/cabinet" });
}

import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { addInboxMessage } from "@/lib/contact-inbox";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

/**
 * Forwards the submission to the admins' Telegram chat when
 * TELEGRAM_ADMIN_CHAT_ID is configured, and keeps a demo inbox for
 * the admin panel. TODO(contact API): persist to Supabase.
 */
async function notifyAdmins(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  // Fallback: the owner's chat (registered via /start on @revoluttime_bot).
  const adminChat = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "5157746090";
  if (!token || !adminChat) return false;
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChat,
        text,
        parse_mode: "HTML",
      }),
    }
  );
  return response.ok;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  addInboxMessage({ name, email, message });

  const delivered = await notifyAdmins(
    [
      "📩 <b>Новая заявка с сайта</b>",
      "",
      `<b>${escapeHtml(name)}</b> (${escapeHtml(email)})`,
      "",
      escapeHtml(message),
    ].join("\n")
  );

  return NextResponse.json({ ok: true, delivered });
}

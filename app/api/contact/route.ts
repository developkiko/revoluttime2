import { NextResponse } from "next/server";
import { z } from "zod";

import { addInboxMessage } from "@/lib/contact-inbox";
import { escapeHtml, notifyAdminChat } from "@/lib/telegram";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  // «Суть вопроса» — локализованный лейбл из формы (владелец 21.11)
  topic: z.string().min(1).max(100).optional(),
});

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

  const { name, email, message, topic } = parsed.data;
  addInboxMessage({ name, email, message });

  const delivered = await notifyAdminChat(
    [
      "📩 <b>Новая заявка с сайта</b>",
      topic ? `🏷 Тема: ${escapeHtml(topic)}` : "",
      "",
      `<b>${escapeHtml(name)}</b> (${escapeHtml(email)})`,
      "",
      escapeHtml(message),
    ]
      .filter(Boolean)
      .join("\n")
  );

  return NextResponse.json({ ok: true, delivered });
}

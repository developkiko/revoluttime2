import { NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { first_name?: string };
  };
}

async function sendMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

/**
 * Telegram bot webhook. Replying to /start with the sender's chat ID lets the
 * owner register as admin (TELEGRAM_ADMIN_CHAT_ID, ADMIN_EMAILS).
 *
 * Verify optionally with X-Telegram-Bot-Api-Secret-Token when
 * TELEGRAM_WEBHOOK_SECRET is configured.
 */
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    secret &&
    request.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!BOT_TOKEN) {
    return NextResponse.json({ error: "auth_not_configured" }, { status: 503 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const message = update.message;
  if (message?.text) {
    if (message.text.startsWith("/start")) {
      await sendMessage(
        message.chat.id,
        [
          `Привет, ${message.from?.first_name ?? "друг"}! Это бот RevolutTIME.`,
          "",
          `Ваш ID для администратора:`,
          `<code>${message.chat.id}</code>`,
          "",
          "Отправьте этот ID администратору — вас добавят в партнёрскую программу и админ-панель.",
          "Заявки с формы контактов на сайте приходят сюда же.",
        ].join("\n")
      );
    } else {
      await sendMessage(
        message.chat.id,
        "Принято! Если это заявка — администратор свяжется с вами. Для быстрой связи: +49 175 9590916 (WhatsApp)."
      );
    }
  }

  return NextResponse.json({ ok: true });
}

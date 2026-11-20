import * as crypto from "node:crypto";
import { NextResponse } from "next/server";
import { kvDelete, kvGetJson, kvPut } from "@/lib/ultra/kv";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
}

interface TelegramReplyMarkup {
  inline_keyboard: Array<Array<{ text: string; url: string }>>;
}

async function sendMessage(
  chatId: number,
  text: string,
  extra?: { reply_markup?: TelegramReplyMarkup }
) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
}

interface TgCodePayload {
  purpose: "login" | "link";
  anchor?: string;
}

/**
 * Telegram bot webhook. Two /start flavours:
 *  - "/start"            → chat ID for admin registration (unchanged);
 *  - "/start <code>"     → deep-link sign-in: verify the code minted by
 *    /api/auth/tg/code, bind a one-time link token to the Telegram identity
 *    and reply with the site URL that completes sign-in / linking.
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
  if (message?.text?.startsWith("/start")) {
    const payload = message.text.split(/\s+/)[1];
    if (payload) {
      // ── deep-link auth code (обходной флоу вместо Login Widget) ──
      const code = payload.toUpperCase();
      const data = await kvGetJson<TgCodePayload | null>(
        `auth_tg_code:${code}`,
        null
      ).catch(() => null);

      if (!data) {
        await sendMessage(
          message.chat.id,
          "Код не найден или истёк. Откройте страницу входа на сайте и получите новый код."
        );
        return NextResponse.json({ ok: true });
      }

      const from = message.from;
      const token = crypto.randomBytes(24).toString("hex");
      const storedLink = await kvPut(
        `auth_tg_link:${token}`,
        JSON.stringify({
          purpose: data.purpose,
          anchor: data.anchor,
          telegram: {
            id: String(from?.id ?? message.chat.id),
            name: [from?.first_name, from?.last_name]
              .filter(Boolean)
              .join(" ")
              .trim(),
            username: from?.username,
          },
        }),
        600
      ).then(
        () => true,
        () => false
      );
      if (!storedLink) {
        await sendMessage(
          message.chat.id,
          "Вход сейчас недоступен (база не подключена). Попробуйте позже."
        );
        return NextResponse.json({ ok: true });
      }
      await kvDelete(`auth_tg_code:${code}`).catch(() => {});

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        new URL(request.url).origin;
      await sendMessage(
        message.chat.id,
        "✅ Код подтверждён! Нажмите кнопку ниже, чтобы завершить вход на сайте.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Войти на RevolutTIME",
                  url: `${siteUrl}/ru/auth-telegram?token=${token}`,
                },
              ],
            ],
          },
        }
      );
      return NextResponse.json({ ok: true });
    }

    // Plain /start — admin registration flow (unchanged).
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
  } else if (message?.text) {
    await sendMessage(
      message.chat.id,
      "Принято! Если это заявка — администратор свяжется с вами. Для быстрой связи: +49 175 9590916 (WhatsApp)."
    );
  }

  return NextResponse.json({ ok: true });
}

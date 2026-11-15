// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Telegram Webhook: /api/tg-webhook
// Команды: /start, /auth, /online, /admins, /users, /mail
// Список админов и сообщения — напрямую в CF KV (без Worker)
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { sendMessage, escHtml } from "@/lib/ultra/telegram";
import { kvGet, kvPut, kvGetJson, kvList } from "@/lib/ultra/kv";
import { dualWritesEnabled } from "@/lib/ultra/storage-mode";
import { insertTelegramMessage } from "@/lib/ultra/db-data";
import { handleMailFlow, handleMailCallback, sendUsersList } from "@/lib/ultra/admin-bot";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";
const ONLINE_WINDOW_MS = 90_000; // 90 сек, как в admin

/** Timing-safe сравнение строк (защита от timing-атак). Работает на Node и edge. */
function safeCompare(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) {
    // всё равно прогоняем сравнение, чтобы не палить длину
    let d = 1;
    for (let i = 0; i < ba.length; i++) d |= ba[i] ^ (bb[i % Math.max(bb.length, 1)] || 0);
    void d;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ba.length; i++) diff |= ba[i] ^ bb[i];
  return diff === 0;
}

/** Проверка: запрос действительно от Telegram (secret_token из setWebhook) */
function verifyTelegramWebhook(request: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true; // секрет не настроен — пропускаем (dev)
  const token = request.headers.get("x-telegram-bot-api-secret-token") || "";
  return safeCompare(token, WEBHOOK_SECRET);
}

async function getAdminIds(): Promise<string[]> {
  const list = await kvGetJson<(string | number)[]>("admin_chat_ids", []);
  return list.map(String);
}

async function authAdmin(
  chatId: number,
  password: string
): Promise<{ ok: boolean; error?: string; already?: boolean }> {
  if (!ADMIN_PASSWORD) {
    return { ok: false, error: "ADMIN_PASSWORD не задан на сервере" };
  }
  if (!safeCompare(password, ADMIN_PASSWORD)) {
    return { ok: false, error: "Неверный пароль" };
  }

  const id = String(chatId);
  const blocked = (await kvGetJson<(string | number)[]>("admin_blocked_ids", [])).map(String);
  if (blocked.includes(id)) {
    return { ok: false, error: "Этот chat_id заблокирован" };
  }

  const list = await getAdminIds();
  if (list.includes(id)) {
    return { ok: true, already: true };
  }
  list.push(id);
  await kvPut("admin_chat_ids", JSON.stringify(list));
  return { ok: true };
}

async function getOnlineCount(): Promise<{ online: number; total: number }> {
  const users = await kvGetJson<string[]>("users_list", []);
  let online = 0;
  const now = Date.now();
  for (const email of users) {
    try {
      const raw = await kvGet("heartbeat:" + email);
      if (!raw) continue;
      const hb = JSON.parse(raw);
      const ts = hb?.ts ? new Date(hb.ts).getTime() : 0;
      if (ts > 0 && now - ts < ONLINE_WINDOW_MS) online++;
    } catch {
      /* skip */
    }
  }
  return { online, total: users.length };
}

/** Сохраняем любого, кто писал боту — для селекта «Из писавших боту» в админке */
async function saveTgMessage(msg: {
  from: { id: number; first_name?: string; last_name?: string; username?: string };
  text?: string;
  chat: { id: number };
}): Promise<void> {
  try {
    const chatId = String(msg.from?.id || msg.chat?.id || "");
    if (!chatId) return;
    const at = new Date().toISOString();
    await kvPut(
      "tg_msg:" + chatId,
      JSON.stringify({
        from: msg.from,
        text: msg.text || "",
        chat_id: msg.chat.id,
        at,
      })
    );
    if (dualWritesEnabled()) {
      insertTelegramMessage({ chat_id: chatId, from_id: String(msg.from?.id || chatId), first_name: msg.from?.first_name, last_name: msg.from?.last_name, username: msg.from?.username, text: msg.text || "", at }).catch((error) => console.error("[storage] Telegram message dual-write failed", error instanceof Error ? error.message : "unknown"));
    }
  } catch (e) {
    console.error("[tg-webhook] saveTgMessage:", e);
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── Верификация source: только запросы от Telegram с нашим secret_token ──
    if (!verifyTelegramWebhook(request)) {
      console.warn("[tg-webhook] Invalid secret token — отклонено");
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const update = await request.json();

    // ── Callback от инлайн-кнопок подтверждения /mail ──
    if (update.callback_query) {
      await handleMailCallback(update.callback_query);
      return NextResponse.json({ ok: true });
    }

    const msg = update.message;

    if (!msg || !msg.from) return NextResponse.json({ ok: true });

    // Любое сообщение (включая /start) — в tg_msg, чтобы появился в селекте админки
    await saveTgMessage(msg);

    // ── State machine /mail (текст, фото, подтверждение) — до команд ──
    // Фото без активной рассылки сюда не дойдут: handleMailFlow вернёт false
    if (await handleMailFlow(msg, msg.chat.id)) {
      return NextResponse.json({ ok: true });
    }

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userIdStr = String(userId);
    const text = (msg.text || "").trim();
    const firstName = msg.from.first_name || "User";

    if (text === "/start") {
      const adminIds = await getAdminIds();
      const isAdmin = adminIds.includes(userIdStr);

      await sendMessage(
        chatId,
        [
          `<b>👋 Привет, ${escHtml(firstName)}!</b>`,
          ``,
          `Я бот <b>Ultra Proxy</b>. Уведомления с сайта (контакты, регистрации, платежи).`,
          ``,
          isAdmin
            ? `✅ Ты уже админ. Уведомления приходят автоматически.`
            : `ℹ️ Авторизация:`,
          ``,
          `<code>/auth <пароль></code> — стать админом`,
          `<code>/online</code> — пользователи онлайн`,
          `<code>/admins</code> — список админов`,
          `<code>/mail</code> — рассылка юзерам (только админы)`,
        ].join("\n")
      );
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/auth")) {
      const parts = text.split(/\s+/);
      const password = parts.slice(1).join(" ").trim();
      if (!password) {
        await sendMessage(chatId, `⚠️ Использование: <code>/auth пароль</code>`);
        return NextResponse.json({ ok: true });
      }

      const result = await authAdmin(userId, password);
      if (!result.ok) {
        await sendMessage(chatId, `❌ ${escHtml(result.error || "Неверный пароль")}`);
      } else if (result.already) {
        await sendMessage(chatId, `✅ Ты уже в списке админов.`);
      } else {
        await sendMessage(
          chatId,
          `✅ Авторизация успешна!\nТеперь уведомления с сайта будут приходить тебе.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/online") {
      const adminIds = await getAdminIds();
      if (!adminIds.includes(userIdStr)) {
        await sendMessage(chatId, `🔒 Только для админов. Сначала <code>/auth пароль</code>`);
        return NextResponse.json({ ok: true });
      }

      const stats = await getOnlineCount();
      await sendMessage(
        chatId,
        [
          `<b>🟢 Онлайн на сайте</b>`,
          ``,
          `Сейчас онлайн: <b>${stats.online}</b>`,
          `Всего пользователей: <b>${stats.total}</b>`,
        ].join("\n")
      );
      return NextResponse.json({ ok: true });
    }

    if (text === "/admins") {
      const adminIds = await getAdminIds();
      if (adminIds.length === 0) {
        await sendMessage(chatId, `📭 Список админов пуст.`);
      } else {
        const lines = adminIds.map(
          (id, i) => `${i + 1}. <code>${escHtml(id)}</code>${id === userIdStr ? " (ты)" : ""}`
        );
        await sendMessage(chatId, [`<b>📋 Админы (${adminIds.length}):</b>`, ...lines].join("\n"));
      }
      return NextResponse.json({ ok: true });
    }

    if (text === "/users") {
      const adminIds = await getAdminIds();
      if (!adminIds.includes(userIdStr)) {
        await sendMessage(chatId, `🔒 Только для админов. Сначала <code>/auth пароль</code>`);
        return NextResponse.json({ ok: true });
      }
      await sendUsersList(chatId);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith("/")) {
      await sendMessage(chatId, `❓ Неизвестная команда. /start — список команд.`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tg-webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "ultra-proxy-tg-webhook" });
}

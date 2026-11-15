// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — логика admin-бота: /mail (рассылка) и /users
// Рассылка идёт от имени КЛИЕНТСКОГО бота (@revoluttime_bot),
// команды и State machine — через админ-бота.
// ══════════════════════════════════════════════════════════════

import { sendMessage, sendPhoto, escHtml } from "@/lib/ultra/telegram";
import { kvGet, kvGetJson, kvPut, kvDelete, kvList } from "@/lib/ultra/kv";

const CLIENT_BOT_TOKEN = process.env.CLIENT_BOT_TOKEN || "";
const CLIENT_API = `https://api.telegram.org/bot${CLIENT_BOT_TOKEN}`;
const MAIL_STATE_TTL = 600; // 10 минут на ввод рассылки

async function getAdminIds(): Promise<string[]> {
  const list = await kvGetJson<(string | number)[]>("admin_chat_ids", []);
  return list.map(String);
}

// ── Отправки от имени клиентского бота ──

async function clientSend(chatId: string, text: string): Promise<{ ok: boolean; description?: string }> {
  if (!CLIENT_BOT_TOKEN) return { ok: false, description: "no token" };
  try {
    const res = await fetch(`${CLIENT_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    const data = await res.json();
    return { ok: !!data.ok, description: data.description };
  } catch (e: any) {
    return { ok: false, description: String(e?.message || e) };
  }
}

async function answerCallbackQuery(id: string, text?: string) {
  const adminToken = process.env.TG_BOT_TOKEN || "";
  if (!adminToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${adminToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: id, text }),
    });
  } catch { /* skip */ }
}

// ── State machine команды /mail ──

interface MailState {
  step: "await_text" | "await_photo" | "confirm";
  text?: string;   // текст рассылки (сырой HTML — HTML-теги разрешены специально)
  textEntities?: any[]; // Telegram entities от админа — чтобы не ломать смайлы/ссылки
  fileId?: string; // file_id фото (получен админ-ботом). Рассылаем через binary, не URL.
}
const mailKey = (chatId: number | string) => `mail_state:${chatId}`;

async function getMailState(chatId: number): Promise<MailState | null> {
  const raw = await kvGet(mailKey(chatId));
  if (!raw) return null;
  try { return JSON.parse(raw) as MailState; } catch { return null; }
}

/** Шаги /mail. Возвращает true, если апдейт поглощён state machine */
export async function handleMailFlow(msg: any, chatId: number): Promise<boolean> {
  const userIdStr = String(msg.from?.id);
  const state = await getMailState(chatId);

  // Команда /mail — только для админов
  if ((msg.text || "").trim() === "/mail") {
    const adminIds = await getAdminIds();
    if (!adminIds.includes(userIdStr)) {
      await sendMessage(chatId, `🔒 Рассылка доступна только админам.`);
      return true;
    }
    if (!CLIENT_BOT_TOKEN) {
      await sendMessage(chatId, `⚠️ CLIENT_BOT_TOKEN не задан — рассылка невозможна.`);
      return true;
    }
    if (state) {
      await sendMessage(chatId, `⚠️ Рассылка уже начата. Пришли данные по шагу или /cancel для отмены.`);
      return true;
    }
    await kvPut(mailKey(chatId), JSON.stringify({ step: "await_text" } satisfies MailState), MAIL_STATE_TTL);
    await sendMessage(
      chatId,
      `📧 <b>Рассылка — шаг 1/3</b>\n\nПришли <b>текст</b> рассылки.\n<i>Можно использовать HTML-теги (b, i, a, code). /cancel — отмена.</i>`
    );
    return true;
  }

  // Отмена на любом шаге
  if ((msg.text || "").trim() === "/cancel") {
    if (!state) return false; // не в рассылке — пусть идёт как обычная команда
    await kvDelete(mailKey(chatId));
    await sendMessage(chatId, `❌ Рассылка отменена.`);
    return true;
  }

  if (!state) return false;

  // Шаг 1: ждём текст
  if (state.step === "await_text") {
    const text = (msg.text || "").trim();
    if (!text) {
      await sendMessage(chatId, `⚠️ Нужен именно текст. Пришли текст рассылки или /cancel.`);
      return true;
    }
    const next: MailState = { step: "await_photo", text };
    await kvPut(mailKey(chatId), JSON.stringify(next), MAIL_STATE_TTL);
    await sendMessage(
      chatId,
      `📧 <b>Рассылка — шаг 2/3</b>\n\nТеперь пришли <b>фото</b> для рассылки\nили напиши <code>без фото</code>, чтобы отправить только текст.`
    );
    return true;
  }

  // Шаг 2: ждём фото (или "без фото" для пропуска)
  if (state.step === "await_photo") {
    let fileId: string | undefined;

    if (msg.photo?.length) {
      // Самый большой вариант. file_id привязан к админ-боту, но нам это не мешает:
      // дальше мы скачиваем фото через getFile и отправляем binary (multipart).
      fileId = msg.photo[msg.photo.length - 1].file_id;
    } else {
      const skip = (msg.text || "").trim().toLowerCase();
      if (skip !== "без фото" && skip !== "no photo" && skip !== "skip") {
        await sendMessage(chatId, `⚠️ Пришли фото или напиши <code>без фото</code>. /cancel — отмена.`);
        return true;
      }
    }

    const next: MailState = { step: "confirm", text: state.text, textEntities: state.textEntities, fileId };
    await kvPut(mailKey(chatId), JSON.stringify(next), MAIL_STATE_TTL);

    // Превью: админ-бот умеет показывать свой собственный file_id без проблем.
    const previewHeader = `📧 <b>Шаг 3/3 — подтверждение</b>\n\nТак будет выглядеть рассылка 👇`;
    if (fileId) {
      const p: any = await sendPhoto(chatId, fileId, state.text);
      if (p?.ok === false) {
        console.error("[mail] preview photo failed:", p.description);
        await sendMessage(chatId, `${previewHeader}\n<i>(фото не показалось: ${escHtml(p.description || "?")})</i>\n\n${state.text}`);
      } else {
        await sendMessage(chatId, previewHeader);
      }
    } else {
      await sendMessage(chatId, `${previewHeader}\n\n${state.text}`);
    }
    await sendMessage(
      chatId,
      `Отправить всем, кто запускал @revoluttime_bot?`,
      "HTML",
      {
        inline_keyboard: [[
          { text: "✅ Да, отправить", callback_data: "mail_yes" },
          { text: "❌ Отмена", callback_data: "mail_no" },
        ]],
      }
    );
    return true;
  }

  // Шаг 3: подтверждение текстом (запасной путь — основной через инлайн-кнопки)
  if (state.step === "confirm") {
    const answer = (msg.text || "").trim().toLowerCase();
    if (answer === "да" || answer === "да!" || answer === "yes" || answer === "y" || answer === "д") {
      await runMailAndReport(chatId, state);
    } else if (answer === "нет" || answer === "no" || answer === "n" || answer === "н") {
      await kvDelete(mailKey(chatId));
      await sendMessage(chatId, `❌ Рассылка отменена.`);
    } else {
      await sendMessage(chatId, `Нажми кнопку ✅/❌ выше или напиши <code>да</code>/<code>нет</code>.`);
    }
    return true;
  }

  return false;
}

/** Callback от инлайн-кнопок подтверждения */
export async function handleMailCallback(cb: any) {
  const chatId = cb?.message?.chat?.id;
  const data = cb?.data || "";
  if (!chatId || !data.startsWith("mail_")) return;

  const fromId = String(cb.from?.id);
  const adminIds = await getAdminIds();
  if (!adminIds.includes(fromId)) {
    await answerCallbackQuery(cb.id, "Только для админов");
    return;
  }
  await answerCallbackQuery(cb.id);

  const state = await getMailState(chatId);
  if (!state || state.step !== "confirm") {
    await sendMessage(chatId, `⚠️ Нет активной рассылки. Начни заново: /mail`);
    return;
  }

  if (data === "mail_yes") {
    await runMailAndReport(chatId, state);
  } else if (data === "mail_no") {
    await kvDelete(mailKey(chatId));
    await sendMessage(chatId, `❌ Рассылка отменена.`);
  }
}

/** Собираем аудиторию рассылки: только те, кто реально запускал клиентского бота
 *  (маркер tg_client_started:). Никакого бэкфилла из чужих ключей — иначе шлём
 *  людям, которые никогда не открывали @revoluttime_bot, и получаем "chat not found". */
async function collectMailRecipientIds(): Promise<string[]> {
  const ids = new Set<string>();
  const keys = await kvList("tg_client_started:", 100000);
  for (const k of keys) {
    const id = k.replace("tg_client_started:", "");
    if (id && /^\d+$/.test(id)) ids.add(id);
  }
  return [...ids];
}

/** Запуск рассылки и отчёт админу */
async function runMailAndReport(chatId: number, state: MailState) {
  await sendMessage(chatId, `⏳ Отправляю рассылку...`);
  const result = await runMailBroadcast(state.text!, state.fileId);
  await kvDelete(mailKey(chatId));
  const zeroNote = result.total === 0 ? `\n<i>Получателей 0 — ещё никто не помечен как запустивший бота.</i>` : "";
  const errNote = result.errors.length ? `\n<i>Ошибки: ${result.errors.map(escHtml).join("; ")}</i>` : "";
  await sendMessage(
    chatId,
    `✅ <b>Рассылка завершена</b>\n\nОтправлено: <b>${result.sent}</b>\nНе доставлено: <b>${result.failed}</b>${zeroNote}${errNote}`
  );
}

/** Скачать фото у Telegram по file_id (через админ-бота, который его получил).
 *  Возвращает байты — их мы сможем залить от имени клиентского бота. */
async function downloadTelegramFile(fileId: string): Promise<{ bytes: ArrayBuffer; contentType: string; name: string } | null> {
  const adminToken = process.env.TG_BOT_TOKEN || "";
  if (!adminToken) return null;
  try {
    const meta = await fetch(`https://api.telegram.org/bot${adminToken}/getFile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_id: fileId }),
    }).then(r => r.json());
    const path = meta?.result?.file_path;
    if (!meta?.ok || !path) { console.error("[mail] getFile:", meta?.description); return null; }
    const res = await fetch(`https://api.telegram.org/file/bot${adminToken}/${path}`);
    if (!res.ok) { console.error("[mail] file dl:", res.status); return null; }
    const bytes = await res.arrayBuffer();
    return { bytes, contentType: res.headers.get("content-type") || "image/jpeg", name: path.split("/").pop() || "photo.jpg" };
  } catch (e) {
    console.error("[mail] downloadTelegramFile exception:", e);
    return null;
  }
}

/** Отправка фото клиентским ботом как multipart/form-data (сами байты, не file_id/URL).
 *  Именно так делают надёжные броадкасты — Telegram не пытается ре-фетчить ничего. */
async function clientSendPhotoBytes(
  chatId: string,
  bytes: ArrayBuffer,
  contentType: string,
  name: string,
  caption: string
): Promise<{ ok: boolean; description?: string }> {
  if (!CLIENT_BOT_TOKEN) return { ok: false, description: "no token" };
  try {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("photo", new Blob([bytes], { type: contentType }), name);
    fd.append("caption", caption);
    fd.append("parse_mode", "HTML");
    const res = await fetch(`${CLIENT_API}/sendPhoto`, { method: "POST", body: fd });
    const data = await res.json();
    return { ok: !!data.ok, description: data.description };
  } catch (e: any) {
    return { ok: false, description: String(e?.message || e) };
  }
}

/** Сама рассылка по собранной аудитории */
async function runMailBroadcast(text: string, fileId?: string): Promise<{ sent: number; failed: number; total: number; errors: string[] }> {
  const ids = await collectMailRecipientIds();
  // Один раз скачиваем фото (через админ-бота) — потом заливаем всем от клиентского
  const photoBin = fileId ? await downloadTelegramFile(fileId) : null;
  if (fileId && !photoBin) {
    console.error("[mail] photo could not be downloaded — will send text only");
  }
  let sent = 0, failed = 0;
  const errors: string[] = [];
  for (const chatId of ids) {
    const res = photoBin
      ? await clientSendPhotoBytes(chatId, photoBin.bytes, photoBin.contentType, photoBin.name, text)
      : await clientSend(chatId, text);
    if (res.ok) {
      sent++;
    } else {
      failed++;
      const desc = String(res.description || "unknown").slice(0, 60);
      console.warn(`[mail] fail ${chatId}: ${desc}`);
      if (errors.length < 5 && !errors.includes(desc)) errors.push(desc);
    }
    await new Promise((r) => setTimeout(r, 40)); // ~25 msg/сек — под лимитами Telegram
  }
  return { sent, failed, total: ids.length, errors };
}

// ── Команда /users ──
export async function sendUsersList(chatId: number) {
  const ids = await collectMailRecipientIds();
  const lines: string[] = [];
  for (const id of ids) {
    let label = "";
    try {
      const raw = await kvGet(`tg_client_started:${id}`);
      if (raw) {
        const p = JSON.parse(raw);
        const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
        const un = p.username ? `@${p.username}` : "";
        label = [name, un].filter(Boolean).join(" ");
      }
    } catch { /* legacy marker «1» или кривой json — покажем только id */ }
    lines.push(label ? `${escHtml(label)} <code>${id}</code>` : `<code>${id}</code>`);
  }

  if (!lines.length) {
    await sendMessage(chatId, `📭 Пока ни один пользователь не запускал @revoluttime_bot.`);
    return;
  }
  const header = `👥 <b>Пользователи бота (${lines.length})</b>\n\n`;
  // Telegram лимит ~4096 символов — режем на чанки
  let chunk = header;
  for (const line of lines) {
    if ((chunk + line + "\n").length > 3800) {
      await sendMessage(chatId, chunk);
      chunk = "";
    }
    chunk += line + "\n";
  }
  if (chunk.trim()) await sendMessage(chatId, chunk);
}

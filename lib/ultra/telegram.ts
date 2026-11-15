// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Telegram Bot API модуль
// Отправка сообщений через Bot API, управление webhook
// ══════════════════════════════════════════════════════════════

const BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const BOT_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TgMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
}

export interface TgWebhookInfo {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
  };
}

// ── Отправка текстового сообщения ──
export async function sendMessage(
  chat_id: number | string,
  text: string,
  parse_mode: "HTML" | "Markdown" = "HTML",
  reply_markup?: any
) {
  if (!BOT_TOKEN) {
    console.warn("[TG] TG_BOT_TOKEN не задан — сообщение не отправлено");
    return { ok: false, description: "no token" };
  }
  try {
    const body: any = { chat_id, text, parse_mode };
    if (reply_markup) body.reply_markup = reply_markup;
    const res = await fetch(`${BOT_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) console.error("[TG] sendMessage error:", data.description);
    return data;
  } catch (e: any) {
    console.error("[TG] sendMessage exception:", e?.message || e);
    return { ok: false, description: String(e?.message || e) };
  }
}

// ── Отправка фото с подписью ──
export async function sendPhoto(
  chat_id: number | string,
  photo: string,
  caption?: string,
  reply_markup?: any
) {
  if (!BOT_TOKEN) return { ok: false, description: "no token" };
  try {
    const body: any = { chat_id, photo };
    if (caption) { body.caption = caption; body.parse_mode = "HTML"; }
    if (reply_markup) body.reply_markup = reply_markup;
    const res = await fetch(`${BOT_API}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) console.error("[TG] sendPhoto error:", data.description);
    return data;
  } catch (e: any) {
    console.error("[TG] sendPhoto exception:", e?.message || e);
    return { ok: false, description: String(e?.message || e) };
  }
}

// ── Массовая рассылка: текст или фото+подпись ──
export async function broadcastToChats(
  chatIds: (number | string)[],
  text: string,
  photo?: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0, failed = 0;
  // Небольшой batch, чтобы не словить 429 от Telegram
  for (const id of chatIds) {
    const res = photo ? await sendPhoto(id, photo, text) : await sendMessage(id, text);
    if (res?.ok) sent++; else failed++;
    await new Promise((r) => setTimeout(r, 50)); // ~20 msg/сек
  }
  return { sent, failed };
}

// ── Получение fileUrl по file_id ──
export async function getFileUrl(fileId: string): Promise<string | null> {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(`${BOT_API}/getFile?file_id=${encodeURIComponent(fileId)}`);
    const data = await res.json();
    const filePath = data?.result?.file_path;
    return filePath ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}` : null;
  } catch {
    return null;
  }
}

// ── Массовая рассылка (для списка админов) ──
export async function broadcastMessage(chatIds: (number | string)[], text: string) {
  if (!chatIds.length) return [];
  const results = await Promise.allSettled(
    chatIds.map((id) => sendMessage(id, text))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) console.warn(`[TG] broadcast: ${failed}/${chatIds.length} не доставлено`);
  return results;
}

// ── Установка webhook ──
export async function setWebhook(url: string) {
  const res = await fetch(`${BOT_API}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, allowed_updates: ["message"] }),
  });
  return res.json();
}

// ── Получение информации о webhook ──
export async function getWebhookInfo(): Promise<TgWebhookInfo> {
  const res = await fetch(`${BOT_API}/getWebhookInfo`);
  return res.json();
}

// ── Форматирование сообщения из формы контактов ──
export function formatContactMessage(data: {
  name: string;
  email: string;
  message: string;
}) {
  return [
    `<b>📩 Новое сообщение из формы контактов</b>`,
    ``,
    `<b>Имя:</b> ${escHtml(data.name)}`,
    `<b>Email:</b> ${escHtml(data.email)}`,
    `<b>Сообщение:</b>`,
    `${escHtml(data.message)}`,
  ].join("\n");
}

// ── Форматирование: новый запрос на оплату ──
export function formatPaymentRequest(data: {
  email: string;
  amount: number;
  session_id: string;
}) {
  return [
    `<b>💰 Новый запрос на оплату</b>`,
    ``,
    `<b>Email:</b> ${escHtml(data.email)}`,
    `<b>Сумма:</b> ${data.amount} USDT`,
    `<b>Session:</b> <code>${data.session_id}</code>`,
    ``,
    `🔗 Вставьте ссылку в админке → вкладка «Платежи»`,
  ].join("\n");
}

// ── Форматирование: платёж подтверждён ──
export function formatPaymentConfirmed(data: {
  email: string;
  amount: number;
}) {
  return [
    `<b>✅ Платёж подтверждён</b>`,
    ``,
    `<b>Email:</b> ${escHtml(data.email)}`,
    `<b>Сумма:</b> ${data.amount} USDT`,
    `<b>Баланс зачислен</b>`,
  ].join("\n");
}

const APP_TZ = "Europe/Kyiv";

/** Время в часовом поясе приложения (Киев / EEST) */
function formatAppTime(d: Date = new Date()): string {
  return d.toLocaleString("ru-RU", { timeZone: APP_TZ });
}

// ── Форматирование: новый пользователь зарегистрировался ──
export function formatRegistrationMessage(data: {
  email: string;
  login: string;
}) {
  return [
    `<b>🆕 Новая регистрация</b>`,
    ``,
    `<b>Email:</b> ${escHtml(data.email)}`,
    `<b>Login:</b> ${escHtml(data.login)}`,
    ``,
    `⏰ ${formatAppTime()}`,
  ].join("\n");
}

// ── Форматирование: вход на сайт с email ──
export function formatLoginMessage(data: {
  email: string;
  ip?: string;
  ua?: string;
}) {
  let text = `<b>🔑 Вход на сайт</b>\n\n<b>Email:</b> ${escHtml(data.email)}`;
  if (data.ip) text += `\n<b>IP:</b> ${escHtml(data.ip)}`;
  if (data.ua) text += `\n<b>UA:</b> ${escHtml(data.ua).substring(0, 100)}`;
  text += `\n\n⏰ ${formatAppTime()}`;
  return text;
}

// ── Экранирование HTML (для parse_mode=HTML в Bot API) ──
export function escHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

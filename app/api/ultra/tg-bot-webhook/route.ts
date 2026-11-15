// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — Client Bot Webhook: /api/tg-bot-webhook
// Bot: @revoluttime_bot (premium account)
// Flow: /start → language → catalog/balance/support → redirect to site
// ══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvPut, kvGetJson } from "@/lib/ultra/kv";
import { escHtml } from "@/lib/ultra/telegram";
import { dualWritesEnabled } from "@/lib/ultra/storage-mode";
import { upsertTelegramClient, listDbUltraProducts } from "@/lib/ultra/db-data";
import { dbReadsEnabled } from "@/lib/ultra/storage-mode";

const BOT_TOKEN = process.env.CLIENT_BOT_TOKEN || "";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WEBHOOK_SECRET = process.env.TG_WEBHOOK_SECRET || "";

async function getBotProducts(): Promise<any[]> {
  const legacy = await kvGetJson<any[]>("products_list", []);
  if (dbReadsEnabled()) {
    try {
      const products = await listDbUltraProducts();
      if (products.length > 0) return products;
    } catch (error) { console.error("[storage] client bot products DB read failed", error instanceof Error ? error.message : "unknown"); }
  }
  return legacy;
}

/** Проверка: запрос действительно от Telegram */
function verifyTelegramWebhook(request: NextRequest): boolean {
  if (!WEBHOOK_SECRET) return true;
  const token = request.headers.get("x-telegram-bot-api-secret-token") || "";
  return token === WEBHOOK_SECRET;
}

interface TgMessage {
  message_id: number;
  from: { id: number; first_name?: string; last_name?: string; username?: string };
  chat: { id: number };
  text?: string;
}

interface TgCallback {
  id: string;
  from: { id: number; first_name?: string; last_name?: string; username?: string };
  message?: { message_id: number; chat: { id: number } };
  data: string;
}

async function sendMessage(
  chatId: number,
  text: string,
  extra?: {
    parse_mode?: "HTML" | "Markdown";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  }
) {
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  };
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
  extra?: {
    parse_mode?: "HTML";
    reply_markup?: any;
  }
): Promise<number | null> {
  const body: any = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
    ...extra,
  };
  const res = await fetch(`${API}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) {
    console.error(`[bot] sendPhoto to ${chatId} failed:`, data.description);
    return null;
  }
  return data.result?.message_id ?? null;
}

async function editMessageText(
  chatId: number,
  messageId: number,
  text: string,
  extra?: {
    parse_mode?: "HTML";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  }
) {
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    ...extra,
  };
  const res = await fetch(`${API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Редактирует caption у фото-сообщения (для главного меню после handleLangSelect) */
async function editMessageCaption(
  chatId: number,
  messageId: number,
  caption: string,
  extra?: {
    parse_mode?: "HTML";
    reply_markup?: any;
  }
) {
  const body: any = {
    chat_id: chatId,
    message_id: messageId,
    caption,
    parse_mode: "HTML",
    ...extra,
  };
  const res = await fetch(`${API}/editMessageCaption`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Универсальный edit: пробует caption, затем text, иначе шлёт новое сообщение */
async function editMessageSmart(
  chatId: number,
  messageId: number,
  text: string,
  extra?: {
    parse_mode?: "HTML";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  }
) {
  // Сначала пробуем как caption — сработает если сообщение с фото
  const capRes = await editMessageCaption(chatId, messageId, text, {
    reply_markup: extra?.reply_markup,
  });
  if (capRes.ok) return capRes;

  // Если не вышло — пробуем как обычный текст
  return editMessageText(chatId, messageId, text, extra);
}

async function answerCallback(callbackId: string, text?: string) {
  const body: any = { callback_query_id: callbackId };
  if (text) {
    body.text = text;
    body.show_alert = true; // show alert to confirm callback works
  }
  await fetch(`${API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── State helpers ──
async function getState(chatId: number): Promise<{ lang?: string }> {
  const raw = await kvGet(`tg_bot_state:${chatId}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function setState(chatId: number, state: { lang?: string }) {
  await kvPut(`tg_bot_state:${chatId}`, JSON.stringify(state), 86400 * 30); // 30 days
  console.log(`[bot] State saved for ${chatId}:`, JSON.stringify(state));
}

// ── Premium Custom Emoji IDs (аккаунт Premium) ──
const EMOJI_ID = {
  balance: "5215420556089776398",   // 💳 Баланс
  catalog: "5240228673738527951",   // 🛒 Каталог
  support: "5303138782004924588",   // 📞 Поддержка
  network: "5447410659077661506",   // 🌐 Сеть/прокси
  loading: "5386367538735104399",   // ⏳ Загрузка
  plus: "5397916757333654639",      // ➕ Плюс
};

// ── i18n texts ──
const texts = {
  ru: {
    welcome: "👋 Привет! RevolutTIME — прокси для любых задач.\n\nВыбери тариф и начни работу за 2 минуты.",
    catalog: "🛒 Каталог тарифов",
    balance: "💳 Баланс",
    support: "📞 Поддержка",
    buy: "🚀 Купить на сайте",
    back: "◀️ Назад",
    balanceText: "Для просмотра баланса войди в личный кабинет на сайте:\n\n<a href=\"https://www.revoluttime.de/dashboard\">https://www.revoluttime.de/dashboard</a>",
    balanceNewUser: "Ты ещё не зарегистрирован на сайте.\n\n1️⃣ Нажми «Купить на сайте» в каталоге\n2️⃣ Зарегистрируйся\n3️⃣ Пополни баланс",
    supportText: "По всем вопросам пиши:\n\n📧 support@revoluttime.de\n💬 <a href=\"https://t.me/revoluttime\">@revoluttime</a>",
    chooseLang: "🌐 Выберите язык / Choose language",
    russian: "🇷🇺 Русский",
    english: "🇬🇧 English",
    noProducts: "Каталог временно недоступен.",
  },
  en: {
    welcome: "👋 Hello! RevolutTIME — proxies for any task.\n\nPick a plan and get started in 2 minutes.",
    catalog: "🛒 Plans Catalog",
    balance: "💳 Balance",
    support: "📞 Support",
    buy: "🚀 Buy on Site",
    back: "◀️ Back",
    balanceText: "Check your balance in the dashboard:\n\n<a href=\"https://www.revoluttime.de/dashboard\">https://www.revoluttime.de/dashboard</a>",
    balanceNewUser: "You are not registered yet.\n\n1️⃣ Click «Buy on Site» in catalog\n2️⃣ Register\n3️⃣ Top up balance",
    supportText: "Contact us:\n\n📧 <a href=\"mailto:support@revoluttime.de\">support@revoluttime.de</a>\n💬 <a href=\"https://t.me/revoluttime\">@revoluttime</a>",
    chooseLang: "🌐 Выберите язык / Choose language",
    russian: "🇷🇺 Русский",
    english: "🇬🇧 English",
    noProducts: "Catalog temporarily unavailable.",
  },
};

function t(lang: string | undefined, key: keyof typeof texts.ru): string {
  const l = lang === "en" ? "en" : "ru";
  return texts[l][key];
}

// ── Keyboards ──
function langKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🇷🇺 Русский", callback_data: "lang_ru" }],
      [{ text: "🇬🇧 English", callback_data: "lang_en" }],
    ],
  };
}

function mainKeyboard(lang: string | undefined) {
  return {
    inline_keyboard: [
      [{ text: t(lang, "catalog"), callback_data: "catalog", icon_custom_emoji_id: EMOJI_ID.catalog }],
      [{ text: t(lang, "balance"), callback_data: "balance", icon_custom_emoji_id: EMOJI_ID.balance }],
      [{ text: t(lang, "support"), callback_data: "support", icon_custom_emoji_id: EMOJI_ID.support }],
    ],
  };
}

function productKeyboard(product: any, lang: string | undefined) {
  return {
    inline_keyboard: [
      [{ text: t(lang, "buy"), url: "https://www.revoluttime.de/dashboard", icon_custom_emoji_id: EMOJI_ID.network }],
      [{ text: lang === "en" ? "I Paid" : "Я оплатил", callback_data: `paid_${product.id}`, icon_custom_emoji_id: EMOJI_ID.plus }],
      [{ text: t(lang, "back"), callback_data: "catalog" }],
    ],
  };
}

function catalogKeyboard(products: any[], lang: string | undefined) {
  const kb: any[] = [];
  for (const p of products) {
    const icon = p.type === "fast" ? "⚡" : p.type === "wifi" ? "🏠" : p.type === "mobile" ? "📱" : "🏢";
    const label = lang === "en" ? p.name_en : p.name_ru;
    const price = p.price;
    kb.push([{ text: `${icon} ${label} — $${price}`, callback_data: `product_${p.id}` }]);
  }
  kb.push([{ text: t(lang, "back"), callback_data: "menu" }]);
  return { inline_keyboard: kb };
}

function backKeyboard(lang: string | undefined) {
  return { inline_keyboard: [[{ text: t(lang, "back"), callback_data: "menu" }]] };
}

// ── Message handlers ──
async function handleStart(chatId: number, user: { id: number; first_name?: string; last_name?: string; username?: string }) {
  await setState(chatId, {});
  // Помечаем пользователя как запустившего бота (с именем/username) —
  // аудитория для /mail и команда /users в админ-боте
  const starterRec = {
    first_name: user.first_name,
    last_name: user.last_name,
    username: user.username,
    at: new Date().toISOString(),
  };
  kvPut(`tg_client_started:${user.id}`, JSON.stringify(starterRec), 86400 * 365).catch(() => {});
  if (dualWritesEnabled()) {
    upsertTelegramClient({ chat_id: String(user.id), first_name: user.first_name, last_name: user.last_name, username: user.username, started_at: starterRec.at, last_seen_at: starterRec.at }).catch((error) => console.error("[storage] Telegram client dual-write failed", error instanceof Error ? error.message : "unknown"));
  }
  await sendMessage(chatId, t("ru", "chooseLang"), { reply_markup: langKeyboard() });

  // Уведомление админам о новом пользователе (не чаще раза в 24ч)
  // Сначала проверяем маркер, потом СРАЗУ ставим его — чтобы параллельные /start
  // не слали дубли (гонка "прочитал → отправил → записал").
  const notifiedKey = `tg_notified:${user.id}`;
  const last = await kvGet(notifiedKey);
  if (!last || Date.now() - new Date(last).getTime() > 24 * 60 * 60 * 1000) {
    // Ставим маркер ДО отправки — даже если notify упадёт, дублей не будет
    await kvPut(notifiedKey, new Date().toISOString(), 86400 * 3);
    await notifyAdminsNewUser(user);
  }
}

async function handleLangSelect(chatId: number, messageId: number, callbackId: string, lang: string) {
  await setState(chatId, { lang });
  await answerCallback(callbackId);

  // Удаляем сообщение с выбором языка
  try {
    await fetch(`${API}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
    });
  } catch { /* skip */ }

  // Отправляем фото с текстом приветствия
  await sendPhoto(chatId, "https://www.revoluttime.de/promo.jpg", t(lang, "welcome"), {
    reply_markup: mainKeyboard(lang),
  });
}

const ADMIN_BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const ADMIN_API = `https://api.telegram.org/bot${ADMIN_BOT_TOKEN}`;

async function sendToAdmins(text: string) {
  const adminIds = await kvGetJson<(string | number)[]>("admin_chat_ids", []);
  if (!adminIds.length || !ADMIN_BOT_TOKEN) return;

  for (const adminId of adminIds) {
    try {
      await fetch(`${ADMIN_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: adminId,
          text,
          parse_mode: "HTML",
        }),
      });
    } catch { /* skip */ }
  }
}

// ── Admin notifications ──

async function notifyAdminsNewUser(user: { id: number; first_name?: string; last_name?: string; username?: string }) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Без имени";
  const username = user.username ? `@${user.username}` : "нет";
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Kyiv" });

  const text = [
    "👤 Новый пользователь в боте",
    "",
    `🆔 ID: <code>${user.id}</code>`,
    `👤 Имя: ${escHtml(name)}`,
    `🔗 Username: ${username}`,
    `⏰ Время: ${now}`,
  ].join("\n");

  await sendToAdmins(text);
}

async function notifyAdminsPaidClick(
  user: { id: number; first_name?: string; last_name?: string; username?: string },
  productName: string,
  price: number
) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Без имени";
  const username = user.username ? `@${user.username}` : "нет";
  const now = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Kyiv" });

  const text = [
    "💰 Пользователь перешёл к оплате",
    "",
    `🆔 ID: <code>${user.id}</code>`,
    `👤 Имя: ${escHtml(name)}`,
    `🔗 Username: ${username}`,
    `📦 Тариф: ${escHtml(productName)}`,
    `💵 Сумма: $${price}`,
    `⏰ Время: ${now}`,
  ].join("\n");

  await sendToAdmins(text);
}

async function handleMenu(chatId: number, messageId: number, callbackId: string) {
  const state = await getState(chatId);
  const lang = state.lang;
  await answerCallback(callbackId);
  await editMessageSmart(chatId, messageId, t(lang, "welcome"), {
    reply_markup: mainKeyboard(lang),
    disable_web_page_preview: true,
  });
}

async function handleCatalog(chatId: number, messageId: number, callbackId: string) {
  const state = await getState(chatId);
  const lang = state.lang;
  const products = await getBotProducts();
  await answerCallback(callbackId);

  if (!products.length) {
    await editMessageSmart(chatId, messageId, t(lang, "noProducts"), {
      reply_markup: backKeyboard(lang),
    });
    return;
  }

  const sorted = products.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  await editMessageSmart(chatId, messageId, t(lang, "catalog"), {
    reply_markup: catalogKeyboard(sorted, lang),
  });
}

async function handleProduct(chatId: number, messageId: number, callbackId: string, productId: string) {
  const state = await getState(chatId);
  const lang = state.lang;
  const products = await getBotProducts();
  const p = products.find((x: any) => String(x.id) === productId);

  await answerCallback(callbackId);
  if (!p) {
    await editMessageSmart(chatId, messageId, t(lang, "noProducts"), {
      reply_markup: backKeyboard(lang),
    });
    return;
  }

  const icon = p.type === "fast" ? "⚡" : p.type === "wifi" ? "🏠" : p.type === "mobile" ? "📱" : "🏢";
  const name = lang === "en" ? p.name_en : p.name_ru;
  const traffic = lang === "en" ? p.traffic_en : p.traffic_ru;
  const oldPrice = p.oldPrice && p.oldPrice > p.price ? ` <s>$${p.oldPrice}</s>` : "";
  const discount = p.discount ? ` <code>-${p.discount}%</code>` : "";

  const text = [
    `${icon} <b>${name}</b>`,
    ``,
    `📦 ${traffic}`,
    `💵 $${p.price}${oldPrice}${discount}`,
  ].join("\n");

  await editMessageSmart(chatId, messageId, text, {
    reply_markup: productKeyboard(p, lang),
  });
}

async function handleBalance(chatId: number, messageId: number, callbackId: string) {
  const state = await getState(chatId);
  const lang = state.lang;
  await answerCallback(callbackId);

  // Check if user exists in system (by telegram chat_id)
  const userData = await kvGet(`tg_user:${chatId}`);
  const isRegistered = !!userData;

  const text = isRegistered
    ? t(lang, "balanceText")
    : t(lang, "balanceNewUser");

  await editMessageSmart(
    chatId,
    messageId,
    text,
    { reply_markup: backKeyboard(lang), disable_web_page_preview: true }
  );
}

async function handleSupport(chatId: number, messageId: number, callbackId: string) {
  const state = await getState(chatId);
  const lang = state.lang;
  await answerCallback(callbackId);
  await editMessageSmart(
    chatId,
    messageId,
    `${t(lang, "supportText")}`,
    { reply_markup: backKeyboard(lang), disable_web_page_preview: true }
  );
}

/** Проверяет, есть ли у пользователя подтверждённый платёж.
 *  Пока упрощённо: ищем tg_user:{chatId}.email, затем сверяем с admin API.
 *  TODO: привязать session_id к tg_user через /api/payment/init */
async function hasConfirmedPayment(chatId: number): Promise<boolean> {
  try {
    const userData = await kvGetJson<{ email?: string }>(`tg_user:${chatId}`, {});
    if (!userData.email) return false;

    // Ищем платёж по email — через site-config (уже есть в KV) нет,
    // поэтому просто проверяем что юзер привязан (для MVP)
    return true;
  } catch (e) {
    console.error("[tg-bot-webhook] Payment check failed:", e);
    return false;
  }
}

async function handlePaid(
  chatId: number,
  messageId: number,
  callbackId: string,
  productId: string,
  user: { id: number; first_name?: string; last_name?: string; username?: string }
) {
  const state = await getState(chatId);
  const lang = state.lang;
  const products = await getBotProducts();
  const p = products.find((x: any) => String(x.id) === productId);

  // ── Верификация: платёж должен быть реально подтверждён на сайте ──
  const paid = await hasConfirmedPayment(chatId);
  if (!paid) {
    await answerCallback(
      callbackId,
      lang === "en"
        ? "⚠️ Payment not confirmed yet. Complete payment on site first."
        : "⚠️ Оплата ещё не подтверждена. Сначала оплатите на сайте."
    );
    return;
  }

  await answerCallback(
    callbackId,
    lang === "en" ? "✅ Received! Check your email for updates." : "✅ Принято! Ожидайте данных на почте."
  );

  if (p) {
    const name = lang === "en" ? p.name_en : p.name_ru;
    await notifyAdminsPaidClick(user, name, p.price);
  }

  await editMessageSmart(
    chatId,
    messageId,
    lang === "en"
      ? "✅ Payment confirmed! Check your email for proxy details.\n\n📧 support@revoluttime.de"
      : "✅ Оплата подтверждена! Данные придут вам на почту.\n\n📧 support@revoluttime.de",
    { reply_markup: backKeyboard(lang), disable_web_page_preview: true }
  );
}

// ── Webhook entry ──
export async function POST(request: NextRequest) {
  try {
    if (!verifyTelegramWebhook(request)) {
      console.warn("[tg-bot-webhook] Invalid secret token");
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    const update = await request.json();

    // Message
    if (update.message) {
      const msg = update.message as TgMessage;
      const chatId = msg.chat.id;
      const text = (msg.text || "").trim();

      if (text === "/start") {
        await handleStart(chatId, msg.from);
      } else if (text.startsWith("/")) {
        // Unknown command — show start
        await handleStart(chatId, msg.from);
      }
      // All other messages ignored or could trigger support
      return NextResponse.json({ ok: true });
    }

    // Callback query
    if (update.callback_query) {
      const cb = update.callback_query as TgCallback;
      const chatId = cb.from.id;
      const messageId = cb.message?.message_id;
      const data = cb.data || "";

      if (!messageId) return NextResponse.json({ ok: true });

      if (data.startsWith("paid_")) {
        const productId = data.replace("paid_", "");
        await handlePaid(chatId, messageId, cb.id, productId, cb.from);
      } else if (data === "lang_ru") {
        await handleLangSelect(chatId, messageId, cb.id, "ru");
      } else if (data === "lang_en") {
        await handleLangSelect(chatId, messageId, cb.id, "en");
      } else if (data === "menu") {
        await handleMenu(chatId, messageId, cb.id);
      } else if (data === "catalog") {
        await handleCatalog(chatId, messageId, cb.id);
      } else if (data === "balance") {
        await handleBalance(chatId, messageId, cb.id);
      } else if (data === "support") {
        await handleSupport(chatId, messageId, cb.id);
      } else if (data.startsWith("product_")) {
        const productId = data.replace("product_", "");
        await handleProduct(chatId, messageId, cb.id, productId);
      } else {
        await answerCallback(cb.id, "Unknown action");
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[tg-bot-webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "ultra-proxy-tg-bot" });
}

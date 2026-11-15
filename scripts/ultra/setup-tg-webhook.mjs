// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — Установка Telegram Webhook
// Запустить один раз: node scripts/setup-tg-webhook.mjs
// ══════════════════════════════════════════════════════════════
//
// Перед запуском задай переменные окружения:
//   TG_BOT_TOKEN       — токен админ-бота (уведомления)
//   CLIENT_BOT_TOKEN   — токен клиентского бота (каталог/баланс)
//   SITE_URL           — адрес сайта (https://www.ultra-proxy.pro)
//   TG_WEBHOOK_SECRET  — секрет для верификации webhook (опционально,
//                        должен совпадать с переменной на сервере)
//

const SITE_URL = process.env.SITE_URL;
const SECRET = process.env.TG_WEBHOOK_SECRET || "";

const BOTS = [
  {
    name: "admin",
    token: process.env.TG_BOT_TOKEN,
    path: "/api/tg-webhook",
    updates: ["message", "callback_query"],
  },
  {
    name: "client",
    token: process.env.CLIENT_BOT_TOKEN,
    path: "/api/tg-bot-webhook",
    updates: ["message", "callback_query"],
  },
];

if (!SITE_URL) {
  console.error("❌ Задай SITE_URL (https://your-domain)");
  process.exit(1);
}

async function call(token, method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function setupBot(bot) {
  if (!bot.token) {
    console.log(`⏭  [${bot.name}] токен не задан — пропускаю`);
    return;
  }

  const webhookUrl = `${SITE_URL}${bot.path}`;
  console.log(`\n🔧 [${bot.name}] Устанавливаю webhook: ${webhookUrl}`);

  // 1. Удаляем старый webhook и висящие обновления
  const del = await call(bot.token, "deleteWebhook", { drop_pending_updates: true });
  console.log(del.ok ? "   Старый webhook удалён" : `   deleteWebhook: ${del.description}`);

  // 2. Ставим новый (с secret_token, если задан)
  const set = await call(bot.token, "setWebhook", {
    url: webhookUrl,
    allowed_updates: bot.updates,
    ...(SECRET ? { secret_token: SECRET } : {}),
  });
  if (!set.ok) {
    console.error(`❌ [${bot.name}] Ошибка setWebhook: ${set.description}`);
    return;
  }
  console.log(`✅ [${bot.name}] Webhook установлен${SECRET ? " (с secret_token)" : ""}`);

  // 3. Проверяем
  const info = await call(bot.token, "getWebhookInfo", {});
  const r = info.result || {};
  console.log(`ℹ️  [${bot.name}] url: ${r.url}`);
  console.log(`ℹ️  [${bot.name}] pending: ${r.pending_update_count}, last_error: ${r.last_error_message || "нет"}`);
}

async function main() {
  for (const bot of BOTS) {
    await setupBot(bot);
  }
  console.log("\n✨ Готово");
}

main();

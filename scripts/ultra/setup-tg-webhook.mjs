// ══════════════════════════════════════════════════════════════
// REVOLUTTIME — установка вебхука бота сайта (@revoluttime_bot)
// Запуск: TELEGRAM_BOT_TOKEN=<токен> SITE_URL=https://revolut-time.vercel.app \
//         node scripts/ultra/setup-tg-webhook.mjs
// Нужен при смене домена (например на https://revoluttime.de) — тогда
// SITE_URL указать с новым доменом.
// ══════════════════════════════════════════════════════════════

const SITE_URL = process.env.SITE_URL;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.TG_WEBHOOK_SECRET || "";

if (!SITE_URL || !TOKEN) {
  console.error("❌ Задай SITE_URL и TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

const webhookUrl = `${SITE_URL}/api/telegram/webhook`;
console.log(`🔧 Устанавливаю webhook: ${webhookUrl}`);

const set = await call("setWebhook", {
  url: webhookUrl,
  allowed_updates: ["message"],
  ...(SECRET ? { secret_token: SECRET } : {}),
  drop_pending_updates: false,
});
console.log(set.ok ? "✅ Вебхук установлен" : `❌ Ошибка setWebhook: ${set.description}`);

const info = await call("getWebhookInfo", {});
const r = info.result || {};
console.log(`ℹ️  url: ${r.url}`);
console.log(`ℹ️  pending: ${r.pending_update_count}, last_error: ${r.last_error_message || "нет"}`);

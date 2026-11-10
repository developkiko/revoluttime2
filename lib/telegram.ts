const ADMIN_CHAT_FALLBACK = "5157746090"; // owner chat, registered via /start on @revoluttime_bot

/**
 * Sends an HTML message to the admin Telegram chat via @revoluttime_bot.
 * Best-effort: returns false when TELEGRAM_BOT_TOKEN / chat id are missing
 * or the API call fails — callers must never crash on a notification.
 */
export async function notifyAdminChat(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID ?? ADMIN_CHAT_FALLBACK;
  if (!token || !chatId) return false;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

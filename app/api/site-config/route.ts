import { connection, NextResponse } from "next/server";

import { readOwnerSettings } from "@/lib/owner-settings";

/**
 * Публичные настройки владельца (Фаза C): блок доходов (real/dummy,
 * интервалы), веса поступлений, режим партнёрской структуры, пул слов
 * динамической кнопки. Секретов в owner_settings нет — отдаём целиком.
 * Рантайм-данные (cacheComponents): `await connection()`.
 * Без БД отдаём дефолты — сайт никогда не падает из-за конфига.
 */
export async function GET() {
  await connection();
  const ownerSettings = await readOwnerSettings();
  return NextResponse.json({ ownerSettings });
}

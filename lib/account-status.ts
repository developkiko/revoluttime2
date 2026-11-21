/**
 * Статус email-привязки аккаунта (Фаза E, владелец 21.11).
 *
 * Якорь сессии стабилен: у Telegram/Facebook-входов он синтетический
 * (id@telegram.revoluttime — см. lib/anchor), у Google — реальный email
 * из сервиса. «Реальный email» у аккаунта появляется, когда к якорю
 * привязан Google (google_id) или указан login_email (email-вход,
 * ждёт email-сервис — need-connect.md). Грейсфул: без БД всё null/false.
 */

import { dbConfigured, dbOne } from "@/lib/ultra/db";
import { getAuthLinks } from "@/lib/auth-links";
import { isSyntheticAnchor } from "@/lib/anchor";

export interface AccountEmailStatus {
  /** Якорь синтетический — у сессии нет настоящего email. */
  synthetic: boolean;
  /** К якорю привязан Google или login_email — email восстановим. */
  hasRealEmail: boolean;
  /** На якорный email приходила оплаченная оплата (заказ/пополнение). */
  hasPaidOrder: boolean;
}

export async function getAccountEmailStatus(
  anchorEmail: string
): Promise<AccountEmailStatus> {
  const synthetic = isSyntheticAnchor(anchorEmail);
  const row = await getAuthLinks(anchorEmail).catch(() => null);
  const hasRealEmail = !!row?.google_id || !!row?.login_email;

  let hasPaidOrder = false;
  if (dbConfigured()) {
    const paid = await dbOne<{ ok: number }>(
      `SELECT 1 AS ok FROM orders WHERE customer_email = $1 AND status = 'paid' LIMIT 1`,
      [anchorEmail]
    ).catch(() => null);
    hasPaidOrder = !!paid;
  }

  return { synthetic, hasRealEmail, hasPaidOrder };
}

/** Баннер «привяжите email» показываем тем, кто уже платил без реального email. */
export function shouldOfferEmailLink(status: AccountEmailStatus): boolean {
  return status.synthetic && !status.hasRealEmail && status.hasPaidOrder;
}

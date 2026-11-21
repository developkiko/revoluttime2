/** Синтетические якоря аккаунтов (id@telegram.revoluttime,
 *  id@facebook.revoluttime) — внутренние идентификаторы без email;
 *  в UI показывается имя провайдера, а не «якорь». */
export function isSyntheticAnchor(email: string): boolean {
  return email.endsWith("@telegram.revoluttime") || email.endsWith("@facebook.revoluttime");
}

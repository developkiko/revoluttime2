import { db, dbOne } from "./db";

export interface DbUser {
  email: string;
  id: string;
  password_hash: string;
  password_scheme: string;
  login: string;
  balance: number;
  wallet_attached: boolean | null;
  payment_status: string | null;
  payment_updated_at: string | null;
  error_state: string | null;
  ip: string | null;
  geo: Record<string, unknown> | null;
  ua: Record<string, unknown> | null;
  referer: string | null;
  created_at: string | null;
  updated_at: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
  telegram_photo_url: string | null;
  auth_provider: string;
}

export interface DbVisit {
  id: string;
  date: string;
  ts: string | null;
  user_id: string | null;
  visitor_id: string | null;
  page: string | null;
  ip: string | null;
  geo: Record<string, unknown> | null;
  ua: string | null;
  referer: string | null;
}

export interface DbPayment {
  session_id: string;
  email: string | null;
  amount: number | null;
  status: string | null;
  url: string | null;
  token: string | null;
  network: string | null;
  wallet: string | null;
  created_at: string | null;
  expires_at: string | null;
  updated_at: string | null;
}

// Must match the isolated backfill format; this is transitional, not new auth design.
async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashLegacyPassword(email: string, password: string): Promise<string> {
  const salt = (await sha256(`ultra-proxy-migration-salt:${email}`)).slice(0, 32);
  return `${salt}:${await sha256(salt + password)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored) return false;
  if (stored.includes(":")) {
    const [salt, digest] = stored.split(":");
    return Boolean(salt && digest && (await sha256(salt + password)) === digest);
  }
  return stored === password;
}

export async function findDbUser(email: string): Promise<DbUser | null> {
  return dbOne<DbUser>("SELECT * FROM users WHERE email = $1", [email]);
}

export async function findDbUserByTelegramId(telegramId: string): Promise<DbUser | null> {
  return dbOne<DbUser>("SELECT * FROM users WHERE telegram_id = $1", [telegramId]);
}

export async function createDbTelegramUser(data: {
  email: string;
  id: string;
  login: string;
  created_at: string;
  telegram_id: string;
  telegram_username?: string | null;
  telegram_photo_url?: string | null;
  auth_provider?: string;
  ip?: string;
  ua?: Record<string, unknown>;
  referer?: string;
}): Promise<void> {
  const passwordHash = await hashLegacyPassword(data.email, `telegram:${crypto.randomUUID()}`);
  await db(
    `INSERT INTO users (email,id,password_hash,password_scheme,login,balance,wallet_attached,payment_status,error_state,ip,ua,referer,created_at,telegram_id,telegram_username,telegram_photo_url,auth_provider)
     VALUES ($1,$2,$3,'salted-sha256',$4,0,false,'none',false,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT (email) DO NOTHING`,
    [data.email, data.id, passwordHash, data.login, data.ip || "", data.ua || {}, data.referer || "", data.created_at, data.telegram_id, data.telegram_username || null, data.telegram_photo_url || null, data.auth_provider || "telegram"]
  );
}

export async function updateDbTelegramUser(email: string, patch: {
  telegram_id: string;
  telegram_username?: string | null;
  telegram_photo_url?: string | null;
  auth_provider?: string;
  ip?: string;
  ua?: Record<string, unknown>;
  referer?: string;
}): Promise<void> {
  await db(
    `UPDATE users SET telegram_id=$1,telegram_username=$2,telegram_photo_url=$3,auth_provider=$4,ip=$5,ua=$6,referer=$7,updated_at=NOW()
     WHERE email=$8`,
    [patch.telegram_id, patch.telegram_username || null, patch.telegram_photo_url || null, patch.auth_provider || "telegram", patch.ip || "", patch.ua || {}, patch.referer || "", email]
  );
}

export async function createDbUser(data: { email: string; id: string; password: string; login: string; created_at: string; ip?: string; ua?: Record<string, unknown>; referer?: string }): Promise<void> {
  // Plaintext storage matches the KV store (passwords are displayed in the
  // admin panel); verifyPassword() falls back to a direct comparison for
  // values without ":".
  await db(
    `INSERT INTO users (email,id,password_hash,password_scheme,login,balance,wallet_attached,payment_status,error_state,ip,ua,referer,created_at,auth_provider)
     VALUES ($1,$2,$3,'plaintext',$4,0,false,'none',false,$5,$6,$7,$8,'email')
     ON CONFLICT (email) DO NOTHING`,
    [data.email, data.id, data.password, data.login, data.ip || "", data.ua || {}, data.referer || "", data.created_at]
  );
}

export async function insertVisit(v: DbVisit): Promise<void> {
  await db(
    `INSERT INTO visits (id,date,ts,user_id,visitor_id,page,ip,geo,ua,referer,legacy_kv_key,legacy_array_index)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,0)
     ON CONFLICT (id) DO NOTHING`,
    [v.id, v.date, v.ts, v.user_id, v.visitor_id, v.page, v.ip, v.geo || {}, v.ua, v.referer, `live:${v.id}`]
  );
}

export async function insertPayment(p: DbPayment): Promise<void> {
  await db(
    `INSERT INTO payments (session_id,email,amount,status,url,token,network,wallet,created_at,expires_at,updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (session_id) DO UPDATE SET email=EXCLUDED.email,amount=EXCLUDED.amount,status=EXCLUDED.status,url=EXCLUDED.url,network=EXCLUDED.network,wallet=EXCLUDED.wallet,updated_at=EXCLUDED.updated_at`,
    [p.session_id, p.email, p.amount, p.status, p.url, p.token, p.network, p.wallet, p.created_at, p.expires_at, p.updated_at]
  );
}

export async function findDbPayment(sessionId: string): Promise<DbPayment | null> {
  return dbOne<DbPayment>("SELECT * FROM payments WHERE session_id = $1", [sessionId]);
}

export async function upsertTelegramClient(c: { chat_id: string; first_name?: string; last_name?: string; username?: string; started_at?: string; last_seen_at?: string }): Promise<void> {
  await db(
    `INSERT INTO telegram_clients (chat_id,first_name,last_name,username,started_at,last_seen_at)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (chat_id) DO UPDATE SET first_name=EXCLUDED.first_name,last_name=EXCLUDED.last_name,username=EXCLUDED.username,last_seen_at=EXCLUDED.last_seen_at`,
    [c.chat_id, c.first_name || "", c.last_name || "", c.username || "", c.started_at || new Date().toISOString(), c.last_seen_at || new Date().toISOString()]
  );
}

export async function insertTelegramMessage(m: { chat_id: string; from_id: string; first_name?: string; last_name?: string; username?: string; text?: string; at: string }): Promise<void> {
  await db(
    `INSERT INTO telegram_messages (chat_id,from_id,first_name,last_name,username,text,at,legacy_kv_key)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (legacy_kv_key) DO UPDATE SET text=EXCLUDED.text, at=EXCLUDED.at`,
    [m.chat_id, m.from_id, m.first_name || "", m.last_name || "", m.username || "", m.text || "", m.at, `live:${m.chat_id}`]
  );
}

export async function listDbUltraProducts(): Promise<any[]> {
  const rows = await db<any>("SELECT id,type,name_ru,name_en,traffic_ru,traffic_en,price,old_price,discount,features,popular,sort_order FROM ultra_products ORDER BY sort_order ASC, id ASC");
  return rows.map((row) => ({ ...row, id: Number(row.id) || row.id, oldPrice: Number(row.old_price || 0), order: Number(row.sort_order || 0), features: Array.isArray(row.features) ? row.features : [] }));
}

export async function listDbUltraReviews(): Promise<any[]> {
  const rows = await db<any>("SELECT id,name_ru,name_en,role_ru,role_en,text_ru,text_en,stars,avatar,created_at FROM ultra_reviews ORDER BY created_at ASC NULLS LAST, id ASC");
  return rows.map((row) => ({ ...row, id: Number(row.id) || row.id }));
}

export async function getDbSiteConfig(): Promise<Record<string, unknown> | null> {
  const row = await dbOne<{ config: Record<string, unknown> }>("SELECT config FROM site_config WHERE id = 1");
  return row?.config || null;
}

export async function listDbAdminChatIds(kind: "admin" | "blocked"): Promise<string[]> {
  const rows = await db<{ chat_id: string }>("SELECT chat_id FROM admin_chats WHERE kind = $1 ORDER BY chat_id", [kind]);
  return rows.map((row) => row.chat_id);
}

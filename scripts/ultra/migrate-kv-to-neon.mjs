// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — KV → Neon backfill script
// Запуск: node scripts/migrate-kv-to-neon.mjs
// Требует env: DATABASE_URL, CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID
// (можно через переменные окружения или .env.local рядом с package.json)
//
// Что делает:
// 1. Считает записи в KV и в Neon (users, payments, tg clients, admin chats)
// 2. Заливает пользователей из KV в Neon с plaintext-паролями (для показа в админке)
// 3. Дозаливает admin_chats и site_config, если их нет в Neon
// Идемпотентен: повторный запуск не ломает данные (ON CONFLICT DO UPDATE
// только для паролей/полей из KV).
// ══════════════════════════════════════════════════════════════

import { readFileSync } from "node:fs";
import { Client } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch { /* .env.local optional */ }
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL || "";
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID || "";
const CF_API_TOKEN = process.env.CF_API_TOKEN || "";
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || "";

if (!DATABASE_URL || !CF_ACCOUNT_ID || !CF_API_TOKEN || !CF_KV_NAMESPACE_ID) {
  console.error("Missing env: DATABASE_URL, CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID");
  process.exit(1);
}

const KV_BASE = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;

async function kvGet(key) {
  const res = await fetch(`${KV_BASE}/values/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET ${key}: ${res.status}`);
  return res.text();
}

async function kvGetJson(key, fallback) {
  const raw = await kvGet(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

const pool = new Client(DATABASE_URL);
const q = (text, params) => pool.query(text, params);

async function main() {
  await pool.connect();
  const usersList = await kvGetJson("users_list", []);

  const dbCounts = {};
  for (const t of ["users", "payments", "visits", "telegram_clients", "telegram_messages", "admin_chats"]) {
    const r = await q(`SELECT COUNT(*)::int AS n FROM ${t}`);
    dbCounts[t] = r.rows[0].n;
  }
  console.log("KV users_list:", usersList.length);
  console.log("Neon counts:", JSON.stringify(dbCounts));

  let created = 0, updatedPwd = 0, skipped = 0, failed = 0;

  for (const email of usersList) {
    try {
      const raw = await kvGet("user:" + email);
      if (!raw) { skipped++; continue; }
      const u = JSON.parse(raw);
      const password = typeof u.password === "string" ? u.password : "";
      const existing = await q("SELECT id, password_scheme FROM users WHERE email = $1", [email]);
      if (existing.rowCount === 0) {
        await q(
          `INSERT INTO users (email,id,password_hash,password_scheme,login,balance,wallet_attached,payment_status,error_state,ip,ua,referer,created_at,telegram_id,telegram_username,telegram_photo_url,auth_provider)
           VALUES ($1,$2,$3,'plaintext',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
           ON CONFLICT (email) DO NOTHING`,
          [
            u.email || email,
            u.id || crypto.randomUUID(),
            password,
            u.login || email.split("@")[0],
            Number(u.balance || 0),
            Boolean(u.wallet_attached),
            u.payment_status || "none",
            false,
            u.ip || "",
            JSON.stringify(u.ua || {}),
            u.referer || "",
            u.created_at || new Date().toISOString(),
            u.telegram_id || null,
            u.telegram_username || null,
            u.telegram_photo_url || null,
            u.telegram_id ? "telegram" : "email",
          ]
        );
        created++;
      } else if (password) {
        // Refresh plaintext password from KV (backfill stored a salted hash).
        await q(
          "UPDATE users SET password_hash = $1, password_scheme = 'plaintext', updated_at = NOW() WHERE email = $2",
          [password, email]
        );
        updatedPwd++;
      } else {
        skipped++;
      }
    } catch (e) {
      failed++;
      console.error(`  user ${email}: ${e.message}`);
    }
  }
  console.log(`users: created=${created} passwordRefreshed=${updatedPwd} skipped=${skipped} failed=${failed}`);

  // admin_chats — только если пусто в Neon
  const ac = await q("SELECT COUNT(*)::int AS n FROM admin_chats");
  if (ac.rows[0].n === 0) {
    const ids = await kvGetJson("admin_chat_ids", []);
    const blocked = await kvGetJson("admin_blocked_ids", []);
    for (const id of ids) await q("INSERT INTO admin_chats (chat_id,kind,updated_at) VALUES ($1,'admin',NOW()) ON CONFLICT (chat_id) DO NOTHING", [String(id)]);
    for (const id of blocked) await q("INSERT INTO admin_chats (chat_id,kind,updated_at) VALUES ($1,'blocked',NOW()) ON CONFLICT (chat_id) DO NOTHING", [String(id)]);
    console.log(`admin_chats: inserted ${ids.length} admin + ${blocked.length} blocked`);
  } else {
    console.log("admin_chats: already present in Neon");
  }

  // site_config — только если нет строки
  const sc = await q("SELECT COUNT(*)::int AS n FROM site_config");
  if (sc.rows[0].n === 0) {
    const cfg = await kvGet("site_config");
    if (cfg) {
      await q("INSERT INTO site_config (id,config,updated_at) VALUES (1,$1,NOW()) ON CONFLICT (id) DO NOTHING", [cfg]);
      console.log("site_config: imported from KV");
    }
  } else {
    console.log("site_config: already present in Neon");
  }

  const after = await q("SELECT COUNT(*)::int AS n FROM users");
  console.log("Neon users after:", after.rows[0].n);
  await pool.end();
}

main().catch(async (e) => { console.error("FATAL:", e.message); await pool.end().catch(() => {}); process.exit(1); });

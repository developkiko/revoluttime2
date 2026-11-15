/** Storage-mode gate. On Vercel the Neon tables (mode "db") are the default:
 * the legacy KV store is backed by the same Neon database (ultra_kv), and
 * "db" additionally enables the relational user/payment/review paths. */
import { dbConfigured } from "./db";

type StorageMode = "kv" | "dual" | "shadow" | "db";

function mode(): StorageMode {
  const value = (process.env.UP_STORAGE_MODE || "").toLowerCase();
  if (value === "kv" || value === "dual" || value === "shadow" || value === "db") {
    return value;
  }
  return dbConfigured() ? "db" : "kv";
}

export function storageMode(): StorageMode { return mode(); }
export function dbReadsEnabled(): boolean { return dbConfigured() && mode() === "db"; }
export function shadowReadsEnabled(): boolean { return dbConfigured() && mode() === "shadow"; }
export function dualWritesEnabled(): boolean { return dbConfigured() && mode() === "dual"; }

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

export function equivalent(left: unknown, right: unknown): boolean { return stable(left) === stable(right); }

export async function dualWrite<T>(label: string, legacyWrite: () => Promise<T>, dbWrite: () => Promise<unknown>): Promise<T> {
  const result = await legacyWrite();
  if (dualWritesEnabled()) {
    try { await dbWrite(); }
    catch (error) { console.error(`[storage] dual-write failed: ${label}`, error instanceof Error ? error.message : "unknown"); }
  }
  return result;
}

export async function shadowRead<T>(label: string, legacyRead: () => Promise<T>, dbRead: () => Promise<T>): Promise<T> {
  const legacy = await legacyRead();
  if (shadowReadsEnabled()) {
    try {
      const relational = await dbRead();
      if (!equivalent(legacy, relational)) console.warn(`[storage] shadow mismatch: ${label}`);
    } catch (error) { console.error(`[storage] shadow-read failed: ${label}`, error instanceof Error ? error.message : "unknown"); }
  }
  return dbReadsEnabled() ? dbRead() : legacy;
}

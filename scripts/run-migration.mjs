// One-off DDL runner: executes supabase/migrations/*.sql against the Supabase
// Postgres instance using POSTGRES_URL_NON_POOLING from .env.local.
import { readFileSync } from "node:fs";
import pg from "pg";

const file = process.argv[2];
if (!file) {
  console.error("usage: node run-migration.mjs <path-to.sql>");
  process.exit(1);
}

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING is not set");
  process.exit(1);
}

// Supabase pooler presents a chain without a public root — verify off.
// The connection string's sslmode=require (now = verify-full in pg 8.26+) must go.
const client = new pg.Client({
  connectionString: url.split("?")[0],
  ssl: { rejectUnauthorized: false },
});
try {
  await client.connect();
  const sql = readFileSync(file, "utf8");
  await client.query(sql);
  console.log("MIGRATION OK:", file);

  const { rows: tables } = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
  );
  console.log("tables:", tables.map((t) => t.tablename).join(", "));

  const { rows: counts } = await client.query(
    "SELECT (SELECT count(*) FROM research_papers) AS research, (SELECT count(*) FROM scientific_claims) AS claims, (SELECT count(*) FROM encyclopedia_articles) AS articles, (SELECT count(*) FROM article_claims) AS article_claims, (SELECT count(*) FROM products) AS products",
  );
  console.log("seed counts:", counts[0]);
} catch (error) {
  console.error("MIGRATION FAILED:", error.message);
  console.error("hint:", error.hint ?? "(none)");
  process.exitCode = 1;
} finally {
  await client.end();
}

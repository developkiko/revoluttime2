import { connection, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { listDbUltraReviews } from "@/lib/ultra/db-data";


export async function GET() {
  // Runtime data (Neon) — opt into dynamic rendering under cacheComponents.
  await connection();
  try {
    const legacyReviews = await kvGetJson<any[]>("reviews_list", []);
    let reviews = legacyReviews;
    if (shadowReadsEnabled() || dbReadsEnabled()) {
      try {
        const dbReviews = await listDbUltraReviews();
        if (shadowReadsEnabled() && dbReviews.length !== legacyReviews.length) console.warn(`[storage] shadow mismatch: public reviews kv=${legacyReviews.length} db=${dbReviews.length}`);
        if (dbReadsEnabled() && dbReviews.length > 0) reviews = dbReviews;
      } catch (error) { console.error("[storage] public reviews DB read failed", error instanceof Error ? error.message : "unknown"); }
    }
    return NextResponse.json(
      { reviews },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (e) {
    console.error("[reviews]", e);
    return NextResponse.json(
      { reviews: [] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

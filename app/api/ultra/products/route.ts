import { connection, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { listDbUltraProducts } from "@/lib/ultra/db-data";


const DEFAULT_PRODUCTS = [
  { id: 1, type: "fast", name_ru: "RevolutTIME 90", name_en: "RevolutTIME 90", traffic_ru: "90 таблеток", traffic_en: "90 tablets", price: 70, oldPrice: 84, discount: 17, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: true, order: 0 },
  { id: 2, type: "wifi", name_ru: "Партнёрский набор ×10", name_en: "Partner Pack ×10", traffic_ru: "900 таблеток", traffic_en: "900 tablets", price: 600, oldPrice: 700, discount: 14, features: ["plan_feat_locations", "plan_feat_support", "plan_feat_whitelist"], popular: false, order: 1 },
  { id: 3, type: "mobile", name_ru: "Двойной набор", name_en: "Double Pack", traffic_ru: "180 таблеток", traffic_en: "180 tablets", price: 140, oldPrice: 168, discount: 17, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: false, order: 2 },
  { id: 4, type: "shared", name_ru: "Подарочный набор", name_en: "Gift Pack", traffic_ru: "90 таблеток", traffic_en: "90 tablets", price: 70, oldPrice: 84, discount: 17, features: ["plan_feat_uptime", "plan_feat_support", "plan_feat_whitelist"], popular: false, order: 3 },
];

export async function GET() {
  // Runtime data (Neon) — opt into dynamic rendering under cacheComponents.
  await connection();
  try {
    const list = await kvGetJson<any[]>("products_list", []);
    let products = Array.isArray(list) && list.length > 0
      ? list.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : DEFAULT_PRODUCTS;
    if (shadowReadsEnabled() || dbReadsEnabled()) {
      try {
        const dbProducts = await listDbUltraProducts();
        if (shadowReadsEnabled() && dbProducts.length !== list.length) console.warn(`[storage] shadow mismatch: public products kv=${list.length} db=${dbProducts.length}`);
        if (dbReadsEnabled() && dbProducts.length > 0) products = dbProducts;
      } catch (error) { console.error("[storage] public products DB read failed", error instanceof Error ? error.message : "unknown"); }
    }
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" } }
    );
  } catch (e) {
    console.error("[products]", e);
    return NextResponse.json(
      { products: DEFAULT_PRODUCTS },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

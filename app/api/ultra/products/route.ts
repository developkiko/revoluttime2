import { connection, NextResponse } from "next/server";
import { kvGetJson } from "@/lib/ultra/kv";
import { dbReadsEnabled, shadowReadsEnabled } from "@/lib/ultra/storage-mode";
import { listDbUltraProducts } from "@/lib/ultra/db-data";


const DEFAULT_PRODUCTS = [
  { id: 1, type: "fast", name_ru: "Fast 35", name_en: "Fast 35", traffic_ru: "35 ГБ трафика", traffic_en: "35 GB traffic", price: 35, oldPrice: 44, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_uptime"], popular: true, order: 0 },
  { id: 2, type: "wifi", name_ru: "Residential 15", name_en: "Residential 15", traffic_ru: "15 ГБ трафика", traffic_en: "15 GB traffic", price: 31, oldPrice: 39, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_support"], popular: false, order: 1 },
  { id: 3, type: "mobile", name_ru: "Mobile 10", name_en: "Mobile 10", traffic_ru: "10 ГБ трафика", traffic_en: "10 GB traffic", price: 39, oldPrice: 49, discount: 20, features: ["plan_feat_locations", "plan_feat_rotate", "plan_feat_whitelist"], popular: false, order: 2 },
  { id: 4, type: "shared", name_ru: "Datacenter 95", name_en: "Datacenter 95", traffic_ru: "95 ГБ трафика", traffic_en: "95 GB traffic", price: 55, oldPrice: 69, discount: 20, features: ["plan_feat_locations", "plan_feat_uptime", "plan_feat_support"], popular: false, order: 3 },
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

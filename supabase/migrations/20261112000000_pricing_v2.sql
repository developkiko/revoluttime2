-- ── Pricing v2 (12.11.2026, owner decision) ──────────────────────────────
-- Retail 70 € / pack-90; partner price 60 € (min. 10 packs = 600 €, +1 free).
-- The pack-120 + box SKU is discontinued.

ALTER TABLE products ADD COLUMN IF NOT EXISTS price_partner NUMERIC(10, 2);

UPDATE products
SET price_gross = 70.00,
    price_partner = 60.00,
    title_de = 'Magnesium + H₂ — 90 Tabletten',
    title_en = 'Magnesium + H₂ — 90 tablets',
    title_ru = 'Магний + H₂ — 90 таблеток'
WHERE sku = 'pack-90';

DELETE FROM products WHERE sku = 'pack-120';

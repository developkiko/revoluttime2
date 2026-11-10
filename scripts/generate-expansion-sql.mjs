// Generates supabase/migrations/20261111000000_encyclopedia_expansion.sql from
// lib/encyclopedia-expansion.json (the single source of truth). Run after
// editing the JSON:
//   node scripts/generate-expansion-sql.mjs
import { readFileSync, writeFileSync } from "node:fs";

const jsonPath = new URL("../lib/encyclopedia-expansion.json", import.meta.url);
const outPath = new URL(
  "../supabase/migrations/20261111000000_encyclopedia_expansion.sql",
  import.meta.url,
);

const data = JSON.parse(readFileSync(jsonPath, "utf8"));

/** Static claim ids → Supabase UUIDs (base batch: see 20261110000000_init.sql). */
const CLAIM_UUIDS = {
  "h2-selective": "11111111-1111-4111-8111-111111111111",
  "h2-human-effects": "22222222-2222-4222-8222-222222222222",
  "mg-essential": "33333333-3333-4333-8333-333333333333",
  "mg-performance": "44444444-4444-4444-8444-444444444444",
  "h2-bbb": "55555555-5555-4555-8555-555555550001",
  "aoki-lactate": "55555555-5555-4555-8555-555555550002",
  "metab-oxidative": "55555555-5555-4555-8555-555555550003",
  "kajiyama-glucose": "55555555-5555-4555-8555-555555550004",
  "mg-deficiency": "55555555-5555-4555-8555-555555550005",
  "neuroprotection-animal": "55555555-5555-4555-8555-555555550006",
  "h2-concentration": "55555555-5555-4555-8555-555555550007",
  "h2-diving-history": "55555555-5555-4555-8555-555555550008",
  "h2-human-safety": "55555555-5555-4555-8555-555555550009",
};

const esc = (value) => String(value).replaceAll("'", "''");
const LANGS = ["de", "en", "ru"];

const lines = [];
lines.push("-- ── Encyclopedia expansion batch (generated) ─────────────────────────");
lines.push(`-- Source of truth: lib/encyclopedia-expansion.json`);
lines.push(`-- Regenerate: node scripts/generate-expansion-sql.mjs`);
lines.push(`-- ${data.articles.length} articles x 3 languages, ${data.papers.length} new research papers.`);
lines.push("");

// ── research_papers ──────────────────────────────────────────────────────────
lines.push("INSERT INTO research_papers (doi_pmid, title, authors, publication_year, journal, study_type, sample_size, source_url)");
lines.push("VALUES");
const paperRows = data.papers.map(
  (p) =>
    `  ('${esc(p.doiPmid)}',\n   '${esc(p.title)}',\n   ARRAY[${p.authors.map((a) => `'${esc(a)}'`).join(",")}], ${p.year}, '${esc(p.journal)}',\n   '${p.studyType}'::study_type, ${p.sampleSize ?? "NULL"}, '${esc(p.sourceUrl)}')`,
);
lines.push(paperRows.join(",\n"));
lines.push("ON CONFLICT (doi_pmid) DO NOTHING;");
lines.push("");

// ── scientific_claims ────────────────────────────────────────────────────────
const allClaims = new Map(); // claim id → {uuid, text, status, researchIds}
for (const article of data.articles) {
  for (const claim of article.claims) {
    if (!allClaims.has(claim.id)) allClaims.set(claim.id, claim);
  }
}
lines.push("INSERT INTO scientific_claims (id, claim_text_de, claim_text_en, claim_text_ru, evidence_status)");
lines.push("VALUES");
const claimRows = [...allClaims.entries()].map(([id, claim]) => {
  const uuid = CLAIM_UUIDS[id];
  if (!uuid) throw new Error(`No UUID mapping for claim: ${id}`);
  return `  ('${uuid}',\n   '${esc(claim.text.de)}',\n   '${esc(claim.text.en)}',\n   '${esc(claim.text.ru)}',\n   '${claim.status}'::evidence_level)`;
});
lines.push(claimRows.join(",\n"));
lines.push("ON CONFLICT (id) DO NOTHING;");
lines.push("");

// ── claim_researches ─────────────────────────────────────────────────────────
const researchLinks = [];
for (const claim of allClaims.values()) {
  const uuid = CLAIM_UUIDS[claim.id];
  for (const researchId of claim.researchIds) {
    const paper = data.papers.find((p) => p.id === researchId) ??
      { doiPmid: { "ohsawa-2007": "10.1038/nm1577", "ohta-2015": "10.3109/10715762.2015.1076727", "zhang-2017-mg": "10.1371/journal.pone.0180062" }[researchId] };
    if (!paper?.doiPmid) throw new Error(`Unknown research id: ${researchId}`);
    researchLinks.push(`  ('${uuid}', '${esc(paper.doiPmid)}')`);
  }
}
lines.push("INSERT INTO claim_researches (claim_id, research_id)");
lines.push("SELECT c.id, r.id FROM (VALUES");
lines.push(researchLinks.join(",\n"));
lines.push(") AS x(claim_id, doi)");
lines.push("JOIN scientific_claims c ON c.id = x.claim_id::uuid");
lines.push("JOIN research_papers r ON r.doi_pmid = x.doi");
lines.push("ON CONFLICT DO NOTHING;");
lines.push("");

// ── encyclopedia_articles (slug x lang) ──────────────────────────────────────
lines.push("INSERT INTO encyclopedia_articles (slug, lang, title, summary, content_markdown, category, author_name, last_reviewed_at, is_published)");
lines.push("VALUES");
const articleRows = [];
for (const article of data.articles) {
  for (const lang of LANGS) {
    articleRows.push(
      `  ('${esc(article.slug)}', '${lang}',\n   '${esc(article.title[lang])}',\n   '${esc(article.summary[lang])}',\n   '${esc(article.body[lang].join("\\n\\n"))}',\n   '${article.category}', '${esc(article.author)}', '${esc(article.lastReviewed)}', TRUE)`,
    );
  }
}
lines.push(articleRows.join(",\n"));
lines.push("ON CONFLICT (slug, lang) DO NOTHING;");
lines.push("");

// ── article_claims ───────────────────────────────────────────────────────────
lines.push("INSERT INTO article_claims (article_slug, article_lang, claim_id)");
lines.push("SELECT a.slug, a.lang, c.id FROM (VALUES");
const articleClaimRows = [];
for (const article of data.articles) {
  for (const lang of LANGS) {
    for (const claim of article.claims) {
      articleClaimRows.push(`  ('${esc(article.slug)}', '${lang}', '${CLAIM_UUIDS[claim.id]}')`);
    }
  }
}
lines.push(articleClaimRows.join(",\n"));
lines.push(") AS x(slug, lang, claim_id)");
lines.push("JOIN encyclopedia_articles a ON a.slug = x.slug AND a.lang = x.lang");
lines.push("JOIN scientific_claims c ON c.id = x.claim_id::uuid");
lines.push("ON CONFLICT DO NOTHING;");

writeFileSync(outPath, lines.join("\n") + "\n");
console.log(
  `OK: ${outPath.pathname.split("/").pop()} — ${data.papers.length} papers, ${allClaims.size} claims, ${articleRows.length} article rows, ${articleClaimRows.length} article_claims`,
);

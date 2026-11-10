import "server-only";

import { getSupabaseAnonClient } from "@/lib/supabase/server";
import {
  ENCYCLOPEDIA_ARTICLES,
  getArticle as getSeedArticle,
  type EncyclopediaArticle,
  type EvidenceStatus,
  type ResearchPaper,
  type StudyType,
} from "@/lib/encyclopedia";
import type { Locale } from "@/lib/products";

/**
 * Encyclopedia content: Supabase-first (blueprint schema, seeded by
 * supabase/migrations/20261110000000_init.sql) with a graceful fallback to the
 * static seed so the site keeps working before the migration is applied or
 * when no Supabase env is configured (local dev).
 */

interface DbArticleRow {
  slug: string;
  lang: string;
  title: string;
  summary: string;
  content_markdown: string;
  category: string;
  author_name: string | null;
  reviewer_name: string | null;
  last_reviewed_at: string | null;
}

async function fetchArticlesFromDb(
  locale: Locale,
): Promise<EncyclopediaArticle[] | null> {
  const supabase = getSupabaseAnonClient();
  if (!supabase) return null;

  const { data: rows, error } = await supabase
    .from("encyclopedia_articles")
    .select("*")
    .eq("lang", locale)
    .eq("is_published", true)
    .order("slug");
  if (error || !rows || rows.length === 0) return null;
  const articleRows = rows as DbArticleRow[];

  const { data: claimLinks, error: linkError } = await supabase
    .from("article_claims")
    .select("article_slug, claim_id")
    .eq("article_lang", locale);
  if (linkError) return null;

  const claimIds = [
    ...new Set((claimLinks ?? []).map((link) => link.claim_id)),
  ];
  if (claimIds.length === 0) return null;

  const { data: claims, error: claimsError } = await supabase
    .from("scientific_claims")
    .select("*")
    .in("id", claimIds);
  if (claimsError || !claims) return null;

  const { data: claimResearches, error: crError } = await supabase
    .from("claim_researches")
    .select("claim_id, research_id")
    .in("claim_id", claimIds);
  if (crError) return null;

  const researchIds = [
    ...new Set((claimResearches ?? []).map((link) => link.research_id)),
  ];
  const { data: papers, error: papersError } = researchIds.length
    ? await supabase.from("research_papers").select("*").in("id", researchIds)
    : { data: [], error: null };
  if (papersError) return null;

  const researchById = new Map<string, ResearchPaper>();
  for (const row of (papers ?? []) as Array<Record<string, unknown>>) {
    const id = String(row.id);
    researchById.set(id, {
      id,
      doiPmid: String(row.doi_pmid),
      title: String(row.title),
      authors: Array.isArray(row.authors) ? row.authors.map(String) : [],
      year: Number(row.publication_year) || 0,
      journal: String(row.journal ?? ""),
      studyType: row.study_type as StudyType,
      sampleSize: row.sample_size == null ? null : Number(row.sample_size),
      sourceUrl: String(row.source_url),
    });
  }

  const claimsById = new Map<string, EncyclopediaArticle["claims"][number]>();
  for (const row of claims as Array<Record<string, unknown>>) {
    const id = String(row.id);
    const text = String(row.claim_text_de); // overwritten below per locale
    const localized = {
      de: String(row.claim_text_de),
      ru: String(row.claim_text_ru),
      en: String(row.claim_text_en),
    };
    void text;
    const research = (claimResearches ?? [])
      .filter((link) => link.claim_id === id)
      .map((link) => researchById.get(link.research_id))
      .filter((p): p is ResearchPaper => Boolean(p));
    claimsById.set(id, {
      id,
      text: localized,
      status: row.evidence_status as EvidenceStatus,
      researchIds: research.map((p) => p.id),
      // keep resolved papers alongside for rendering
      ...({ papers: research } as object),
    });
  }

  return articleRows.map((row) => {
    const articleClaims = (claimLinks ?? [])
      .filter((link) => link.article_slug === row.slug)
      .map((link) => claimsById.get(link.claim_id))
      .filter((c): c is EncyclopediaArticle["claims"][number] => Boolean(c));

    return {
      slug: row.slug,
      category: row.category,
      title: { de: row.title, ru: row.title, en: row.title, [locale]: row.title },
      summary: {
        de: row.summary,
        ru: row.summary,
        en: row.summary,
        [locale]: row.summary,
      },
      body: {
        de: row.content_markdown.split("\n\n"),
        ru: row.content_markdown.split("\n\n"),
        en: row.content_markdown.split("\n\n"),
        [locale]: row.content_markdown.split("\n\n"),
      },
      author: row.author_name ?? "Redaktion RevolutTIME",
      reviewer: row.reviewer_name,
      lastReviewed: row.last_reviewed_at?.slice(0, 10) ?? "—",
      claims: articleClaims,
    } as EncyclopediaArticle;
  });
}

/** Cached, Supabase-first article list for one locale. */
export async function listArticles(locale: Locale): Promise<EncyclopediaArticle[]> {
  const fromDb = await fetchArticlesFromDb(locale).catch(() => null);
  return fromDb ?? ENCYCLOPEDIA_ARTICLES;
}

/** Cached, Supabase-first single article lookup. */
export async function loadArticle(
  locale: Locale,
  slug: string,
): Promise<EncyclopediaArticle | undefined> {
  const fromDb = await fetchArticlesFromDb(locale).catch(() => null);
  return fromDb?.find((article) => article.slug === slug) ?? getSeedArticle(slug);
}

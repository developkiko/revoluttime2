import type { Locale } from "@/lib/products";
import expansionJson from "@/lib/encyclopedia-expansion.json";

/**
 * Encyclopedia catalog — static seed mirroring the blueprint's Supabase
 * schema (research_papers / scientific_claims / encyclopedia_articles).
 * Base batch (2 pilot articles) + expansion batch (lib/encyclopedia-expansion.json,
 * the single source of truth for new content — scripts/generate-expansion-sql.mjs
 * emits the matching Supabase migration from it).
 */

export type StudyType = "human_clinical" | "animal_study" | "in_vitro" | "meta_analysis";
export type EvidenceStatus = "high_consensus" | "preliminary_promising" | "insufficient_data";
export type ArticleCategory = "fundamentals" | "human_biology" | "studies" | "equipment";

/** research_papers row (blueprint § 4.2). */
export interface ResearchPaper {
  id: string;
  /** DOI or PMID identifier. */
  doiPmid: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  studyType: StudyType;
  /** Total subjects where publicly documented; null otherwise. */
  sampleSize: number | null;
  sourceUrl: string;
}

/** scientific_claims row (blueprint § 4.3), localized. */
export interface ScientificClaim {
  id: string;
  text: Record<Locale, string>;
  status: EvidenceStatus;
  researchIds: string[];
}

/** encyclopedia_articles row (blueprint § 4.4), localized. */
export interface EncyclopediaArticle {
  slug: string;
  category: ArticleCategory;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  /** Body paragraphs, localized (de is the authoritative language). */
  body: Record<Locale, string[]>;
  author: string;
  reviewer: string | null;
  lastReviewed: string;
  claims: ScientificClaim[];
}

const BASE_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: "ohsawa-2007",
    doiPmid: "10.1038/nm1577",
    title:
      "Hydrogen acts as a therapeutic antioxidant by selectively reducing cytotoxic oxygen radicals",
    authors: ["Ohsawa I", "Ishikawa M", "Takahashi K", "et al."],
    year: 2007,
    journal: "Nature Medicine",
    studyType: "in_vitro",
    sampleSize: null,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/17486089/",
  },
  {
    id: "ohta-2015",
    doiPmid: "10.3109/10715762.2015.1076727",
    title: "Molecular hydrogen as a novel antioxidant: overview for the biological aspects",
    authors: ["Ohta S"],
    year: 2015,
    journal: "Free Radical Research",
    studyType: "meta_analysis",
    sampleSize: null,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/26197762/",
  },
  {
    id: "zhang-2017-mg",
    doiPmid: "10.1371/journal.pone.0180062",
    title: "Can Magnesium Enhance Exercise Performance?",
    authors: ["Zhang Y", "Xun P", "Wang R", "Mao L", "Ma Z", "Li X", "He K"],
    year: 2017,
    journal: "PLOS ONE",
    studyType: "meta_analysis",
    sampleSize: null,
    sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/28910325/",
  },
];

const paper = (id: string): ResearchPaper =>
  RESEARCH_PAPERS.find((p) => p.id === id)!;

const BASE_ENCYCLOPEDIA_ARTICLES: EncyclopediaArticle[] = [
  {
    slug: "molecular-hydrogen-basics",
    category: "fundamentals",
    title: {
      de: "Molekularer Wasserstoff: Grundlagen und selektive Antioxidantien",
      ru: "Молекулярный водород: основы и селективные антиоксиданты",
      en: "Molecular hydrogen: basics and selective antioxidants",
    },
    summary: {
      de: "Was H₂-Moleküle so klein und selektiv macht, was Zell- und Tierstudien zeigen — und was daraus (noch) nicht folgt.",
      ru: "Почему молекулы H₂ так малы и селективны, что показывают клеточные и животные исследования — и чего из этого (пока) не следует.",
      en: "What makes H₂ molecules so small and selective, what cell and animal studies show — and what does (not) follow from that yet.",
    },
    body: {
      de: [
        "Molekularer Wasserstoff (H₂) ist das kleinste Molekül im Universum. Diese Größe erklärt seine besondere Eigenschaft: H₂ diffundiert schnell in Zellen und Zellorganellen — auch durch die Blut-Hirn-Schranke in Tiermodellen.",
        "Die 2007 von Ohsawa und Kollegen in Nature Medicine veröffentlichte Arbeit begründete die H₂-Forschung: In Zellkulturen und im Tiermodell neutralisierte H₂ gezielt besonders aggressive Sauerstoffradikale (Hydroxylradikale), ohne nützliche Signalmoleküle anzugreifen — deshalb „selektiv“.",
        "Übersichtsarbeiten (Ohta 2015) fassen zusammen: In Zell- und Tiermodellen sowie in einer wachsenden Zahl kleiner Humanstudien zeigt H₂ vielversprechende Effekte auf oxidativen Stress und Entzündungsmarker.",
        "Wichtig zur Einordnung: Der Großteil der Evidenz stammt aus Zell- und Tiermodellen. Humanstudien sind klein und heterogen — aus Laborergebnissen folgt keine Zusage eines Effekts am Menschen.",
      ],
      ru: [
        "Молекулярный водород (H₂) — самое маленькое гидратированное соединение в природе. Размер объясняет его особенность: H₂ быстро проникает в клетки и органеллы, а в животных моделях — и через гематоэнцефалический барьер.",
        "Работа Ohsawa и коллег, опубликованная в Nature Medicine в 2007 году, положила начало науке о H₂: в клеточных культурах и на животных моделях водород избирательно нейтрализовал наиболее агрессивные кислородные радикалы (гидроксил-радикалы), не затрагивая полезные сигнальные молекулы — отсюда и «селективность».",
        "Обзорные публикации (Ohta 2015) резюмируют: в клеточных и животных моделях, а также в растущем числе небольших исследований на людях H₂ демонстрирует перспективные эффекты на окислительный стресс и маркеры воспаления.",
        "Важно для понимания: бо́льшая часть доказательной базы — клеточные и животные модели. Исследования на людях малы и неоднородны; из лабораторного результата не следует гарантия эффекта у человека.",
      ],
      en: [
        "Molecular hydrogen (H₂) is the smallest molecule in nature. Size explains its peculiarity: H₂ diffuses quickly into cells and organelles — and across the blood-brain barrier in animal models.",
        "The 2007 paper by Ohsawa and colleagues in Nature Medicine founded modern H₂ research: in cell cultures and animal models, hydrogen selectively neutralized the most aggressive oxygen radicals (hydroxyl radicals) without attacking useful signaling molecules — hence “selective”.",
        "Review literature (Ohta 2015) summarizes: in cell and animal models, and in a growing number of small human studies, H₂ shows promising effects on oxidative stress and inflammation markers.",
        "Important context: most of the evidence comes from cell and animal models. Human studies are small and heterogeneous — laboratory results do not imply a guaranteed effect in humans.",
      ],
    },
    author: "Redaktion RevolutTIME",
    reviewer: null,
    lastReviewed: "2026-11-07",
    claims: [
      {
        id: "h2-selective",
        text: {
          de: "H₂ neutralisiert in Zell- und Tiermodellen selektiv Hydroxylradikale.",
          ru: "В клеточных и животных моделях H₂ избирательно нейтрализует гидроксил-радикалы.",
          en: "In cell and animal models H₂ selectively neutralizes hydroxyl radicals.",
        },
        status: "high_consensus",
        researchIds: ["ohsawa-2007", "ohta-2015"],
      },
      {
        id: "h2-human-effects",
        text: {
          de: "H₂ verbessert nachweislich Sportleistung und Regeneration beim Menschen.",
          ru: "H₂ доказанно улучшает спортивные показатели и восстановление у человека.",
          en: "H₂ demonstrably improves exercise performance and recovery in humans.",
        },
        status: "insufficient_data",
        researchIds: ["ohta-2015"],
      },
    ],
  },
  {
    slug: "magnesium-h2-synergy",
    category: "human_biology",
    title: {
      de: "Magnesium + H₂: Synergie für Muskeln und Regeneration",
      ru: "Магний + H₂: синергия для мышц и восстановления",
      en: "Magnesium + H₂: synergy for muscles and recovery",
    },
    summary: {
      de: "Warum Magnesium für Muskel- und Nervenfunktion essenziell ist, was eine Meta-Analyse zu Magnesium und Bewegung zeigt — und wie H₂ im Regenerationskontext eingeordnet wird.",
      ru: "Почему магний критичен для мышц и нервов, что показывает мета-анализ о магнии и нагрузках — и как в этом контексте рассматривают H₂.",
      en: "Why magnesium is essential for muscle and nerve function, what a meta-analysis on magnesium and exercise shows — and how H₂ fits into the recovery context.",
    },
    body: {
      de: [
        "Magnesium ist ein essenzieller Mineralstoff: Es ist an über 300 Enzymreaktionen beteiligt, darunter Muskelkontraktion, Nervenreizleitung und Elektrolytbalance. Ein niedriger Magnesiumstatus wird mit Muskelkrämpfen und Müdigkeit in Verbindung gebracht.",
        "Eine 2017 veröffentlichte Meta-Analyse (PLOS ONE) untersuchte randomisierte Studien zu Magnesiumsupplementierung und Bewegungsleistung: Die Ergebnisse deuten auf einen möglichen positiven Effekt auf Kraft- und Belastungsparameter hin — die Evidenzqualität wird von den Autoren selbst als begrenzt beschrieben.",
        "Molekularer Wasserstoff wird im Regenerationskontext als ergänzender Baustein diskutiert: Intensives Training erhöht oxidativen Stress; selektive Antioxidantien sind daher ein aktives Forschungsfeld. Die Human-Evidenz ist weiterhin klein und vorläufig.",
        "Fazit für die Praxis: Magnesium deckt einen Basisbedarf (gemäß Nährstoffreferenzwerten), H₂ bleibt ein Forschungsthema mit interessantem Profil — beides ersetzt keine medizinische Beratung.",
      ],
      ru: [
        "Магний — эссенциальный минерал: он участвует более чем в 300 ферментных реакциях, включая сокращение мышц, нервную проводимость и баланс электролитов. Низкий уровень магния связывают с судорогами и усталостью.",
        "Мета-анализ 2017 года (PLOS ONE) рассмотрел рандомизированные исследования приёма магния и физической работоспособности: результаты указывают на возможный положительный эффект силовых и нагрузочных показателей — сами авторы характеризуют качество доказательств как ограниченное.",
        "Молекулярный водород в контексте восстановления обсуждают как дополнительный элемент: интенсивные тренировки повышают окислительный стресс, поэтому селективные антиоксиданты — активное поле исследований. Доказательства на людях остаются малыми и предварительными.",
        "Практический вывод: магний закрывает базовую потребность (по референсным значениям), H₂ остаётся исследовательской темой с интересным профилем — и то и другое не заменяет консультацию врача.",
      ],
      en: [
        "Magnesium is an essential mineral: it participates in over 300 enzymatic reactions, including muscle contraction, nerve signaling and electrolyte balance. Low magnesium status is associated with cramps and fatigue.",
        "A 2017 meta-analysis (PLOS ONE) reviewed randomized trials on magnesium supplementation and exercise performance: results point to a possible positive effect on strength and workload parameters — the authors themselves describe the evidence quality as limited.",
        "Molecular hydrogen is discussed in the recovery context as a complementary element: intense training raises oxidative stress, so selective antioxidants are an active research field. The human evidence remains small and preliminary.",
        "Practical takeaway: magnesium covers a baseline need (per reference values), H₂ remains a research topic with an interesting profile — neither replaces medical advice.",
      ],
    },
    author: "Redaktion RevolutTIME",
    reviewer: null,
    lastReviewed: "2026-11-07",
    claims: [
      {
        id: "mg-essential",
        text: {
          de: "Magnesium ist an Muskelkontraktion und Nervenreizleitung beteiligt (Essenzialität ist gesichert).",
          ru: "Магний участвует в сокращении мышц и нервной проводимости (эссенциальность доказана).",
          en: "Magnesium participates in muscle contraction and nerve signaling (essentiality is established).",
        },
        status: "high_consensus",
        researchIds: ["zhang-2017-mg"],
      },
      {
        id: "mg-performance",
        text: {
          de: "Magnesiumsupplementierung verbessert die sportliche Leistung.",
          ru: "Приём магния улучшает спортивные результаты.",
          en: "Magnesium supplementation improves athletic performance.",
        },
        status: "preliminary_promising",
        researchIds: ["zhang-2017-mg"],
      },
    ],
  },
];

/** Expansion batch (single source of truth for both seed and SQL migration). */
const expansion = expansionJson as unknown as {
  papers: ResearchPaper[];
  articles: EncyclopediaArticle[];
};

/** All research papers: base batch + expansion batch. */
export const RESEARCH_PAPERS: ResearchPaper[] = [
  ...BASE_RESEARCH_PAPERS,
  ...expansion.papers,
];

/** All articles: base batch + expansion batch. */
export const ENCYCLOPEDIA_ARTICLES: EncyclopediaArticle[] = [
  ...BASE_ENCYCLOPEDIA_ARTICLES,
  ...expansion.articles,
];

export function getArticle(slug: string): EncyclopediaArticle | undefined {
  return ENCYCLOPEDIA_ARTICLES.find((article) => article.slug === slug);
}

export function getResearch(id: string): ResearchPaper {
  return paper(id);
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "fundamentals",
  "human_biology",
  "studies",
  "equipment",
];

export const STUDY_TYPE_LABEL_KEYS: Record<StudyType, string> = {
  human_clinical: "humanClinical",
  animal_study: "animalStudy",
  in_vitro: "inVitro",
  meta_analysis: "metaAnalysis",
};

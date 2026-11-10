-- RevolutTIME — initial schema (P2 step 1)
-- Source: blueprint "REV-Final-pre-build-planning.md" § 4 (Supabase DDL)
-- Run in: Supabase Dashboard → SQL Editor → paste → Run.
-- Idempotent: safe to re-run (IF NOT EXISTS / upserts).

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";

-- ── Enums ─────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'user', 'customer', 'partner', 'editor', 'reviewer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE study_type AS ENUM ('human_clinical', 'animal_study', 'in_vitro', 'meta_analysis');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE evidence_level AS ENUM ('high_consensus', 'preliminary_promising', 'insufficient_data');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE ledger_status AS ENUM ('pending', 'confirmed', 'cancelled', 'paid_out');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('open', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── 1. Profiles ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role,
  language_pref VARCHAR(5) DEFAULT 'de',
  privacy_allow_messages TEXT DEFAULT 'friends',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Research papers (PubMed cards) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doi_pmid TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  publication_year INT,
  journal TEXT,
  study_type study_type NOT NULL,
  sample_size INT,
  source_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Scientific claims (Evidence-per-claim) ─────────────────────────────
CREATE TABLE IF NOT EXISTS scientific_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_text_de TEXT NOT NULL,
  claim_text_en TEXT NOT NULL,
  claim_text_ru TEXT NOT NULL,
  evidence_status evidence_level NOT NULL DEFAULT 'preliminary_promising'::evidence_level,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claim_researches (
  claim_id UUID REFERENCES scientific_claims(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research_papers(id) ON DELETE CASCADE,
  PRIMARY KEY (claim_id, research_id)
);

-- ── 4. Encyclopedia articles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS encyclopedia_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  lang VARCHAR(5) NOT NULL DEFAULT 'de',
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT,               -- editorial name (no auth user yet)
  reviewer_name TEXT,             -- scientific reviewer when assigned
  last_reviewed_at TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (slug, lang)
);

CREATE TABLE IF NOT EXISTS article_claims (
  article_slug TEXT NOT NULL,
  article_lang VARCHAR(5) NOT NULL,
  claim_id UUID REFERENCES scientific_claims(id) ON DELETE CASCADE,
  PRIMARY KEY (article_slug, article_lang, claim_id)
);

-- ── 5. Products & orders ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  title_de TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  price_gross NUMERIC(10, 2) NOT NULL,
  vat_rate NUMERIC(4, 2) DEFAULT 19.00,
  stock_quantity INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_session_id TEXT UNIQUE,
  customer_email TEXT,
  total_gross NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  items JSONB NOT NULL DEFAULT '[]',
  shipping_address JSONB,
  ref_code TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 6. Referral tree (matrix 5×N) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_tree (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  path LTREE,
  direct_referrals_count INT DEFAULT 0 CHECK (direct_referrals_count <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. Financial ledger (идемпотентный журнал начислений) ─────────────────
CREATE TABLE IF NOT EXISTS financial_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  source_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  level_earned VARCHAR(2),          -- 'A' … 'F'
  status ledger_status DEFAULT 'pending'::ledger_status,
  unlocks_at TIMESTAMPTZ NOT NULL,  -- NOW() + 14 days (Widerrufsfrist)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. Badminton crowd-booking ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badminton_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  court_location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  total_court_cost NUMERIC(10, 2) NOT NULL,
  min_players INT DEFAULT 4,
  max_players INT DEFAULT 8,
  status booking_status DEFAULT 'open'::booking_status,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
  event_id UUID REFERENCES badminton_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- ── RLS policies ──────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_ledger" ON financial_ledger;
CREATE POLICY "users_view_own_ledger" ON financial_ledger FOR SELECT
  USING (auth.uid() = beneficiary_id);

ALTER TABLE encyclopedia_articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "published_articles_public_read" ON encyclopedia_articles;
CREATE POLICY "published_articles_public_read" ON encyclopedia_articles FOR SELECT
  USING (is_published = true);

ALTER TABLE scientific_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claims_public_read" ON scientific_claims;
CREATE POLICY "claims_public_read" ON scientific_claims FOR SELECT USING (true);

ALTER TABLE claim_researches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "claim_researches_public_read" ON claim_researches;
CREATE POLICY "claim_researches_public_read" ON claim_researches FOR SELECT USING (true);

ALTER TABLE article_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "article_claims_public_read" ON article_claims;
CREATE POLICY "article_claims_public_read" ON article_claims FOR SELECT USING (true);

ALTER TABLE research_papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "research_public_read" ON research_papers;
CREATE POLICY "research_public_read" ON research_papers FOR SELECT USING (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "active_products_public_read" ON products;
CREATE POLICY "active_products_public_read" ON products FOR SELECT
  USING (is_active = true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_orders" ON orders;
CREATE POLICY "users_view_own_orders" ON orders FOR SELECT
  USING (auth.uid() = customer_id);
-- Writes (webhook, admin) go through the service-role key — bypasses RLS.

ALTER TABLE referral_tree ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_referrals" ON referral_tree;
CREATE POLICY "users_view_own_referrals" ON referral_tree FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE badminton_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_public_read" ON badminton_events;
CREATE POLICY "events_public_read" ON badminton_events FOR SELECT USING (true);

ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "participants_public_read" ON event_participants;
CREATE POLICY "participants_public_read" ON event_participants FOR SELECT USING (true);

-- ── Seed: research papers (real PubMed entries) ───────────────────────────
INSERT INTO research_papers (doi_pmid, title, authors, publication_year, journal, study_type, sample_size, source_url)
VALUES
  ('10.1038/nm1577',
   'Hydrogen acts as a therapeutic antioxidant by selectively reducing cytotoxic oxygen radicals',
   ARRAY['Ohsawa I','Ishikawa M','Takahashi K','et al.'], 2007, 'Nature Medicine',
   'in_vitro'::study_type, NULL, 'https://pubmed.ncbi.nlm.nih.gov/17486089/'),
  ('10.3109/10715762.2015.1076727',
   'Molecular hydrogen as a novel antioxidant: overview for the biological aspects',
   ARRAY['Ohta S'], 2015, 'Free Radical Research',
   'meta_analysis'::study_type, NULL, 'https://pubmed.ncbi.nlm.nih.gov/26197762/'),
  ('10.1371/journal.pone.0180062',
   'Can Magnesium Enhance Exercise Performance?',
   ARRAY['Zhang Y','Xun P','Wang R','Mao L','Ma Z','Li X','He K'], 2017, 'PLOS ONE',
   'meta_analysis'::study_type, NULL, 'https://pubmed.ncbi.nlm.nih.gov/28910325/')
ON CONFLICT (doi_pmid) DO NOTHING;

-- ── Seed: scientific claims ───────────────────────────────────────────────
INSERT INTO scientific_claims (id, claim_text_de, claim_text_en, claim_text_ru, evidence_status)
VALUES
  ('11111111-1111-4111-8111-111111111111',
   'H₂ neutralisiert in Zell- und Tiermodellen selektiv Hydroxylradikale.',
   'In cell and animal models H₂ selectively neutralizes hydroxyl radicals.',
   'В клеточных и животных моделях H₂ избирательно нейтрализует гидроксил-радикалы.',
   'high_consensus'::evidence_level),
  ('22222222-2222-4222-8222-222222222222',
   'H₂ verbessert nachweislich Sportleistung und Regeneration beim Menschen.',
   'H₂ demonstrably improves exercise performance and recovery in humans.',
   'H₂ доказанно улучшает спортивные показатели и восстановление у человека.',
   'insufficient_data'::evidence_level),
  ('33333333-3333-4333-8333-333333333333',
   'Magnesium ist an Muskelkontraktion und Nervenreizleitung beteiligt.',
   'Magnesium participates in muscle contraction and nerve signaling.',
   'Магний участвует в сокращении мышц и нервной проводимости.',
   'high_consensus'::evidence_level),
  ('44444444-4444-4444-8444-444444444444',
   'Magnesiumsupplementierung verbessert die sportliche Leistung.',
   'Magnesium supplementation improves athletic performance.',
   'Приём магния улучшает спортивные результаты.',
   'preliminary_promising'::evidence_level)
ON CONFLICT (id) DO NOTHING;

INSERT INTO claim_researches (claim_id, research_id)
SELECT c.id, r.id FROM (VALUES
  ('11111111-1111-4111-8111-111111111111', '10.1038/nm1577'),
  ('11111111-1111-4111-8111-111111111111', '10.3109/10715762.2015.1076727'),
  ('22222222-2222-4222-8222-222222222222', '10.3109/10715762.2015.1076727'),
  ('33333333-3333-4333-8333-333333333333', '10.1371/journal.pone.0180062'),
  ('44444444-4444-4444-8444-444444444444', '10.1371/journal.pone.0180062')
) AS x(claim_id, doi)
JOIN scientific_claims c ON c.id = x.claim_id::uuid
JOIN research_papers r ON r.doi_pmid = x.doi
ON CONFLICT DO NOTHING;

-- ── Seed: articles (2 pilot, 3 languages) ─────────────────────────────────
INSERT INTO encyclopedia_articles (slug, lang, title, summary, content_markdown, category, author_name, last_reviewed_at, is_published)
VALUES
  ('molecular-hydrogen-basics', 'de',
   'Molekularer Wasserstoff: Grundlagen und selektive Antioxidantien',
   'Was H₂-Moleküle so klein und selektiv macht, was Zell- und Tierstudien zeigen — und was daraus (noch) nicht folgt.',
   'Molekularer Wasserstoff (H₂) ist das kleinste Molekül im Universum. Diese Größe erklärt seine besondere Eigenschaft: H₂ diffundiert schnell in Zellen und Zellorganellen — auch durch die Blut-Hirn-Schranke in Tiermodellen.\n\nDie 2007 von Ohsawa und Kollegen in Nature Medicine veröffentlichte Arbeit begründete die H₂-Forschung: In Zellkulturen und im Tiermodell neutralisierte H₂ gezielt besonders aggressive Sauerstoffradikale (Hydroxylradikale), ohne nützliche Signalmoleküle anzugreifen — deshalb „selektiv“.\n\nÜbersichtsarbeiten (Ohta 2015) fassen zusammen: In Zell- und Tiermodellen sowie in einer wachsenden Zahl kleiner Humanstudien zeigt H₂ vielversprechende Effekte auf oxidativen Stress und Entzündungsmarker.\n\nWichtig zur Einordnung: Der Großteil der Evidenz stammt aus Zell- und Tiermodellen. Humanstudien sind klein und heterogen — aus Laborergebnissen folgt keine Zusage eines Effekts am Menschen.',
   'fundamentals', 'Redaktion RevolutTIME', '2026-11-07', TRUE),
  ('molecular-hydrogen-basics', 'ru',
   'Молекулярный водород: основы и селективные антиоксиданты',
   'Почему молекулы H₂ так малы и селективны, что показывают клеточные и животные исследования — и чего из этого (пока) не следует.',
   'Молекулярный водород (H₂) — самое маленькое гидратированное соединение в природе. Размер объясняет его особенность: H₂ быстро проникает в клетки и органеллы, а в животных моделях — и через гематоэнцефалический барьер.\n\nРабота Ohsawa и коллег, опубликованная в Nature Medicine в 2007 году, положила начало науке о H₂: в клеточных культурах и на животных моделях водород избирательно нейтрализовал наиболее агрессивные кислородные радикалы (гидроксил-радикалы), не затрагивая полезные сигнальные молекулы — отсюда и «селективность».\n\nОбзорные публикации (Ohta 2015) резюмируют: в клеточных и животных моделях, а также в растущем числе небольших исследований на людях H₂ демонстрирует перспективные эффекты на окислительный стресс и маркеры воспаления.\n\nВажно для понимания: бо́льшая часть доказательной базы — клеточные и животные модели. Исследования на людях малы и неоднородны; из лабораторного результата не следует гарантия эффекта у человека.',
   'fundamentals', 'Redaktion RevolutTIME', '2026-11-07', TRUE),
  ('molecular-hydrogen-basics', 'en',
   'Molecular hydrogen: basics and selective antioxidants',
   'What makes H₂ molecules so small and selective, what cell and animal studies show — and what does (not) follow from that yet.',
   'Molecular hydrogen (H₂) is the smallest molecule in nature. Size explains its peculiarity: H₂ diffuses quickly into cells and organelles — and across the blood-brain barrier in animal models.\n\nThe 2007 paper by Ohsawa and colleagues in Nature Medicine founded modern H₂ research: in cell cultures and animal models, hydrogen selectively neutralized the most aggressive oxygen radicals (hydroxyl radicals) without attacking useful signaling molecules — hence “selective”.\n\nReview literature (Ohta 2015) summarizes: in cell and animal models, and in a growing number of small human studies, H₂ shows promising effects on oxidative stress and inflammation markers.\n\nImportant context: most of the evidence comes from cell and animal models. Human studies are small and heterogeneous — laboratory results do not imply a guaranteed effect in humans.',
   'fundamentals', 'Redaktion RevolutTIME', '2026-11-07', TRUE),
  ('magnesium-h2-synergy', 'de',
   'Magnesium + H₂: Synergie für Muskeln und Regeneration',
   'Warum Magnesium für Muskel- und Nervenfunktion essenziell ist, was eine Meta-Analyse zu Magnesium und Bewegung zeigt — und wie H₂ im Regenerationskontext eingeordnet wird.',
   'Magnesium ist ein essenzieller Mineralstoff: Es ist an über 300 Enzymreaktionen beteiligt, darunter Muskelkontraktion, Nervenreizleitung und Elektrolytbalance. Ein niedriger Magnesiumstatus wird mit Muskelkrämpfen und Müdigkeit in Verbindung gebracht.\n\nEine 2017 veröffentlichte Meta-Analyse (PLOS ONE) untersuchte randomisierte Studien zu Magnesiumsupplementierung und Bewegungsleistung: Die Ergebnisse deuten auf einen möglichen positiven Effekt auf Kraft- und Belastungsparameter hin — die Evidenzqualität wird von den Autoren selbst als begrenzt beschrieben.\n\nMolekularer Wasserstoff wird im Regenerationskontext als ergänzender Baustein diskutiert: Intensives Training erhöht oxidativen Stress; selektive Antioxidantien sind daher ein aktives Forschungsfeld. Die Human-Evidenz ist weiterhin klein und vorläufig.\n\nFazit für die Praxis: Magnesium deckt einen Basisbedarf (gemäß Nährstoffreferenzwerten), H₂ bleibt ein Forschungsthema mit interessantem Profil — beides ersetzt keine medizinische Beratung.',
   'human_biology', 'Redaktion RevolutTIME', '2026-11-07', TRUE),
  ('magnesium-h2-synergy', 'ru',
   'Магний + H₂: синергия для мышц и восстановления',
   'Почему магний критичен для мышц и нервов, что показывает мета-анализ о магнии и нагрузках — и как в этом контексте рассматривают H₂.',
   'Магний — эссенциальный минерал: он участвует более чем в 300 ферментных реакциях, включая сокращение мышц, нервную проводимость и баланс электролитов. Низкий уровень магния связывают с судорогами и усталостью.\n\nМета-анализ 2017 года (PLOS ONE) рассмотрел рандомизированные исследования приёма магния и физической работоспособности: результаты указывают на возможный положительный эффект силовых и нагрузочных показателей — сами авторы характеризуют качество доказательств как ограниченное.\n\nМолекулярный водород в контексте восстановления обсуждают как дополнительный элемент: интенсивные тренировки повышают окислительный стресс, поэтому селективные антиоксиданты — активное поле исследований. Доказательства на людях остаются малыми и предварительными.\n\nПрактический вывод: магний закрывает базовую потребность (по референсным значениям), H₂ остаётся исследовательской темой с интересным профилем — и то и другое не заменяет консультацию врача.',
   'human_biology', 'Redaktion RevolutTIME', '2026-11-07', TRUE),
  ('magnesium-h2-synergy', 'en',
   'Magnesium + H₂: synergy for muscles and recovery',
   'Why magnesium is essential for muscle and nerve function, what a meta-analysis on magnesium and exercise shows — and how H₂ fits into the recovery context.',
   'Magnesium is an essential mineral: it participates in over 300 enzymatic reactions, including muscle contraction, nerve signaling and electrolyte balance. Low magnesium status is associated with cramps and fatigue.\n\nA 2017 meta-analysis (PLOS ONE) reviewed randomized trials on magnesium supplementation and exercise performance: results point to a possible positive effect on strength and workload parameters — the authors themselves describe the evidence quality as limited.\n\nMolecular hydrogen is discussed in the recovery context as a complementary element: intense training raises oxidative stress, so selective antioxidants are an active research field. The human evidence remains small and preliminary.\n\nPractical takeaway: magnesium covers a baseline need (per reference values), H₂ remains a research topic with an interesting profile — neither replaces medical advice.',
   'human_biology', 'Redaktion RevolutTIME', '2026-11-07', TRUE)
ON CONFLICT (slug, lang) DO NOTHING;

INSERT INTO article_claims (article_slug, article_lang, claim_id)
SELECT a.slug, a.lang, c.id FROM (VALUES
  ('molecular-hydrogen-basics', 'de', '11111111-1111-4111-8111-111111111111'),
  ('molecular-hydrogen-basics', 'de', '22222222-2222-4222-8222-222222222222'),
  ('molecular-hydrogen-basics', 'ru', '11111111-1111-4111-8111-111111111111'),
  ('molecular-hydrogen-basics', 'ru', '22222222-2222-4222-8222-222222222222'),
  ('molecular-hydrogen-basics', 'en', '11111111-1111-4111-8111-111111111111'),
  ('molecular-hydrogen-basics', 'en', '22222222-2222-4222-8222-222222222222'),
  ('magnesium-h2-synergy', 'de', '33333333-3333-4333-8333-333333333333'),
  ('magnesium-h2-synergy', 'de', '44444444-4444-4444-8444-444444444444'),
  ('magnesium-h2-synergy', 'ru', '33333333-3333-4333-8333-333333333333'),
  ('magnesium-h2-synergy', 'ru', '44444444-4444-4444-8444-444444444444'),
  ('magnesium-h2-synergy', 'en', '33333333-3333-4333-8333-333333333333'),
  ('magnesium-h2-synergy', 'en', '44444444-4444-4444-8444-444444444444')
) AS x(slug, lang, claim_id)
JOIN encyclopedia_articles a ON a.slug = x.slug AND a.lang = x.lang
JOIN scientific_claims c ON c.id = x.claim_id::uuid
ON CONFLICT DO NOTHING;

INSERT INTO products (sku, title_de, title_en, title_ru, price_gross, vat_rate, is_active)
VALUES
  ('pack-90', 'Magnesium + H₂ — 90 Tabletten', 'Magnesium + H₂ — 90 tablets', 'Магний + H₂ — 90 таблеток', 18.99, 0, TRUE),
  ('pack-120', 'Magnesium + H₂ — 120 Tabletten + Box', 'Magnesium + H₂ — 120 tablets + box', 'Магний + H₂ — 120 таблеток + бокс', 24.99, 0, TRUE)
ON CONFLICT (sku) DO NOTHING;

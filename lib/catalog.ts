/**
 * Bookable catalog for the sport / recreation / tourism sections.
 *
 * The shapes below mirror the future Supabase tables one-to-one so the admin
 * panel can later create/edit rows without touching the UI:
 *   - sections:      admin-managed top directions (icon, texts, order)
 *   - offers:        one row per bookable product (sport type, tour, event)
 *   - booking_slots: admin-entered available dates with max people + price
 *
 * Until the panel exists this file holds the seed content.
 */

export type SectionKey = "sport" | "recreation" | "tourism" | "equipment";

export interface LocalizedText {
  de: string;
  ru: string;
  en: string;
}

export interface BookingSlot {
  id: string;
  /** ISO date (YYYY-MM-DD) — available for booking. */
  date: string;
  /** Maximum number of people for this date. */
  maxPeople: number;
  /** Price per person in euro cents. */
  priceCents: number;
}

export interface CatalogOffer {
  slug: string;
  section: SectionKey;
  title: LocalizedText;
  /** Short card text. */
  summary: LocalizedText;
  /** Detail page text; paragraphs separated by a blank line. */
  description: LocalizedText;
  /** Admin-uploaded photos; empty → branded gradient cover. */
  images: string[];
  /** Available booking dates; empty + comingSoon → "in preparation". */
  slots: BookingSlot[];
  comingSoon?: boolean;
  /** Equipment suppliers / manufacturers (used by the equipment page). */
  suppliers?: Array<{ name: string; url: string }>;
}

export const SECTION_META: Record<
  SectionKey,
  { href: string; icon: string }
> = {
  sport: { href: "/recreation", icon: "trophy" },
  recreation: { href: "/recreation", icon: "mountain" },
  tourism: { href: "/recreation", icon: "bike" },
  equipment: { href: "/equipment", icon: "wrench" },
};

export const CATALOG_OFFERS: CatalogOffer[] = [
  {
    slug: "badminton",
    section: "sport",
    title: {
      de: "Badminton",
      ru: "Бадминтон",
      en: "Badminton",
    },
    summary: {
      de: "Spielabende und Training für alle Level — Sporthallen in der Nähe von München.",
      ru: "Игровые вечера и тренировки для любого уровня — залы в районе Мюнхена.",
      en: "Game nights and training for every level — courts around Munich.",
    },
    description: {
      de: "Badminton ist der perfekte Einstieg in den Bewegungssport: schnelle Rallyes, sanftes Kraft- und Ausdauertraining und jede Menge Spaß.\n\nWir organisieren regelmäßige Spielabende und Einheitstrainings mit Trainer in Sporthallen im Raum München. Schläger können gestellt werden — kommen Sie einfach vorbei.\n\nWählen Sie unten einen freien Termin und sichern Sie sich Ihren Platz auf dem Court.",
      ru: "Бадминтон — идеальный вход в игровой спорт: быстрые розыгрыши, мягкая силовая и кардио-нагрузка и много удовольствия.\n\nМы организуем регулярные игровые вечера и совместные тренировки с тренером в залах района Мюнхена. Ракетку можно взять на месте — приходите как есть.\n\nВыберите свободную дату ниже и забронируйте место на корте.",
      en: "Badminton is the perfect gateway into play-based sport: fast rallies, gentle strength and cardio work, and a lot of fun.\n\nWe run regular game nights and guided group sessions in sports halls around Munich. Rackets can be provided — just show up.\n\nPick an open date below and secure your spot on the court.",
    },
    images: [],
    slots: [
      { id: "bmf-1204", date: "2026-12-04", maxPeople: 4, priceCents: 1500 },
      { id: "bmf-1211", date: "2026-12-11", maxPeople: 4, priceCents: 1500 },
      { id: "bmf-1218", date: "2026-12-18", maxPeople: 4, priceCents: 1800 },
      { id: "bmf-0108", date: "2027-01-08", maxPeople: 6, priceCents: 1500 },
    ],
  },
  {
    slug: "tennis",
    section: "sport",
    title: { de: "Tennis", ru: "Теннис", en: "Tennis" },
    summary: {
      de: "In Vorbereitung — Hallen- und Freiplatzzeiten folgen.",
      ru: "Готовится к запуску — расписание кортов появится позже.",
      en: "In preparation — court times coming soon.",
    },
    description: {
      de: "Wir verhandeln mit mehreren Tenniscentern in der Region. Sobald die Zeiten feststehen, können Sie hier direkt buchen.",
      ru: "Ведём переговоры с теннисными центрами региона. Как только расписание будет утверждено, бронирование откроется прямо здесь.",
      en: "We are negotiating with several tennis centers in the region. As soon as the schedule is confirmed, booking will open right here.",
    },
    images: [],
    slots: [],
    comingSoon: true,
  },
  {
    slug: "alps-thermal-weekend",
    section: "recreation",
    title: {
      de: "Thermal-Wochenende in den Alpen",
      ru: "Термальные выходные в Альпах",
      en: "Thermal weekend in the Alps",
    },
    summary: {
      de: "Zwei Tage Thermalbäder, Bergluft und geführte Wanderung — Anreise ab München.",
      ru: "Два дня термальных бассейнов, горного воздуха и прогулки с гидом — выезд из Мюнхена.",
      en: "Two days of thermal baths, mountain air and a guided walk — departure from Munich.",
    },
    description: {
      de: "Ein sanftes Restart-Wochenende: morgens geführte Spaziergänge in der Bergluft, nachmittags Thermalbäder, abends gemeinsames Abendessen.\n\nIm Preis enthalten: Busfahrt ab München, 1 Übernachtung im Doppelzimmer, Thermen-Eintritt und Begleitung. Anreise am Freitagmorgen, Rückkehr am Samstagabend.",
      ru: "Мягкие выходные перезапуска: утром прогулки в горном воздухе с гидом, днём термальные бассейны, вечером совместный ужин.\n\nВ стоимость входит: автобус из Мюнхена, 1 ночь в двухместном номере, вход в термы и сопровождение. Выезд в пятницу утром, возвращение в субботу вечером.",
      en: "A gentle reset weekend: guided morning walks in mountain air, thermal baths in the afternoon, a shared dinner in the evening.\n\nIncluded: bus from Munich, 1 night in a twin room, thermal spa entry and guidance. Departure Friday morning, return Saturday evening.",
    },
    images: [],
    slots: [
      { id: "alp-1211", date: "2026-12-11", maxPeople: 8, priceCents: 24900 },
      { id: "alp-0115", date: "2027-01-15", maxPeople: 8, priceCents: 24900 },
      { id: "alp-0212", date: "2027-02-12", maxPeople: 10, priceCents: 26900 },
    ],
  },
  {
    slug: "bavaria-lakes",
    section: "recreation",
    title: {
      de: "Starnberger See: See, Wald, Stille",
      ru: "Штарнбергер-Зе: озеро, лес, тишина",
      en: "Lake Starnberg: water, forest, silence",
    },
    summary: {
      de: "Tagesprogramm am See mit Atemübungen, Waldspaziergang und Pickupnick.",
      ru: "Дневная программа у озера: дыхательные практики, лесная прогулка и пикник.",
      en: "A day program by the lake: breathing practice, forest walk and a picnic.",
    },
    description: {
      de: "Ein Tag für die Sinne: morgens Atem- und Entspannungsübungen am Ufer, Wanderung entlang des Seeufers, Imbiss mit regionalen Produkten.\n\nIdeal als Ausgleich zum Büroalltag — auch für Einsteiger ohne Vorerfahrung.",
      ru: "День для чувств: утром дыхательные и расслабляющие практики у воды, прогулка вдоль берега, пикник из локальных продуктов.\n\nИдеально как перезагрузка от офисного ритма — подходит новичкам без опыта.",
      en: "A day for the senses: morning breathing and relaxation practice by the shore, a walk along the lake, a picnic with regional produce.\n\nA perfect counterbalance to office life — suitable for complete beginners.",
    },
    images: [],
    slots: [
      { id: "lak-0712", date: "2026-12-07", maxPeople: 10, priceCents: 8900 },
      { id: "lak-0612", date: "2027-06-12", maxPeople: 12, priceCents: 9900 },
    ],
  },
  {
    slug: "munich-run",
    section: "tourism",
    title: {
      de: "Stadtlauf München: Team RevolutTIME",
      ru: "Забег по Мюнхену: команда RevolutTIME",
      en: "Munich city run: Team RevolutTIME",
    },
    summary: {
      de: "Gemeinsam starten: 5 oder 10 km, Startunterlagen, Team-Trikot und Warm-up.",
      ru: "Стартуем вместе: 5 или 10 км, стартовый пакет, командная футболка и разминка.",
      en: "Start together: 5 or 10 km, race pack, team shirt and warm-up.",
    },
    description: {
      de: "Ob erster 5-km-Lauf oder persönliche 10-km-Bestzeit — wir laufen als Team. Inklusive geführtem Warm-up, Startunterlagen und Zuschauer-Support auf der Strecke.",
      ru: "Первые 5 км или личный рекорд на 10 км — бежим командой. Включает разминку с тренером, стартовые пакеты и поддержку болельщиков на трассе.",
      en: "Whether it's your first 5 km or a 10 km personal best — we run as a team. Includes coached warm-up, race packs and on-course support.",
    },
    images: [],
    slots: [
      { id: "run-0517", date: "2027-05-17", maxPeople: 20, priceCents: 8900 },
    ],
  },
  {
    slug: "alps-hike",
    section: "tourism",
    title: {
      de: "Alpenüberquerung light",
      ru: "Лёгкий траверс Альп",
      en: "Alps crossing light",
    },
    summary: {
      de: "Viertägige Hüttenwanderung mit Gepäcktransport — für Einsteiger geeignet.",
      ru: "Четырёхдневный поход от хижины к хижине с трансфером вещей — для новичков.",
      en: "Four-day hut-to-hut trek with luggage transfer — beginner friendly.",
    },
    description: {
      de: "Vier Tage, drei Hütten, ein Gepäcktransport: Sie wandern mit Tagesrucksack, die Sachen reisen voraus. Bergführerin, Halbpension und Veranstaltungs-Gear-Liste inklusive.",
      ru: "Четыре дня, три хижины, трансфер вещей: идёте с дневным рюкзаком, багаж едет впереди. Включено: гид, полупансион и список снаряжения.",
      en: "Four days, three huts, luggage transfer: you hike with a daypack while your bags travel ahead. Includes a guide, half board and a gear list.",
    },
    images: [],
    slots: [
      { id: "hik-0710", date: "2027-07-10", maxPeople: 12, priceCents: 54900 },
      { id: "hik-0814", date: "2027-08-14", maxPeople: 12, priceCents: 54900 },
    ],
  },
  {
    slug: "h2-inhaler",
    section: "equipment",
    title: {
      de: "H₂-Inhalator (900–3600 ml/min)",
      ru: "Водородный ингалятор (900–3600 мл/мин)",
      en: "H₂ inhalation device (900–3600 ml/min)",
    },
    summary: {
      de: "Stationäre H₂-Inhalatoren für Zuhause oder Studio — Modelle von 900 bis 3600 ml/min, geeignet für die kommerzielle Nutzung.",
      ru: "Стационарные H₂-ингаляторы для дома и студии — модели от 900 до 3600 мл/мин, подходят для коммерческого использования.",
      en: "Stationary H₂ inhalation devices for home or studio — models from 900 to 3600 ml/min, suitable for commercial use.",
    },
    description: {
      de: "Inhalationsgeräte sind die Basis jeder H₂-Praxis: tägliche Sessions für Kundschaft, einstellbare Durchflussrate, Dauerbetrieb für Studios.\n\nWir arbeiten mit geprüften Herstellern — Hydrogen Wellness und H2Medical (Geräte von 900 bis 3600 ml/min). Modell, Konfiguration und Preis auf Anfrage.",
      ru: "Ингаляторы — основа любой H₂-практики: ежедневные сессии для клиентов, настраиваемый поток, режим работы под студию.\n\nМы работаем с проверенными производителями — Hydrogen Wellness и H2Medical (аппараты от 900 до 3600 мл/мин). Модель, комплектацию и цену уточняйте по запросу.",
      en: "Inhalation devices are the core of any H₂ practice: daily client sessions, adjustable flow rate, studio-grade duty cycle.\n\nWe work with proven manufacturers — Hydrogen Wellness and H2Medical (devices from 900 to 3600 ml/min). Model, configuration and price on request.",
    },
    images: [],
    slots: [],
    comingSoon: true,
    suppliers: [
      { name: "H2Medical", url: "https://h2medical.org/hydrogen-inhalers.html" },
      { name: "Hydrogen Wellness", url: "https://hydrogenwellness.co/" },
    ],
  },
  {
    slug: "ems-bodytec",
    section: "equipment",
    title: {
      de: "EMS-Training mit miha bodytec",
      ru: "EMS-тренировки с miha bodytec",
      en: "EMS training with miha bodytec",
    },
    summary: {
      de: "EMS-Kostüm-Training mit dem bekannten deutschen Hersteller miha bodytec — der Standard für Studios.",
      ru: "EMS-тренировки в костюме от известного немецкого производителя miha bodytec — стандарт для студий.",
      en: "EMS suit training from the renowned German manufacturer miha bodytec — the studio standard.",
    },
    description: {
      de: "EMS-Training ermöglicht ein ganzkörperliches Krafttraining in 20 Minuten pro Einheit — ideal für Studios mit wenig Fläche und hohem Kundendurchlauf.\n\nmiha bodytec ist einer der bekanntesten EMS-Hersteller Deutschlands. Konfiguration (Kostüm, Steuergerät, Schulung) und Preis auf Anfrage.",
      ru: "EMS-тренировки дают тренировку всего тела за 20 минут — идеально для студий с небольшой площадью и высоким потоком клиентов.\n\nmiha bodytec — один из самых известных EMS-производителей Германии. Конфигурация (костюм, пульт, обучение) и цена по запросу.",
      en: "EMS training delivers a full-body strength session in 20 minutes — ideal for studios with limited space and high client flow.\n\nmiha bodytec is one of Germany's best-known EMS manufacturers. Configuration (suit, control unit, training) and price on request.",
    },
    images: [],
    slots: [],
    comingSoon: true,
    suppliers: [
      { name: "miha bodytec", url: "https://www.miha-bodytec.com/en/home" },
    ],
  },
  {
    slug: "red-light-panels",
    section: "equipment",
    title: {
      de: "Red-Light-Panels & Kapseln",
      ru: "Red Light панели и капсулы",
      en: "Red light panels & capsules",
    },
    summary: {
      de: "Professionelle Red-Light-Systeme: Panels, Kapseln und vollformatige Anlagen für Fitness- und Studios.",
      ru: "Профессиональные системы Red Light: панели, капсулы и полноразмерные решения для фитнес-центров и студий.",
      en: "Professional red light systems: panels, capsules and full-size solutions for fitness centers and studios.",
    },
    description: {
      de: "Red-Light-Therapie ist eines der gefragtesten Wellness-Verfahren: Regeneration, Hautbild und Energie — je nach System einzeln oder in Kombination mit EMS und H₂.\n\nWir arbeiten mit IDEATHERAPY und SunPlus Therapy (Panels, Kapseln, vollformatige Systeme). Konfiguration und Preis auf Anfrage.",
      ru: "Red Light Therapy — одна из самых востребованных wellness-процедур: восстановление, состояние кожи и энергия — в зависимости от системы, отдельно или в связке с EMS и H₂.\n\nРаботаем с IDEATHERAPY и SunPlus Therapy (панели, капсулы, полноразмерные системы). Конфигурацию и цену уточняйте по запросу.",
      en: "Red light therapy is one of the most in-demand wellness procedures: recovery, skin condition and energy — depending on the system, standalone or combined with EMS and H₂.\n\nWe work with IDEATHERAPY and SunPlus Therapy (panels, capsules, full-size systems). Configuration and price on request.",
    },
    images: [],
    slots: [],
    comingSoon: true,
    suppliers: [
      { name: "IDEATHERAPY", url: "https://www.ideatherapy.com/" },
      { name: "SunPlus Therapy", url: "https://sunplustherapy.com/" },
    ],
  },
  {
    slug: "vibration-platform",
    section: "equipment",
    title: {
      de: "Vibrationsplattform (Lymphfluss)",
      ru: "Виброплатформа (лимфодренаж)",
      en: "Vibration platform (lymph flow)",
    },
    summary: {
      de: "Professionelle Vibrationsplattformen für Lymphfluss und Tiefenmuskulatur — Hypervibe oder LifePro.",
      ru: "Профессиональные виброплатформы для лимфотока и глубоких мышц — Hypervibe или LifePro.",
      en: "Professional vibration platforms for lymph flow and deep muscles — Hypervibe or LifePro.",
    },
    description: {
      de: "Vibrationstraining aktiviert Lymphfluss und tiefe Muskelgruppen in wenigen Minuten — die perfekte Ergänzung zu EMS und H₂-Sessions.\n\nFür kommerzielle Nutzung empfehlen wir Hypervibe (robuste Studioqualität); alternativ LifePro Rumblex 4D bzw. LifePro Waver. Modell und Preis auf Anfrage.",
      ru: "Вибротренинг активирует лимфоток и глубокие мышечные группы за считанные минуты — идеальное дополнение к EMS и H₂-сессиям.\n\nДля коммерческого использования рекомендуем Hypervibe (надёжное студийное качество); альтернативы — LifePro Rumblex 4D и LifePro Waver. Модель и цену уточняйте по запросу.",
      en: "Vibration training activates lymph flow and deep muscle groups in minutes — the perfect complement to EMS and H₂ sessions.\n\nFor commercial use we recommend Hypervibe (robust studio quality); alternatives are LifePro Rumblex 4D and LifePro Waver. Model and price on request.",
    },
    images: [],
    slots: [],
    comingSoon: true,
    suppliers: [
      { name: "Hypervibe", url: "https://hypervibe.com/" },
      { name: "LifePro", url: "https://lifeprofitness.com/" },
    ],
  },
];

export function getOffer(slug: string): CatalogOffer | undefined {
  return CATALOG_OFFERS.find((offer) => offer.slug === slug);
}

export function getOfferSlot(
  slug: string,
  slotId: string
): BookingSlot | undefined {
  return getOffer(slug)?.slots.find((slot) => slot.id === slotId);
}

export function offersBySection(section: SectionKey): CatalogOffer[] {
  return CATALOG_OFFERS.filter((offer) => offer.section === section);
}

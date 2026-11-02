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
    slug: "h2-bottle",
    section: "equipment",
    title: {
      de: "H₂-Wasserstoffflasche",
      ru: "Водородная бутылка H₂",
      en: "H₂ hydrogen bottle",
    },
    summary: {
      de: "Trinkflasche mit SPE/PEM-Technologie — bis 1,6 ppm H₂ unterwegs. Akku und USB-C-Laden.",
      ru: "Бутылка с технологией SPE/PEM — до 1,6 ppm H₂ в дороге. Аккумулятор, зарядка USB-C.",
      en: "Bottle with SPE/PEM technology — up to 1.6 ppm H₂ on the go. Rechargeable via USB-C.",
    },
    description: {
      de: "Die H₂-Flasche macht überall Wasserstoffwasser: Eine Füllung dauert wenige Minuten.\n\nTechnische Daten und Preis auf Anfrage — schreiben Sie uns, wir beraten individuell.",
      ru: "Водородная бутылка делает H₂-воду где угодно: один цикл насыщения — несколько минут.\n\nХарактеристики и цену уточняйте по запросу — напишите нам, проконсультируем индивидуально.",
      en: "The H₂ bottle makes hydrogen water anywhere: one saturation cycle takes just a few minutes.\n\nSpecifications and price on request — write to us for personal advice.",
    },
    images: [],
    slots: [],
    comingSoon: true,
  },
  {
    slug: "h2-generator",
    section: "equipment",
    title: {
      de: "H₂-Inhalationsgerät",
      ru: "Ингалятор с молекулярным водородом",
      en: "H₂ inhalation device",
    },
    summary: {
      de: "Stationäres Gerät für H₂-Inhalationen zuhause oder im Studio.",
      ru: "Стационарный прибор для водородных ингаляций дома или в студии.",
      en: "Stationary device for hydrogen inhalation sessions at home or in the studio.",
    },
    description: {
      de: "Für tägliche H₂-Inhalationssessions — die Technik aus dem RevolutTIME Studio für zuhause.\n\nModell, Leistung und Preis auf Anfrage — wir beraten Sie persönlich per WhatsApp oder Telefon.",
      ru: "Для ежедневных водородных ингаляций — технология из студии RevolutTIME у вас дома.\n\nМодель, характеристики и цену уточняйте — проконсультируем лично по WhatsApp или телефону.",
      en: "For daily hydrogen inhalation sessions — the technology from the RevolutTIME studio at your home.\n\nModel, specifications and price on request — personal advice via WhatsApp or phone.",
    },
    images: [],
    slots: [],
    comingSoon: true,
  },
  {
    slug: "h2-water-bar",
    section: "equipment",
    title: {
      de: "H₂-Wasserbar für Büros",
      ru: "H₂-водяная станция для офисов",
      en: "H₂ water station for offices",
    },
    summary: {
      de: "Wasserstoffwasser für Teams: Station für Büro, Studio oder Café.",
      ru: "Водородная вода для команд: станция для офиса, студии или кафе.",
      en: "Hydrogen water for teams: a station for offices, studios or cafés.",
    },
    description: {
      de: "Eine stationäre Station liefert frisches Wasserstoffwasser für das ganze Team — inklusive Einweisung und Wartungsplan.\n\nKonfiguration und Preis auf Anfrage.",
      ru: "Стационарная станция даёт свежую водородную воду всей команде — с обучением и планом обслуживания.\n\nКонфигурацию и цену уточняйте по запросу.",
      en: "A stationary station delivers fresh hydrogen water for the whole team — including training and a maintenance plan.\n\nConfiguration and price on request.",
    },
    images: [],
    slots: [],
    comingSoon: true,
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

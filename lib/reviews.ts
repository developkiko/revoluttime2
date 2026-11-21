/**
 * Homepage reviews — ported from the Ultra template's review wall (names,
 * roles and avatar art kept), texts rewritten for RevolutTIME products.
 * TODO(reviews API): source from a Supabase table once moderation exists.
 */

import type { Locale } from "@/lib/products";

type Tri = Record<Locale, string>;

export interface Review {
  name: string;
  role: Tri;
  text: Tri;
  stars: number;
  avatar: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Анна-Мария В.",
    role: { ru: "Постоянный покупатель", de: "Stammkundin", en: "Regular customer" },
    avatar: "/imgs/avas/ava1.jpg",
    stars: 4,
    text: {
      ru: "Заказываю Redox+ уже второй месяц подряд. Пью по утрам вместо сладкого кофе — привыкла быстро. Посылка из Баварии пришла за два дня, упаковка аккуратная.",
      de: "Bestelle Redox+ jetzt im zweiten Monat in Folge. Trinke es morgens statt gesüßtem Kaffee — man gewöhnt sich schnell daran. Das Paket aus Bayern kam in zwei Tagen, sauber verpackt.",
      en: "I've been ordering Redox+ for the second month in a row now. I drink it in the morning instead of sweetened coffee — you get used to it fast. The parcel from Bavaria arrived in two days, neatly packed.",
    },
  },
  {
    name: "Руслан П.",
    role: { ru: "Тренер по фитнесу", de: "Fitness-Trainer", en: "Fitness coach" },
    avatar: "/imgs/avas/ava2.jpg",
    stars: 5,
    text: {
      ru: "Советую таблетки клиентам: магний плюс водород — понятная история для восстановления после нагрузок. Сам пью после тренировок: вкус нейтральный, растворяется за минуту.",
      de: "Empfehle die Tabletten meinen Kunden: Magnesium plus Wasserstoff ist eine nachvollziehbare Sache für die Regeneration. Ich trinke sie selbst nach dem Training: neutral im Geschmack, löst sich in einer Minute auf.",
      en: "I recommend the tablets to my clients: magnesium plus hydrogen is an easy story for post-workout recovery. I drink them myself after training: neutral taste, dissolves within a minute.",
    },
  },
  {
    name: "Сергей Т.",
    role: { ru: "DevOps-инженер", de: "DevOps-Ingenieur", en: "DevOps engineer" },
    avatar: "/imgs/avas/ava3.jpg",
    stars: 5,
    text: {
      ru: "Работаю за компьютером по десять часов в день — бросаю таблетку в бутылку воды утром, и день идёт заметно легче. Заказ через сайт занял три минуты.",
      de: "Ich sitze zehn Stunden am Tag am Rechner — morgens eine Tablette in die Wasserflasche, und der Tag läuft spürbar leichter. Die Bestellung über die Website hat drei Minuten gedauert.",
      en: "I spend ten hours a day at the computer — one tablet into a water bottle in the morning and the day goes noticeably easier. Ordering through the site took three minutes.",
    },
  },
  {
    name: "Ольга Л.",
    role: { ru: "SMM-менеджер", de: "SMM-Managerin", en: "SMM manager" },
    avatar: "/imgs/avas/ava4.jpg",
    stars: 5,
    text: {
      ru: "Взяла стартовый набор, чтобы просто попробовать. Через две недели оформила партнёрку — первые два реферала уже окупили мой стартовый заказ.",
      de: "Ich habe ein Starterpaket genommen, einfach um es auszuprobieren. Nach zwei Wochen habe ich mich als Partnerin angemeldet — die ersten zwei Empfehlungen haben meine Starterbestellung schon wieder eingespielt.",
      en: "I took a starter pack just to try it. Two weeks later I joined the partner program — my first two referrals have already paid off the starter order.",
    },
  },
  {
    name: "Артём З.",
    role: { ru: "Data Scientist", de: "Data Scientist", en: "Data Scientist" },
    avatar: "/imgs/avas/ava5.jpg",
    stars: 5,
    text: {
      ru: "Ценю конкретику: состав на упаковке, протокол Eurofins прямо на сайте, НДС не выделяется — всё прозрачно. Вода с H₂ стала моей утренней привычкой.",
      de: "Ich schätze Konkretes: Zusammensetzung auf der Packung, Eurofins-Protokoll direkt auf der Website, keine USt. ausgewiesen — alles transparent. H₂-Wasser ist zu meiner Morgenroutine geworden.",
      en: "I value concreteness: composition on the label, the Eurofins protocol right on the site, no VAT charged — everything is transparent. H₂ water has become my morning habit.",
    },
  },
  {
    name: "Мартин К.",
    role: { ru: "Growth-хакер", de: "Growth Hacker", en: "Growth hacker" },
    avatar: "/imgs/avas/ava8.jpg",
    stars: 5,
    text: {
      ru: "Сравнивал несколько брендов водородных таблеток. У RevolutTIME лучший баланс цены и качества: десять пачек по 60 € плюс одна в подарок — выгоднее всех, кого я нашёл.",
      de: "Ich habe mehrere Marken von Wasserstofftabletten verglichen. RevolutTIME hat das beste Preis-Leistungs-Verhältnis: zehn Packungen für je 60 € plus eine gratis — günstiger als alles, was ich gefunden habe.",
      en: "I compared several hydrogen tablet brands. RevolutTIME has the best price-to-quality balance: ten packs at 60 € each plus one free — better value than anything else I found.",
    },
  },
];

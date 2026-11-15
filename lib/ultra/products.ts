// ══════════════════════════════════════════════════════════════
// ULTRA PROXY — данные продуктов и отзывов
// ══════════════════════════════════════════════════════════════

export interface Product {
  type: "fast" | "wifi" | "mobile" | "shared";
  name: { ru: string; en: string };
  traffic: { ru: string; en: string };
  price: number;
  oldPrice: number;
  discount: number;
  features: string[]; // i18n keys
  popular: boolean;
}

export interface Review {
  name: { ru: string; en: string };
  role: { ru: string; en: string };
  text: { ru: string; en: string };
  stars: number;
  avatar?: string;
}

export const products: Product[] = [
  {
    type: "fast",
    name: { ru: "Fast 35", en: "Fast 35" },
    traffic: { ru: "35 ГБ трафика", en: "35 GB traffic" },
    price: 35,
    oldPrice: 44,
    discount: 20,
    features: [
      "plan_feat_locations",
      "plan_feat_rotate",
      "plan_feat_uptime",
    ],
    popular: true,
  },
  {
    type: "wifi",
    name: { ru: "Residential 15", en: "Residential 15" },
    traffic: { ru: "15 ГБ трафика", en: "15 GB traffic" },
    price: 31,
    oldPrice: 39,
    discount: 20,
    features: [
      "plan_feat_locations",
      "plan_feat_rotate",
      "plan_feat_support",
    ],
    popular: false,
  },
  {
    type: "mobile",
    name: { ru: "Mobile 10", en: "Mobile 10" },
    traffic: { ru: "10 ГБ трафика", en: "10 GB traffic" },
    price: 39,
    oldPrice: 49,
    discount: 20,
    features: [
      "plan_feat_locations",
      "plan_feat_rotate",
      "plan_feat_whitelist",
    ],
    popular: false,
  },
  {
    type: "shared",
    name: { ru: "Datacenter 95", en: "Datacenter 95" },
    traffic: { ru: "95 ГБ трафика", en: "95 GB traffic" },
    price: 55,
    oldPrice: 69,
    discount: 20,
    features: [
      "plan_feat_locations",
      "plan_feat_uptime",
      "plan_feat_support",
    ],
    popular: false,
  },
];

export const DEFAULT_REVIEWS: Review[] = [
  {
    name: { ru: "Анна-Мария В.", en: "Anne-Marie V." },
    role: { ru: "E-commerce аналитик", en: "E-commerce Analyst" },
    avatar: "/ultra/avas/ava1.jpg",
    text: {
      ru: "Мониторю цены на Amazon и Wildberries ежедневно. Прокси работают без перебоев уже 4 месяца. Только один раз лагало — поддержка решила за 10 минут.",
      en: "I monitor Amazon and Wildberries prices daily. Proxies have been running smoothly for 4 months. Only one hiccup — support fixed it in 10 minutes.",
    },
    stars: 4,
  },
  {
    name: { ru: "Руслан П.", en: "Ruslan P." },
    role: { ru: "Арбитражник", en: "Affiliate Marketer" },
    avatar: "/ultra/avas/ava2.jpg",
    text: {
      ru: "Лью трафик на FB через резидентов Ultra Proxy. За 3 месяца ни одного бана аккаунта. Гео США, Германия — стабильно. Цена/качество — топ.",
      en: "Running FB ads through Ultra Proxy residentials for 3 months. Zero account bans. US and Germany geo — solid. Best bang for the buck.",
    },
    stars: 5,
  },
  {
    name: { ru: "Сергей Т.", en: "Serge T." },
    role: { ru: "DevOps инженер", en: "DevOps Engineer" },
    avatar: "/ultra/avas/ava3.jpg",
    text: {
      ru: "Беру серверные прокси пачками для парсинга SERP. 95 ГБ хватает на месяц плотной работы. API не хватает, но для веба — отлично.",
      en: "Grabbing datacenter proxies in bulk for SERP scraping. 95 GB lasts a month of heavy use. Missing an API, but for web it's great.",
    },
    stars: 5,
  },
  {
    name: { ru: "Ольга Л.", en: "Olga L." },
    role: { ru: "SMM-менеджер", en: "SMM Manager" },
    avatar: "/ultra/avas/ava4.jpg",
    text: {
      ru: "Запускаю мобильные прокси для TikTok и Insta. Гео Европы подтягиваются быстро, IP чистые. Ценник чуть выше рынка, но стабильность того стоит.",
      en: "Running mobile proxies for TikTok and Insta. European geo connects fast, IPs are clean. Prices a bit above market but the reliability pays off.",
    },
    stars: 5,
  },
  {
    name: { ru: "Артём З.", en: "Artem Z." },
    role: { ru: "Data Scientist", en: "Data Scientist" },
    avatar: "/ultra/avas/ava5.jpg",
    text: {
      ru: "Собираю данные для ML-моделей через резидентов + ротацию каждые 10 мин. Никаких капч и блокировок. То, что надо для big data сбора.",
      en: "Collecting data for ML models via residentials with 10-min rotation. No captchas, no blocks. Exactly what you need for big data collection.",
    },
    stars: 5,
  },
  {
    name: { ru: "Мартин К.", en: "Martin K." },
    role: { ru: "Growth Hacker", en: "Growth Hacker" },
    avatar: "/ultra/avas/ava8.jpg",
    text: {
      ru: "Пользуюсь несколькими провайдерами. У Ultra — лучшая скорость ротации среди всех. Для A/B тестов лендингов в 30 странах — огонь.",
      en: "Using multiple providers. Ultra has the fastest rotation among all. For A/B testing landing pages across 30 countries — it's fire.",
    },
    stars: 5,
  },
  {
    name: { ru: "Игорь Б.", en: "Igor B." },
    role: { ru: "Фрилансер", en: "Freelancer" },
    avatar: "/ultra/avas/ava7.jpg",
    text: {
      ru: "Беру small-пакеты под задачи. Всё устраивает, кроме одного: разок пришлось ждать замену IP около часа. В остальном — молодцы.",
      en: "Grabbing small packages per task. Everything's fine, except once had to wait ~1 hour for an IP swap. Otherwise — solid.",
    },
    stars: 4,
  },
  {
    name: { ru: "Елена Г.", en: "Elena G." },
    role: { ru: "Контент-менеджер", en: "Content Manager" },
    avatar: "/ultra/avas/ava6.jpg",
    text: {
      ru: "Работаю с зарубежными соцсетями через мобильные прокси. Быстрое подключение, чистые IP. Ни одной блокировки за полгода. Рекомендую команде.",
      en: "Working with foreign social media via mobile proxies. Fast connection, clean IPs. Zero blocks in 6 months. Recommended to the team.",
    },
    stars: 5,
  },
];

/** Same SVG set as allLocations / CreateProxy (`/ultra/flags/{code}.svg`). No emoji. */
export const topLocations = [
  { code: "us", label: { ru: "США", en: "USA" } },
  { code: "gb", label: { ru: "Великобритания", en: "UK" } },
  { code: "de", label: { ru: "Германия", en: "Germany" } },
  { code: "fr", label: { ru: "Франция", en: "France" } },
  { code: "jp", label: { ru: "Япония", en: "Japan" } },
  { code: "br", label: { ru: "Бразилия", en: "Brazil" } },
  { code: "in", label: { ru: "Индия", en: "India" } },
  { code: "cn", label: { ru: "Китай", en: "China" } },
];

export const allLocations = [
  { code: "us", label: { ru: "США", en: "USA" } },
  { code: "gb", label: { ru: "Великобритания", en: "UK" } },
  { code: "de", label: { ru: "Германия", en: "Germany" } },
  { code: "fr", label: { ru: "Франция", en: "France" } },
  { code: "jp", label: { ru: "Япония", en: "Japan" } },
  { code: "br", label: { ru: "Бразилия", en: "Brazil" } },
  { code: "in", label: { ru: "Индия", en: "India" } },
  { code: "cn", label: { ru: "Китай", en: "China" } },
  { code: "ca", label: { ru: "Канада", en: "Canada" } },
  { code: "au", label: { ru: "Австралия", en: "Australia" } },
  { code: "it", label: { ru: "Италия", en: "Italy" } },
  { code: "es", label: { ru: "Испания", en: "Spain" } },
  { code: "nl", label: { ru: "Нидерланды", en: "Netherlands" } },
  { code: "se", label: { ru: "Швеция", en: "Sweden" } },
  { code: "pl", label: { ru: "Польша", en: "Poland" } },
  { code: "tr", label: { ru: "Турция", en: "Turkey" } },
  { code: "kr", label: { ru: "Южная Корея", en: "South Korea" } },
  { code: "mx", label: { ru: "Мексика", en: "Mexico" } },
  { code: "ar", label: { ru: "Аргентина", en: "Argentina" } },
  { code: "za", label: { ru: "ЮАР", en: "South Africa" } },
  { code: "ae", label: { ru: "ОАЭ", en: "UAE" } },
  { code: "sg", label: { ru: "Сингапур", en: "Singapore" } },
  { code: "ru", label: { ru: "Россия", en: "Russia" } },
  { code: "ua", label: { ru: "Украина", en: "Ukraine" } },
  { code: "kz", label: { ru: "Казахстан", en: "Kazakhstan" } },
  { code: "cz", label: { ru: "Чехия", en: "Czechia" } },
  { code: "ro", label: { ru: "Румыния", en: "Romania" } },
  { code: "id", label: { ru: "Индонезия", en: "Indonesia" } },
  { code: "vn", label: { ru: "Вьетнам", en: "Vietnam" } },
  { code: "th", label: { ru: "Таиланд", en: "Thailand" } },
  { code: "ph", label: { ru: "Филиппины", en: "Philippines" } },
  { code: "ng", label: { ru: "Нигерия", en: "Nigeria" } },
  { code: "eg", label: { ru: "Египет", en: "Egypt" } },
];

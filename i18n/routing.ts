import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "ru", "en"],
  defaultLocale: "de",
});

export type Locale = (typeof routing.locales)[number];

import { webkit, devices } from "playwright";

// Проверка мобильного hero в НАСТОЯЩЕМ WebKit (движок Safari/iPhone),
// дескриптор iPhone 13: 390×844, DPR 3, тач. Это не полная iOS-эмуляция
// (нет safe-area/тач-скролла iOS), но ловит CSS-обрезку, bg-fixed артефакты
// и отсутствие гидрации — то, что Chrome-resized не показывает.
// Запуск: `npx next start` локально, затем `node scripts/check-webkit.mjs`.
const iphone = devices["iPhone 13"];
const browser = await webkit.launch();
const results = {};

for (const scheme of ["dark", "light"]) {
  const context = await browser.newContext({
    ...iphone,
    colorScheme: scheme,
    locale: "ru-RU",
  });
  const page = await context.newPage();
  const errs = [];
  page.on("pageerror", (err) => errs.push("PAGEERROR: " + err.message.slice(0, 150)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errs.push("CONSOLE: " + msg.text().slice(0, 150));
  });

  await page.goto("http://localhost:3000/ru", { waitUntil: "load" });
  // dynamic import + гидрация hero — до 25с
  await page.waitForSelector('[class*="touch-pan-y"]', { timeout: 25000 });
  await page.waitForTimeout(800);

  const check = await page.evaluate(() => {
    const area = document.querySelector('[class*="touch-pan-y"]');
    const h1 = document.querySelector("h1");
    const headerBottom =
      document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const aRect = area?.getBoundingClientRect();
    const slideImg = area?.querySelector("img");
    // FAB контактов не должен перекрывать чипы hero
    const fab = document.querySelector('[class*="fixed"][class*="bottom-"][class*="z-"]');
    const chips = Array.from(document.querySelectorAll("ul li")).find((li) =>
      li.textContent.includes("ppm"),
    );
    return {
      title: document.title.slice(0, 40),
      sliderMounted: !!area,
      innerScrollClipped:
        aRect && slideImg
          ? slideImg.getBoundingClientRect().bottom > aRect.bottom + 4
          : null,
      h1UnderHeader: h1 ? h1.getBoundingClientRect().top < headerBottom - 2 : null,
      docOverflowX: document.documentElement.scrollWidth > window.innerWidth,
      fabOverlapsChips: (() => {
        if (!fab || !chips) return false;
        const f = fab.getBoundingClientRect();
        const c = chips.getBoundingClientRect();
        return f.top < c.bottom && f.bottom > c.top;
      })(),
    };
  });
  results[scheme] = { ...check, errors: errs };
  await page.screenshot({ path: `../webkit-${scheme}.png` });
  await context.close();
}

await browser.close();
const ok =
  results.dark.sliderMounted &&
  !results.dark.innerScrollClipped &&
  !results.dark.h1UnderHeader &&
  !results.dark.docOverflowX &&
  !results.dark.fabOverlapsChips &&
  results.dark.errors.length === 0 &&
  results.light.sliderMounted &&
  !results.light.h1UnderHeader &&
  results.light.errors.length === 0;
console.log(JSON.stringify(results, null, 2));
console.log(ok ? "OK: WebKit iPhone layout clean" : "FAIL: see fields above");
process.exit(ok ? 0 : 1);

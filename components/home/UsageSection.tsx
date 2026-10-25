import { getTranslations } from "next-intl/server";

const STEPS = [
  { key: "step1", emoji: "💧" },
  { key: "step2", emoji: "⏱️" },
  { key: "step3", emoji: "🥤" },
] as const;

export async function UsageSection() {
  const t = await getTranslations("usage");

  return (
    <section id="usage" className="border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("title")}
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{t("subtitle")}</p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map(({ key, emoji }, index) => (
            <li key={key} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-lg">
                  {emoji}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}/3
                </span>
              </div>
              <h3 className="mt-3 font-semibold">{t(`${key}.title`)}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t(`${key}.text`)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

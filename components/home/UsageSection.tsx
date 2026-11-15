import { getTranslations } from "next-intl/server";
import { CupSodaIcon, DropletsIcon, TimerIcon } from "lucide-react";

const STEPS = [
  { key: "step1", icon: DropletsIcon },
  { key: "step2", icon: TimerIcon },
  { key: "step3", icon: CupSodaIcon },
] as const;

export async function UsageSection() {
  const t = await getTranslations("usage");

  return (
    <section id="usage" className="scroll-mt-16 border-t bg-muted/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-[1.5rem] font-bold tracking-tight text-foreground sm:text-[2rem] text-center mb-3">
          {t("title")}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground sm:text-base max-w-[600px] mx-auto">{t("subtitle")}</p>

        <ol className="mt-8 grid gap-4 text-left md:grid-cols-3">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li key={key} className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
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

import { getTranslations } from "next-intl/server";
import { InfoIcon } from "lucide-react";

interface Section {
  h: string;
  p: string;
}

/**
 * Renders one legal document from the messages `legal.<slug>` namespace.
 * German is the legally binding version; RU/EN show the prevailing-language note.
 */
export async function LegalArticle({ slug }: { slug: string }) {
  const t = await getTranslations("legal");
  const prevailing = slug !== "impressum" ? t("prevailing") : "";
  const sections = t.raw(`${slug}.sections`) as Section[];

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t(`${slug}.title`)}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("updated")}</p>

      {prevailing && (
        <p className="mt-6 flex items-start gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm text-foreground">
          <InfoIcon className="mt-0.5 size-4 shrink-0 text-sky-500" />
          {prevailing}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-8">
        {sections.map((section, index) => (
          <section key={index}>
            <h2 className="font-semibold leading-snug">{section.h}</h2>
            {section.p.split("\n\n").map((paragraph, pIndex) => (
              <p
                key={pIndex}
                className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

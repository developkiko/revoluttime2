import { NextResponse } from "next/server";
import { z } from "zod";
import { getTranslations } from "next-intl/server";

import { recommendProgram } from "@/lib/journey";
import { buildJourneyPdf } from "@/lib/journey-pdf";
import { addInboxMessage } from "@/lib/contact-inbox";
import { notifyAdminChat } from "@/lib/telegram";

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(80).optional(),
  goal: z.enum(["energy", "recovery", "balance", "sport"]),
  experience: z.enum(["newcomer", "experienced"]),
  format: z.enum(["tablets", "studio", "recreation"]),
  locale: z.enum(["de", "en", "ru"]),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }

  const { email, name, goal, experience, format, locale, consent } = parsed.data;

  // Core PDF fonts are Latin-1 only — Cyrillic falls back to the English copy.
  const pdfLocale = locale === "ru" ? "en" : locale;
  const t = await getTranslations({ locale: pdfLocale, namespace: "journey" });

  const programId = recommendProgram({ goal, experience, format });
  const programBase = `results.programs.${programId}`;
  const today = new Intl.DateTimeFormat(pdfLocale === "de" ? "de-DE" : "en-GB", {
    dateStyle: "medium",
  }).format(new Date());

  const bullets = (t.raw(`${programBase}.bullets`) as string[]).slice(0, 4);
  const pdf = buildJourneyPdf({
    header: t("pdf.header"),
    programTitle: t(`${programBase}.title`),
    paragraphs: [t("results.intro"), t(`${programBase}.description`)],
    bullets,
    footnote: t("results.footnote"),
    contactLine: t("results.contactLine", { name: name || "—", email, date: today }),
  });

  // Lead capture (demo inbox for /admin + Telegram alert to the owner).
  addInboxMessage({
    name: name || "Journey Lead",
    email,
    message: `Discovery Journey → ${programId} (${goal}/${experience}/${format}, ${locale})`,
  });
  await notifyAdminChat(
    [
      "🚀 <b>Новый лид с Discovery Journey</b>",
      "",
      name ? `Имя: ${name}` : null,
      `E-mail: ${email}`,
      `Программа: <b>${programId}</b>`,
      `Ответы: ${goal} / ${experience} / ${format}`,
      `Локаль: ${locale}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  void consent; // schema-enforced (must be true) — no extra processing

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="revoluttime-journey.pdf"',
      "Cache-Control": "no-store",
    },
  });
}

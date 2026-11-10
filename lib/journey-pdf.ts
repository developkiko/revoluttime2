/**
 * Minimal single-page PDF writer for the Discovery Journey lead magnet.
 * No dependencies: builds the PDF object structure by hand with the core
 * Helvetica fonts (WinAnsi). Core fonts cannot encode Cyrillic — the caller
 * falls back to the English copy for ru (see /api/journey/lead).
 */

const PAGE_WIDTH = 595; // A4 pt
const PAGE_HEIGHT = 842;
const MARGIN_X = 56;
const BODY_SIZE = 10.5;
const LEADING = 15;
const MAX_LINE_CHARS = 88; // conservative wrap width for 10.5pt Helvetica

function escapePdfText(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 63;
    if (code === 0x28 || code === 0x29 || code === 0x5c) {
      out += "\\" + char;
    } else if (code > 0xff) {
      out += "?"; // core fonts are WinAnsi — strip anything outside Latin-1
    } else if (code > 0x7e || (code >= 0x20 && code <= 0x7e) || code >= 0xa0) {
      out += char;
    } else {
      out += " ";
    }
  }
  return out;
}

function wrap(text: string, maxChars = MAX_LINE_CHARS): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface JourneyPdfInput {
  /** Brand line, e.g. "RevolutTIME — Discovery Journey". */
  header: string;
  /** Program title (large). */
  programTitle: string;
  /** Body paragraphs in order. */
  paragraphs: string[];
  /** Bullet items (rendered with "– "). */
  bullets: string[];
  /** Footer note (disclaimer). */
  footnote: string;
  /** Lead contact line, e.g. "Prepared for: name (email) — 11.11.2026". */
  contactLine: string;
}

export function buildJourneyPdf(input: JourneyPdfInput): Buffer {
  const content: string[] = [];
  let y = PAGE_HEIGHT - MARGIN_X - 12;

  const text = (str: string, size: number, font: "F1" | "F2") => {
    content.push(
      `BT /${font} ${size} Tf 1 0 0 1 ${MARGIN_X} ${y.toFixed(1)} Tm (${escapePdfText(str)}) Tj ET`,
    );
    y -= size + 6;
  };

  const paragraph = (str: string, font: "F1" | "F2" = "F1", size = BODY_SIZE) => {
    for (const line of wrap(str)) {
      content.push(
        `BT /${font} ${size} Tf 1 0 0 1 ${MARGIN_X} ${y.toFixed(1)} Tm (${escapePdfText(line)}) Tj ET`,
      );
      y -= LEADING;
      if (y < MARGIN_X + 60) break; // skeleton: single page
    }
    y -= 6;
  };

  // Header + rule
  text(input.header, 9, "F1");
  content.push(
    `0.03 0.43 0.66 RG 1.2 w ${MARGIN_X} ${y.toFixed(1)} m ${(PAGE_WIDTH - MARGIN_X).toFixed(1)} ${y.toFixed(1)} l S`,
  );
  y -= 22;

  // Program title (wrapped, bold)
  for (const line of wrap(input.programTitle, 42)) {
    text(line, 16, "F2");
    y -= 2;
  }
  y -= 8;

  for (const paragraphText of input.paragraphs) paragraph(paragraphText);

  y -= 4;
  for (const bullet of input.bullets) paragraph("–  " + bullet);

  // Footer
  y = MARGIN_X + 46;
  for (const line of wrap(input.contactLine)) {
    text(line, 8.5, "F1");
  }
  y -= 4;
  for (const line of wrap(input.footnote, 100)) {
    text(line, 7.5, "F1");
  }

  const stream = content.join("\n");

  // ── Assemble the PDF object structure ──
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const LEVELS = [
  { key: "levelI", letter: "I", chip: "bg-sky-500 text-white", tint: "group-hover:bg-sky-500/5", text: "group-hover:text-sky-600 dark:group-hover:text-sky-400", border: "hover:border-sky-500/50" },
  { key: "levelII", letter: "II", chip: "bg-violet-500 text-white", tint: "group-hover:bg-violet-500/5", text: "group-hover:text-violet-600 dark:group-hover:text-violet-400", border: "hover:border-violet-500/50" },
  { key: "levelIII", letter: "III", chip: "bg-amber-500 text-white", tint: "group-hover:bg-amber-500/5", text: "group-hover:text-amber-600 dark:group-hover:text-amber-400", border: "hover:border-amber-500/50" },
  { key: "levelIV", letter: "IV", chip: "bg-emerald-500 text-white", tint: "group-hover:bg-emerald-500/5", text: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", border: "hover:border-emerald-500/50" },
  { key: "levelV", letter: "V", chip: "bg-rose-500 text-white", tint: "group-hover:bg-rose-500/5", text: "group-hover:text-rose-600 dark:group-hover:text-rose-400", border: "hover:border-rose-500/50" },
] as const;

/**
 * The I–V referral cascade (matrix 5 wide): strictly rectangular rows,
 * right edges aligned, level V narrowest — the ladder steps toward level I.
 * Hover: the row GROWS 20px longer extending to the LEFT while its right
 * edge stays pinned (items-end pins the right edge; margin-auto would
 * collapse and let the row grow to the right instead).
 */
export function LevelsCascade() {
  const t = useTranslations("partner.levels");

  return (
    <ol className="flex flex-col items-end gap-2">
      {LEVELS.map(({ key, letter, chip, tint, text, border }, index) => (
        <motion.li
          key={key}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
          className={`group flex w-[calc(100%-var(--lvl-inset))] items-center gap-3 border bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition-[width] duration-300 hover:w-[calc(100%-var(--lvl-inset)+1.25rem)] ${tint} ${border}`}
          style={{ ["--lvl-inset" as string]: `${index * 20}px` }}
        >
          <motion.span
            className={`flex size-7 shrink-0 items-center justify-center rounded-full font-bold ${chip}`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {letter}
          </motion.span>
          <span className={`transition-colors duration-300 ${text}`}>
            {t(key)}
          </span>
        </motion.li>
      ))}
    </ol>
  );
}

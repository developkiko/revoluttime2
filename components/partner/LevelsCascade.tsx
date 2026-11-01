"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const LEVELS = [
  { key: "levelA", letter: "A", chip: "bg-sky-500 text-white", tint: "group-hover:bg-sky-500/5", text: "group-hover:text-sky-600 dark:group-hover:text-sky-400", border: "hover:border-sky-500/50" },
  { key: "levelB", letter: "B", chip: "bg-violet-500 text-white", tint: "group-hover:bg-violet-500/5", text: "group-hover:text-violet-600 dark:group-hover:text-violet-400", border: "hover:border-violet-500/50" },
  { key: "levelC", letter: "C", chip: "bg-amber-500 text-white", tint: "group-hover:bg-amber-500/5", text: "group-hover:text-amber-600 dark:group-hover:text-amber-400", border: "hover:border-amber-500/50" },
  { key: "levelD", letter: "D", chip: "bg-emerald-500 text-white", tint: "group-hover:bg-emerald-500/5", text: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400", border: "hover:border-emerald-500/50" },
  { key: "levelE", letter: "E", chip: "bg-rose-500 text-white", tint: "group-hover:bg-rose-500/5", text: "group-hover:text-rose-600 dark:group-hover:text-rose-400", border: "hover:border-rose-500/50" },
  { key: "levelF", letter: "F", chip: "bg-cyan-500 text-white", tint: "group-hover:bg-cyan-500/5", text: "group-hover:text-cyan-600 dark:group-hover:text-cyan-400", border: "hover:border-cyan-500/50" },
] as const;

/**
 * The A–F referral cascade: staggered slide-in from the left, and a hover
 * effect distinct from the partner steps — the row slides right while its
 * letter chip fills solid color and a subtle background tint sweeps in.
 */
export function LevelsCascade() {
  const t = useTranslations("partner.levels");

  return (
    <ol className="flex flex-col gap-2">
      {LEVELS.map(({ key, letter, chip, tint, text, border }, index) => (
        <motion.li
          key={key}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
          className={`group flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition-all duration-300 ${tint} ${border}`}
          style={{ marginInlineStart: `${index * 20}px` }}
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

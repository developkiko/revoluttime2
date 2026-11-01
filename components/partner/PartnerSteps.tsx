"use client";

import { motion } from "framer-motion";
import {
  LinkIcon,
  Share2Icon,
  UserPlusIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Per-step accent hues so the four partner steps read as a colorful journey
 * rather than four identical grey cards.
 */
const STEPS: Array<{
  key: string;
  icon: LucideIcon;
  chip: string;
  ring: string;
  bar: string;
}> = [
  {
    key: "step1",
    icon: UserPlusIcon,
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    ring: "group-hover:ring-2 group-hover:ring-sky-500/40",
    bar: "from-sky-400 to-sky-600",
  },
  {
    key: "step2",
    icon: LinkIcon,
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    ring: "group-hover:ring-2 group-hover:ring-violet-500/40",
    bar: "from-violet-400 to-violet-600",
  },
  {
    key: "step3",
    icon: Share2Icon,
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ring: "group-hover:ring-2 group-hover:ring-amber-500/40",
    bar: "from-amber-400 to-amber-600",
  },
  {
    key: "step4",
    icon: WalletIcon,
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    ring: "group-hover:ring-2 group-hover:ring-emerald-500/40",
    bar: "from-emerald-400 to-emerald-600",
  },
];

export function PartnerSteps() {
  const t = useTranslations("partner.how.steps");

  return (
    <ol className="grid gap-4 sm:grid-cols-2">
      {STEPS.map(({ key, icon: Icon, chip, ring, bar }, index) => (
        <motion.li
          key={key}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45, delay: index * 0.12, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className={`group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-shadow hover:shadow-lg ${ring} hover:ring-2`}
        >
          {/* accent bar on top edge */}
          <span
            aria-hidden
            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${bar} opacity-60 transition-opacity group-hover:opacity-100`}
          />
          <div className="flex items-center gap-2.5">
            <motion.span
              className={`flex size-10 items-center justify-center rounded-full ${chip}`}
              whileHover={{ rotate: -8, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Icon className="size-5" />
            </motion.span>
            <span
              className={`text-sm font-bold tabular-nums ${
                index === 0
                  ? "text-sky-600 dark:text-sky-400"
                  : index === 1
                    ? "text-violet-600 dark:text-violet-400"
                    : index === 2
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {index + 1}/4
            </span>
          </div>
          <h3 className="mt-3 font-semibold">{t(`${key}.title`)}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t(`${key}.text`)}
          </p>
        </motion.li>
      ))}
    </ol>
  );
}

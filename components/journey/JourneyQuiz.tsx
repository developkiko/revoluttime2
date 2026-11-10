"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  DownloadIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  JOURNEY_EXPERIENCE,
  JOURNEY_FORMATS,
  JOURNEY_GOALS,
  JOURNEY_PROGRAMS,
  recommendProgram,
  type JourneyExperience,
  type JourneyFormat,
  type JourneyGoal,
  type JourneyProgramId,
} from "@/lib/journey";

type OptionKey = string;

const STEP_KEYS = ["goal", "experience", "format", "contact"] as const;

export function JourneyQuiz() {
  const t = useTranslations("journey");
  const locale = useLocale();

  const [step, setStep] = React.useState(0);
  const [goal, setGoal] = React.useState<JourneyGoal | null>(null);
  const [experience, setExperience] = React.useState<JourneyExperience | null>(null);
  const [format, setFormat] = React.useState<JourneyFormat | null>(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [program, setProgram] = React.useState<JourneyProgramId | null>(null);
  const [downloading, setDownloading] = React.useState(false);

  const finished = program !== null;

  const pickGoal = (value: JourneyGoal) => {
    setGoal(value);
    setStep(1);
  };
  const pickExperience = (value: JourneyExperience) => {
    setExperience(value);
    setStep(2);
  };
  const pickFormat = (value: JourneyFormat) => {
    setFormat(value);
    setStep(3);
  };

  const submitContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!goal || !experience || !format || !consent) return;
    setProgram(recommendProgram({ goal, experience, format }));
  };

  const download = async () => {
    if (!program) return;
    setDownloading(true);
    try {
      const response = await fetch("/api/journey/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          goal,
          experience,
          format,
          locale,
          consent: true,
        }),
      });
      if (!response.ok) throw new Error(`lead api: ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "revoluttime-journey.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(t("results.downloadSuccess"));
    } catch {
      toast.error(t("results.downloadError"));
    } finally {
      setDownloading(false);
    }
  };

  const back = () => {
    setStep((current) => Math.max(0, current - 1));
    setProgram(null);
  };

  // ── Result screen ──
  if (finished) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border bg-card p-6 shadow-lg md:p-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CheckCircle2Icon className="size-3.5" />
            {t("results.badge")}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight">
            {t(`results.programs.${program}.title`)}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {t(`results.programs.${program}.description`)}
          </p>
          <ul className="mt-5 space-y-2">
            {(t.raw(`results.programs.${program}.bullets`) as string[]).map(
              (bullet, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground"
                >
                  <SparklesIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {bullet}
                </li>
              ),
            )}
          </ul>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button onClick={download} disabled={downloading} size="lg" className="flex-1">
              <DownloadIcon data-icon="inline-start" />
              {downloading ? t("results.downloading") : t("results.download")}
            </Button>
            <Button variant="outline" onClick={back} size="lg">
              <ArrowLeftIcon data-icon="inline-start" />
              {t("results.restart")}
            </Button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {t("results.footnote")}
          </p>
        </div>
      </div>
    );
  }

  const stepKey = STEP_KEYS[step];

  // ── Option steps ──
  const optionList =
    stepKey === "goal"
      ? JOURNEY_GOALS.map((value) => ({ value, key: `steps.goal.options.${value}` }))
      : stepKey === "experience"
        ? JOURNEY_EXPERIENCE.map((value) => ({
            value,
            key: `steps.experience.options.${value}`,
          }))
        : JOURNEY_FORMATS.map((value) => ({ value, key: `steps.format.options.${value}` }));

  const choose = (value: OptionKey) => {
    if (stepKey === "goal") pickGoal(value as JourneyGoal);
    if (stepKey === "experience") pickExperience(value as JourneyExperience);
    if (stepKey === "format") pickFormat(value as JourneyFormat);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEP_KEYS.length) * 100}%` }}
          />
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {t("progress", { step: step + 1, total: STEP_KEYS.length })}
        </p>
      </div>

      <div className="rounded-3xl border bg-card p-6 shadow-lg md:p-8">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">
          {t(`steps.${stepKey}.title`)}
        </h2>

        {stepKey !== "contact" ? (
          <>
            <div className="mt-5 grid gap-3">
              {optionList.map(({ value, key }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => choose(value)}
                  className="group flex items-center justify-between rounded-2xl border bg-background px-5 py-4 text-left text-sm font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {t(key)}
                  <ArrowRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
              ))}
            </div>
            {step > 0 && (
              <Button variant="ghost" onClick={back} className="mt-4">
                <ArrowLeftIcon data-icon="inline-start" />
                {t("back")}
              </Button>
            )}
          </>
        ) : (
          <form onSubmit={submitContact} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="journey-name" className="text-sm font-medium">
                {t("steps.contact.name")}
              </label>
              <Input
                id="journey-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("steps.contact.namePlaceholder")}
                maxLength={80}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="journey-email" className="text-sm font-medium">
                {t("steps.contact.email")}
              </label>
              <Input
                id="journey-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <label className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[--primary]"
              />
              {t("steps.contact.consent")}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" size="lg" className="flex-1" disabled={!consent || !email}>
                {t("steps.contact.submit")}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              <Button type="button" variant="ghost" onClick={back} size="lg">
                <ArrowLeftIcon data-icon="inline-start" />
                {t("back")}
              </Button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t("stepsHint")}
      </p>
      {/* expose program keys for aria completeness (hidden) */}
      <span className="sr-only">{JOURNEY_PROGRAMS.length} programme profiles</span>
    </div>
  );
}

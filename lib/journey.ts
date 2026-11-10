/**
 * Discovery Journey — quiz model and recommendation logic.
 * Shared between the client quiz (answers) and the lead API (PDF generation).
 */

export type JourneyGoal = "energy" | "recovery" | "balance" | "sport";
export type JourneyExperience = "newcomer" | "experienced";
export type JourneyFormat = "tablets" | "studio" | "recreation";

export type JourneyProgramId =
  | "balance-start"
  | "performance-recovery"
  | "mind-body-studio"
  | "active-outdoor";

export interface JourneyAnswers {
  goal: JourneyGoal;
  experience: JourneyExperience;
  format: JourneyFormat;
}

export const JOURNEY_GOALS: JourneyGoal[] = ["energy", "recovery", "balance", "sport"];
export const JOURNEY_EXPERIENCE: JourneyExperience[] = ["newcomer", "experienced"];
export const JOURNEY_FORMATS: JourneyFormat[] = ["tablets", "studio", "recreation"];
export const JOURNEY_PROGRAMS: JourneyProgramId[] = [
  "balance-start",
  "performance-recovery",
  "mind-body-studio",
  "active-outdoor",
];

/**
 * Maps quiz answers onto one of the four program profiles. The chosen
 * direction (format) dominates — it routes into the matching RevolutTIME
 * direction; goal/experience refine the copy.
 */
export function recommendProgram(answers: JourneyAnswers): JourneyProgramId {
  if (answers.format === "studio") return "mind-body-studio";
  if (answers.format === "recreation") return "active-outdoor";
  if (answers.goal === "sport" || answers.goal === "recovery") {
    return "performance-recovery";
  }
  return "balance-start";
}

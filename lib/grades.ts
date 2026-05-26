import type { Grade } from "./types";

const GRADE_TIER: Record<Grade, number> = {
  common: 0,
  rare: 0,
  epic: 1,
  legendary: 2,
  mythic: 3,
  secret: 4,
};

export function getGradeTier(grade: Grade): number {
  return GRADE_TIER[grade];
}

export function pickBestGrade(grades: Grade[]): Grade {
  return grades.reduce((best, grade) =>
    getGradeTier(grade) > getGradeTier(best) ? grade : best
  );
}

export function hasRevealEffect(grade: Grade): boolean {
  return getGradeTier(grade) >= 1;
}

export const ALL_GRADES: Grade[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "secret",
];

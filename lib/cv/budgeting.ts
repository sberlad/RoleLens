/**
 * Content budgeting for tailored CVs.
 * Enforces one-page constraints to prevent AI-generated content overflow.
 */

import type { TailoredCV } from "./schema";

export interface ContentBudget {
  summaryMaxWords: number;
  maxRoles: number;
  maxBulletsPerRole: number;
  maxBulletWords: number;
  maxProjects: number;
  maxSkillsPerCategory: number;
}

export const DEFAULT_BUDGET: ContentBudget = {
  summaryMaxWords: 60,
  maxRoles: 4,
  maxBulletsPerRole: 4,
  maxBulletWords: 20,
  maxProjects: 3,
  maxSkillsPerCategory: 8,
};

/** Count words in a string */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Truncate a string to a maximum number of words */
export function truncateToWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "…";
}

/** Apply content budget constraints to a tailored CV */
export function applyContentBudget(cv: TailoredCV, budget: ContentBudget = DEFAULT_BUDGET): TailoredCV {
  return {
    ...cv,
    summary: truncateToWords(cv.summary, budget.summaryMaxWords),
    experience: cv.experience.slice(0, budget.maxRoles).map((exp) => ({
      ...exp,
      bullets: exp.bullets
        .slice(0, budget.maxBulletsPerRole)
        .map((bullet) => truncateToWords(bullet, budget.maxBulletWords)),
    })),
    projects: cv.projects.slice(0, budget.maxProjects).map((proj) => ({
      ...proj,
      bullets: proj.bullets.slice(0, 2).map((b) => truncateToWords(b, budget.maxBulletWords)),
    })),
    skills: {
      systems: cv.skills.systems.slice(0, budget.maxSkillsPerCategory),
      ai: cv.skills.ai.slice(0, budget.maxSkillsPerCategory),
      technical: cv.skills.technical.slice(0, budget.maxSkillsPerCategory),
    },
  };
}

/** Check if a CV is within budget constraints */
export function isWithinBudget(cv: TailoredCV, budget: ContentBudget = DEFAULT_BUDGET): boolean {
  if (countWords(cv.summary) > budget.summaryMaxWords) return false;
  if (cv.experience.length > budget.maxRoles) return false;
  for (const exp of cv.experience) {
    if (exp.bullets.length > budget.maxBulletsPerRole) return false;
    for (const bullet of exp.bullets) {
      if (countWords(bullet) > budget.maxBulletWords) return false;
    }
  }
  if (cv.projects.length > budget.maxProjects) return false;
  if (cv.skills.systems.length > budget.maxSkillsPerCategory) return false;
  if (cv.skills.ai.length > budget.maxSkillsPerCategory) return false;
  if (cv.skills.technical.length > budget.maxSkillsPerCategory) return false;
  return true;
}

/** Calculate total estimated line count for rough one-page estimate */
export function estimateLineCount(cv: TailoredCV): number {
  let lines = 0;
  lines += 3; // header (name, location, contact)
  lines += 1; // summary label
  lines += Math.ceil(countWords(cv.summary) / 12); // ~12 words per line
  lines += cv.experience.length * 2; // title + company line per role
  for (const exp of cv.experience) {
    lines += exp.bullets.length;
  }
  if (cv.projects.length > 0) {
    lines += 1; // section label
    lines += cv.projects.length * 2;
  }
  lines += 2; // skills section
  if (cv.education.length > 0) {
    lines += 1 + cv.education.length * 2;
  }
  if (cv.languages.length > 0) {
    lines += 1;
  }
  return lines;
}

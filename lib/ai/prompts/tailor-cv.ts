/**
 * CV tailoring prompt module.
 * Generates a tailored one-page CV for a specific job.
 * Content budgeting rules prevent runaway long-form output.
 */

import { initAI, getProvider } from "../index";
import { CVProfile } from "@/lib/cv/schema";
import { Job } from "@/lib/jobs/schema";
import { TailoredCV, tailoredCVSchema } from "@/lib/cv/schema";
import { applyContentBudget, isWithinBudget } from "@/lib/cv/budgeting";

export const CONTENT_BUDGET = {
  summaryMaxWords: 60,
  maxRoles: 4,
  maxBulletsPerRole: 4,
  maxBulletWords: 20,
  maxProjects: 3,
  maxSkillsPerCategory: 8,
} as const;

const SYSTEM_PROMPT = `You are an expert CV tailoring assistant. Reframe an existing CV to better match a job description.

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements
- ONLY reframe and reorder existing content
- Use ATS-friendly language that mirrors the job description
- Keep content truthful and specific
- Do not add qualifications the candidate doesn't have

Return a JSON object with this schema:
{
  "name": string,
  "location": string,
  "workAuthorization": string[],
  "summary": string (max 60 words, tailored to this specific role),
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "dates": string,
      "bullets": string[] (max 4 bullets, max 20 words each, most relevant first)
    }
  ] (max 4 roles, most relevant first),
  "projects": [
    {
      "name": string,
      "link": string | null,
      "description": string (max 15 words),
      "bullets": string[] (max 2 bullets)
    }
  ] (max 3 projects, most relevant first),
  "skills": {
    "systems": string[] (max 8),
    "ai": string[] (max 8),
    "technical": string[] (max 8)
  },
  "education": [
    {
      "degree": string,
      "institution": string,
      "location": string,
      "dates": string
    }
  ],
  "languages": [
    {
      "language": string,
      "proficiency": string
    }
  ]
}

Return ONLY valid JSON, no markdown.`;

export async function tailorCV(profile: CVProfile, job: Job): Promise<TailoredCV> {
  initAI();
  const provider = getProvider();

  const profileJson = JSON.stringify(profile, null, 2);

  const result = await provider.complete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `ORIGINAL PROFILE (JSON):\n${profileJson}\n\nTARGET JOB:\nTitle: ${job.title}\nCompany: ${job.company}\n\nJob Description:\n${job.description}\n\nGenerate a tailored CV that maximizes fit for this specific role.`,
      },
    ],
    { jsonMode: true, temperature: 0.4, maxTokens: 2000 },
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    throw new Error(`CV tailor returned invalid JSON: ${result.content.slice(0, 200)}`);
  }

  const validated = tailoredCVSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Tailored CV validation failed: ${validated.error.message}`);
  }

  // Apply content budget to prevent overflow
  const budgeted = applyContentBudget(validated.data, CONTENT_BUDGET);

  // Verify it fits within budget
  if (!isWithinBudget(budgeted, CONTENT_BUDGET)) {
    // Force-trim if still over budget
    return applyContentBudget(budgeted, CONTENT_BUDGET);
  }

  return budgeted;
}

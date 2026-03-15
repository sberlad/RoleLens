/**
 * Match scoring prompt module.
 * Scores fit between a CV profile and a job description.
 */

import { initAI, getProvider } from "../index";
import { CVProfile } from "@/lib/cv/schema";
import { Job, MatchScore, matchScoreSchema } from "@/lib/jobs/schema";

const SYSTEM_PROMPT = `You are a precise job-fit analyst. Evaluate how well a candidate's profile matches a job description.

Return a JSON object with this exact schema:
{
  "score": number (0-100),
  "strengths": string[] (2-4 strongest matching qualifications, each ≤ 12 words),
  "gaps": string[] (1-3 main skill or experience gaps, each ≤ 12 words),
  "rationale": string (2-3 sentence honest assessment, ≤ 60 words)
}

Scoring guide:
- 85-100: Excellent match, most requirements met
- 70-84: Strong match, minor gaps only
- 55-69: Moderate match, some notable gaps
- 40-54: Partial match, significant gaps
- Below 40: Poor fit

Be honest and specific. Do not inflate scores.
Return ONLY valid JSON, no markdown.`;

function profileToText(profile: CVProfile): string {
  const lines: string[] = [];
  lines.push(`Name: ${profile.name}`);
  lines.push(`Location: ${profile.location}`);
  if (profile.workAuthorization.length > 0) {
    lines.push(`Work Authorization: ${profile.workAuthorization.join(", ")}`);
  }
  if (profile.summary) {
    lines.push(`\nSummary:\n${profile.summary}`);
  }
  if (profile.experience.length > 0) {
    lines.push("\nExperience:");
    for (const exp of profile.experience) {
      lines.push(`  ${exp.title} at ${exp.company} (${exp.dates})`);
      for (const bullet of exp.bullets) {
        lines.push(`    - ${bullet}`);
      }
    }
  }
  if (profile.projects.length > 0) {
    lines.push("\nProjects:");
    for (const proj of profile.projects) {
      lines.push(`  ${proj.name}: ${proj.description}`);
    }
  }
  const allSkills = [
    ...profile.skills.systems,
    ...profile.skills.ai,
    ...profile.skills.technical,
  ];
  if (allSkills.length > 0) {
    lines.push(`\nSkills: ${allSkills.join(", ")}`);
  }
  if (profile.languages.length > 0) {
    lines.push(
      `\nLanguages: ${profile.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}`,
    );
  }
  return lines.join("\n");
}

export async function scoreMatch(profile: CVProfile, job: Job): Promise<MatchScore> {
  initAI();
  const provider = getProvider();

  const profileText = profileToText(profile);

  const result = await provider.complete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `CANDIDATE PROFILE:\n${profileText}\n\nJOB DESCRIPTION:\nTitle: ${job.title}\nCompany: ${job.company}\n\n${job.description}`,
      },
    ],
    { jsonMode: true, temperature: 0.2, maxTokens: 500 },
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    throw new Error(`Match scorer returned invalid JSON: ${result.content.slice(0, 200)}`);
  }

  const validated = matchScoreSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Match score validation failed: ${validated.error.message}`);
  }

  return validated.data;
}

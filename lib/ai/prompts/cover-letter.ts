/**
 * Cover letter generation prompt module.
 * Generates a concise, tailored cover letter.
 */

import { initAI, getProvider } from "../index";
import { CVProfile } from "@/lib/cv/schema";
import { Job } from "@/lib/jobs/schema";

const SYSTEM_PROMPT = `You are an expert cover letter writer. Write a concise, professional cover letter.

Requirements:
- 150-220 words total
- Professional tone, no fluff
- Role-specific — reference the actual job and company
- Highlight 2-3 most relevant qualifications
- No fabricated claims — only reference what's in the profile
- No generic filler phrases like "I am passionate about..."
- End with a clear, brief call to action
- Do not include subject line or date

Return ONLY the cover letter text, no JSON, no explanation.`;

export async function generateCoverLetter(
  profile: CVProfile,
  job: Job,
  tailoredSummary?: string,
): Promise<string> {
  initAI();
  const provider = getProvider();

  const relevantBackground = [
    `Candidate: ${profile.name}`,
    `Location: ${profile.location}`,
    profile.summary ? `Summary: ${profile.summary}` : "",
    profile.experience.length > 0
      ? `Recent experience: ${profile.experience
          .slice(0, 3)
          .map((e) => `${e.title} at ${e.company}`)
          .join(", ")}`
      : "",
    profile.languages.length > 0
      ? `Languages: ${profile.languages.map((l) => `${l.language}`).join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await provider.complete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `CANDIDATE BACKGROUND:\n${relevantBackground}\n\nTARGET ROLE:\nTitle: ${job.title}\nCompany: ${job.company}\n\nJob Description (excerpt):\n${job.description.slice(0, 1500)}\n\n${tailoredSummary ? `Tailored summary to use as basis:\n${tailoredSummary}\n\n` : ""}Write the cover letter now.`,
      },
    ],
    { temperature: 0.5, maxTokens: 400 },
  );

  const text = result.content.trim();

  // Basic word count validation
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 100) {
    throw new Error(`Cover letter too short (${wordCount} words). Expected 150-220.`);
  }

  return text;
}

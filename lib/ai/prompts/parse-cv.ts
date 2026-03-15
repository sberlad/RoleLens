/**
 * CV parsing prompt module.
 * Converts raw CV text into structured JSON matching the CVProfile schema.
 */

import { initAI, getProvider } from "../index";
import { CVProfile, cvProfileSchema } from "@/lib/cv/schema";

const SYSTEM_PROMPT = `You are a precise CV parser. Extract structured data from CV text.

Return a JSON object matching this exact schema:
{
  "name": string,
  "location": string,
  "workAuthorization": string[],
  "summary": string,
  "experience": [
    {
      "title": string,
      "company": string,
      "location": string,
      "dates": string,
      "bullets": string[]
    }
  ],
  "projects": [
    {
      "name": string,
      "link": string | null,
      "description": string,
      "bullets": string[]
    }
  ],
  "skills": {
    "systems": string[],
    "ai": string[],
    "technical": string[]
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

Rules:
- Extract all information faithfully — do not invent or embellish
- If a field is not present, use null for optional fields or empty arrays for arrays
- Categorize skills into systems (operating systems, platforms), ai (ML/AI tools), and technical (languages, frameworks, tools)
- Keep bullet points concise — max 15 words each
- Return ONLY valid JSON, no markdown, no explanation`;

export async function parseCVText(cvText: string): Promise<CVProfile> {
  initAI();
  const provider = getProvider();

  const result = await provider.complete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Parse this CV:\n\n${cvText}`,
      },
    ],
    { jsonMode: true, temperature: 0.1, maxTokens: 2000 },
  );

  let parsed: unknown;
  try {
    parsed = JSON.parse(result.content);
  } catch {
    throw new Error(`CV parser returned invalid JSON: ${result.content.slice(0, 200)}`);
  }

  const validated = cvProfileSchema.safeParse(parsed);
  if (!validated.success) {
    // Try a second pass with validation errors as feedback
    const retryResult = await provider.complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Parse this CV:\n\n${cvText}` },
        { role: "assistant", content: result.content },
        {
          role: "user",
          content: `The JSON had validation errors. Please fix and return valid JSON:\n${validated.error.message}`,
        },
      ],
      { jsonMode: true, temperature: 0.1, maxTokens: 2000 },
    );

    let retryParsed: unknown;
    try {
      retryParsed = JSON.parse(retryResult.content);
    } catch {
      throw new Error("CV parser failed to return valid JSON after retry");
    }

    const retryValidated = cvProfileSchema.safeParse(retryParsed);
    if (!retryValidated.success) {
      throw new Error(`CV parsing failed validation: ${retryValidated.error.message}`);
    }
    return retryValidated.data;
  }

  return validated.data;
}

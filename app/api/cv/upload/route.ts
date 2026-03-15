/**
 * POST /api/cv/upload
 * Accepts a CV file (PDF or DOCX), extracts text, parses it with AI,
 * saves the profile, and returns the structured profile.
 *
 * The OpenAI API key is read from server-side env only — never exposed to client.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/parsing";
import { parseCVText } from "@/lib/ai/prompts/parse-cv";
import { saveProfile } from "@/lib/storage/local";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from CV file
    let cvText: string;
    try {
      cvText = await extractTextFromFile(buffer, filename, mimeType);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to extract text from file";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the uploaded file." },
        { status: 422 },
      );
    }

    // Parse CV with AI
    let profile;
    try {
      profile = await parseCVText(cvText);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "CV parsing failed";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    // Save profile to local storage
    await saveProfile(profile);

    return NextResponse.json({ profile }, { status: 200 });
  } catch (err: unknown) {
    console.error("CV upload error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

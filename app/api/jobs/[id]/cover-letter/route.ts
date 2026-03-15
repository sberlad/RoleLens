/**
 * POST /api/jobs/[id]/cover-letter
 * Generates a tailored cover letter for a specific job.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadJob, loadProfile, loadOutput, saveOutput } from "@/lib/storage/local";
import { generateCoverLetter } from "@/lib/ai/prompts/cover-letter";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [job, profile] = await Promise.all([loadJob(params.id), loadProfile()]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!profile) {
      return NextResponse.json({ error: "No profile found. Upload your CV first." }, { status: 400 });
    }

    // Use tailored summary if available
    const existing = await loadOutput(params.id);
    const tailoredSummary = existing?.tailoredCV?.summary;

    const coverLetter = await generateCoverLetter(profile, job, tailoredSummary);

    await saveOutput({
      jobId: params.id,
      tailoredCV: existing?.tailoredCV,
      coverLetter,
      generatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ coverLetter });
  } catch (err: unknown) {
    console.error("Cover letter error:", err);
    const message = err instanceof Error ? err.message : "Cover letter generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const output = await loadOutput(params.id);
  if (!output?.coverLetter) {
    return NextResponse.json({ error: "No cover letter generated yet" }, { status: 404 });
  }
  return NextResponse.json({ coverLetter: output.coverLetter, generatedAt: output.generatedAt });
}

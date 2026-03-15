/**
 * POST /api/jobs/[id]/tailor
 * Generates a tailored CV for a specific job.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadJob, loadProfile, loadOutput, saveOutput } from "@/lib/storage/local";
import { tailorCV } from "@/lib/ai/prompts/tailor-cv";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [job, profile] = await Promise.all([loadJob(params.id), loadProfile()]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!profile) {
      return NextResponse.json({ error: "No profile found. Upload your CV first." }, { status: 400 });
    }

    const tailoredCV = await tailorCV(profile, job);

    // Merge with existing output if any
    const existing = await loadOutput(params.id);
    await saveOutput({
      jobId: params.id,
      tailoredCV,
      coverLetter: existing?.coverLetter,
      generatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ tailoredCV });
  } catch (err: unknown) {
    console.error("Tailor CV error:", err);
    const message = err instanceof Error ? err.message : "CV tailoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const output = await loadOutput(params.id);
  if (!output?.tailoredCV) {
    return NextResponse.json({ error: "No tailored CV generated yet" }, { status: 404 });
  }
  return NextResponse.json({ tailoredCV: output.tailoredCV, generatedAt: output.generatedAt });
}

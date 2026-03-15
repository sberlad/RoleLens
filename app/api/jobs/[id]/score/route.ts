/**
 * POST /api/jobs/[id]/score
 * Scores the fit between the current profile and a job.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadJob, loadProfile, upsertJob } from "@/lib/storage/local";
import { scoreMatch } from "@/lib/ai/prompts/score-match";

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

    const matchScore = await scoreMatch(profile, job);

    const updatedJob = { ...job, matchScore };
    await upsertJob(updatedJob);

    return NextResponse.json({ matchScore });
  } catch (err: unknown) {
    console.error("Score match error:", err);
    const message = err instanceof Error ? err.message : "Scoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

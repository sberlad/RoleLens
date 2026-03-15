/**
 * GET  /api/jobs   — list all jobs
 * POST /api/jobs   — create a new job
 */

import { NextRequest, NextResponse } from "next/server";
import { loadJobs, upsertJob } from "@/lib/storage/local";
import { jobSchema } from "@/lib/jobs/schema";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  const jobs = await loadJobs();
  return NextResponse.json({ jobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validated = jobSchema.omit({ id: true, createdAt: true }).safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid job data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const job = {
      ...validated.data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      matchScore: null,
    };

    await upsertJob(job);
    return NextResponse.json({ job }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

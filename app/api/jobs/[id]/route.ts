/**
 * GET    /api/jobs/[id]  — get a specific job
 * PUT    /api/jobs/[id]  — update a job
 * DELETE /api/jobs/[id]  — delete a job
 */

import { NextRequest, NextResponse } from "next/server";
import { loadJob, upsertJob, deleteJob } from "@/lib/storage/local";
import { jobSchema } from "@/lib/jobs/schema";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await loadJob(params.id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json({ job });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = jobSchema.partial().safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid job data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const existing = await loadJob(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updated = { ...existing, ...validated.data };
    await upsertJob(updated);
    return NextResponse.json({ job: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteJob(params.id);
  return NextResponse.json({ ok: true });
}

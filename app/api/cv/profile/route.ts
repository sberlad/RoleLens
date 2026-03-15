/**
 * GET  /api/cv/profile  — load the current profile
 * PUT  /api/cv/profile  — save an edited profile
 * DELETE /api/cv/profile — clear the user profile (revert to seed)
 */

import { NextRequest, NextResponse } from "next/server";
import { loadProfile, saveProfile, clearProfile } from "@/lib/storage/local";
import { cvProfileSchema } from "@/lib/cv/schema";

export const runtime = "nodejs";

export async function GET() {
  const profile = await loadProfile();
  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = cvProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: validated.error.flatten() },
        { status: 400 },
      );
    }
    await saveProfile(validated.data);
    return NextResponse.json({ profile: validated.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  await clearProfile();
  return NextResponse.json({ ok: true });
}

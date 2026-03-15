/**
 * Local file-based persistence layer.
 * Stores data as JSON files in the /data directory.
 * Simple and local-first for MVP.
 */

import fs from "fs/promises";
import path from "path";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJSON<T>(filename: string): Promise<T | null> {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filepath = path.join(DATA_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Profile Storage ──────────────────────────────────────────────────────────

import type { CVProfile } from "@/lib/cv/schema";

const PROFILE_FILE = "profile.json";
const SEED_PROFILE_FILE = "seed-profile.json";

export async function loadProfile(): Promise<CVProfile | null> {
  // User profile takes precedence over seed
  const profile = await readJSON<CVProfile>(PROFILE_FILE);
  if (profile) return profile;
  // Fall back to seed profile
  return readJSON<CVProfile>(SEED_PROFILE_FILE);
}

export async function saveProfile(profile: CVProfile): Promise<void> {
  await writeJSON(PROFILE_FILE, profile);
}

export async function clearProfile(): Promise<void> {
  const filepath = path.join(DATA_DIR, PROFILE_FILE);
  try {
    await fs.unlink(filepath);
  } catch {
    // ignore if not found
  }
}

// ── Jobs Storage ─────────────────────────────────────────────────────────────

import type { JobWithScore } from "@/lib/jobs/schema";

const JOBS_FILE = "jobs.json";
const SEED_JOBS_FILE = "seed-jobs.json";

export async function loadJobs(): Promise<JobWithScore[]> {
  const jobs = await readJSON<JobWithScore[]>(JOBS_FILE);
  if (jobs) return jobs;
  // Fall back to seed jobs
  const seedJobs = await readJSON<JobWithScore[]>(SEED_JOBS_FILE);
  return seedJobs ?? [];
}

export async function saveJobs(jobs: JobWithScore[]): Promise<void> {
  await writeJSON(JOBS_FILE, jobs);
}

export async function loadJob(id: string): Promise<JobWithScore | null> {
  const jobs = await loadJobs();
  return jobs.find((j) => j.id === id) ?? null;
}

export async function upsertJob(job: JobWithScore): Promise<void> {
  const jobs = await loadJobs();
  const index = jobs.findIndex((j) => j.id === job.id);
  if (index >= 0) {
    jobs[index] = job;
  } else {
    jobs.push(job);
  }
  await saveJobs(jobs);
}

export async function deleteJob(id: string): Promise<void> {
  const jobs = await loadJobs();
  await saveJobs(jobs.filter((j) => j.id !== id));
}

// ── Generated Outputs Storage ─────────────────────────────────────────────────

export interface GeneratedOutput {
  jobId: string;
  tailoredCV?: CVProfile;
  coverLetter?: string;
  generatedAt: string;
}

export async function loadOutput(jobId: string): Promise<GeneratedOutput | null> {
  return readJSON<GeneratedOutput>(`output-${jobId}.json`);
}

export async function saveOutput(output: GeneratedOutput): Promise<void> {
  await writeJSON(`output-${output.jobId}.json`, output);
}

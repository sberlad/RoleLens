import Link from "next/link";
import { loadProfile } from "@/lib/storage/local";
import { loadJobs } from "@/lib/storage/local";

export default async function DashboardPage() {
  const [profile, jobs] = await Promise.all([loadProfile(), loadJobs()]);

  const scoredJobs = jobs.filter((j) => j.matchScore !== null);
  const bestScore = scoredJobs.length > 0
    ? Math.max(...scoredJobs.map((j) => j.matchScore!.score))
    : null;

  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-neutral-900">
          {profile ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome to RoleLens"}
        </h1>
        <p className="mt-2 text-neutral-500">
          AI-assisted career intelligence and application tailoring.
        </p>
      </div>

      {/* Status Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="section-title mb-2">Profile</div>
          <div className="text-2xl font-semibold">{profile ? "Loaded" : "Not set"}</div>
          <p className="mt-1 text-sm text-neutral-500">
            {profile ? `${profile.name} · ${profile.location}` : "Upload your CV to get started"}
          </p>
          <Link href={profile ? "/profile" : "/upload"} className="btn-secondary mt-4 text-xs">
            {profile ? "View profile" : "Upload CV"}
          </Link>
        </div>

        <div className="card">
          <div className="section-title mb-2">Jobs</div>
          <div className="text-2xl font-semibold">{jobs.length}</div>
          <p className="mt-1 text-sm text-neutral-500">
            {jobs.length === 0
              ? "No jobs added yet"
              : `${scoredJobs.length} scored · ${jobs.length - scoredJobs.length} pending`}
          </p>
          <Link href="/jobs" className="btn-secondary mt-4 text-xs">
            Manage jobs
          </Link>
        </div>

        <div className="card">
          <div className="section-title mb-2">Best Match</div>
          <div className="text-2xl font-semibold">
            {bestScore !== null ? `${bestScore}%` : "—"}
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {bestScore !== null
              ? scoredJobs.find((j) => j.matchScore?.score === bestScore)?.title ?? ""
              : "Score a job to see your best fit"}
          </p>
          {bestScore !== null && (
            <Link href="/jobs" className="btn-secondary mt-4 text-xs">
              View analysis
            </Link>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/upload" className="btn-secondary justify-center">
            Upload CV
          </Link>
          <Link href="/jobs" className="btn-secondary justify-center">
            Add Job
          </Link>
          <Link href="/profile" className="btn-secondary justify-center">
            Edit Profile
          </Link>
          <Link href="/settings" className="btn-secondary justify-center">
            Settings
          </Link>
        </div>
      </div>

      {/* Jobs List Preview */}
      {jobs.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Recent Jobs</h2>
            <Link href="/jobs" className="text-xs text-neutral-500 hover:text-neutral-900">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-neutral-100">
            {jobs.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-neutral-900">{job.title}</div>
                  <div className="text-xs text-neutral-500">{job.company}</div>
                </div>
                <div className="flex items-center gap-3">
                  {job.matchScore && (
                    <span
                      className={`badge ring-1 ${
                        job.matchScore.score >= 75
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : job.matchScore.score >= 55
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : "bg-red-50 text-red-700 ring-red-200"
                      }`}
                    >
                      {job.matchScore.score}%
                    </span>
                  )}
                  <Link href={`/jobs/${job.id}`} className="btn-ghost py-1 text-xs">
                    Analyze
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {!profile && (
        <div className="card border-neutral-100 bg-neutral-50">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Getting Started</h2>
          <ol className="space-y-2 text-sm text-neutral-600">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                1
              </span>
              <span>
                Upload your CV (PDF or DOCX) or use the seeded profile from{" "}
                <Link href="/profile" className="underline">
                  Profile
                </Link>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                2
              </span>
              <span>
                Add job descriptions from{" "}
                <Link href="/jobs" className="underline">
                  Jobs
                </Link>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700">
                3
              </span>
              <span>Score fit, tailor your CV, and generate a cover letter for each job</span>
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}

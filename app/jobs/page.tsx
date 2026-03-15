import { loadJobs } from "@/lib/storage/local";
import JobsManager from "@/components/jobs/JobsManager";

export default async function JobsPage() {
  const jobs = await loadJobs();

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Jobs</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Add job descriptions and analyze fit with your profile.
        </p>
      </div>

      <JobsManager initialJobs={jobs} />
    </div>
  );
}

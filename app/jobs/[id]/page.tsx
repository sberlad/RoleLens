import { loadJob, loadOutput } from "@/lib/storage/local";
import { notFound } from "next/navigation";
import JobAnalysis from "@/components/jobs/JobAnalysis";

export default async function JobAnalysisPage({ params }: { params: { id: string } }) {
  const [job, output] = await Promise.all([loadJob(params.id), loadOutput(params.id)]);

  if (!job) notFound();

  return (
    <div className="page-container">
      <div className="mb-8">
        <div className="text-xs font-medium text-neutral-400">
          <a href="/jobs" className="hover:text-neutral-700">
            Jobs
          </a>{" "}
          / {job.title}
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">{job.title}</h1>
        <p className="mt-0.5 text-sm text-neutral-500">{job.company}</p>
      </div>

      <JobAnalysis job={job} existingOutput={output} />
    </div>
  );
}

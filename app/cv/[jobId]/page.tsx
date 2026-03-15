import { loadJob, loadOutput } from "@/lib/storage/local";
import { notFound } from "next/navigation";
import CVRenderer from "@/components/cv/CVRenderer";

export default async function TailoredCVPage({ params }: { params: { jobId: string } }) {
  const [job, output] = await Promise.all([loadJob(params.jobId), loadOutput(params.jobId)]);

  if (!job || !output?.tailoredCV) {
    notFound();
  }

  return (
    <div>
      {/* Controls bar - hidden when printing */}
      <div className="no-print sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <a href={`/jobs/${job.id}`} className="text-sm text-neutral-500 hover:text-neutral-900">
              ← Back to {job.title}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              Tailored for <strong>{job.title}</strong> at {job.company}
            </span>
            <button
              onClick={() => window.print()}
              className="btn-primary text-xs"
              data-testid="print-btn"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* CV Content */}
      <div className="no-print my-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <CVRenderer cv={output.tailoredCV} />
        </div>
      </div>

      {/* Print-only version */}
      <div className="hidden print:block">
        <CVRenderer cv={output.tailoredCV} />
      </div>

      {/* Cover letter if available */}
      {output.coverLetter && (
        <div className="no-print mx-auto mb-12 max-w-2xl px-6">
          <div className="card">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Cover Letter</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {output.coverLetter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

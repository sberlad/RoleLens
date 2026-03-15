"use client";

import { useState } from "react";
import Link from "next/link";
import type { JobWithScore } from "@/lib/jobs/schema";
import type { GeneratedOutput } from "@/lib/storage/local";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { scoreBadgeColor } from "@/lib/utils";

interface JobAnalysisProps {
  job: JobWithScore;
  existingOutput: GeneratedOutput | null;
}

export default function JobAnalysis({ job: initialJob, existingOutput }: JobAnalysisProps) {
  const [job, setJob] = useState<JobWithScore>(initialJob);
  const [output, setOutput] = useState<GeneratedOutput | null>(existingOutput);
  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const [isTailoringLoading, setIsTailoringLoading] = useState(false);
  const [isCoverLetterLoading, setIsCoverLetterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScore() {
    setIsScoringLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/score`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scoring failed");
      setJob((prev) => ({ ...prev, matchScore: data.matchScore }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Scoring failed");
    } finally {
      setIsScoringLoading(false);
    }
  }

  async function handleTailor() {
    setIsTailoringLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/tailor`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tailoring failed");
      setOutput((prev) => ({ ...prev, jobId: job.id, tailoredCV: data.tailoredCV, generatedAt: new Date().toISOString() }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "CV tailoring failed");
    } finally {
      setIsTailoringLoading(false);
    }
  }

  async function handleCoverLetter() {
    setIsCoverLetterLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}/cover-letter`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cover letter generation failed");
      setOutput((prev) => ({ ...prev, jobId: job.id, coverLetter: data.coverLetter, generatedAt: new Date().toISOString() }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setIsCoverLetterLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Actions Row */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleScore}
          disabled={isScoringLoading}
          className="btn-primary"
          data-testid="score-btn"
        >
          {isScoringLoading ? (
            <>
              <Spinner size="sm" />
              Scoring...
            </>
          ) : job.matchScore ? (
            "Re-score Match"
          ) : (
            "Score Match"
          )}
        </button>

        <button
          onClick={handleTailor}
          disabled={isTailoringLoading}
          className="btn-secondary"
          data-testid="tailor-btn"
        >
          {isTailoringLoading ? (
            <>
              <Spinner size="sm" />
              Tailoring CV...
            </>
          ) : output?.tailoredCV ? (
            "Re-tailor CV"
          ) : (
            "Tailor CV"
          )}
        </button>

        <button
          onClick={handleCoverLetter}
          disabled={isCoverLetterLoading}
          className="btn-secondary"
          data-testid="cover-letter-btn"
        >
          {isCoverLetterLoading ? (
            <>
              <Spinner size="sm" />
              Generating...
            </>
          ) : output?.coverLetter ? (
            "Regenerate Cover Letter"
          ) : (
            "Generate Cover Letter"
          )}
        </button>

        {output?.tailoredCV && (
          <Link href={`/cv/${job.id}`} className="btn-secondary" data-testid="view-cv-btn">
            View Tailored CV →
          </Link>
        )}
      </div>

      {/* Match Score */}
      {job.matchScore && (
        <div className="card" data-testid="match-score-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Match Analysis</h2>
            <span className={`badge ring-1 text-base ${scoreBadgeColor(job.matchScore.score)}`}>
              {job.matchScore.score}%
            </span>
          </div>

          <p className="mb-4 text-sm text-neutral-600">{job.matchScore.rationale}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="section-title mb-2">Strengths</div>
              <ul className="space-y-1">
                {job.matchScore.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="section-title mb-2">Gaps</div>
              <ul className="space-y-1">
                {job.matchScore.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <span className="mt-0.5 text-amber-500">△</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cover Letter */}
      {output?.coverLetter && (
        <div className="card" data-testid="cover-letter-card">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Cover Letter Draft</h2>
          <div className="whitespace-pre-wrap rounded-lg bg-neutral-50 p-5 font-sans text-sm leading-relaxed text-neutral-700">
            {output.coverLetter}
          </div>
          <div className="mt-3 text-right">
            <button
              onClick={() => {
                navigator.clipboard.writeText(output.coverLetter!);
              }}
              className="btn-ghost text-xs"
            >
              Copy to clipboard
            </button>
          </div>
        </div>
      )}

      {/* Tailored CV Preview */}
      {output?.tailoredCV && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Tailored CV Preview</h2>
            <Link href={`/cv/${job.id}`} className="btn-secondary py-1 text-xs">
              Full preview + Print →
            </Link>
          </div>
          <div className="rounded-lg bg-neutral-50 p-4">
            <div className="text-base font-semibold">{output.tailoredCV.name}</div>
            <div className="text-xs text-neutral-500">{output.tailoredCV.location}</div>
            {output.tailoredCV.summary && (
              <p className="mt-3 text-sm text-neutral-700">{output.tailoredCV.summary}</p>
            )}
            <div className="mt-3 text-xs text-neutral-400">
              {output.tailoredCV.experience.length} roles · {output.tailoredCV.projects.length}{" "}
              projects
            </div>
          </div>
        </div>
      )}

      {/* Job Description */}
      <div className="card">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900">Job Description</h2>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 block text-xs text-neutral-500 hover:underline"
          >
            {job.url}
          </a>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
          {job.description}
        </div>
      </div>
    </div>
  );
}

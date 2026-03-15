"use client";

import { useState } from "react";
import Link from "next/link";
import type { JobWithScore } from "@/lib/jobs/schema";
import { formatDate, scoreBadgeColor } from "@/lib/utils";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface JobsManagerProps {
  initialJobs: JobWithScore[];
}

interface NewJobForm {
  title: string;
  company: string;
  url: string;
  description: string;
}

const emptyForm: NewJobForm = { title: "", company: "", url: "", description: "" };

export default function JobsManager({ initialJobs }: JobsManagerProps) {
  const [jobs, setJobs] = useState<JobWithScore[]>(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewJobForm>(emptyForm);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company || !form.description) return;
    setIsAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          url: form.url || null,
          description: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add job");
      setJobs((prev) => [...prev, data.job]);
      setForm(emptyForm);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add job");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this job?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {/* Add Job Button */}
      <div className="flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Job"}
        </button>
      </div>

      {/* Add Job Form */}
      {showForm && (
        <div className="card">
          <h2 className="mb-4 text-sm font-semibold text-neutral-900">Add New Job</h2>
          <form onSubmit={handleAddJob} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label mb-1">Job Title *</label>
                <input
                  className="input-field"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Product Manager"
                  required
                />
              </div>
              <div>
                <label className="label mb-1">Company *</label>
                <input
                  className="input-field"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="e.g., Acme Corp"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label mb-1">Job URL (optional)</label>
              <input
                className="input-field"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="label mb-1">Job Description *</label>
              <textarea
                className="input-field h-48 resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Paste the full job description here..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={isAdding} className="btn-primary">
                {isAdding ? "Adding..." : "Add Job"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="card text-center text-sm text-neutral-500">
          No jobs yet. Add your first job description above.
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">{job.title}</span>
                  {job.matchScore && (
                    <span className={`badge ring-1 ${scoreBadgeColor(job.matchScore.score)}`}>
                      {job.matchScore.score}% match
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-neutral-500">
                  {job.company}
                  {job.url && (
                    <>
                      {" "}
                      ·{" "}
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        View listing
                      </a>
                    </>
                  )}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-neutral-400">
                  {job.description.slice(0, 200)}...
                </div>
                <div className="mt-1 text-xs text-neutral-300">
                  Added {formatDate(job.createdAt)}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Link href={`/jobs/${job.id}`} className="btn-primary py-1 text-xs">
                  Analyze →
                </Link>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-xs text-neutral-400 hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

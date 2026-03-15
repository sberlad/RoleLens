"use client";

import { useState } from "react";
import type { CVProfile } from "@/lib/cv/schema";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SuccessMessage } from "@/components/ui/SuccessMessage";

interface ProfileEditorProps {
  initialProfile: CVProfile | null;
}

export default function ProfileEditor({ initialProfile }: ProfileEditorProps) {
  const [profile, setProfile] = useState<CVProfile | null>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/cv/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSuccess("Profile saved.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset to seed profile? This will discard any uploaded CV.")) return;
    await fetch("/api/cv/profile", { method: "DELETE" });
    window.location.reload();
  }

  if (!profile) {
    return (
      <div className="card text-center text-sm text-neutral-500">
        No profile found.{" "}
        <a href="/upload" className="font-medium text-neutral-700 underline">
          Upload your CV
        </a>{" "}
        to get started.
      </div>
    );
  }

  function updateField<K extends keyof CVProfile>(key: K, value: CVProfile[K]) {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess(null);
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
      {success && <SuccessMessage message={success} onDismiss={() => setSuccess(null)} />}

      {/* Header Info */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Basic Info</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label mb-1">Name</label>
            <input
              className="input-field"
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </div>
          <div>
            <label className="label mb-1">Location</label>
            <input
              className="input-field"
              value={profile.location}
              onChange={(e) => updateField("location", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label mb-1">Work Authorization (comma-separated)</label>
            <input
              className="input-field"
              value={profile.workAuthorization.join(", ")}
              onChange={(e) =>
                updateField(
                  "workAuthorization",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              placeholder="e.g., EU, US"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Summary</h2>
        <textarea
          className="input-field h-28 resize-none"
          value={profile.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          placeholder="Professional summary..."
        />
      </div>

      {/* Experience */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">
          Experience ({profile.experience.length})
        </h2>
        <div className="space-y-4">
          {profile.experience.map((exp, i) => (
            <div key={i} className="rounded-lg border border-neutral-100 p-4">
              <div className="mb-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="label mb-1 text-xs">Title</label>
                  <input
                    className="input-field text-sm"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[i] = { ...exp, title: e.target.value };
                      updateField("experience", updated);
                    }}
                  />
                </div>
                <div>
                  <label className="label mb-1 text-xs">Company</label>
                  <input
                    className="input-field text-sm"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[i] = { ...exp, company: e.target.value };
                      updateField("experience", updated);
                    }}
                  />
                </div>
                <div>
                  <label className="label mb-1 text-xs">Location</label>
                  <input
                    className="input-field text-sm"
                    value={exp.location}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[i] = { ...exp, location: e.target.value };
                      updateField("experience", updated);
                    }}
                  />
                </div>
                <div>
                  <label className="label mb-1 text-xs">Dates</label>
                  <input
                    className="input-field text-sm"
                    value={exp.dates}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[i] = { ...exp, dates: e.target.value };
                      updateField("experience", updated);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="label mb-1 text-xs">Bullets (one per line)</label>
                <textarea
                  className="input-field h-24 resize-none text-sm"
                  value={exp.bullets.join("\n")}
                  onChange={(e) => {
                    const updated = [...profile.experience];
                    updated[i] = {
                      ...exp,
                      bullets: e.target.value.split("\n").filter((s) => s.trim()),
                    };
                    updateField("experience", updated);
                  }}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    updateField(
                      "experience",
                      profile.experience.filter((_, idx) => idx !== i),
                    );
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              updateField("experience", [
                ...profile.experience,
                { title: "", company: "", location: "", dates: "", bullets: [] },
              ])
            }
            className="btn-secondary text-xs"
          >
            + Add Experience
          </button>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Skills</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(["systems", "ai", "technical"] as const).map((cat) => (
            <div key={cat}>
              <label className="label mb-1 capitalize">{cat}</label>
              <textarea
                className="input-field h-24 resize-none text-sm"
                value={profile.skills[cat].join("\n")}
                onChange={(e) => {
                  updateField("skills", {
                    ...profile.skills,
                    [cat]: e.target.value.split("\n").filter((s) => s.trim()),
                  });
                }}
                placeholder="One per line"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-neutral-900">Languages</h2>
        <div className="space-y-2">
          {profile.languages.map((lang, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                className="input-field"
                value={lang.language}
                placeholder="Language"
                onChange={(e) => {
                  const updated = [...profile.languages];
                  updated[i] = { ...lang, language: e.target.value };
                  updateField("languages", updated);
                }}
              />
              <input
                className="input-field"
                value={lang.proficiency}
                placeholder="Proficiency"
                onChange={(e) => {
                  const updated = [...profile.languages];
                  updated[i] = { ...lang, proficiency: e.target.value };
                  updateField("languages", updated);
                }}
              />
              <button
                onClick={() =>
                  updateField(
                    "languages",
                    profile.languages.filter((_, idx) => idx !== i),
                  )
                }
                className="shrink-0 text-xs text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              updateField("languages", [...profile.languages, { language: "", proficiency: "" }])
            }
            className="btn-secondary text-xs"
          >
            + Add Language
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button onClick={handleReset} className="btn-danger text-xs">
          Reset to Seed Profile
        </button>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? (
            <>
              <Spinner size="sm" />
              Saving...
            </>
          ) : (
            "Save Profile"
          )}
        </button>
      </div>
    </div>
  );
}

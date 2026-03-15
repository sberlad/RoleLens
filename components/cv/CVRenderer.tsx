"use client";

import type { TailoredCV } from "@/lib/cv/schema";

interface CVRendererProps {
  cv: TailoredCV;
}

export default function CVRenderer({ cv }: CVRendererProps) {
  const allSkills = [
    ...cv.skills.systems,
    ...cv.skills.ai,
    ...cv.skills.technical,
  ].filter(Boolean);

  return (
    <div
      className="cv-page mx-auto max-w-[680px] bg-white px-10 py-10 shadow-md print:shadow-none"
      data-testid="cv-page"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header */}
      <header className="mb-5 border-b border-neutral-300 pb-5">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ letterSpacing: "-0.02em" }}>
          {cv.name}
        </h1>
        <div className="mt-1 flex flex-wrap gap-x-3 text-sm text-neutral-600">
          {cv.location && <span>{cv.location}</span>}
          {cv.workAuthorization.length > 0 && (
            <span>Work auth: {cv.workAuthorization.join(", ")}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {cv.summary && (
        <section className="mb-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Summary
          </h2>
          <p className="text-sm leading-relaxed text-neutral-700">{cv.summary}</p>
        </section>
      )}

      {/* Experience */}
      {cv.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Experience
          </h2>
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-semibold text-neutral-900">{exp.title}</span>
                    <span className="text-sm text-neutral-600"> · {exp.company}</span>
                    {exp.location && (
                      <span className="text-sm text-neutral-400"> · {exp.location}</span>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-neutral-400">{exp.dates}</span>
                </div>
                {exp.bullets.length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {exp.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {cv.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Projects
          </h2>
          <div className="space-y-3">
            {cv.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-900">{proj.name}</span>
                  {proj.link && (
                    <a
                      href={proj.link}
                      className="text-xs text-neutral-400 hover:underline print:text-neutral-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {proj.link.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-sm text-neutral-600">{proj.description}</p>
                )}
                {proj.bullets.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {proj.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm leading-snug text-neutral-700">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Skills
          </h2>
          <div className="text-sm text-neutral-700">
            {cv.skills.technical.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">Technical: </span>
                {cv.skills.technical.join(" · ")}
              </div>
            )}
            {cv.skills.ai.length > 0 && (
              <div className="mb-1">
                <span className="font-medium">AI/ML: </span>
                {cv.skills.ai.join(" · ")}
              </div>
            )}
            {cv.skills.systems.length > 0 && (
              <div>
                <span className="font-medium">Systems: </span>
                {cv.skills.systems.join(" · ")}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Education */}
      {cv.education.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Education
          </h2>
          <div className="space-y-2">
            {cv.education.map((edu, i) => (
              <div key={i} className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold text-neutral-900">{edu.degree}</span>
                  <span className="text-sm text-neutral-600"> · {edu.institution}</span>
                  {edu.location && (
                    <span className="text-sm text-neutral-400"> · {edu.location}</span>
                  )}
                </div>
                {edu.dates && (
                  <span className="shrink-0 text-xs text-neutral-400">{edu.dates}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {cv.languages.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            Languages
          </h2>
          <div className="text-sm text-neutral-700">
            {cv.languages
              .map((lang) => `${lang.language}${lang.proficiency ? ` (${lang.proficiency})` : ""}`)
              .join(" · ")}
          </div>
        </section>
      )}
    </div>
  );
}

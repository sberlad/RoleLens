import { describe, it, expect } from "vitest";
import { cvProfileSchema, tailoredCVSchema } from "@/lib/cv/schema";
import { jobSchema, matchScoreSchema } from "@/lib/jobs/schema";

describe("cvProfileSchema", () => {
  it("parses a complete valid profile", () => {
    const input = {
      name: "Jane Smith",
      location: "Berlin",
      workAuthorization: ["EU"],
      summary: "Experienced professional.",
      experience: [
        {
          title: "PM",
          company: "Co",
          location: "Berlin",
          dates: "2020–2024",
          bullets: ["Did stuff"],
        },
      ],
      projects: [{ name: "App", link: null, description: "A project", bullets: [] }],
      skills: { systems: ["Linux"], ai: ["GPT"], technical: ["TypeScript"] },
      education: [{ degree: "BSc", institution: "Uni", location: "Berlin", dates: "2018" }],
      languages: [{ language: "English", proficiency: "Native" }],
    };
    const result = cvProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("applies defaults for missing optional arrays", () => {
    const input = { name: "Jane" };
    const result = cvProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.experience).toEqual([]);
      expect(result.data.skills.technical).toEqual([]);
      expect(result.data.languages).toEqual([]);
    }
  });

  it("fails without required name field", () => {
    const input = { location: "Berlin" };
    const result = cvProfileSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts null project links", () => {
    const input = {
      name: "Jane",
      projects: [{ name: "App", link: null, description: "", bullets: [] }],
    };
    const result = cvProfileSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe("tailoredCVSchema", () => {
  it("is equivalent to cvProfileSchema for valid input", () => {
    const input = { name: "Jane", summary: "Good candidate." };
    const r1 = cvProfileSchema.safeParse(input);
    const r2 = tailoredCVSchema.safeParse(input);
    expect(r1.success).toBe(r2.success);
  });
});

describe("jobSchema", () => {
  it("parses a valid job", () => {
    const input = {
      id: "job-1",
      title: "Engineer",
      company: "Acme",
      url: null,
      description: "Build stuff.",
      createdAt: new Date().toISOString(),
    };
    const result = jobSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("accepts null URL", () => {
    const input = {
      id: "job-1",
      title: "Engineer",
      company: "Acme",
      url: null,
      description: "Build stuff.",
      createdAt: new Date().toISOString(),
    };
    expect(jobSchema.safeParse(input).success).toBe(true);
  });

  it("fails without required fields", () => {
    const input = { title: "Engineer" };
    expect(jobSchema.safeParse(input).success).toBe(false);
  });
});

describe("matchScoreSchema", () => {
  it("parses a valid score", () => {
    const input = {
      score: 72,
      strengths: ["Strong writing skills", "Technical background"],
      gaps: ["No formal ML experience"],
      rationale: "Good fit for the analytical side but lacks ML depth.",
    };
    const result = matchScoreSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects scores outside 0–100", () => {
    expect(matchScoreSchema.safeParse({ score: 101, strengths: [], gaps: [], rationale: "" }).success).toBe(false);
    expect(matchScoreSchema.safeParse({ score: -1, strengths: [], gaps: [], rationale: "" }).success).toBe(false);
  });

  it("accepts score of exactly 0 and 100", () => {
    expect(matchScoreSchema.safeParse({ score: 0, strengths: [], gaps: [], rationale: "" }).success).toBe(true);
    expect(matchScoreSchema.safeParse({ score: 100, strengths: [], gaps: [], rationale: "" }).success).toBe(true);
  });
});

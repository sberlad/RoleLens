import { describe, it, expect } from "vitest";
import {
  countWords,
  truncateToWords,
  applyContentBudget,
  isWithinBudget,
  estimateLineCount,
  DEFAULT_BUDGET,
  type ContentBudget,
} from "@/lib/cv/budgeting";
import type { TailoredCV } from "@/lib/cv/schema";

// Fixture
function makeCv(overrides: Partial<TailoredCV> = {}): TailoredCV {
  return {
    name: "Jane Smith",
    location: "Berlin, Germany",
    workAuthorization: ["EU"],
    summary: "An experienced professional with skills in product management and strategy.",
    experience: [
      {
        title: "Product Manager",
        company: "Acme Corp",
        location: "Berlin",
        dates: "2020–2024",
        bullets: [
          "Led cross-functional teams to deliver three major product lines",
          "Grew revenue by 40% through systematic roadmap prioritization",
          "Managed stakeholder relationships across engineering, design, and sales teams",
        ],
      },
    ],
    projects: [
      {
        name: "Dashboard App",
        link: null,
        description: "Internal analytics dashboard",
        bullets: ["Built using React and TypeScript"],
      },
    ],
    skills: {
      systems: ["Linux", "macOS"],
      ai: ["GPT-4", "Claude"],
      technical: ["TypeScript", "React", "Node.js"],
    },
    education: [],
    languages: [{ language: "English", proficiency: "Native" }],
    ...overrides,
  };
}

describe("countWords", () => {
  it("counts words correctly", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("  spaced   out   words  ")).toBe(3);
    expect(countWords("")).toBe(0);
    expect(countWords("one")).toBe(1);
  });
});

describe("truncateToWords", () => {
  it("leaves short text unchanged", () => {
    expect(truncateToWords("hello world", 10)).toBe("hello world");
  });

  it("truncates and appends ellipsis", () => {
    const result = truncateToWords("one two three four five", 3);
    expect(result).toBe("one two three…");
    expect(countWords(result.replace("…", ""))).toBe(3);
  });

  it("handles exact boundary", () => {
    const result = truncateToWords("one two three", 3);
    expect(result).toBe("one two three");
  });
});

describe("applyContentBudget", () => {
  it("respects maxRoles", () => {
    const cv = makeCv({
      experience: Array.from({ length: 6 }, (_, i) => ({
        title: `Role ${i}`,
        company: "Co",
        location: "",
        dates: "",
        bullets: ["bullet"],
      })),
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxRoles: 3 };
    const result = applyContentBudget(cv, budget);
    expect(result.experience).toHaveLength(3);
  });

  it("respects maxBulletsPerRole", () => {
    const cv = makeCv({
      experience: [
        {
          title: "Dev",
          company: "Co",
          location: "",
          dates: "",
          bullets: ["a", "b", "c", "d", "e"],
        },
      ],
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxBulletsPerRole: 2 };
    const result = applyContentBudget(cv, budget);
    expect(result.experience[0].bullets).toHaveLength(2);
  });

  it("truncates bullet words", () => {
    const cv = makeCv({
      experience: [
        {
          title: "Dev",
          company: "Co",
          location: "",
          dates: "",
          bullets: ["word ".repeat(30).trim()],
        },
      ],
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxBulletWords: 5 };
    const result = applyContentBudget(cv, budget);
    const bullet = result.experience[0].bullets[0];
    expect(countWords(bullet.replace("…", ""))).toBe(5);
  });

  it("respects summaryMaxWords", () => {
    const cv = makeCv({ summary: "word ".repeat(100).trim() });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, summaryMaxWords: 10 };
    const result = applyContentBudget(cv, budget);
    expect(countWords(result.summary.replace("…", ""))).toBe(10);
  });

  it("respects maxProjects", () => {
    const cv = makeCv({
      projects: Array.from({ length: 5 }, (_, i) => ({
        name: `Project ${i}`,
        link: null,
        description: "",
        bullets: [],
      })),
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxProjects: 2 };
    const result = applyContentBudget(cv, budget);
    expect(result.projects).toHaveLength(2);
  });

  it("respects maxSkillsPerCategory", () => {
    const cv = makeCv({
      skills: {
        systems: Array.from({ length: 15 }, (_, i) => `system${i}`),
        ai: [],
        technical: [],
      },
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxSkillsPerCategory: 5 };
    const result = applyContentBudget(cv, budget);
    expect(result.skills.systems).toHaveLength(5);
  });
});

describe("isWithinBudget", () => {
  it("returns true for a well-formed CV", () => {
    const cv = makeCv();
    expect(isWithinBudget(cv, DEFAULT_BUDGET)).toBe(true);
  });

  it("returns false when summary is over word limit", () => {
    const cv = makeCv({ summary: "word ".repeat(100).trim() });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, summaryMaxWords: 10 };
    expect(isWithinBudget(cv, budget)).toBe(false);
  });

  it("returns false when too many roles", () => {
    const cv = makeCv({
      experience: Array.from({ length: 5 }, (_, i) => ({
        title: `Role ${i}`,
        company: "Co",
        location: "",
        dates: "",
        bullets: [],
      })),
    });
    const budget: ContentBudget = { ...DEFAULT_BUDGET, maxRoles: 4 };
    expect(isWithinBudget(cv, budget)).toBe(false);
  });

  it("returns true after applying budget to an oversized CV", () => {
    const cv = makeCv({
      summary: "word ".repeat(100).trim(),
      experience: Array.from({ length: 6 }, (_, i) => ({
        title: `Role ${i}`,
        company: "Co",
        location: "",
        dates: "",
        bullets: ["long ".repeat(30).trim()],
      })),
    });
    const budgeted = applyContentBudget(cv, DEFAULT_BUDGET);
    expect(isWithinBudget(budgeted, DEFAULT_BUDGET)).toBe(true);
  });
});

describe("estimateLineCount", () => {
  it("returns a positive number for any CV", () => {
    const cv = makeCv();
    expect(estimateLineCount(cv)).toBeGreaterThan(0);
  });

  it("increases with more experience roles", () => {
    const small = makeCv({ experience: [] });
    const large = makeCv({
      experience: Array.from({ length: 4 }, (_, i) => ({
        title: `Role ${i}`,
        company: "Co",
        location: "",
        dates: "",
        bullets: ["a", "b", "c"],
      })),
    });
    expect(estimateLineCount(large)).toBeGreaterThan(estimateLineCount(small));
  });
});

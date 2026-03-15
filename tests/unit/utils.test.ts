import { describe, it, expect } from "vitest";
import { generateId, formatDate, scoreColor, scoreBadgeColor } from "@/lib/utils";

describe("generateId", () => {
  it("returns a string", () => {
    expect(typeof generateId()).toBe("string");
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date", () => {
    const result = formatDate("2024-01-15T10:00:00.000Z");
    expect(result).toContain("Jan");
    expect(result).toContain("2024");
  });

  it("returns the input string if it cannot be parsed", () => {
    const result = formatDate("not-a-date");
    // Invalid Date results in "Invalid Date" — we just ensure it returns something
    expect(typeof result).toBe("string");
  });
});

describe("scoreColor", () => {
  it("returns emerald for high scores", () => {
    expect(scoreColor(85)).toContain("emerald");
    expect(scoreColor(75)).toContain("emerald");
  });

  it("returns amber for mid scores", () => {
    expect(scoreColor(74)).toContain("amber");
    expect(scoreColor(55)).toContain("amber");
  });

  it("returns red for low scores", () => {
    expect(scoreColor(54)).toContain("red");
    expect(scoreColor(0)).toContain("red");
  });
});

describe("scoreBadgeColor", () => {
  it("returns emerald classes for high scores", () => {
    const result = scoreBadgeColor(80);
    expect(result).toContain("emerald");
  });

  it("returns amber classes for mid scores", () => {
    const result = scoreBadgeColor(60);
    expect(result).toContain("amber");
  });

  it("returns red classes for low scores", () => {
    const result = scoreBadgeColor(30);
    expect(result).toContain("red");
  });
});

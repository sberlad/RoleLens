/**
 * End-to-end test for RoleLens MVP.
 *
 * Covers:
 * 1. Load seeded profile
 * 2. View and verify jobs list (seeded jobs)
 * 3. Navigate to a job analysis page
 * 4. Attempt to generate match score (mocked or skipped if no API key)
 * 5. Verify CV render page exists
 *
 * Note: AI calls require a real OPENAI_API_KEY. In CI without a key,
 * the test verifies UI structure and navigation only.
 */

import { test, expect } from "@playwright/test";

const hasApiKey = !!process.env.OPENAI_API_KEY;

test.describe("RoleLens MVP", () => {
  test("dashboard loads with seeded profile", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText(/Welcome|RoleLens/);
    // Should show profile or prompt to upload
    await expect(page.locator("body")).toContainText(/Profile|Upload/);
  });

  test("navigation links work", async ({ page }) => {
    await page.goto("/");

    // Navigate to Profile
    await page.click("text=Profile");
    await expect(page).toHaveURL(/\/profile/);
    await expect(page.locator("h1")).toContainText("Profile");

    // Navigate to Jobs
    await page.click("text=Jobs");
    await expect(page).toHaveURL(/\/jobs/);
    await expect(page.locator("h1")).toContainText("Jobs");

    // Navigate to Settings
    await page.click("text=Settings");
    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("profile page shows seeded profile data", async ({ page }) => {
    await page.goto("/profile");
    // Seeded profile has Samuel Berlad
    await expect(page.locator("body")).toContainText("Samuel");
  });

  test("jobs page shows seeded jobs", async ({ page }) => {
    await page.goto("/jobs");
    // Seeded jobs include "AI Evaluator" and "Product Operations Associate"
    await expect(page.locator("body")).toContainText(/AI Evaluator|Product Operations/);
  });

  test("job analysis page loads for seeded job", async ({ page }) => {
    await page.goto("/jobs/seed-job-001");
    await expect(page.locator("h1")).toContainText("AI Evaluator");
    await expect(page.locator('[data-testid="score-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="tailor-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="cover-letter-btn"]')).toBeVisible();
  });

  test("settings page shows security architecture info", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("body")).toContainText("OPENAI_API_KEY");
    await expect(page.locator("body")).toContainText("server-side");
    await expect(page.locator("body")).toContainText(".env.local");
  });

  test("upload page shows file upload UI", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.locator("h1")).toContainText("Upload CV");
    await expect(page.locator("body")).toContainText("PDF");
    await expect(page.locator("body")).toContainText("DOCX");
  });

  // AI-dependent tests — only run when API key is available
  test.describe("AI-powered features", () => {
    test.skip(!hasApiKey, "Skipped: no OPENAI_API_KEY set");

    test("score match generates analysis", async ({ page }) => {
      test.setTimeout(60000);

      await page.goto("/jobs/seed-job-001");
      await page.click('[data-testid="score-btn"]');

      // Wait for score card to appear
      await expect(page.locator('[data-testid="match-score-card"]')).toBeVisible({
        timeout: 45000,
      });
      await expect(page.locator("body")).toContainText(/%/);
    });

    test("generate tailored CV and view render", async ({ page }) => {
      test.setTimeout(90000);

      await page.goto("/jobs/seed-job-001");
      await page.click('[data-testid="tailor-btn"]');

      // Wait for the view CV button to appear
      await expect(page.locator('[data-testid="view-cv-btn"]')).toBeVisible({
        timeout: 60000,
      });

      // Navigate to tailored CV
      await page.click('[data-testid="view-cv-btn"]');
      await expect(page).toHaveURL(/\/cv\/seed-job-001/);
      await expect(page.locator('[data-testid="cv-page"]')).toBeVisible();
      await expect(page.locator("body")).toContainText("Samuel");
    });

    test("generate cover letter", async ({ page }) => {
      test.setTimeout(60000);

      await page.goto("/jobs/seed-job-001");
      await page.click('[data-testid="cover-letter-btn"]');

      // Wait for cover letter card
      await expect(page.locator('[data-testid="cover-letter-card"]')).toBeVisible({
        timeout: 45000,
      });
    });
  });
});

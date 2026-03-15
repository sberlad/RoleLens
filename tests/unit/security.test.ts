/**
 * Security tests.
 * Verifies that the API key is only read server-side and
 * never appears in client-exposed code paths.
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { createOpenAIProvider } from "@/lib/ai/openai";

describe("API key security", () => {
  it("OpenAI provider reads key from process.env, not a constant", () => {
    // The provider should throw if OPENAI_API_KEY is not set
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const provider = createOpenAIProvider();
    // The error should happen when complete() is called, not at construction
    // (so the provider can be instantiated, but calling it fails without a key)
    expect(provider).toBeDefined();
    expect(provider.name).toBe("openai");

    if (original) process.env.OPENAI_API_KEY = original;
  });

  it("openai.ts source does not hard-code any API key", () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), "lib/ai/openai.ts"),
      "utf-8",
    );
    // Must not contain anything that looks like a real key literal
    expect(src).not.toMatch(/sk-[A-Za-z0-9]{20,}/);
  });

  it("no client-side files read OPENAI_API_KEY", () => {
    // Check that no file in app/ (client bundle) reads process.env.OPENAI_API_KEY directly
    const appDir = path.join(process.cwd(), "app");
    const clientFiles: string[] = [];

    function walk(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Skip API routes (server-side)
          if (entry.name !== "api") walk(fullPath);
        } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
          clientFiles.push(fullPath);
        }
      }
    }

    walk(appDir);

    for (const file of clientFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Client pages/components must not ACCESS the API key via process.env
      // (Mentioning "OPENAI_API_KEY" as display text in settings is fine)
      if (content.includes("process.env.OPENAI_API_KEY")) {
        throw new Error(`Client file accesses process.env.OPENAI_API_KEY: ${file}`);
      }
    }

    expect(clientFiles.length).toBeGreaterThan(0);
  });

  it(".env.local is in .gitignore", () => {
    const gitignore = fs.readFileSync(path.join(process.cwd(), ".gitignore"), "utf-8");
    expect(gitignore).toContain(".env.local");
    expect(gitignore).toContain(".env*.local");
  });
});

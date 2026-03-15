# RoleLens

**AI-assisted job discovery, CV tailoring, and application intelligence platform.**

RoleLens helps you understand how well your background fits a specific role, generate a tailored one-page CV, and write a cover letter — all without fabricating experience or making claims that aren't in your profile.

---

## Product Overview

RoleLens is a local-first web application that runs entirely on your machine. You upload your CV once, add job descriptions as you find them, and then use AI to:

- **Understand fit** — score how well your background matches a role, with specific strengths and gaps
- **Tailor your CV** — generate a reframed one-page CV that emphasizes the most relevant parts of your actual experience
- **Write a cover letter** — produce a concise, role-specific letter (150–220 words) grounded in your real background
- **Export cleanly** — print a CV to PDF directly from the browser with clean, ATS-friendly formatting

This is not an auto-apply bot. It is a judgment-assistance and tailoring tool.

---

## MVP Scope

| Feature | Status |
|---------|--------|
| CV upload (PDF + DOCX) | ✅ |
| AI-powered CV parsing | ✅ |
| Profile review + manual editing | ✅ |
| Job description management | ✅ |
| Match scoring (0–100 with rationale) | ✅ |
| Tailored CV generation (content-budgeted) | ✅ |
| Cover letter generation | ✅ |
| Print-to-PDF CV rendering | ✅ |
| Local JSON persistence | ✅ |
| Seed data (Samuel Berlad profile + 2 jobs) | ✅ |
| Provider abstraction layer | ✅ |
| Unit tests (41 tests) | ✅ |
| E2E tests (Playwright) | ✅ |
| Security: API key server-side only | ✅ |

---

## Architecture

```
rolelens/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Dashboard
│   ├── upload/page.tsx         # CV upload
│   ├── profile/page.tsx        # Profile review + edit
│   ├── jobs/page.tsx           # Jobs list + add form
│   ├── jobs/[id]/page.tsx      # Job analysis (score, tailor, letter)
│   ├── cv/[jobId]/page.tsx     # Tailored CV render + print
│   ├── settings/page.tsx       # Provider config (server-side explanation)
│   └── api/
│       ├── cv/upload/          # POST: parse uploaded CV file
│       ├── cv/profile/         # GET/PUT/DELETE: profile storage
│       ├── jobs/               # GET/POST: job list
│       ├── jobs/[id]/          # GET/PUT/DELETE: single job
│       ├── jobs/[id]/score/    # POST: generate match score
│       ├── jobs/[id]/tailor/   # POST/GET: tailored CV
│       └── jobs/[id]/cover-letter/ # POST/GET: cover letter
│
├── components/
│   ├── layout/NavBar.tsx
│   ├── cv/ProfileEditor.tsx    # Editable profile form
│   ├── cv/CVRenderer.tsx       # Print-friendly CV template
│   ├── jobs/JobsManager.tsx    # Job list + add form
│   ├── jobs/JobAnalysis.tsx    # Per-job analysis UI
│   └── ui/                     # Spinner, ErrorMessage, SuccessMessage
│
├── lib/
│   ├── ai/
│   │   ├── provider.ts         # Abstract AIProvider interface
│   │   ├── openai.ts           # OpenAI implementation
│   │   ├── index.ts            # Provider initialization
│   │   └── prompts/
│   │       ├── parse-cv.ts     # CV → structured JSON
│   │       ├── score-match.ts  # Profile × Job → match score
│   │       ├── tailor-cv.ts    # Profile × Job → tailored CV
│   │       └── cover-letter.ts # Profile × Job → cover letter
│   │
│   ├── cv/
│   │   ├── schema.ts           # Zod schemas for CVProfile, TailoredCV
│   │   └── budgeting.ts        # Content budget enforcement (one-page rules)
│   │
│   ├── jobs/
│   │   └── schema.ts           # Zod schemas for Job, MatchScore
│   │
│   ├── parsing/
│   │   ├── index.ts            # File type detection + dispatch
│   │   ├── pdf.ts              # pdf-parse wrapper
│   │   └── docx.ts             # mammoth wrapper
│   │
│   ├── storage/
│   │   └── local.ts            # JSON file persistence (./data/)
│   │
│   └── utils.ts                # cn(), generateId(), formatDate(), score colors
│
├── data/
│   ├── seed-profile.json       # Samuel Berlad seed profile (always available)
│   └── seed-jobs.json          # 2 seed jobs: AI Evaluator, Product Ops
│
└── tests/
    ├── unit/
    │   ├── budgeting.test.ts   # Content budget logic (16 tests)
    │   ├── schema.test.ts      # Zod validation (11 tests)
    │   ├── utils.test.ts       # Utility functions (10 tests)
    │   └── security.test.ts    # API key security checks (4 tests)
    └── e2e/
        └── rolelens.spec.ts    # Playwright E2E (navigation + AI-gated tests)
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+
- An OpenAI API key

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd rolelens

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

The app immediately works with seed data — no upload required to explore the UI.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | **Yes** | — | Your OpenAI API key. **Server-side only. Never exposed to browser.** |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | Override the model. Use `gpt-4o` for higher quality. |
| `DATA_DIR` | No | `./data` | Directory for local JSON persistence. |

**Never commit `.env.local`.** It is in `.gitignore`.

---

## Running the App

```bash
# Development
npm run dev           # starts on http://localhost:3000

# Production build
npm run build
npm start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

---

## Running Tests

```bash
# Unit tests (41 tests — no API key required)
npm test

# Unit tests in watch mode
npm run test:watch

# E2E tests (requires running dev server)
# Navigation tests run without API key
# AI feature tests are auto-skipped without OPENAI_API_KEY
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

The unit tests cover:
- Content budgeting logic (word limits, role/bullet counts)
- Zod schema validation
- Utility functions
- Security: verifies API key is server-side only, `.gitignore` contains `.env.local`

---

## Local Persistence

All data is stored as plain JSON files in `./data/`:

| File | Contents |
|------|----------|
| `data/seed-profile.json` | Seed profile (Samuel Berlad) — always available, committed to git |
| `data/seed-jobs.json` | Seed jobs (AI Evaluator, Product Ops) — committed to git |
| `data/profile.json` | Your uploaded/edited profile — takes precedence over seed, gitignored |
| `data/jobs.json` | Your saved jobs — takes precedence over seed, gitignored |
| `data/output-{jobId}.json` | Generated tailored CVs and cover letters |

The app falls back to seed data automatically when no user data exists.
User-created files are gitignored to avoid accidentally committing personal data.

---

## Security

### API Key Architecture

```
Browser  →  Next.js API Route (server)  →  OpenAI API
                      ↑
              process.env.OPENAI_API_KEY
              (read here only, never sent to browser)
```

**Guarantees:**
- `OPENAI_API_KEY` is read exclusively in server-side API routes
- No client component or page reads `process.env.OPENAI_API_KEY`
- The key is never returned in any API response
- The key is never stored in `localStorage`, `sessionStorage`, or any browser storage
- `.env.local` is in `.gitignore` and `.env.example` contains only placeholder values
- A dedicated security test (`tests/unit/security.test.ts`) verifies these properties on every test run

---

## Provider Abstraction

Adding Anthropic Claude (or any other provider) requires minimal work:

```typescript
// lib/ai/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatMessage, CompletionOptions, CompletionResult } from "./provider";

export class AnthropicProvider implements AIProvider {
  name = "anthropic";

  async complete(messages: ChatMessage[], options: CompletionOptions = {}): Promise<CompletionResult> {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // ... map messages, call API, return CompletionResult
  }
}
```

Then in `lib/ai/index.ts`:
```typescript
import { setProvider } from "./provider";
import { AnthropicProvider } from "./anthropic";

setProvider(new AnthropicProvider());
```

No other code changes needed. All prompt modules, API routes, and application logic depend only on the `AIProvider` interface.

---

## Future Roadmap

### Short Term
- LinkedIn / job board URL scraping (auto-fill job descriptions)
- Multiple saved profiles (for career pivots or freelance vs. full-time)
- Export to `.docx` format
- Dark mode

### Medium Term
- Secure provider management UI (encrypted key storage, provider switching)
- Anthropic Claude provider implementation
- Job tracking (stages: applied, interviewing, offer, rejected)
- Application history and analytics

### Long Term
- Multi-user support with authentication
- Webhook integrations for job alerts
- Interview prep module (practice questions based on job + profile gaps)
- ATS simulation scoring

---

## Design Principles

The UI is intentionally minimal. No AI-product visual gimmicks, no glowing effects, no animated gradients. The tool should feel like a well-made professional instrument — calm, fast, and trust-inspiring.

Typography hierarchy, generous whitespace, and a restrained neutral palette are the primary design tools. The CV renderer uses a serif font and clean section dividers specifically for print quality.

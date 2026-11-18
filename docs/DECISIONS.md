# Architecture Decision Records

## ADR-001: Phase 1 Scaffold Decisions

**Date:** 2026-11-18  
**Status:** Accepted  
**Deciders:** SaafSaans Team

---

### Context

Phase 1 establishes the foundational scaffold for SaafSaans, a GenAI-powered winter-smog assistant. All tooling, linting, testing, and CI decisions made here will govern the entire project lifecycle.

---

### Decisions

#### Framework: Next.js 16 App Router

**Decision:** Use Next.js 16 with the App Router (not Pages Router).  
**Rationale:** App Router enables React Server Components by default, reducing client bundle size. Layouts, loading, and error boundaries are co-located with routes. `--turbo` flag for Turbopack gives faster dev experience.

---

#### Language: TypeScript with strict settings

**Decision:** `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`.  
**Rationale:** These catch entire classes of null-pointer and index-out-of-bounds bugs at compile time. The overhead in authoring is offset by elimination of runtime surprises in production air-quality data processing.

---

#### Styling: Tailwind CSS v4

**Decision:** Tailwind CSS 4 with PostCSS.  
**Rationale:** Tailwind 4 uses `@import "tailwindcss"` syntax (no config file needed by default). Utility-first CSS keeps component files self-contained and eliminates stylesheet churn.

---

#### Testing: Vitest + Testing Library + Playwright

**Decision:** Vitest for unit/integration, Playwright + axe-core for E2E and accessibility testing.  
**Rationale:** Vitest shares the Vite toolchain with Next.js dev, giving fast watch mode. Playwright is the gold standard for browser-based E2E. axe-core enforces WCAG 2.1 AA accessibility in automated tests.

---

#### Coverage Thresholds

**Decision:** Overall ≥ 90%; domain layer ≥ 95%.  
**Rationale:** Domain logic (AQI calculations, exposure models) is pure TypeScript with no IO side effects, making 95%+ coverage achievable. Higher thresholds here give the most safety per test written.

---

#### Linting: ESLint 10 flat config

**Decision:** ESLint 10 with flat config (`eslint.config.mjs`), `typescript-eslint` strict preset.  
**Rationale:** ESLint 10 is the first version where flat config is the default. `typescript-eslint` strict-type-checked provides stronger checks than base rules alone.

**Key budget rules:**

- `max-lines: 200` — keeps files focused and reviewable
- `complexity: 8` — forces decomposition of complex branching logic
- `max-depth: 3` — prevents deeply nested callback pyramids
- `max-params: 4` — encourages data objects over long argument lists
- `no-console: error` — all logging goes through `src/server/logger.ts`
- `import/no-default-export` — enforced everywhere except Next.js-required files

---

#### No Default Exports Policy

**Decision:** Default exports banned except in Next.js-required files (layout, page, error, route handlers, config files).  
**Rationale:** Named exports make auto-import, refactoring, and tree-shaking deterministic. Default exports allow renaming on import, leading to inconsistency.

---

#### Branded Types for Domain Primitives

**Decision:** Use TypeScript branded types for `AqiIndex`, `Pm25UgM3`.  
**Rationale:** Prevents unit confusion bugs (passing raw PM2.5 where AQI is expected, or µg/m³ where ppb is expected). Zero runtime cost—brands are type-only.

---

#### Named Constants with Units

**Decision:** All constants include units in their names (e.g., `WHO_PM25_24H_GUIDELINE_UG_M3`, not `WHO_GUIDELINE`).  
**Rationale:** Eliminates documentation lookups at usage sites and prevents unit mismatch bugs.

---

#### Environment Validation

**Decision:** Validate `process.env` with Zod at startup in `src/server/env.ts`.  
**Rationale:** Fail fast with a clear message if required env vars are missing or malformed. The exported `isAiEnabled` flag allows graceful degradation to rule-based mode when no API key is configured.

---

#### AI Graceful Degradation

**Decision:** App operates in two modes — "ai" (Gemini API key present) and "rule-based" (no key).  
**Rationale:** Hackathon demo must work without API key for judges who cannot configure secrets. The `/api/health` endpoint exposes the current mode.

---

#### Repo Size Limits

**Decision:** Tracked files ≤ 5 MB; `.git` directory ≤ 8 MB.  
**Rationale:** Prevents accidental large binary or model file commits. Enforced via `scripts/check-repo-size.mjs` in CI.

---

### Consequences

- Developers must use `logger` from `src/server/logger.ts` for all logging.
- All new domain types should be branded primitives.
- All constants must include their units in the name.
- Files exceeding 200 lines must be refactored before merging.
- Functions exceeding complexity 8 must be decomposed.

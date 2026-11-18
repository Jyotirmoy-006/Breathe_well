# Architecture Decision Records (ADRs)

This document records the architectural and design decisions made throughout the development of **SaafSaans (साफ़ साँस)** across Phases 1 through 8.

---

## ADR-001: Next.js 16 App Router & Strict Tooling Scaffolding (Phase 1)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Phase 1 established the foundation for a resilient, performant web application addressing winter smog in India. Tooling and budget rules established here govern all subsequent phases.

### Decisions

1. **Next.js 16 with App Router:** Leverage React Server Components (RSC) to minimize client-side JavaScript bundle sizes and maximize performance.
2. **Strict TypeScript:** Enforce `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, and branded primitive types.
3. **Strict Code Quality Budgets in ESLint 10:**
   - Functions $\le$ 40 lines
   - Cyclomatic complexity $\le$ 8
   - Nesting depth $\le$ 3
   - Max parameters $\le$ 4
   - File length $\le$ 200 lines (300 for tests)
   - Zero console statements outside `src/server/logger.ts`
   - Banned default exports except where Next.js framework requires them.
4. **Testing Suite:** Vitest for lightning-fast unit tests with v8 coverage, and Playwright with axe-core for end-to-end browser automation.

---

## ADR-002: Pure Deterministic Domain Engine & Branded Types (Phase 2)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Air quality metrics, piecewise linear sub-indices, and exposure reduction calculations are safety-critical. Inaccurate numbers or hallucinations could lead users to exercise during hazardous air episodes.

### Decisions

1. **Separation of Concerns:** The domain layer (`src/domain/`) is strictly pure TypeScript with zero side-effects, zero network calls, and 100% test coverage.
2. **Branded Types:** Created `AqiIndex`, `Pm25UgM3`, `KgCo2e`, and `Percentage` branded types to make accidental unit mixing a compile-time error.
3. **CPCB Breakpoints Standard:** Implement piecewise linear interpolation strictly according to the Central Pollution Control Board (CPCB) National Air Quality Index technical manual.
4. **Multiplicative Non-Double-Counting Model:** Adopt $R = 1 - \prod (1 - r_i)$ with an 85% physical ceiling to prevent misleading additive inflation of filtration claims.

---

## ADR-003: Server Layer Security, SSRF Allowlisting, & Gemini SDK (Phase 3)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

The application consumes external meteorological data and interfaces with Google Gemini. It must remain secure against SSRF, prompt injection, and unexpected API outages.

### Decisions

1. **SSRF Host Allowlist:** All outbound server fetches must pass through an allowlist validator (`src/server/security/fetchAllowlist.ts`) permitting only Open-Meteo and Google Generative AI endpoints.
2. **In-Memory IP Rate Limiting:** Enforce sliding-window rate limiters across all API routes to safeguard server resources and external quotas.
3. **Gemini SDK with Resilient Fallback:** Wrap `@google/genai` calls with an 8-second timeout, a single exponential backoff retry on transient 429/503 errors, and automatic fallback to rule-based generation when the API key is absent or invalid.
4. **Zero Number Hallucination Directive:** Gemini prompts are instructed with strict negative constraints ("ZERO NUMBERS") and JSON schema validation, ensuring the LLM only generates empathetic qualitative narratives.

---

## ADR-004: Atmosphere Journal Editorial Design System (Phase 4 & 5)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Standard weather dashboards are visually cluttered, relying on heavy third-party charting libraries that bloat bundles and complicate accessibility.

### Decisions

1. **Atmosphere Journal Theme:** Adopt a clean, editorial broadsheet aesthetic utilizing an off-white paper texture (`#FBF9F5`), deep forest green (`#1A5341`), mint teal (`#2DD4BF`), and elegant serif typography.
2. **Zero External Charting Libraries:** Implement the 48-hour forecast area chart and AQI dial using hand-crafted, accessible inline SVG components with gradient fills and timeline scrubbing.
3. **Interactive Visual Smog Skyline:** Render a 4-layer parallax skyline whose haze opacity dynamically interpolates between 0.10 and 0.85 based on PM2.5 levels.
4. **One-Page Printable Family Air Plan:** Provide a dedicated `@media print` cheat-sheet formatted specifically for physical display on family refrigerator doors.

---

## ADR-005: Automated Accessibility Auditing & WCAG 2.1 AA Compliance (Phase 6)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Public health tools must be fully usable by individuals with visual impairments, motor challenges, or sensory sensitivities.

### Decisions

1. **Automated axe-core Audits:** Integrate `axe-core` in Vitest to run programmatic accessibility audits against every core feature across all AQI tiers and color themes, requiring zero violations.
2. **Screen-Reader & Keyboard Accessibility:** Ensure all interactive elements have explicit accessible labels, logical heading hierarchies (`h1` $\to$ `h2` $\to$ `h3`), tab panels with roving `aria-selected` attributes, and `aria-live="polite"` regions for asynchronous updates.
3. **Motion Preferences:** Honor `prefers-reduced-motion` across canvas particle simulations and CSS transitions.

---

## ADR-006: Grounded Follow-up Streaming Q&A & Medical Guardrail (Phase 8)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Users frequently have follow-up questions about their generated plan (e.g., child outdoor play or DIY filter cleaning), but must never receive unvalidated medical or pharmaceutical advice.

### Decisions

1. **Deterministic Medical Guardrail:** Questions containing medical, clinical, or pharmaceutical keywords (e.g., dosage, cetirizine, diagnosis) are intercepted deterministically and returned with a standard clinical referral message without invoking the LLM.
2. **Strict Grounding:** Gemini prompts strictly isolate user input within delimiters and instruct the model to cite only facts present in the provided action plan and official CPCB guidelines.
3. **Streaming Text Protocol:** Return a Web standard `ReadableStream<Uint8Array>` via Next.js App Router for low-latency token rendering in an accessible `aria-live` container.

---

## ADR-007: Production Hardening, Edge Routing, & Smoke Verification (Phase 7)

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Final deployment requires low latency for users in India, robust caching headers, and automated smoke test validation.

### Decisions

1. **Mumbai Region (`bom1`):** Configure `vercel.json` to route serverless functions to the Mumbai AWS/GCP edge (`bom1`), cutting round-trip latency across South Asia.
2. **Cache Headers:** Configure `s-maxage=600, stale-while-revalidate=120` for air quality endpoints to shield upstream providers while serving fast cached responses.
3. **Automated Smoke Test Script:** Create `scripts/smoke.mjs` verifying status codes, JSON response schemas, and strict security headers (`CSP`, `nosniff`, `DENY`) against any deployed URL.
4. **Repository Size Guard:** Maintain an automated check ensuring tracked repository assets remain below 5 MB.

---

## ADR-008: Hardening Pass — Live Model Pinning, PostCSS, and Axe-Core E2E

- **Date:** 2026-11-18
- **Status:** Accepted
- **Deciders:** SaafSaans Team

### Context

Prior to publication, production builds must be verified with active API keys, real browser engines, and rigorous accessibility assertions.

### Decisions

1. **Gemini Model Selection:** Verified live Google Generative AI endpoints; deprecated `gemini-2.0-flash` and `gemini-2.5-flash` replaced with `gemini-3-flash-preview` using `apiVersion: 'v1beta'`.
2. **PostCSS with Tailwind v4:** Integrated `@tailwindcss/postcss` and `postcss.config.mjs` ensuring atomic utility classes compile into the production bundle.
3. **WCAG 2.1 AA Contrast Enforcement:** Updated secondary and muted text across all UI elements (`HeroVerdict`, `AqiDial`, `ImpactExposureMeter`, `JournalFooter`, `ModelExplanationDrawer`) from `text-stone-500` to `text-stone-600 dark:text-stone-400` ensuring contrast ratios exceed 5.5:1 against the `#FAF6EE` paper background.
4. **Real-Browser Axe-Core Auditing:** Automated `@axe-core/playwright` across desktop and mobile viewports, auditing light and night themes, modal drawers, and all interactive controls with zero violations.
5. **Opt-in Live Smoke Script:** Added `scripts/smoke-live.mjs` (`npm run smoke:live`) for opt-in verification of live Gemini response schema validation, streaming tokens, and deterministic medical guardrails without compromising CI safety.

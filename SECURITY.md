# SaafSaans Security & Threat Model

This document outlines the security architecture, threat model, and defense-in-depth mitigations for SaafSaans (साफ़ साँस).

---

## 1. Threat Modeling Overview

SaafSaans processes environmental air quality data, user living conditions, and generative AI recommendations. The threat model focuses on mitigating:

1. **Server-Side Request Forgery (SSRF)**: Malicious manipulation of outbound HTTP queries.
2. **Denial of Service & Wallet Draining (DoS)**: High-frequency requests exhausting external API quotas or compute.
3. **Prompt Injection & Model Manipulation**: Hostile user input altering LLM behavior or extracting system instructions.
4. **Data Exfiltration & Secret Leakage**: Accidental leakage of Gemini API keys or internal infrastructure details.
5. **Privacy Violations**: Unintended logging or persistent storage of user coordinates and health vulnerability attributes.

---

## 2. Core Security Mitigations

### 2.1 Zero Client Secrets

- All external API keys (`GEMINI_API_KEY`) reside exclusively in server-side environment variables (`process.env`).
- Environment variables are parsed and validated at boot using Zod (`src/server/env.ts`).
- No API keys or tokens are ever bundled into client JavaScript bundles or serialized into Next.js props.

### 2.2 Strict Input Validation with Zod

- Every public API route validates query parameters and request bodies with strict Zod schemas:
  - Latitude: `[-90, 90]`
  - Longitude: `[-180, 180]`
  - Search query strings: `[2, 100]` characters, trimmed and non-printable characters removed.
  - Plan generation payload: strongly-typed `UserProfile` schema preventing prototype pollution and extra attributes.
- Malformed or unexpected inputs are rejected immediately with HTTP 400 Bad Request before hitting providers or AI.

### 2.3 IP-Based In-Memory Rate Limiting

- Endpoints are rate-limited per client IP:
  - Geocoding and Air Quality routes: `30 requests / minute`
  - AI Plan generation route: `10 requests / minute`
- Exceeding the threshold returns HTTP 429 Too Many Requests with a `Retry-After` header.
- Sliding window records automatically prune stale entries to prevent memory exhaustion attacks.

### 2.4 Outbound Fetch Allowlisting & SSRF Protection

- Outbound network requests are routed exclusively through `fetchWithAllowlist`:
  - Enforces strict destination domain matching (`*.open-meteo.com` and `generativelanguage.googleapis.com`).
  - Prohibits custom protocols, credentials in URLs, and internal IP ranges (e.g. `127.0.0.1`, `169.254.169.254`).
  - Enforces an 8-second request timeout using `AbortSignal`.
  - Caps response payloads at 1 MB to thwart decompression bombs and buffer overflow attacks.

### 2.5 Prompt Injection & Delimiter Isolation

- User input embedded into LLM prompts is rigorously sanitized:
  - Strips zero-width characters, non-printable ASCII, and unicode bidirectional overrides (`\u202A-\u202E`).
  - Neutralizes prompt delimiter markers (`<<<` and `>>>`).
  - Scans for hostile jailbreak signatures ("ignore previous instructions", "system override", script tags).
  - Delimiter isolation encloses system instructions, data, and user attributes in distinct, tamper-evident sections.
  - LLM outputs are validated against a strict Zod schema (`validateAiResponse`). If malformed or violating schema, the system falls back to the deterministic, zero-hallucination baseline.

### 2.6 Hardened HTTP Security Headers

- All HTTP responses include production-grade security headers:
  - `Content-Security-Policy`: Disallows unauthorized origins and forbids framing.
  - `Strict-Transport-Security`: Enforces HTTPS with preload.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing.
  - `X-Frame-Options: DENY`: Blocks clickjacking.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes referrer leakage.
  - `Permissions-Policy: geolocation=(self)`: Limits browser capability access.

### 2.7 Privacy Principles & Zero Persistence

- SaafSaans does not log, store, or track user GPS coordinates, home dwelling specifics, or health conditions.
- Coordinate queries are processed ephemerally to fetch atmospheric readings.
- Structured logger (`src/server/logger.ts`) sanitizes contextual log objects to prevent logging Personally Identifiable Information (PII).

# DIREKT AI Provider Foundation

**Governing issue:** #264  
**Parent integration programme:** #261  
**Status:** AI0 — provider-neutral foundation implemented and gated; provider canaries proven; DIREKT runtime binding not active

## Purpose

DIREKT may use AI to assist users and operators without transferring trust, verification, commercial or legal authority to a model provider.

Approved assistive uses include:

- search/query expansion and category-intent assistance;
- enquiry/support drafting and summarization;
- translation/language assistance;
- synthetic/non-sensitive document extraction suggestions for human review;
- operations case summarization, duplicate/anomaly hints and triage assistance.

AI must never independently:

- verify a provider or professional;
- alter trust/ranking/publication state;
- approve, capture, release, refund or reconcile payments/escrow;
- decide disputes/complaints;
- override consent, eligibility, authorization or audit rules;
- act as a regulator/legal authority.

## Architecture

```text
Android / Web / Operations
          |
          v
DIREKT API / BFF
          |
          v
AiProvider interface
  |-- GeminiProvider
  |-- GroqProvider (fallback)
  |-- OpenRouterFreeProvider (optional dev/emergency candidate)
  `-- OllamaProvider (local/dev only)
          |
          v
Sanitized assistive result
          |
          v
Human/backend-authoritative workflow
```

No AI provider key enters Android, browser bundles or public environment variables.

## Provider direction and evidence

### Gemini

Primary development/synthetic provider. A Gemini Developer API auth key is stored server-side in Secret Manager for bounded synthetic use. Production direction should prefer Vertex AI / Google Cloud IAM through the Cloud Run service account if later approved so long-lived application API keys are not required.

Evidence:

- synthetic canary: HTTP `200` → `DIREKT_AI_OK`;
- Secret Manager: `direkt-gemini-dev-api-key`, version `1`, enabled;
- runtime binding: **not active**;
- free-tier/external-data boundary: synthetic/non-sensitive only.

### Groq

Hosted open-weight model fallback. Use only through server-side API credentials, explicit model allowlist, timeout/rate-limit handling and the same sanitization/authority rules.

Evidence:

- synthetic canary: HTTP `200` → `DIREKT_GROQ_OK`;
- Secret Manager: `direkt-groq-dev-api-key`, version `1`, enabled;
- runtime binding: **not active**;
- external-data boundary: synthetic/non-sensitive only.

### OpenRouter free router

Low-volume development/emergency fallback candidate only. Free model availability and routing can change, so it is not an authoritative production dependency and is not currently provisioned as a DIREKT runtime dependency.

### Ollama

No-key local/offline development fallback. Not a default Cloud Run production dependency.

## Implemented backend contract

AI0 adds a provider-neutral NestJS boundary with:

- `AiProviderPort` abstraction;
- Gemini primary adapter;
- Groq fallback adapter;
- disabled provider adapter / fail-closed default;
- bounded request timeout and input size;
- fallback only on normalized provider-unavailable failures;
- synthetic-only data-classification enforcement before provider calls;
- explicit prompt-level authority boundary reinforced by backend trust rules;
- tests for primary success, fallback, provider failure normalization, non-synthetic rejection and bounded input.

The implementation is intentionally not a public/general-purpose AI endpoint and does not make model output authoritative state.

## Environment contract

Server-only configuration:

```text
AI_PROVIDER_MODE=disabled|gemini
AI_FALLBACK_PROVIDER=disabled|groq
AI_GEMINI_MODEL=<approved Gemini model>
AI_GROQ_MODEL=<approved Groq/open model>
AI_REQUEST_TIMEOUT_MS=<bounded value>
AI_MAX_INPUT_CHARS=<bounded value>
AI_GEMINI_API_KEY=<Secret Manager / protected local env only>
AI_GROQ_API_KEY=<Secret Manager / protected local env only>
```

Rules:

- AI defaults to `disabled`;
- provider activation currently permits only `DIREKT_DATA_MODE=synthetic-only`;
- controlled-pilot and production data modes require AI to remain disabled until separately approved;
- missing required credentials fail environment validation;
- browser/Android clients never receive provider credentials.

## Required controls retained

- server-only provider interface;
- explicit provider/model allowlist;
- Secret Manager for API-key providers;
- bounded timeout and failover; disabled mode remains the kill switch;
- input minimization/redaction before external calls;
- no raw identity/evidence documents, phone/email, access tokens, private coordinates or payment credentials on free-tier/external providers;
- model output treated as untrusted input and revalidated by DIREKT;
- audit/telemetry must not persist unnecessary prompt content;
- no AI authority over verification, trust/ranking/publication, payments/escrow, disputes, consent or authorization.

## AI0 closure evidence

1. Gemini development credential provisioned and stored — **PASS**.
2. Synthetic/non-sensitive Gemini canary — **PASS**, HTTP `200`, `DIREKT_AI_OK`.
3. Hosted open-model fallback provisioned — **PASS**, Groq.
4. Synthetic Groq fallback canary — **PASS**, HTTP `200`, `DIREKT_GROQ_OK`.
5. Provider-neutral backend contract and tests — **PASS**.
6. AI secrets remain server-only and AI authority is explicitly constrained — **PASS**.
7. `LIVE_INTEGRATION_LEDGER.md` and `CURRENT_INTEGRATION_STATUS.md` reconciled — **PASS**.
8. Exact-head repository regression gates must remain green before merge — **REQUIRED FOR PROMOTION**.

AI0 closure does not claim active Cloud Run AI usage or production AI authorization. A later approved runtime/use-case checkpoint may bind provider credentials only after privacy/data-use requirements for that use case are satisfied.

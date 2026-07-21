# DIREKT AI Provider Foundation

**Governing issue:** #264  
**Parent integration programme:** #261  
**Status:** AI0 — provider-neutral foundation and synthetic-only activation

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
  |-- GroqProvider (fallback candidate)
  |-- OpenRouterFreeProvider (dev/emergency candidate)
  `-- OllamaProvider (local/dev only)
          |
          v
Sanitized structured result
          |
          v
Human/backend-authoritative workflow
```

No AI provider key enters Android, browser bundles or public environment variables.

## Provider direction

### Gemini

Primary development/synthetic provider. A Gemini Developer API auth key may be stored in Secret Manager for bounded synthetic canaries. Production direction should prefer Vertex AI / Google Cloud IAM through the Cloud Run service account so long-lived application API keys are not required.

Free-tier Gemini prompts must be synthetic/non-sensitive until data-use/privacy terms are approved for real participant data.

### Groq

Hosted open-weight model fallback candidate. Use only through server-side API credentials, explicit model allowlist, timeout/rate-limit handling and the same sanitization/authority rules.

### OpenRouter free router

Low-volume development/emergency fallback only. Free model availability and routing can change, so it is not an authoritative production dependency.

### Ollama

No-key local/offline development fallback. Not a default Cloud Run production dependency.

## Required controls

- server-only `AiProvider` interface;
- explicit provider/model allowlist;
- Secret Manager for API-key providers;
- timeout, retry/backoff, circuit breaker and kill switch;
- input minimization/redaction before external calls;
- no raw identity/evidence documents, phone/email, access tokens, private coordinates or payment credentials on free-tier providers;
- structured outputs where downstream automation consumes model results;
- model output treated as untrusted input and revalidated by DIREKT;
- audit metadata records provider/model/task/version without persisting unnecessary prompt content;
- synthetic managed canaries and authority/privacy negative tests.

## Initial environment contract

Suggested server-only values:

```text
AI_PROVIDER=disabled|gemini|groq|openrouter
AI_FALLBACK_PROVIDER=disabled|groq|openrouter
AI_MODEL_PRIMARY=gemini-3.5-flash
AI_MODEL_FALLBACK=<approved model id>
AI_TIMEOUT_MS=<bounded value>
AI_ENABLED=false
GEMINI_API_KEY=<Secret Manager only for Developer API path>
GROQ_API_KEY=<Secret Manager only if provisioned>
OPENROUTER_API_KEY=<Secret Manager only if provisioned>
```

Production startup must fail closed if an enabled provider requires credentials/configuration that are absent.

## AI0 closure

1. Provision/store Gemini development auth key or choose Vertex AI ADC path.
2. Verify one synthetic/non-sensitive Gemini canary.
3. Provision one open-model fallback candidate and verify a synthetic canary.
4. Implement provider-neutral backend contract and tests.
5. Prove no AI secret/client leak and no authority escalation.
6. Update `LIVE_INTEGRATION_LEDGER.md` and `CURRENT_INTEGRATION_STATUS.md`.
7. Pass exact-head regression gates before promotion.

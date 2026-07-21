# DIREKT AI Product Architecture

**Status:** Authoritative architecture direction for AI-assisted features  
**Applies to:** Android, customer/provider web/PWA, operations portal, backend services, analytics and agent-assisted development  
**Parent plan:** `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`

## 1. Purpose

Define how DIREKT can become AI-native across discovery, provider onboarding, verification assistance, operations, support and product intelligence without allowing probabilistic models to become the authority for identity, verification, authorization, payments, legal conclusions or other consequential decisions.

The architecture is deliberately provider-neutral. No single model vendor, SDK or agent framework is part of the domain model.

## 2. Core principle

AI may interpret, summarize, classify, suggest, extract, rank within approved bounds and draft.

AI may not silently authorize, publish trust claims, move money, expose private evidence, bypass server-side scope, decide legal status or replace required human review.

## 3. Authority hierarchy

From highest to lowest authority:

1. server-side authorization and role scope;
2. deterministic trust/publication/privacy/payment rules;
3. canonical persisted domain state;
4. approved registry/provider responses where applicable;
5. human reviewer decisions and audited overrides within policy;
6. AI-derived suggestions/signals/summaries;
7. client presentation.

An AI output never moves upward in this hierarchy merely because a model is confident.

## 4. Logical architecture

```text
Android / PWA / Operations
          │
          ▼
Canonical API / approved BFF boundary
          │
          ├── AuthN/AuthZ and provider-scope resolution
          ├── Domain services and deterministic policy
          ├── Search/discovery eligibility
          ├── Evidence/storage access controls
          └── AI Orchestrator
                 │
                 ├── Use-case policy registry
                 ├── Prompt/template registry
                 ├── Context builder / retrieval
                 ├── PII/evidence classification + redaction
                 ├── Model-provider adapter
                 ├── Structured-output validator
                 ├── Tool/function allow-list
                 ├── Safety/content controls
                 ├── Evaluation hooks
                 ├── Cost/rate/latency controls
                 └── Audit/telemetry
```

## 5. AI orchestration boundary

Create a backend-owned AI orchestration module rather than direct client-to-model calls.

Responsibilities:

- choose the approved use-case configuration;
- enforce authentication and authorization;
- classify allowed input data;
- build least-privilege context;
- select a configured model/provider;
- apply prompt/version controls;
- validate structured output;
- reject unsupported tool calls;
- record model/version/prompt version, latency, token/cost metadata and outcome class;
- return a bounded response to the caller;
- support kill-switch/fallback.

Clients may render AI responses but must not hold provider secrets or privileged system prompts.

## 6. Model-provider abstraction

Define an interface that can support multiple approved providers without coupling domain code to one SDK.

Conceptual capabilities:

- text generation;
- structured JSON generation;
- embeddings;
- vision/document understanding;
- speech-to-text where approved;
- moderation/safety classification where approved.

Each implementation records:

- provider/model identifier;
- supported regions/data-processing terms;
- retention/training settings;
- latency/cost characteristics;
- input/output limits;
- fallback model;
- disabled-state behavior.

A model change is treated as a behavior change and must pass evaluation before promotion.

## 7. Use-case registry

Every AI capability has a source-controlled use-case definition.

Required fields:

- stable use-case key;
- purpose;
- user roles;
- allowed input classes;
- prohibited input classes;
- retrieval sources;
- model capability;
- output schema;
- user disclosure rule;
- human confirmation requirement;
- fallback behavior;
- maximum cost/latency;
- audit level;
- evaluation suite;
- kill switch.

No generic “AI endpoint” may accept arbitrary privileged context.

## 8. Data classification for AI

### Public-safe

Examples:

- public provider profile projection;
- public category/service taxonomy;
- approved public trust claims and limitations;
- public help/documentation;
- synthetic fixtures.

May be used by approved AI use cases subject to normal controls.

### Account-private

Examples:

- draft provider profile;
- customer enquiry draft;
- account preferences;
- private support context.

Requires authenticated purpose-specific use and minimization.

### Restricted trust/evidence

Examples:

- identity documents;
- certificates/licences;
- private registration evidence;
- exact private locations;
- field-visit material;
- complaint evidence;
- reviewer-private notes.

Default: do not send to external AI models.

Any exception requires explicit legal/privacy/security/data-processing approval, documented model retention/training controls, minimization/redaction, least privilege and a dedicated evaluation/kill switch.

### Secrets/credentials

Never sent to models:

- API keys;
- service-account credentials;
- raw access tokens/session cookies;
- signing keys;
- database passwords;
- private encryption material.

## 9. Retrieval and grounding

AI answers that describe DIREKT policy, provider trust state or user-specific workflow must be grounded in approved sources.

Rules:

- retrieve only records the authenticated caller may access;
- distinguish system instructions from retrieved untrusted data;
- do not allow retrieved content to create tool instructions;
- include stable source identifiers internally for audit;
- prefer structured canonical fields over prose scraping;
- return deterministic trust facts separately from generated summaries;
- never let embeddings/vector similarity bypass authorization filters.

## 10. Tool and action safety

AI tool/function calls are optional and narrowly scoped.

Allowed pattern:

1. model proposes a typed action;
2. server validates schema;
3. server rechecks role/scope/domain preconditions;
4. user confirms where required;
5. deterministic service executes;
6. audit records the action.

Never grant an agent unrestricted database, shell, storage or admin access.

Consequential actions that require explicit human review include:

- verification approval/rejection;
- claim revocation/suspension;
- complaint/appeal final decision;
- evidence deletion outside retention policy;
- payment/refund/reconciliation override;
- privileged user/role changes;
- production configuration change;
- public policy/trust copy changes.

## 11. Prompt-injection and untrusted-content controls

Treat all user content, provider descriptions, reviews, uploaded-document text, retrieved web/registry text and model-generated content as untrusted data.

Controls:

- separate instructions from data structurally;
- sanitize/normalize where appropriate;
- never concatenate untrusted text into privileged system instructions;
- restrict tools by use case;
- authorize every tool call server-side;
- cap retrieval depth and context size;
- validate outputs before rendering/executing;
- test direct and indirect prompt injection;
- log attack-class indicators without storing unnecessary sensitive content;
- provide deterministic fallback.

## 12. Structured outputs

Prefer typed model outputs for application logic.

Examples:

- intent classification;
- category candidates;
- evidence field candidates;
- moderation labels;
- case-summary sections;
- risk-signal descriptors.

Every structured response must:

- validate against a schema;
- reject unknown fields where possible;
- define confidence/uncertainty semantics if used;
- avoid interpreting free-form model prose as executable policy;
- preserve raw source facts for human comparison when consequential.

## 13. Customer AI architecture

### Natural-language discovery

Input:

- text, and later optional approved photo/voice.

Output:

- probable service intent;
- clarifying questions;
- category/service candidates;
- safe search parameters.

Deterministic filters then enforce geography, publication eligibility and privacy.

### Recommendation explanation

AI may summarize why a provider appears relevant based only on approved public facts such as:

- service match;
- area/service-area compatibility;
- availability;
- current public checks;
- review summary after minimum thresholds.

AI does not invent ranking reasons and does not describe private evidence.

## 14. Provider AI architecture

### Onboarding copilot

Grounded in:

- category requirements;
- provider type;
- current onboarding state;
- public/provider-safe help content.

Outputs suggestions and explanations only.

### Profile drafting

AI-generated descriptions are drafts derived from provider-supplied facts. Provider confirmation is mandatory before publication.

### Evidence preparation

Computer vision/OCR may extract candidate fields or quality signals. Extracted values are marked machine-assisted until confirmed by deterministic validation/reviewer action.

## 15. Operations AI architecture

### Case summarization

Summaries must distinguish:

- canonical facts;
- prior human decisions;
- model-generated synthesis;
- unresolved conflict/missing information.

### Checklist assistance

AI may highlight missing evidence/checklist items but cannot mark a required check satisfied unless canonical deterministic/human state says so.

### Draft explanations

Action-required or support copy may be drafted by AI but must use approved reason-code semantics and remain editable before sending.

### Risk signals

Risk signals are advisory inputs to triage. They require threshold calibration, false-positive monitoring and bias review.

## 16. Search/recommendation architecture

Use a multi-stage system:

```text
User need
  → intent/category understanding
  → deterministic eligible candidate set
  → lexical/semantic/location candidate generation
  → approved scoring
  → policy-safe re-ranking
  → diversity/fairness/business-rule pass
  → explainable results
```

Rules:

- no commercial payment may masquerade as trust;
- sponsored placement, if ever introduced, is explicitly labelled;
- sensitive traits are excluded from ranking unless legally justified and explicitly approved;
- new ML ranking models run shadow/offline evaluation before affecting users;
- deterministic fallback ranking always exists.

## 17. Evaluation framework

Each AI use case has three layers.

### Offline quality

- task accuracy;
- structured-output validity;
- grounding/source fidelity;
- hallucination/material-error rate;
- language/locality quality;
- edge-case performance;
- fairness slices where applicable.

### Safety/security

- prompt injection;
- indirect prompt injection;
- sensitive-data extraction;
- unauthorized tool/action attempts;
- jailbreak/content policy tests;
- malformed output;
- vector/retrieval authorization bypass attempts;
- unbounded-cost/denial-of-wallet tests.

### Product impact

- task completion;
- correction/edit rate;
- abandonment;
- latency;
- user satisfaction;
- support escalation;
- false-positive/false-negative operational impact;
- cost per successful task.

## 18. Human feedback and learning

Use explicit product feedback instead of silently training on private user data.

Examples:

- suggestion accepted/rejected;
- provider edits to generated profile copy;
- reviewer correction to extracted fields;
- operator correction to case summary;
- customer relevance feedback.

Feedback data use must follow privacy purpose, retention and consent rules.

## 19. Observability

Record at minimum:

- use-case key;
- request correlation ID;
- model/provider/version;
- prompt/template version;
- latency;
- token/usage/cost estimate;
- success/fallback/error class;
- safety-filter result;
- structured validation result;
- human confirmation/correction state where relevant.

Do not log raw restricted evidence, secrets, unnecessary exact locations or full private prompts by default.

## 20. Resilience and cost controls

Every AI feature must degrade gracefully.

- model outage → deterministic/manual flow;
- timeout → retry only where safe/idempotent;
- high latency → cancel/fallback;
- rate limit → bounded queue or manual flow;
- cost threshold → circuit breaker;
- malformed output → reject and fallback;
- provider compromise/incident → kill switch.

No core trust, enquiry, complaint or account function may depend solely on a generative model being available.

## 21. Rollout sequence

Recommended order:

1. documentation-grounded support/help assistant using public-safe content;
2. natural-language discovery intent and query expansion;
3. public provider comparison summaries;
4. provider onboarding guidance/profile drafting;
5. evidence-quality/OCR assistance after dedicated restricted-data review;
6. operations case summarization/checklist assistance;
7. review/content moderation assistance;
8. risk/anomaly signals;
9. advanced recommendation and analytics intelligence.

Each stage is independently kill-switchable.

## 22. Testing and release requirements

An AI feature cannot be marked complete until:

- manual fallback exists;
- use-case registry entry exists;
- data classification is documented;
- model/provider configuration is externalized;
- schemas and authorization are tested;
- evaluation set exists;
- quality and safety thresholds pass;
- prompt-injection/security tests pass;
- monitoring/cost controls exist;
- user disclosure/confirmation is implemented where required;
- exact-head regression across affected clients/backend passes;
- integration status is updated truthfully.

## 23. Standards alignment

Use as external guidance:

- NIST AI Risk Management Framework;
- NIST Generative AI Profile;
- OWASP GenAI/LLM Top 10;
- Google Responsible AI guidance.

These references inform governance and testing. They do not override repository-specific trust, privacy, security, legal or release controls.
# DIREKT Product Requirements

**Document type:** Product requirements document (PRD)  
**Release:** Android Version 1 / Zambia pilot and launch  
**Product-modernization direction:** `WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`  
**AI architecture:** `../architecture/AI_PRODUCT_ARCHITECTURE.md`

## 1. Product objective

Deliver a world-class native Android marketplace, responsive customer/provider web companion and supporting operational platform through which customers can discover providers by service and location, understand check-specific trust information, send trackable enquiries and participate in accountable reviews and complaints.

DIREKT is AI-assisted across discovery, provider enablement, support, operations and product intelligence, but AI does not become the authorization, trust, payment, legal or final consequential decision authority.

## 2. Roles

- unauthenticated visitor;
- customer;
- provider owner;
- provider manager/member;
- field agent;
- verification reviewer;
- support agent;
- trust and safety supervisor;
- finance operator;
- platform administrator;
- auditor/read-only institutional user where approved.

Permissions are defined in `USER_ROLES_AND_PERMISSIONS.md`.

## 3. Functional requirements

### FR-001 Account and session

- Support phone-number and/or email-based account identity through approved verification providers.
- Maintain secure sessions and device revocation.
- Require stronger authentication for privileged operations roles.
- Allow one person to be a customer and an authorized provider member.
- Preserve audit history when role relationships change.

### FR-002 Customer area selection

- Permit current-location search only after contextual permission.
- Permit manual area selection without location permission.
- Persist a preferred search area.
- Avoid storing continuous/background customer location.
- Clearly show the active search area.

### FR-003 Categories and services

- Use an administrator-controlled category taxonomy.
- Associate category-specific evidence requirements.
- Allow providers to select only approved services.
- Support synonyms for search without creating duplicate public categories.
- Version material requirement changes.
- Permit AI-assisted intent/category suggestions only as proposals against the canonical taxonomy.

### FR-004 Provider profile

A provider profile must support:

- legal/display name;
- provider type;
- authorized representatives;
- description;
- categories/services;
- operating model;
- service areas;
- public premises details where consented;
- contact channels;
- hours/availability;
- portfolio imagery;
- verification-check summary;
- subscription state;
- moderation/publication state.

AI may draft public profile/service copy from provider-supplied facts, but the provider must confirm/edit generated copy before publication and canonical profile validation still applies.

### FR-005 Verification

- Create independent checks for contact, identity, business, qualification/licence, location, premises and good standing as applicable.
- Define required evidence by provider type and category.
- Store evidence privately.
- Support review, action required, rejection, resubmission, approval, expiry, revocation and suspension.
- Derive public claims from approved checks.
- Record every decision and override.
- Notify providers of actionable outcomes without exposing reviewer-private notes.
- Prevent commercial entitlement from changing outcomes.
- Permit AI/OCR to assist evidence quality/extraction only under an approved use-case/data-processing boundary.
- Never allow AI output alone to approve, reject, revoke, suspend or publish a verification claim.

### FR-006 Field verification

- Assign authorized field agents.
- Capture appointment, arrival/departure, structured checklist, permitted photos and notes.
- Separate private visit coordinates from any public pin.
- Detect obvious stale/replayed submissions through time/device controls where lawful.
- Require supervisor review for defined risk cases.
- AI may summarize or flag inconsistencies for authorized reviewers but cannot replace required field/human attestation.

### FR-007 Search and discovery

Search must support:

- category/service text;
- natural-language service-need description when AI intent assistance is active;
- chosen search origin;
- distance or area;
- fixed/mobile/hybrid operating model;
- current verification checks;
- availability indicators;
- list and map;
- stable pagination;
- no-location fallback;
- explainable sponsored placement if introduced;
- manual/non-AI category and keyword discovery at all times.

Ranking must consider relevance, service-area compatibility, distance, current trust signals, response quality and data freshness. It must not imply an unverified provider is verified.

AI/ML search rules:

- deterministic publication/privacy/eligibility filters run before AI ranking;
- AI may classify intent, expand queries, generate semantic candidates and re-rank only within approved policy;
- AI explanations use approved public facts;
- paid placement cannot masquerade as trust or organic relevance;
- a deterministic fallback ranking must exist.

### FR-008 Provider detail

Display:

- provider identity and service summary;
- current public location/service area;
- check-specific trust details;
- expiry/currentness;
- services and availability;
- portfolio content;
- eligible-interaction reviews;
- enquiry/contact action;
- save/share/report controls.

Sensitive documents, private coordinates, personal identity numbers and reviewer notes must never appear.

Where AI comparison/relevance summaries are active, canonical trust facts must remain visibly separate from generated synthesis.

### FR-009 Enquiries

- Customer selects service, location/area, preferred timing and safe description.
- Customer consents before sharing contact information.
- Provider receives an inbox item and can respond.
- State changes are tracked.
- Direct call or external messaging handoff remains associated with the enquiry where feasible.
- Abuse rate limits and block/report controls apply.
- AI may help structure a customer description but the customer confirms the submitted content.

### FR-010 Reviews

- Only eligible platform-tracked interactions may create standard reviews.
- Reviews include rating dimensions, optional text and moderation state.
- Providers may respond.
- Users may report reviews.
- Removed reviews retain audit history.
- Review summaries require a minimum sample before strong aggregate claims.
- AI may assist spam/toxicity/policy triage and theme summarization, but moderation outcomes remain policy/human accountable.
- AI summaries must preserve sample size/context and cannot fabricate sentiment.

### FR-011 Complaints and safety reports

- Support inaccurate-profile, fraud, harassment, non-delivery, unsafe conduct and other controlled report types.
- Provide emergency guidance without representing DIREKT as emergency response.
- Triage by severity.
- Link reports to provider, interaction and evidence where authorized.
- Support restriction, suspension, remediation and appeal.
- AI may assist classification/summarization/risk signals within approved privacy boundaries.
- AI cannot make final suspension, complaint or appeal decisions.

### FR-012 Subscription

- Define plans, entitlements, billing period, grace period and cancellation.
- Use payment-provider adapters.
- Process webhooks idempotently.
- Maintain a financial ledger and reconciliation state.
- Degrade commercial features predictably without rewriting trust history.
- Allow mandatory safety/expiry communication regardless of marketing consent.
- AI may explain commercial state but cannot mutate ledger/reconciliation truth or create payment authority.

### FR-013 Notifications

- In-app notification centre is authoritative.
- Push notifications use FCM.
- SMS/email are reserved for approved authentication, critical and operational cases.
- Users control optional notifications.
- Sensitive evidence content is not placed in lock-screen notification text.
- AI-generated notification copy, if used, must be constrained by canonical event/reason semantics and approved templates.

### FR-014 Administration

The portal must provide:

- role-scoped dashboards;
- verification queues;
- evidence access and audit;
- field assignment;
- decision/reason-code controls;
- provider/customer/support search;
- complaints and incidents;
- subscription/reconciliation views;
- configuration for categories and evidence rules;
- exports restricted by purpose;
- immutable activity history.

Operations AI may summarize cases, highlight missing/inconsistent information and draft safe explanations, but cannot bypass role scope or execute final consequential decisions autonomously.

### FR-015 Analytics

Measure product health without storing unnecessary sensitive data:

- search success;
- result-to-profile;
- profile-to-enquiry;
- provider response;
- verification conversion and turnaround;
- expiry/remediation;
- review completion;
- complaint and enforcement rates;
- retention;
- subscription performance;
- reliability and crash metrics;
- AI suggestion acceptance/correction;
- AI fallback/error rate;
- model latency/cost;
- AI summary/extraction correction rate;
- risk-signal false positive/negative indicators where measurable.

### FR-016 AI assistance platform

The backend must provide a controlled AI orchestration boundary before production AI features are enabled.

Required capabilities:

- source-controlled use-case registry;
- model-provider abstraction;
- prompt/template versioning;
- purpose-scoped retrieval/context;
- PII/evidence data classification and redaction controls;
- structured output schemas/validation;
- allow-listed tools/functions with server-side authorization;
- safety/content controls;
- rate/cost/latency limits;
- observability/audit;
- evaluation suites;
- kill switches and deterministic/manual fallback.

Clients must not hold model provider secrets or privileged system prompts.

### FR-017 AI customer/provider/support experiences

Subject to use-case activation and evaluation:

- natural-language service need understanding;
- bounded clarifying questions;
- search query/category expansion;
- explainable provider relevance/comparison summaries from public-safe facts;
- provider onboarding/requirements guidance;
- provider public copy drafting with provider confirmation;
- documentation-grounded support/help assistant;
- multilingual/simple-language assistance where quality is proven.

All core journeys remain available without AI.

### FR-018 AI operations/evidence intelligence

Subject to dedicated privacy/security/data-processing approval:

- OCR/document field extraction assistance;
- evidence quality assistance;
- case-history summarization;
- missing-checklist/inconsistency suggestions;
- complaint/review summarization;
- moderation assistance;
- fraud/anomaly risk signals;
- analytics/taxonomy proposals.

These outputs are advisory and never become final trust/payment/legal authority.

## 4. Non-functional requirements

### Availability and resilience

- Define service-level objectives before pilot.
- Gracefully handle map, notification, payment and AI dependency failures.
- Use durable queues for asynchronous actions.
- Provide backup and tested restore.
- Core discovery, trust, enquiry, complaint and account tasks must remain possible through deterministic/manual fallback when AI is unavailable.

### Performance

Initial targets, subject to measurement:

- cached Android app usable start under 2 seconds on pilot median device;
- common API reads p95 under 500 ms excluding third-party latency;
- initial search p95 under 1.5 seconds under planned pilot load;
- image/evidence uploads show progress and recoverability;
- Pages documentation build remains reproducible;
- AI use cases define independent p50/p95 latency and maximum cost budgets;
- AI latency must not block deterministic fallback.

### Security

- least privilege;
- server-side authorization;
- private evidence objects and short-lived access;
- encryption in transit and at rest through approved infrastructure;
- secret management;
- rate limits and abuse detection;
- auditable privileged actions;
- dependency and secret scanning;
- AI prompt-injection and indirect-prompt-injection testing;
- AI sensitive-information disclosure testing;
- structured output validation;
- no unrestricted AI tool/agent access;
- model/provider supply-chain review;
- AI denial-of-wallet/unbounded-consumption controls.

### Privacy

- data minimization;
- purpose and consent recording;
- location precision controls;
- retention/deletion rules;
- policy versioning;
- access/correction/deletion request operations;
- no advertising use of sensitive verification evidence;
- restricted evidence is not sent to an external AI model by default;
- any restricted-data AI use requires explicit approved purpose, legal/privacy/security review, provider processing terms and minimization/redaction;
- no silent training/fine-tuning on private user/evidence data.

### Accessibility

- Android TalkBack and dynamic type/font scale;
- non-map alternatives;
- sufficient contrast;
- 48dp targets;
- clear errors and status text;
- web portal keyboard access;
- 200% scaling/reflow;
- reduced-motion support;
- AI is never the only path to complete a core task;
- AI suggestions are editable/confirmable and understandable.

### Responsible AI

Every AI use case must document:

- purpose and intended users;
- allowed/prohibited data;
- human decision boundary;
- model/provider/version;
- evaluation dataset and thresholds;
- fairness/bias considerations appropriate to the use case;
- fallback/kill-switch behavior;
- monitoring and incident handling;
- user disclosure where AI materially shapes output/recommendation.

Use NIST AI RMF/Generative AI Profile and OWASP GenAI/LLM guidance as external governance/security references.

### Maintainability

- modular boundaries;
- OpenAPI contract;
- typed clients;
- forward migrations;
- architecture decision records;
- automated tests;
- observable jobs and integrations;
- provider-neutral AI adapter;
- source-controlled prompts/use-case policies;
- reproducible AI evaluation suites.

### Visual and interaction quality

Production-facing customer/provider/operations UI must:

- follow the approved VC Design DNA;
- remove development/workstream/API labels;
- use approved typography/iconography/imagery;
- present check-specific trust beautifully and accurately;
- provide responsive/adaptive layouts;
- define loading/empty/error/offline states;
- remain usable under low bandwidth;
- meet VC8 visual/accessibility quality gates.

## 5. MVP exclusions and protected boundaries

- native iOS app;
- open marketplace chat unless validated as essential;
- escrow;
- loans, insurance and financial advice;
- emergency dispatch;
- employee background checks beyond approved provider verification;
- continuous/background location tracking;
- public evidence documents;
- bidding/auction marketplace;
- cross-country launch;
- AI-generated final verification decisions;
- AI-generated final suspension/complaint/appeal decisions;
- autonomous AI payment/refund/reconciliation decisions;
- unrestricted agent access to database/storage/admin tools;
- use of restricted evidence by external AI providers without explicit approval;
- AI replacing the manual path for core marketplace tasks.

## 6. Acceptance scenario

The product passes the core acceptance scenario when a category-appropriate provider can submit evidence, receive independent reviewed outcomes, become discoverable with accurate scoped claims, receive a tracked customer enquiry, respond, and participate in a review/complaint lifecycle that operations staff can audit end to end.

The world-class/AI acceptance extension passes when:

- the same journey is visually polished across applicable Android/PWA/operations surfaces;
- customer can use either standard search or evaluated AI-assisted need understanding;
- AI-generated suggestions/summaries remain distinguishable from canonical trust facts;
- provider can receive AI assistance without AI self-approving evidence;
- operations can use bounded AI assistance without losing human accountability;
- manual/deterministic fallback succeeds when AI is unavailable;
- VC8 accessibility, security, privacy, regression and AI evaluation gates pass;
- Phase 11/12 real-pilot/production gates remain separately satisfied before any production claim.
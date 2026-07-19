# DIREKT Product Requirements

**Document type:** Product requirements document  
**Release:** Android-first Version 1 with customer/provider PWA companion

## 1. Product objective

DIREKT enables customers in Zambia to discover local service providers, understand check-specific trust information, send trackable enquiries and participate in accountable reviews and complaints. Providers build evidence-backed profiles, manage verification progress and respond to enquiries. Privileged staff use a separate operations portal.

Native Android remains the primary customer/provider client. A responsive installable PWA is an approved companion for desktop, tablet and mobile. The public pre-release PWA is synthetic-only until a separate live-browser security and access gate is approved.

## 2. Roles

- visitor;
- customer;
- provider owner, manager or member;
- field agent;
- verification reviewer;
- support agent;
- trust and safety supervisor;
- finance operator;
- platform administrator;
- auditor/read-only institutional user where approved.

Permissions are server-defined and must never be inferred from client navigation alone.

## 3. Client requirements

### Native Android

Primary Version 1 release client. It owns Android-specific permission flows, secure local session storage, native evidence capture, recoverable background work and Play distribution concerns.

### Customer/provider PWA

The PWA must:

- adapt cleanly across desktop, tablet and mobile;
- be installable and provide an offline static shell;
- mirror Android product semantics and use the same canonical REST/OpenAPI contracts when live mode is later enabled;
- contain no privileged database or storage credentials;
- preserve server-authoritative identity, provider scope, verification, publication, interaction, review and commercial rules;
- keep the public pre-release build synthetic-only with no real submissions or protected API calls;
- require a reviewed browser authentication/session, origin, request-integrity, caching and abuse-control design before live access.

### Operations portal

The operations portal is a separate privileged web application for verification, moderation, field work, support, finance exceptions and audit. It must not be bundled into the public PWA.

## 4. Functional requirements

### FR-001 Account and session

- Support approved phone and/or email identity methods.
- Maintain secure sessions and revocation.
- Require stronger authentication for privileged roles.
- Allow one person to hold customer and authorized provider relationships.
- Preserve audit history when role relationships change.
- Phone possession alone must never grant provider or operations authority.

### FR-002 Area and location

- Support manual area selection without device location.
- Request current location only with contextual permission where implemented.
- Do not require continuous/background customer location in Version 1.
- Always show the active search area.
- Preserve list/manual fallback when a map provider is unavailable or not activated.

### FR-003 Categories and services

- Administrator-controlled taxonomy.
- Category-specific evidence requirements.
- Approved services only.
- Search synonyms without duplicate public categories.
- Immutable versioning for material requirement changes.

### FR-004 Provider profile

Support provider identity/display information, pathway/type, authorized representatives, categories/services, operating model, service areas, consented public premises, contact channels, availability, approved media, check summary, commercial state and moderation/publication state.

### FR-005 Verification

- Separate checks for contact, identity, business, qualification/licence, location/premises and other approved claims.
- Private evidence storage and controlled access.
- Review, action-required, rejection, resubmission, approval, expiry, revocation and suspension lifecycle.
- Public claims derived only from valid current decisions/evidence.
- Every decision and high-impact override auditable.
- Provider receives actionable outcomes without reviewer-private material.
- Commercial state cannot alter verification outcomes.

### FR-006 Field verification

- Authorized assignments only.
- Structured inspection records.
- Private visit coordinates separated from any public location.
- Defined supervision/four-eyes rules where risk requires them.
- Field observations cannot bypass the normal verification decision lifecycle.

### FR-007 Search and discovery

Support service/category search, chosen area/origin, service-area compatibility, operating model, current trust claims, availability, list/map presentation, stable pagination and no-location fallback.

Ranking must be explainable and must not treat payment as trust. Private provider base coordinates must not become public ranking inputs.

### FR-008 Provider detail

Display public-safe provider/service summary, public location/service area, check-specific trust details, currentness/expiry, services/availability, approved media, eligible-interaction reviews and enquiry/save/share/report actions.

Never display private documents, private coordinates, sensitive identifiers or reviewer-private notes.

### FR-009 Enquiries and contact handoff

- Bounded service request.
- Provider inbox and response lifecycle.
- Tracked state changes.
- Explicit consent before releasing real contact information.
- Consent expiry and revocation.
- Approved external contact handoff remains associated with the tracked interaction where feasible.
- Public synthetic PWA releases no real contact information.

### FR-010 Reviews

- Standard reviews require a qualifying tracked interaction.
- Moderation/report/appeal controls.
- Bounded provider response.
- Removed or withheld history retained for audit.
- Aggregate claims require sufficient evidence/sample.

### FR-011 Complaints and safety

Support controlled report types, severity triage, authorized linkage to provider/interaction/evidence, restriction/remediation/appeal and clear emergency limitations.

### FR-012 Commercial/subscription

- Plans, entitlements, billing lifecycle, grace and cancellation.
- Provider-neutral payment boundary.
- Idempotent external callbacks.
- Immutable invoice/ledger/reconciliation history.
- Commercial degradation must not rewrite trust history.
- Real money movement remains disabled until explicit approval gates pass.

### FR-013 Notifications and communications

- In-app notification state is authoritative where implemented.
- External email, push and messaging providers operate only through approved adapters and delivery controls.
- Sensitive evidence/private contact data is excluded from notification content.
- Current provider activation status is governed by `docs/integrations/CURRENT_INTEGRATION_STATUS.md`.

### FR-014 Administration

The portal provides role-scoped dashboards, verification queues, private evidence review/audit, field assignment, structured decisions/reasons, support search, complaints/incidents, commercial exception views, controlled configuration, purpose-restricted exports and immutable activity history.

### FR-015 Analytics and reliability

Measure product health with minimized data: search success, profile/enquiry conversion, provider response, verification turnaround/remediation, reviews/complaints, retention, commercial performance and reliability.

## 5. Trust and privacy requirements

- No blanket paid or registration-derived verification claim.
- Exact private locations and evidence are private by default.
- Public claims show scope, state, currentness and limitations.
- Client UI cannot grant roles, provider scope or trust status.
- Direct database edits, client assertions or commercial state cannot create public trust.
- Public PWA caches no private evidence, contact or session material.
- External-provider provisioning does not equal runtime activation.

## 6. Non-functional requirements

### Resilience

- Graceful dependency degradation.
- Durable idempotent asynchronous work where needed.
- Backup and tested restore.
- Rollback and kill switches.
- Manual/list fallback for location-dependent discovery.

### Performance

- Representative Android startup/performance budgets.
- Common API reads and search measured against documented targets.
- Upload progress/recovery.
- PWA first-load, responsive and offline-shell checks on representative conditions.
- Reproducible documentation/PWA static build.

### Accessibility

Critical customer/provider flows require semantic labels, visible focus/touch targets, scalable text/zoom/reflow, status independent of color, reduced-motion support and non-map alternatives.

### Security

Least privilege, server-side authorization, protected private storage, safe session handling, rate/abuse controls, supply-chain checks, no protected material in public artifacts and fail-closed production-release gates.

## 7. Environment requirements

- `https://direkt.forum/app/`: synthetic remote review until live-mode approval.
- Managed development/private staging: synthetic or explicitly approved non-personal test data under protected infrastructure.
- Controlled Zambia pilot: only after Phase 11 entry gates.
- Production: only after Phase 11 exit and formal release gates.

## 8. Owner-visible acceptance principle

A user-facing milestone is not considered adequately inspectable merely because backend code and automated tests exist. The owner must have the appropriate visible test surface: native Android distribution, the public synthetic PWA or protected operations access, while preserving all security/privacy boundaries.

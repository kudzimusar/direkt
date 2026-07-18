# DIREKT Threat Model

**Version:** Phase 10 baseline — 2026-07-17  
**Owner:** Security and platform workstream  
**Governing issue:** #41  
**Status:** Synthetic-system threat model. It does not authorize real evidence, real payments, deployment or pilot activity.

## Purpose

This document identifies DIREKT assets, actors, trust boundaries, data flows, abuse cases and required mitigations after completion of Phases 4–9. It is the controlling Stage 10A security model and must remain consistent with:

- `docs/security/SECURITY_MODEL.md`;
- `docs/security/PRIVACY_MODEL.md`;
- `docs/backend/AUTHENTICATION_AND_AUTHORIZATION.md`;
- `docs/phase9/COMMERCIAL_TRUST_CONTRACT.md`;
- `docs/phase10/HANDOFF_FROM_PHASE9.md`;
- `RISK_REGISTER.md`.

A threat is not considered closed merely because a user interface hides an action. API authorization, database constraints/functions, private-storage policy, immutable audit history and permanent tests form the authoritative control boundary.

## Scope

Included components:

- native Android customer/provider application;
- NestJS API and request middleware;
- account, provider, verification, discovery, operations, interaction and commercial modules;
- PostgreSQL/PostGIS and forward migration runner;
- private evidence/storage adapter and the planned DIREKT Supabase development project;
- internal Next.js operations portal;
- GitHub repository, Actions workflows, artifacts and documentation site;
- synthetic authentication, contact handoff and payment adapters;
- future external map, communications, payment and authority adapters at their disabled boundaries.

Excluded from current authorization:

- real participant data;
- real identity or qualification evidence;
- production OTP, messaging, map or payment credentials;
- real settlement or money movement;
- public deployment or controlled Zambia pilot.

## Security objectives

1. Prevent unauthorized identity, provider, tenant, evidence, trust, interaction, operations or commercial access.
2. Preserve the integrity and provenance of verification decisions, claims, publication, reviews, complaints, incidents, invoices, payments and ledger history.
3. Minimize disclosure of contact details, precise locations, private evidence, internal rationale, credentials and protected infrastructure metadata.
4. Make retry, webhook and external-adapter processing idempotent, replay-safe and auditable.
5. Keep commercial state independent from trust, publication, ranking and accountability rights.
6. Preserve usable recovery on low-bandwidth Android devices without storing protected credentials.
7. Detect, contain and recover from abuse, compromise, operator error and infrastructure failure.
8. Fail closed when production configuration, provider approval or exact environment identity is absent.

## Asset classification

| Asset class | Examples | Sensitivity | Primary integrity requirement |
|---|---|---|---|
| Authentication | challenge records, session families, access/refresh token references | Restricted | only verified/current sessions authorize actions |
| Human identity | account identity IDs, profile status, representative assignments | Restricted | a person and provider organization remain separate aggregates |
| Contact | normalized phone/email references, masked hints, handoff consent | Highly restricted | no raw value exposed outside current purpose/scope |
| Provider profile | pathway, operating model, locality/service summaries | Internal/public allowlist | public output contains only consented safe fields |
| Precise location | private base, public premises coordinates, service areas | Highly restricted | private coordinates never drive public output or mobile-provider distance ranking |
| Evidence | identity, qualification, business, location and experience evidence | Highly restricted | immutable version, checksum, requirement scope and assigned review |
| Verification | cases, recommendations, decisions, reason codes and claims | Restricted | decisions and claims derive only through controlled state machines |
| Discovery | publication records, search policy and ranking explanations | Public allowlist | payment/profile completion cannot bypass claim requirements |
| Interaction | enquiries, tracked interactions, consent handoffs and history | Restricted | owner/provider scope and immutable event sequence |
| Accountability | reviews, responses, reports, appeals and complaints | Restricted/public allowlist | one qualifying record, independent moderation and no paid suppression |
| Operations | assignments, evidence grants, field work, overrides and incidents | Highly restricted | live permission, purpose, ownership, four-eyes controls and audit |
| Commercial | products, subscriptions, invoices, payments, webhooks, ledger, reconciliation and adjustments | Restricted | minor-unit integrity, replay safety, balanced append-only history and trust separation |
| Infrastructure | database URLs, server keys, provider secrets, workflow/environment configuration | Secret | backend-only, rotated, masked and absent from clients/artifacts |
| Audit and evidence of control | audit events, lifecycle events, CI reports and review records | Restricted | append-only or review-preserved, attributable and time ordered |

## Threat actors

| Actor | Motivation/capability |
|---|---|
| Unauthenticated attacker | enumeration, credential stuffing, denial of service, scraping or exploit attempts |
| Fraudulent customer | fake reviews/complaints, provider harassment, contact harvesting or spam enquiries |
| Fraudulent provider | forged evidence, copied credentials, manipulated location, fake availability or retaliation |
| Compromised Android device | local-data extraction, token theft, overlay/accessibility abuse or request replay |
| Compromised browser/session | operations impersonation, CSRF-like action attempts, data exfiltration or privilege misuse |
| Malicious/curious insider | evidence browsing, override abuse, ledger/reconciliation manipulation or data export |
| Colluding operators | field/reviewer/finance participants bypassing independent approval |
| Compromised external provider | forged webhooks, leaked signed URLs, malicious responses or service outage |
| Supply-chain attacker | dependency, build action, package, artifact or release compromise |
| Accidental operator/developer | wrong environment, wrong project, destructive migration, secret logging or unsafe configuration |

## Trust boundaries

```text
[Android application]
        |
        | TLS + bearer session + bounded DTOs
        v
[NestJS public API boundary]
        |
        | live permissions + actor-resolved scope + transactions
        v
[PostgreSQL/PostGIS domain boundary]
        |
        +--> [Private storage adapter] --> [Exact approved storage project/buckets]
        |
        +--> [Disabled/synthetic external-adapter ports]

[Operations browser]
        |
        | TLS + bearer session; API only; no database/storage client
        v
[NestJS operations API boundary]

[GitHub repository and CI]
        |
        +--> reviewed source, clean-database validation, client builds, sanitized artifacts
        +--> protected manual environment activation only after exact-project verification
```

Critical boundary rules:

- Android mode, portal navigation, request-body IDs and public resource IDs do not grant authorization.
- The API resolves current server-side role assignments and purpose/scope.
- Database functions independently enforce high-risk permission and lifecycle rules.
- Browser and Android clients receive no database URL or server/storage secret.
- The storage adapter verifies exact environment/bucket policy before real use.
- External adapter input is untrusted until signature, freshness, idempotency and semantic checks pass.

## Principal data flows

| Flow | Data | Required controls |
|---|---|---|
| Authentication challenge | bounded contact input → normalized reference/challenge | enumeration-safe response, rate limit, expiry, attempt limit, synthetic disabled in production |
| Session rotation | refresh token → new family member | stored hash only, reuse detection, family revocation, short access lifetime |
| Provider creation/update | actor → provider/profile/category/location | live provider permission, revision, field allowlist, private/public location separation |
| Evidence upload | actor → logical intent → short-lived private session → metadata confirmation | actor scope, MIME/size/checksum, opaque key, expiry, no public bucket |
| Evidence review | assigned operator → short-lived read grant → reasoned decision | current assignment, purpose, expiry/revocation, audit, no persistent URL |
| Publication/search | current claims/location/service area → public projection | live claim re-evaluation, private-coordinate exclusion, deterministic non-paid ordering |
| Enquiry/handoff | customer → bounded enquiry → accepted interaction → consented channel reference | idempotency, owner/provider scope, expiry/revocation, masked value, delivery disabled until approval |
| Review/complaint | qualifying interaction → bounded record → moderation/operations lifecycle | one-per-scope constraints, revision, reason, public allowlist, no trust mutation |
| Payment webhook | canonical provider event → verification → payment/ledger/reconciliation | HMAC, freshness, unique event/fingerprint, amount/currency match, canonical receipt binding |
| Adjustment | finance request → two independent approvals → new ledger transaction | requester exclusion, distinct approvers, reference consistency, append-only accounting |
| Portal action | operations browser → API route → database function | API-only architecture, live permission, step-up for future high-risk actions, no client authority |
| CI/deployment preparation | reviewed commit → clean runners/builds/artifacts | pinned actions/dependencies, least token permissions, scans, sanitized retention, exact-head review |

## Threat and abuse register

| ID | Threat/abuse case | Primary controls implemented | Residual Phase 10 work |
|---|---|---|---|
| T10-001 | Account enumeration through challenge or error differences | stable problem details, bounded challenge contract | distributed rate limit, response-timing review and abuse monitoring |
| T10-002 | Credential stuffing/challenge flooding | expiring synthetic challenge and session-family controls | provider-backed attempt budgets, IP/device throttling and alerting |
| T10-003 | Access/refresh token theft or reuse | short access lifetime, hashed rotating refresh token, family reuse revocation | secure Android storage review, privileged step-up and anomaly response |
| T10-004 | Client-selected provider/tenant access | actor-resolved assignments, zero/ambiguous denial | complete route/function permission matrix and automated coverage |
| T10-005 | IDOR using copied provider/evidence/interaction/commercial IDs | resource scope guards and database checks | comprehensive cross-resource authorization suite |
| T10-006 | Malicious operator browses unrelated evidence | assignment-scoped short grants, audit/revocation | usage alerts, access review and independent audit workflow |
| T10-007 | Signed evidence URL leaks | short expiry, private bucket, assigned access | exact-project policy test, revocation exercise and log scan |
| T10-008 | Forged or substituted evidence | checksum, MIME/size, immutable versions, requirement scope | malware scanning, authority verification and representative real-file validation |
| T10-009 | Reviewer/field-agent collusion or self-approval | role separation, advisory field work, four-eyes overrides | relationship/conflict declarations and anti-collusion analytics |
| T10-010 | Trust claim or publication forged by direct edit | controlled database functions, immutable decisions, live claim checks | privileged database-role review and restore-integrity exercise |
| T10-011 | Precise home/mobile-provider location disclosed | separate private/public/service-area concepts, safe projections | log/export review, retention rules and representative privacy testing |
| T10-012 | Enquiries used to harvest contact details | bounded enquiry, accepted interaction and 24-hour consent handoff | rate limits, provider/customer abuse detection and approved delivery controls |
| T10-013 | Fake/retaliatory review or complaint | tracked-interaction eligibility, one-per-scope constraints, moderation/appeal | anomaly detection, staffing/service levels and pilot comprehension testing |
| T10-014 | Paid provider gains trust/ranking or suppresses accountability | separate commercial schema/module and before/after trust tests | policy/legal review of future paid features |
| T10-015 | Forged/stale/replayed payment webhook | HMAC, timestamp window, unique ID/fingerprint, advisory lock and conflict denial | production key rotation, provider-specific signing review and monitoring |
| T10-016 | Ledger history altered or unbalanced | append-only triggers and balanced posting functions | backup/restore integrity and independent reconciliation exercise |
| T10-017 | Adjustment references unrelated invoice/payment or bypasses approval | database reference trigger, requester exclusion, two distinct approvers | anti-collusion review, approval expiry and operations service levels |
| T10-018 | Raw webhook/contact/evidence/credential leaks to clients | minimized projections, safe metadata, API-only portal, Android metadata-only recovery | automated secret/data scanning across logs, artifacts and bundles |
| T10-019 | Wrong Supabase project is migrated | exact project reference in protected workflow, current connector block | obtain correct access, run identity check/advisors and preserve evidence |
| T10-020 | Malicious dependency/action compromises build | lockfiles and pinned major action references | vulnerability scan, action SHA policy, provenance and artifact verification |
| T10-021 | Framework/header disclosure aids exploitation | framework header removed and defensive API response headers | production TLS/proxy validation and header monitoring |
| T10-022 | Denial of service or cost amplification | bounded payloads, queues and explicit adapters | distributed rate limits, quotas, load/soak and degraded-mode tests |
| T10-023 | Operator sends data to wrong external provider/environment | disabled production adapters and protected activation | kill switches, provider allowlists, environment banners and incident drill |
| T10-024 | Audit/event history deleted or silently rewritten | append-only database triggers and controlled transitions | backup/restore validation, privileged role audit and retention approval |
| T10-025 | Public repository/Pages exposes private data | synthetic-only policy and documentation validation | repository-history, artifact and generated-site secret/privacy scans |

## HTTP/API baseline

Stage 10A requires:

- removal of framework disclosure headers;
- `Cache-Control: no-store` for current API responses;
- MIME sniffing disabled;
- frame embedding denied;
- referrer disclosure disabled;
- restrictive browser permissions policy;
- same-origin opener isolation;
- JSON API content security policy denying executable/resource loads;
- HSTS only in production configuration;
- allowlisted CORS origins with credentials disabled;
- validation whitelist with unknown fields rejected;
- stable problem-detail errors without provider/internal payload disclosure.

Swagger remains a local/development operational interface. It retains frame protection but does not receive the JSON-only CSP because its UI requires local scripts/styles. Production documentation exposure requires a later explicit decision.

## Logging and observability rules

Never log:

- access/refresh tokens or challenge codes;
- raw phone/email contact values;
- private coordinates;
- evidence bytes, object keys or checksums in public logs;
- database URLs or server/provider keys;
- raw webhook bodies;
- payment account, PIN or card values;
- internal moderation or legal rationale in public telemetry.

Logs require correlation IDs, bounded reason/error codes and redacted structured metadata. Phase 10 must add automated evidence that protected values do not enter diagnostics or retained artifacts.

## Environment and external-provider stop gates

A real external adapter remains prohibited until:

1. the exact environment/project identity is verified;
2. provider terms, signing, retry, data-use and incident obligations are current;
3. production secrets are protected, rotated and revocable;
4. abuse, rate-limit and kill-switch controls exist;
5. reconciliation/support ownership and service levels exist;
6. qualified Zambia privacy, consumer, payments, tax, invoicing and AML findings are recorded where applicable;
7. backup/restore, incident and outage exercises pass;
8. Phase 11 pilot entry is separately authorized.

## Validation evidence

Stage 10A baseline evidence includes:

- this updated threat model;
- `docs/security/SECURITY_MODEL.md`;
- API defensive-header middleware;
- E2E tests for response headers and framework-disclosure removal;
- existing cross-domain, webhook, ledger, adjustment, privacy and public-repository regressions;
- clean permanent CI on the Phase 10 checkpoint branch.

## Review and maintenance

Update this model whenever:

- a new data class, route, database function, storage bucket or external adapter is added;
- an authorization scope or role changes;
- a new public projection is introduced;
- production deployment/environment design changes;
- a security/privacy incident or test finding exposes an unmodelled path;
- a provider/legal approval changes an existing stop gate.

Every material threat-model change must map to a decision, risk treatment, implementation control or explicit accepted/blocking limitation.

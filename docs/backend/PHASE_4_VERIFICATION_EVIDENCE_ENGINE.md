# Phase 4 Verification and Private Evidence Engine

## Purpose

Phase 4 implements DIREKT's first evidence-backed trust vertical slice. It does not create a blanket verified-provider state and does not authorize customer discovery. Each case evaluates one provider, one category requirement version and one scoped check.

## Implemented boundaries

- provider organizations and category selections remain owned by Phase 3;
- evidence metadata lives in the private `evidence` schema;
- verification cases, assignments, immutable recommendations, decisions, field visits and claims live in the `verification` schema;
- original evidence bytes remain outside PostgreSQL behind `EvidenceStoragePort`;
- the checkpoint uses `SyntheticPrivateStorageAdapter` and fictional metadata only;
- private evidence object keys are opaque and never returned by API DTOs;
- provider routes require server-resolved provider scope;
- reviewer evidence access requires a global review permission and an active assignment to the exact case;
- every private access grant is short-lived, synthetic, watermarked and audited;
- safe claim cards exclude evidence objects, checksums, identifiers, reviewer identity, notes and private location data.

## Evidence lifecycle

```text
upload session requested
→ synthetic private object uploaded
→ completion and checksum confirmed
→ immutable evidence version created
→ ready for review
→ approved / rejected / correction required
→ replacement creates the next immutable version
→ approved evidence may later expire or be revoked
```

Evidence items may retain multiple versions. An update never rewrites an earlier version. Upload sessions bind provider, requirement, submitter, content type, size limit, consent and an opaque object key.

## Verification case lifecycle

```text
draft
→ awaiting evidence
→ ready for review
→ assigned
→ in review
→ approved / rejected / correction required / revoked
→ renewal, appeal, expiry or closure where permitted
```

Database triggers reject transitions outside the documented graph. A case binds:

- provider;
- category and immutable requirement version;
- specific requirement;
- check key and family;
- risk classification;
- policy version;
- evidence links;
- assignments;
- review and decision history;
- any resulting scoped claim.

## Separation of duties

The database and application jointly enforce:

- provider creator cannot be assigned to review the provider;
- evidence submitter cannot review that evidence;
- reviewer, field-agent and supervisor assignments require their corresponding active platform role;
- finance has no review or decision permission;
- an operator must be actively assigned before case/evidence access;
- high-risk decisions require a prior recommendation from a different actor;
- field visits require a matching active field-agent assignment;
- recommendations, decisions and field visits are append-only.

## Decision and claim derivation

Claims cannot be inserted or changed by ordinary SQL or application repositories. `verification.record_decision(...)` validates independence and assignment, records an immutable decision, changes the case/evidence state and derives a claim inside one transaction.

Every approved claim records:

- claim key and scoped statement;
- limitation;
- evidence/check family;
- checked timestamp;
- validity deadline;
- policy version;
- active, degraded, revoked or expired state.

No claim states that the provider is universally safe, competent or guaranteed to perform future work.

## Expiry and revocation

`verification.degrade_expired_claims(as_of)` is deterministic and idempotent for a supplied timestamp. It:

1. expires current evidence versions whose validity deadline has passed;
2. expires active claims whose own deadline passed or whose linked evidence is expired/revoked;
3. transitions approved cases to expired;
4. records an append-only batch audit event.

Provider evidence revocation invokes the same degradation path so dependent claims cannot remain active.

## API surface

Provider-scoped endpoints:

```text
POST /api/v1/providers/{providerId}/evidence/upload-sessions
POST /api/v1/providers/{providerId}/evidence
GET  /api/v1/providers/{providerId}/evidence
GET  /api/v1/providers/{providerId}/evidence/{evidenceId}
POST /api/v1/providers/{providerId}/evidence/{evidenceId}/revoke
POST /api/v1/providers/{providerId}/verification-cases
GET  /api/v1/providers/{providerId}/verification-cases
GET  /api/v1/providers/{providerId}/claims
```

Operations endpoints:

```text
GET  /api/v1/operations/verification-queue
GET  /api/v1/verification-cases/{caseId}
POST /api/v1/verification-cases/{caseId}/assignments
POST /api/v1/verification-cases/{caseId}/evidence/{evidenceId}/access
POST /api/v1/verification-cases/{caseId}/recommendations
POST /api/v1/verification-cases/{caseId}/decisions
POST /api/v1/verification-cases/{caseId}/field-visits
POST /api/v1/operations/verification/expire-claims
GET  /api/v1/operations/providers/{providerId}/claims
```

No public evidence, case or evidence-object route exists.

## Android checkpoint

The native Android app contains only fictional models and Compose cards for:

- private evidence versions;
- correction and resubmission history;
- verification timeline;
- scoped claim statement and limitation;
- deterministic expiry;
- explicit absence of real evidence and public discoverability.

The model uses epoch milliseconds rather than `java.time` so it remains compatible with minSdk 23 without adding desugaring.

## Operations portal checkpoint

The Next.js portal contains a fictional verification queue and assigned-case summary. It deliberately omits:

- evidence files or real signed URLs;
- object keys and checksums;
- document identifiers;
- private addresses;
- download/export controls;
- public-publish controls;
- direct database/storage imports.

## External integration handoff

When the dedicated DIREKT Supabase project is available, the synthetic adapter may be replaced by a Supabase private-storage adapter implementing the same port. That later change must add:

- private buckets and service-role backend access;
- signed upload/read URLs;
- MIME/signature/size verification;
- malware scanning and quarantine;
- lifecycle deletion and legal hold;
- integration tests against non-real fixtures.

No storage credential may enter Android, the browser bundle or the public repository.

## Test obligations

The checkpoint must prove:

- evidence versions and decisions are append-only;
- direct claim insertion is rejected;
- provider self-review and evidence-submitter review are rejected;
- finance cannot recommend or decide verification;
- unassigned reviewers cannot access private evidence;
- assigned access is short-lived and audited;
- cross-provider evidence links fail;
- invalid state transitions fail;
- replacements preserve version history;
- claim output is safe and scoped;
- expiry and revocation degrade claims;
- no Phase 4 route creates public provider discovery;
- Android, portal and documentation contain fictional data only.

## Explicit exclusions

- real provider evidence or personal data;
- production Supabase/storage credentials;
- production malware/document extraction services;
- real field-agent operations;
- public provider search or publication;
- maps, OTP, payment or authority integrations;
- production deployment and public pilot.
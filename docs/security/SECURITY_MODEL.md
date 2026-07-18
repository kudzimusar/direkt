# DIREKT Security Model

**Baseline:** Phase 10 — 2026-07-17  
**System state:** Synthetic-only; no production provider, deployment or pilot authorization.

## Security objectives

- protect identity, contact, evidence, precise location, interaction, accountability and commercial data;
- prevent unauthorized trust, publication, moderation, complaint, incident, payment or ledger changes;
- maintain customer/provider/operations tenant and purpose isolation;
- preserve immutable or append-only auditability where history is material;
- fail closed when environment, permission, provider approval or signature evidence is absent;
- remain usable and recoverable on consumer Android devices without storing protected credentials;
- support detection, containment, restoration and post-incident review.

## Layered control model

### Identity and sessions

- passwordless challenge contract is synthetic outside production and disabled by production configuration;
- contacts are normalized and referenced rather than broadly exposed;
- access tokens contain identity/session references only;
- refresh tokens are stored as hashes, rotate on use and revoke their family after reuse;
- roles and permissions are resolved live on the server;
- privileged step-up remains a Phase 10 design/implementation requirement.

### Authorization and tenant isolation

- human identities and provider organizations are separate aggregates;
- provider context is resolved from active server-side assignments;
- zero, revoked, expired or ambiguous assignments deny provider-scoped mutations;
- route guards are not the sole boundary: high-risk database functions validate permission, scope, revision and lifecycle independently;
- operations trust, support, finance, audit and administration permissions remain separate;
- client navigation, Android mode and supplied identifiers do not grant authority.

### Android

- app-private persistence stores bounded recovery metadata only;
- no database URL, storage server key, payment credential or provider secret enters the client;
- interaction and payment retries preserve one logical request identity across process recreation;
- critical trust/commercial states have explicit accessible recovery paths;
- production encrypted-storage, network pinning/tamper trade-offs and device-threat validation remain Phase 10 work.

### API

- strict DTO validation transforms allowlisted fields and rejects unknown input;
- CORS uses an explicit origin list with credentials disabled;
- current responses are no-store, frame-denied, MIME-sniff protected, referrer-minimized and browser-permission restricted;
- JSON API responses use a deny-by-default content security policy;
- framework disclosure is disabled;
- HSTS is emitted only in production configuration;
- stable problem details do not expose raw provider or storage errors;
- distributed rate limiting and abuse monitoring remain Stage 10E work.

### Data and database

- PostgreSQL/PostGIS is the system of record;
- migrations are forward-only, checksummed, advisory-locked and transactional per file;
- material lifecycle/event history is append-only or direct-edit protected;
- verification decisions, public claims, publication, reviews, complaints, incidents and commercial state use separate aggregates and state machines;
- private location, public premises and service area are distinct data classes;
- invoices use immutable integer minor-unit snapshots;
- ledger transactions are balanced and append-only;
- retries store hashed idempotency keys and fingerprints only.

### Private storage

- evidence bytes remain outside PostgreSQL behind a backend-only adapter;
- objects/buckets are private and access uses short-lived assigned grants;
- server-side MIME, size and checksum confirmation is required;
- object keys and raw provider errors are excluded from safe responses;
- exact-project policy, revocation, scanning, retention and restore exercises remain Stage 10D work.

### Trust and marketplace integrity

- verification is check-specific and evidence-backed;
- claims derive only from valid decisions and current requirements;
- discovery publication re-evaluates current claims and safe location policy;
- paid status cannot create verification, publication or ranking;
- reviews require a qualifying tracked interaction;
- complaints, appeals and incidents cannot be suppressed by commercial state;
- field work remains advisory and high-risk overrides use independent approval.

### Commercial integrity

- production payment mode is disabled;
- development/test synthetic webhooks require HMAC, freshness, event identity and semantic checks;
- conflicting event reuse is rejected at the database boundary;
- processed receipts are bound to canonical target status, amount and currency;
- reconciliation records mismatches rather than silently changing money state;
- adjustments require consistent provider/invoice/payment/currency references, requester separation and two distinct approvers;
- synthetic refund state performs no real money movement.

### Operations portal

- browser code consumes only the versioned backend API;
- no direct PostgreSQL, Supabase or external-provider client is permitted;
- navigation is permission-filtered but server/database authorization remains authoritative;
- high-risk workflows require reason codes, expected revisions, ownership and audit;
- future production portal security requires CSP/session/cookie/step-up review.

### Supply chain and environments

- runtimes and dependency lockfiles are pinned;
- GitHub Actions use least privilege for permanent validation workflows;
- generated artifacts are bounded and synthetic;
- protected activation verifies exact environment identity before remote mutation;
- dependency/secret/history/artifact scanning and provenance review remain Stage 10G work.

## Assurance strategy

Phase 10 assurance combines:

1. threat and data-flow modelling;
2. complete permission/route/function review;
3. permanent authorization, privacy, replay, immutability and response-header tests;
4. exact-environment private-storage validation when access is available;
5. abuse/rate-limit and queue-operability tests;
6. backup/restore and incident exercises;
7. performance and soak evidence;
8. dependency, secret and fail-closed configuration scans;
9. qualified external provider/authority/legal evidence or explicit stop gates;
10. one exact reviewed checkpoint head before Phase 11 entry.

Independent assessment is required before broad production as resources permit. A successful synthetic Phase 10 checkpoint does not itself authorize real participants, real evidence, real payment integration or public launch.

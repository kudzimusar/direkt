# Phase 8 Validation and Exit Matrix

**Checkpoint:** Phase 8 — Enquiries, interactions and reviews  
**Branch:** `build/android-v1`  
**PR:** #31  
**Issue:** #30  
**Validation rule:** all permanent gates must pass on one exact reviewed source head before merge.

## Validation objective

Prove that the synthetic DIREKT interaction loop is complete, privacy-safe, authorization-safe, retry-safe and independent from verification, publication, ranking and commercial state.

A green build alone is insufficient. The checkpoint also requires source review, database state-machine review, API projection review, Android critical-state review, portal architecture review and documentation consistency.

## Permanent gate commands

### Backend and database

```bash
cd backend/direkt-api
npm ci --ignore-scripts
npm run format:check
npm run lint
npm run typecheck
npm run migration:check
npm run test
npm run build
npm run openapi:check
```

The CI database is PostgreSQL 18 with PostGIS 3.6. Migrations are applied from a clean database and verified against committed checksums.

### Android

```bash
cd android/direkt-app
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

The permanent package identity remains `com.kudzimusar.direkt`; debug builds use the `.debug` suffix. The expected Phase 8 version is `0.8.0-phase8` with version code `8`.

### Operations portal

```bash
cd admin/direkt-operations-portal
npm ci --ignore-scripts
npm run verify
```

`npm run verify` runs formatting, lint, TypeScript, Vitest coverage and the Next.js production build.

### Documentation and repository controls

The documentation gate must verify:

- Markdown structure and links;
- no committed secrets or real participant data;
- synthetic-only examples;
- decision and risk IDs remain unique;
- project status and workstream lock agree;
- Stage 8 and Phase 9 boundaries agree with the master plan.

## Functional matrix

| Area | Required proof | Permanent evidence |
|---|---|---|
| Enquiry creation | Current publication, bounded payload, idempotent replay, fingerprint conflict | Enquiry E2E and OpenAPI checks |
| Customer isolation | Cross-customer identifiers do not grant access | Enquiry and lifecycle E2E deny assertions |
| Provider scope | Provider is actor-resolved; zero, revoked or ambiguous scope is denied | Repository logic and provider-scope regressions |
| Lifecycle | Valid transitions pass; stale, repeated, invalid and terminal transitions fail | Database transition function and HTTP E2E |
| Contact consent | Accepted active interaction and verified phone are mandatory | Migration constraints and lifecycle E2E |
| Data minimization | Handoff exposes masked hint only; raw value and delivery are absent | DTO flags, JSON leak assertions and portal boundary tests |
| Consent expiry/revocation | Provider retrieval stops immediately | Handoff repository and lifecycle E2E |
| Interaction history | Events are immutable and scope-safe | Database triggers and HTTP projections |
| Review eligibility | Only accepted-and-closed owned interaction within window | Review insert trigger and lifecycle E2E |
| Review duplication | One review per interaction | Unique constraint and conflict assertion |
| Provider response | One immutable response per review | Unique constraint, no-delete trigger and conflict assertion |
| Moderation | Authorized reasoned revision-safe transitions only | Permission guards, DB permission check and E2E |
| Public review | Pending/withheld/removed/appealed reviews remain private | Public endpoint E2E before and after publication |
| Appeals | Only withheld/removed reviews; denied restores origin; upheld returns pending | Forward migrations and lifecycle E2E |
| Reports | One report per identity; report is separate from complaint | Unique constraint and E2E |
| Customer complaints | Owned interaction, idempotent creation, separate state machine | Complaint E2E and portal tests |
| Incident separation | Phase 7 internal incident data is not included | Operations DTO flags and portal assertions |
| Trust independence | No decision, claim or publication count changes | Before/after database assertions |
| Commercial independence | No subscription, invoice, payment or webhook mutation route | OpenAPI prohibited-path check |
| Offline Android | Draft restores with stable logical request and retry count | Unit and Compose instrumentation tests |
| Android stale state | Stale revision and consent expiry require explicit recovery | Unit and Compose state tests |
| Accessibility | Critical controls have labels, test tags and readable states | Compose instrumentation and Android lint |
| Portal API boundary | No direct database/storage connector | Source import gate and portal tests |

## Security and privacy review checklist

- [ ] No raw phone, email, message, evidence or storage value is stored in the interaction schema.
- [ ] No public response includes customer identity or interaction identifier.
- [ ] Operations interaction history excludes contact hints and customer identity.
- [ ] Provider scope is never accepted from request body or query string.
- [ ] Privileged database functions verify active permissions independently from controllers.
- [ ] Lifecycle event rows are update/delete protected.
- [ ] Material interaction rows are delete protected.
- [ ] Idempotency keys are stored only as hashes.
- [ ] Policy versions and reason codes are recorded on privileged actions.
- [ ] Direct database mutation cannot create review publication or complaint terminal state.
- [ ] Interaction work cannot create verification decisions, claims, publication or ranking.
- [ ] Phase 9 endpoints remain absent except the inherited synthetic read-only subscription boundary.
- [ ] Real credentials, vendor identifiers and real participant data remain absent.

## Android critical states

The customer and provider experiences must render and recover from:

- loading;
- empty;
- offline draft;
- interrupted/retryable send;
- access denied;
- stale revision;
- consent expired or revoked;
- accepted/closed terminal states;
- review pending, withheld, appealed and published;
- complaint submitted, triaged, resolved and closed.

The synthetic client may demonstrate these states locally, but the server remains authoritative whenever a real API adapter is introduced.

## Portal critical states

The operations portal must represent:

- loading and empty queues without private placeholders;
- permission denied;
- stale review or complaint revision;
- pending moderation;
- appeal awaiting decision;
- expired/revoked handoff as aggregate state only;
- customer complaint records separately from internal incidents.

## Exit decision

Phase 8 may be promoted only when all of the following are true:

1. the backend, Android, portal and documentation gates pass on the same commit;
2. the complete lifecycle E2E passes against a clean PostgreSQL/PostGIS database;
3. Android unit, lint and APK/test-APK assembly pass;
4. portal format, lint, type, test and production build pass;
5. OpenAPI contains all approved Phase 8 routes and no prohibited communication or commercial routes;
6. source review finds no critical or high unresolved defect;
7. decisions, risks, status and Phase 9 handoff are current;
8. PR #31 is merged without force-pushing;
9. Issue #30 is closed as completed;
10. `build/android-v1` is synchronized to the stable merge checkpoint and the workstream lock is released.

## Residual limitations accepted at this checkpoint

Even after a successful synthetic exit:

- there is no production WhatsApp, call, SMS, email or push adapter;
- Android recovery uses synthetic metadata persistence, not approved encrypted production storage;
- no representative Zambia device/connectivity study has been completed;
- moderation, complaint and appeal staffing/service levels are not operational;
- legal basis, privacy notices, retention and deletion rules require qualified review;
- review-abuse and anomaly detection are not production-ready;
- the controlled Zambia pilot remains blocked by later programme gates.

These limitations do not prevent the synthetic Phase 8 checkpoint, but they prohibit production or pilot interpretation.

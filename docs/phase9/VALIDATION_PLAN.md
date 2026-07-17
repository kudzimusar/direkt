# Phase 9 Validation and Exit Matrix

**Checkpoint:** Phase 9 — Subscription and payment foundation  
**Branch:** `build/android-v1`  
**PR:** #35  
**Issue:** #34  
**Validation rule:** all permanent gates must pass on one exact reviewed source head before merge.

## Validation objective

Prove that DIREKT's synthetic commercial loop is authorization-safe, idempotent, immutable where required, ledger-balanced, reconciliation-aware, privacy-minimized and structurally incapable of changing verification, publication, ranking or accountability rights.

A green build alone is insufficient. Exit also requires database state-machine review, safe API projection review, payment-adapter review, Android recovery review, portal permission review, documentation consistency and complete pull-request source review.

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

The CI database is PostgreSQL 18 with PostGIS 3.6. The complete migration chain is applied from a clean database and verified against committed SHA-256 checksums.

### Android

```bash
cd android/direkt-app
./gradlew --no-daemon --stacktrace \
  testDebugUnitTest \
  lintDebug \
  assembleDebug \
  assembleDebugAndroidTest
```

The permanent package identity remains `com.kudzimusar.direkt`; debug builds use the `.debug` suffix. Phase 9 must preserve the native Android and accessibility contracts inherited from earlier phases.

### Operations portal

```bash
cd admin/direkt-operations-portal
npm ci --ignore-scripts
npm run verify
```

`npm run verify` runs formatting, lint, strict TypeScript, Vitest coverage and the Next.js production build. CI separately verifies that the portal imports no direct database, Supabase or payment-provider client.

### Documentation and repository controls

The documentation gate must verify:

- Markdown structure and links;
- no committed credentials or real participant/payment data;
- synthetic-only examples;
- unique decision and risk identifiers;
- project status, workstream lock and phase handoffs agree;
- Phase 9 and Phase 10 boundaries agree with the master plan;
- MkDocs strict build and generated Pages source succeed.

## Functional matrix

| Area | Required proof | Permanent evidence |
|---|---|---|
| Product catalogue | Safe active products/prices only; explicit no-verification/no-ranking flags | Catalogue API, types and OpenAPI checks |
| Provider scope | One active actor-resolved provider workspace; copied identifiers cannot grant access | Provider commercial E2E and DB scope functions |
| Idempotent subscription | Identical replay returns existing row; changed fingerprint is rejected | Commercial lifecycle E2E and unique constraints |
| Subscription lifecycle | Valid transitions pass; stale, invalid, repeated and terminal actions fail | Database functions, events and E2E |
| Entitlements | Grants follow product and subscription policy; ranking effect remains false | Database functions and workspace projection |
| Immutable invoice | Minor-unit totals and line snapshots cannot be edited or deleted | Migration guards and direct-mutation deny assertions |
| Payment initiation | Stable logical key; synthetic or disabled adapter only | Service tests, E2E and production environment schema |
| Webhook signature | HMAC and timestamp required before state change | Provider unit tests and signed E2E |
| Webhook replay | Identical event is duplicate-safe; conflicting event is rejected | Unique constraints and E2E |
| Amount/currency mismatch | Payment is not silently succeeded; reconciliation case is opened | Commercial lifecycle E2E |
| Receipt | Generated only from confirmed successful payment and balanced ledger | Workspace projection and E2E |
| Ledger | Append-only and balanced per transaction/currency | Database functions and balance assertions |
| Reconciliation | Explicit mismatch code, revision, reason and operations lifecycle | Operations API and E2E |
| Adjustment | Requester separation and two distinct approvals | DB functions, permissions and E2E |
| Synthetic refund | Accounting/audit only; no external money movement | Adapter flags and projection assertions |
| Trust independence | Decisions, claims, publications, reviews and complaints unchanged | Before/after database assertions |
| Privacy | No credential, contact, evidence, raw webhook or internal identity in projections | Leak assertions, DTO flags and portal tests |
| Android retry | Stable logical request survives process recreation and interruption | Unit and Compose instrumentation tests |
| Android critical states | Pending, active, grace, past-due, paid, failed, reversed and recovery states | Compose instrumentation and Android lint |
| Portal separation | Finance permissions do not derive from trust/review permissions | Navigation, page and API-client tests |
| Portal API boundary | No direct data/storage/payment client | Import isolation gate |
| Production disable | Production cannot select synthetic provider mode | Environment-schema and adapter unit tests |

## Database review checklist

- [ ] Commercial aggregates remain in the separate `commercial` schema.
- [ ] No payment field is added to verification, discovery, interaction, review, complaint or incident tables.
- [ ] Provider scope is resolved from active server assignments.
- [ ] Operations actions verify current global commercial permissions.
- [ ] Idempotency keys are stored only as hashes and bound to fingerprints.
- [ ] Currency values use integer minor units and bounded currency codes.
- [ ] Issued invoice lines are immutable.
- [ ] Payment and subscription events are append-only.
- [ ] Raw webhook bodies are absent from the commercial schema.
- [ ] External event IDs and fingerprints are unique.
- [ ] Ledger entries cannot be updated or deleted.
- [ ] Ledger transactions are balanced before completion.
- [ ] Reconciliation is opened for mismatch rather than silently mutating payment state.
- [ ] Adjustment application requires two distinct eligible approvers.
- [ ] Direct edits cannot create trust, publication or ranking state.

## API and provider-adapter review checklist

- [ ] Public catalogue contains only allowlisted commercial fields.
- [ ] Provider workspace accepts no client-selected provider scope.
- [ ] Operations routes use separate commercial permission families.
- [ ] Synthetic webhook route accepts only bounded canonical fields.
- [ ] Invalid signature and stale timestamp cannot mutate payment state.
- [ ] Disabled adapter keeps historical state readable while preventing initiation.
- [ ] Production environment accepts only disabled payment mode.
- [ ] No real provider route, SDK, credential or vendor identifier is committed.
- [ ] OpenAPI requires every approved Phase 9 route.
- [ ] OpenAPI rejects real-provider, credential, raw-payload and public-commercial paths.

## Privacy and security review checklist

- [ ] No payment PIN, card number, account number, wallet credential or provider secret is stored.
- [ ] No raw customer/provider contact is copied into commercial records.
- [ ] Interaction handoff consent is not reused as payment or marketing consent.
- [ ] Private evidence and storage object paths are absent.
- [ ] Raw webhook payload is absent from API and database projections.
- [ ] Internal requester/approver identities are not exposed in safe projections.
- [ ] Android persistence contains only opaque IDs, amount, currency, revision and safe state/error metadata.
- [ ] Portal uses backend bearer-authenticated no-store HTTP requests only.
- [ ] Repository and generated documentation contain fictional data only.

## Android critical states

The provider commercial experience must render and recover from:

- product loading and empty catalogue;
- subscription pending activation;
- active subscription;
- deterministic grace period;
- past-due entitlement degradation;
- cancelled or expired terminal state;
- offline payment preparation;
- initiation in progress;
- interrupted and retryable request;
- stale revision and refresh;
- external action required;
- processing;
- failed;
- paid and receipt available;
- reversed;
- cancelled or expired payment intent;
- access denied.

Critical controls require readable text, accessibility semantics and stable test tags. Local state is synthetic presentation/recovery state; the server remains authoritative.

## Portal critical states

The finance workspace must represent:

- loading and empty commercial queues;
- permission denied;
- product active/inactive state;
- subscription pending, active, grace, past-due and terminal state;
- invoice open, paid and void state;
- payment required-action, succeeded, failed and reversed state;
- balanced ledger status;
- open reconciliation mismatch;
- stale reconciliation revision;
- adjustment awaiting first and second independent approval;
- rejected or applied adjustment.

Trust reviewers and supervisors without commercial permissions must not receive the Finance navigation item.

## Pull-request review procedure

Before promotion:

1. list every changed file in PR #35;
2. inspect migrations for authorization, immutability, amount and balance defects;
3. inspect controllers/services for scope, idempotency, adapter and projection defects;
4. inspect Android persistence and UI for credential leakage and inaccessible recovery states;
5. inspect portal permissions, API-only architecture and stale planned-state assumptions;
6. inspect documentation for overstated production readiness;
7. inspect all review threads, issue comments and submitted reviews;
8. resolve every valid finding and rerun permanent gates;
9. confirm the reviewed SHA is still the PR head before merge.

## Exit decision

Phase 9 may be promoted only when all of the following are true:

1. backend, Android, portal and documentation workflows pass on one exact source head;
2. the complete commercial lifecycle E2E passes against a clean PostgreSQL/PostGIS database;
3. migrations, events, invoices, ledger and adjustment history satisfy immutability review;
4. signature, timestamp, replay, mismatch and reconciliation tests pass;
5. trust/publication/ranking before-and-after assertions remain unchanged;
6. Android unit, lint, APK and test-APK assembly pass;
7. portal format, lint, type, test, build and isolation checks pass;
8. OpenAPI contains approved commercial routes and no real-provider or credential surface;
9. no critical or high unresolved source-review defect remains;
10. decisions, risks, status, commercial trust contract and Phase 10 handoff are current;
11. PR #35 is merged without force-pushing;
12. Issue #34 is closed as completed;
13. `build/android-v1` is synchronized to the stable merge checkpoint and the Phase 9 workstream lock is released.

## Residual limitations accepted at this checkpoint

Even after successful synthetic exit:

- no real mobile-money, card, bank or wallet provider is approved;
- no production credential, settlement account or money movement exists;
- Supabase remote activation still requires verified project access and protected secrets;
- Android recovery storage is not approved encrypted production payment storage;
- reconciliation staffing and service levels are not operational;
- backup/restore, incident-response, abuse, performance and dependency/secret-scanning exercises remain Phase 10 work;
- qualified Zambia payment, consumer, privacy, tax, invoicing and anti-money-laundering review remains outstanding;
- approved map, OTP and payment-provider terms remain outstanding;
- controlled Zambia pilot validation remains Phase 11 work.

These limitations do not prevent the synthetic Phase 9 checkpoint, but they prohibit production payment or pilot interpretation.

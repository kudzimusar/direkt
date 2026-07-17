# Phase 10 Exit-Gate Status

**Reviewed:** 2026-07-18  
**Governing issue:** #41  
**Checkpoint PR:** #42  
**Implementation lane:** `build/android-v1`  
**Authority:** `MASTER_BUILD_PLAN.md` and `docs/phase10/HANDOFF_FROM_PHASE9.md`

## Decision

Phase 10 is **not complete** and Phase 11 is **not authorized**.

The repository-side security, privacy, abuse-control, recovery, performance and supply-chain implementation is now substantially complete and has passed together on an exact reviewed technical head. The documented Phase 10 exit gate still requires managed-integration evidence, current external approvals or explicit stop gates, final review/promotion and branch synchronization.

A remotely reachable development or protected staging service is not a controlled Zambia pilot. No real participant, provider, evidence or payment data is authorized by this status.

## Exact technical checkpoint

Exact passing technical head: `3a387e31626f0669f33ca464b428492694df8c32`

Nine permanent workflows passed together on that head:

- documentation quality;
- backend CI;
- backend container CI;
- operations portal CI;
- Android CI;
- controlled staging container readiness;
- recovery and reliability exercise;
- supply-chain security;
- Android performance budget.

This proves the repository/CI technical checkpoint. It does not prove exact-project managed activation, legal readiness or pilot readiness.

## Stage-by-stage evidence matrix

| Stage | Required outcome | Repository status | Remaining gate |
|---|---|---|---|
| 10A | Threat model, route/function authorization and tenant isolation review | Implemented; authorization inventory and regressions pass in permanent backend CI | Final checkpoint review and merge |
| 10B | Privacy, retention, deletion, export and legal controls | Privacy/retention contracts and regressions exist | Qualified Zambia legal, DPC and controller/processor evidence |
| 10C | Exact-project private storage and evidence access validation | Supabase storage adapter, private buckets, migrations and provider-error redaction exist | Successful remote activation evidence for immutable DIREKT project ref `aeeuscifrxcjmnswqwnq`; current connector access does not expose that project |
| 10D | Abuse, enumeration, replay, spam and distributed rate-limit controls | Distributed database-backed abuse control, tests and dedicated staging pepper binding pass | Managed private-staging confirmation on the final source |
| 10E | Location privacy, minimization and fallback | Manual/synthetic location boundaries and external-provider stop gate are documented | Approved map/geocoding provider terms before any production credential or exact-location processing |
| 10F | Restore, incident, recovery and performance evidence | Synthetic full restore, PostGIS/sentinel integrity, fail-closed outage recovery, API/portal soak and Android cold-launch budgets pass | Managed Supabase/Cloud Run restore, rollback, kill-switch, representative-device and incident-tabletop evidence |
| 10G | Dependency, secret, configuration and environment hardening | Protected-literal scan, locked installs, zero high/critical npm audit result, Gradle resolution, Dependabot and private staging checks pass | Final managed secret/IAM verification on deployed revisions |
| 10H | Provider, authority and legal approvals or stop gates | `EXTERNAL_APPROVAL_REGISTER.md` records explicit stop gates for DPC, ZICTA, CCPC, Bank of Zambia, payments, OTP, maps, registries and tax | Owner/counsel/provider evidence before real processing; blocked adapters remain disabled |
| 10I | Final regression, review, handoff and checkpoint promotion | Blocked draft Phase 11 handoff exists; repository workflows pass | Managed integration evidence; zero unresolved critical/high defects; review, merge, Issue #41 closure and branch synchronization |

## Technical evidence summary

### Recovery and reliability

- 118/118 application tables restored;
- 1/1 synthetic identities restored;
- PostGIS 3.6.4 preserved;
- integrity sentinel matched with zero synthetic loss;
- restore completed in 2 seconds in the CI exercise;
- readiness failed closed during database outage;
- recovery measured at 0 seconds after dependency return;
- API soak passed 600/600 requests at concurrency 10, p95 15 ms and maximum 173 ms.

### API and portal containers

- API and portal run non-root as UID 1000;
- migrations and end-to-end readiness pass on non-default ports;
- API soak passed 300/300, p95 10 ms and maximum 125 ms;
- portal-through-API soak passed 300/300, p95 23 ms and maximum 70 ms;
- protected-literal violations: zero.

### Android

- debug APK: 11,676,451 bytes against a 50 MiB ceiling;
- API 35 cold-launch samples: 2,167 / 3,727 / 3,358 / 2,532 / 4,777 ms;
- median: 3,358 ms against a 4,500 ms debug-emulator regression budget;
- p95: 4,777 ms against a 6,000 ms debug-emulator regression budget;
- the first-frame startup path reduced the prior measured median by about 46% and p95 by about 31%.

## Managed integration status

### Supabase

- Bound project ref: `aeeuscifrxcjmnswqwnq`.
- Required mode: exact-project, private buckets, pooled runtime connection, direct migration connection, synthetic-only until later approval.
- Repository integration and protected activation workflow are implemented.
- The connected Supabase tool still exposes only unrelated CarUp projects, so no successful exact-project remote activation was recorded in this review.
- Safety decision: unrelated Supabase projects must not be used as substitutes or mutated.

### Google Cloud, Artifact Registry and Cloud Run

- Bound project: `direkt-dev-502701` in `asia-northeast1`.
- Immutable API image build and private Cloud Run service deployment have previously reached Google Cloud.
- The latest recorded development deployment still lacks a successful final readiness result.
- The Phase 10 branch contains the reserved-`PORT` correction, audience-bound GitHub OIDC smoke tokens and separate `X-Serverless-Authorization` infrastructure authentication.
- The two-service staging workflow remains manual-only, private, synthetic-only, secret-version-pinned and blocked from dispatch until the exact reviewed source is merged to `main` with all staging variables present.

### Vercel

- The operations portal has a standalone build, health contract and deployment configuration.
- No owner-confirmed Vercel project binding or successful protected preview/staging evidence is recorded.
- Vercel must not be treated as complete until project identity, environment variables, private API reachability and no-index/no-store behavior are verified.

### Firebase

- Bound Google/Firebase project and internal tester-group identifiers are documented.
- No final App Distribution release evidence on the exact Phase 10 source is recorded.
- External testers, production distribution and public release remain outside Phase 10 authorization.

## Promotion rule

Phase 11 may begin only after all of the following are true on one exact reviewed commit:

1. backend, Android, portal, documentation, container, staging-readiness, recovery/reliability, supply-chain and Android-performance workflows pass;
2. successful exact-project Supabase activation evidence is recorded;
3. private Cloud Run API and portal readiness pass with immutable images and approved identity/secret boundaries;
4. Vercel and Firebase evidence is either completed or explicitly excluded by the authoritative plan with a documented stop gate;
5. managed rollback, kill-switch, restore and incident evidence is recorded;
6. no unresolved critical or high security, privacy, legal or reliability defect remains;
7. the Phase 11 handoff is current and explicitly preserves the controlled-pilot entry criteria;
8. PR #42 is reviewed and merged, Issue #41 is closed, and long-lived branches are synchronized without force-pushing.

Until then, the correct action is to continue Phase 10 rather than begin pilot recruitment, real data entry, public promotion or payment activation.

# Phase 10 Exit-Gate Status

**Reviewed:** 2026-07-18  
**Governing issue:** #41  
**Checkpoint PR:** #42  
**Implementation lane:** `build/android-v1`  
**Authority:** `MASTER_BUILD_PLAN.md` and `docs/phase10/HANDOFF_FROM_PHASE9.md`

## Decision

Phase 10 is **not complete** and Phase 11 is **not authorized**.

The repository has substantial security, privacy, abuse-control and controlled-infrastructure implementation, but the documented Phase 10 exit gate requires one exact reviewed head with permanent green evidence for restore/recovery, performance/soak, supply-chain scanning and managed integrations. It also requires current external approvals or explicit stop gates and a current Phase 11 handoff.

A remotely reachable development or protected staging service is not a controlled Zambia pilot. No real participant, provider, evidence or payment data is authorized by this status.

## Stage-by-stage evidence matrix

| Stage | Required outcome | Repository status | Remaining gate |
|---|---|---|---|
| 10A | Threat model, route/function authorization and tenant isolation review | Implemented and reviewed on PR #42; authorization inventory is part of permanent backend CI | Re-run on the final exact Phase 10 head |
| 10B | Privacy, retention, deletion, export and legal controls | Privacy/retention contract and regressions exist; external Zambia legal determinations remain stop-gated | Qualified Zambia legal, DPC and controller/processor evidence |
| 10C | Exact-project private storage and evidence access validation | Supabase storage adapter, private buckets, migrations and provider-error redaction exist | Successful remote activation evidence for immutable DIREKT project ref `aeeuscifrxcjmnswqwnq`; current connector access does not expose that project |
| 10D | Abuse, enumeration, replay, spam and distributed rate-limit controls | Distributed database-backed abuse control and tests exist; staging has a dedicated rate-limit pepper binding | Final exact-head backend and controlled-staging evidence |
| 10E | Location privacy, minimization and fallback | Manual/synthetic location boundaries and external-provider stop gate are documented | Approved map/geocoding provider terms before any production credential or exact-location processing |
| 10F | Restore, incident, recovery and performance evidence | Permanent synthetic restore/outage/soak workflow added; full dump/restore, PostGIS, sentinel integrity and restored API startup have executed successfully | One final green workflow run proving fail-closed dependency outage, bounded recovery and soak budgets; managed-staging exercise remains required |
| 10G | Dependency, secret, configuration and environment hardening | Protected-literal scan, pinned lockfile installs, Dependabot and permanent supply-chain workflow added | Final green npm/Gradle/security reports on the exact checkpoint head |
| 10H | Provider, authority and legal approvals or stop gates | `EXTERNAL_APPROVAL_REGISTER.md` records explicit stop gates for DPC, ZICTA, CCPC, Bank of Zambia, payments, OTP, maps, registries and tax | Owner/counsel/provider evidence before real processing; blocked adapters remain disabled |
| 10I | Final regression, review, handoff and checkpoint promotion | Active | All permanent workflows green on one exact head; managed integration evidence; zero unresolved critical/high defects; current Phase 11 handoff; merge and synchronization |

## Managed integration status

### Supabase

- Bound project ref: `aeeuscifrxcjmnswqwnq`.
- Required mode: exact-project, private buckets, pooled runtime connection, direct migration connection, synthetic-only until later approval.
- Current status: repository integration is implemented, but no successful activation notification or connector-visible project evidence has been recorded in this review.
- Safety decision: unrelated Supabase projects must not be used as substitutes or mutated.

### Google Cloud, Artifact Registry and Cloud Run

- Bound project: `direkt-dev-502701` in `asia-northeast1`.
- Immutable API image build and private Cloud Run deployment have reached Google Cloud successfully.
- The latest development run still lacks a successful final readiness result.
- The Phase 10 branch now contains the reviewed reserved-`PORT` correction and audience-bound GitHub OIDC smoke-token pattern.
- The two-service staging workflow remains manual-only, private, synthetic-only, version-pinned for secrets and blocked from dispatch until bootstrapped to `main` with an exact reviewed `main`-ancestor source.

### Vercel

- The operations portal has a standalone build, health contract and deployment configuration.
- No owner-confirmed Vercel project binding or successful protected preview/staging evidence is recorded.
- Vercel must not be treated as complete until project identity, environment variables, private API reachability and no-index/no-store behavior are verified.

### Firebase

- Bound Google/Firebase project and internal tester-group identifiers are documented.
- No final App Distribution release evidence on the exact Phase 10 head is recorded.
- External testers, production distribution and public release remain outside Phase 10 authorization.

## Permanent technical controls added during this review

- synchronized the corrected Cloud Run development workflow into the Phase 10 lane at `af5ad94ef7454b3eea3b207077f99cb165c7b21c`;
- corrected private two-service staging deployment authentication and Cloud Run `PORT` handling at `0ee194d7eb35d1904be2a0a391cd70702e1e7175`;
- made those controls enforceable in the staging readiness gate at `57da4d227946a4e0402a4f0a7cbf655dd14e41b4`;
- added persistent migration diagnostics at `6a86c6f173e78d87ad842fec327d7b0d08bd0046`;
- added the synthetic recovery/reliability workflow at `cb46294c0571102509fc51621f4412d70c4274c2` and made the dependency-outage exercise reversible at `ce94559798b4de2c16e5ea72bd0e5729f461f1fb`;
- refined protected-literal classification for runtime-only disposable PostgreSQL variables at `94dc675331feabe7c425f392cd102c93a69a0db0` without allowing actual credential values;
- added bounded dependency-update automation at `733ddfdbf7a4b0a708d6941cfddb435a95736f74`;
- added the permanent supply-chain security gate at `9bbaea4c5ac60fe1b1da7fcd1619a37538d9269f`.

## Promotion rule

Phase 11 may begin only after all of the following are true on one exact reviewed commit:

1. backend, Android, portal, documentation, container, staging-readiness, recovery/reliability and supply-chain workflows pass;
2. successful exact-project Supabase activation evidence is recorded;
3. private Cloud Run API and portal readiness pass with immutable images and approved identity/secret boundaries;
4. Vercel and Firebase evidence is either completed or explicitly excluded by the authoritative plan with a documented stop gate;
5. no unresolved critical or high security, privacy, legal or reliability defect remains;
6. the Phase 11 handoff is current and explicitly preserves the controlled-pilot entry criteria;
7. PR #42 is reviewed, merged, Issue #41 is closed and long-lived branches are synchronized without force-pushing.

Until then, the correct action is to continue Phase 10 rather than begin pilot recruitment, real data entry, public promotion or payment activation.

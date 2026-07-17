# Phase 10 Reliability, Recovery and Performance Evidence

**Status:** Permanent synthetic-only evidence is implemented and passing in GitHub Actions. Managed-environment evidence remains required before Phase 10 promotion.  
**Reviewed:** 2026-07-18  
**Governing issue:** #41  
**Checkpoint PR:** #42

## Scope and boundary

This document records technical evidence produced without real participant, provider, evidence or payment data. It does not authorize a Zambia pilot, public access or production operation.

The permanent workflows cover:

- complete PostgreSQL/PostGIS backup and restore integrity;
- restored API startup and forward migration compatibility;
- dependency-outage detection and recovery;
- bounded API reliability soak;
- API and operations-portal container performance budgets;
- Android debug artifact and cold-launch budgets;
- immutable evidence artifacts retained by GitHub Actions.

## Exact-head workflow checkpoint

Exact implementation head: `3a387e31626f0669f33ca464b428492694df8c32`

All nine permanent workflows associated with that head passed together:

- Documentation quality;
- DIREKT Backend CI;
- DIREKT Backend Container CI;
- DIREKT Operations Portal CI;
- DIREKT Android CI;
- DIREKT controlled staging container readiness;
- DIREKT Phase 10 recovery and reliability exercise;
- DIREKT Phase 10 supply-chain security;
- DIREKT Phase 10 Android performance budget.

This is a repository/CI checkpoint only. It does not replace managed-integration evidence or external approvals.

## Database restore and dependency recovery

Permanent workflow: `DIREKT Phase 10 recovery and reliability exercise`  
Representative passing evidence run: `29594186405` / run number `18`

| Measure | Result | Exercise gate |
|---|---:|---:|
| Source application tables | 118 | Must be greater than zero |
| Restored application tables | 118 | Must equal source |
| Source synthetic identities | 1 | Must be greater than zero |
| Restored synthetic identities | 1 | Must equal source |
| PostGIS version | 3.6.4 | Must survive restore |
| Integrity sentinel | Matched | Must match source hash |
| Restore duration | 2 seconds | At most 180 seconds in CI exercise |
| Exercise recovery point | Zero synthetic sentinel loss | No loss allowed |
| Readiness during database outage | Failed closed | HTTP 200 prohibited |
| Recovery after dependency return | 0 seconds measured | At most 120 seconds in CI exercise |

The exercise performs a full custom-format `pg_dump`, creates a clean restore database, uses `pg_restore --exit-on-error`, compares table and synthetic-identity counts, verifies the integrity sentinel and PostGIS extension, reruns forward migrations, and starts the API against the restored database.

The outage exercise pauses PostgreSQL, verifies that API readiness does not remain healthy, restores the dependency, and verifies readiness recovery. This is a technical dependency-recovery exercise, not a substitute for a managed Supabase disaster-recovery exercise or an operational incident tabletop.

## API reliability soak

The same permanent recovery workflow executes a bounded synthetic API soak after recovery.

| Measure | Result | Budget |
|---|---:|---:|
| Requests | 600 | 600 |
| Concurrency | 10 | 10 |
| Successful readiness responses | 600 | 600 required |
| p95 latency | 15 ms | At most 750 ms |
| Maximum latency | 173 ms | At most 3,000 ms |

## API and portal container performance

Permanent workflow: `DIREKT controlled staging container readiness`  
Representative passing evidence run: `29594615933` / run number `51`

The workflow builds the immutable candidate containers, applies all migrations to disposable PostGIS, starts both services on non-default ports, verifies non-root runtime identities and exercises the portal-to-API health path.

| Target | Requests | Concurrency | Successes | p95 | Maximum | p95 budget | Maximum budget |
|---|---:|---:|---:|---:|---:|---:|---:|
| API readiness | 300 | 10 | 300 | 10 ms | 125 ms | 750 ms | 3,000 ms |
| Portal health through API | 300 | 10 | 300 | 23 ms | 70 ms | 1,200 ms | 3,000 ms |

Additional evidence from the same run:

- API runtime UID: `1000`;
- portal runtime UID: `1000`;
- API test port: `9091`;
- portal test port: `9092`;
- protected-literal violations: `0`;
- deployment triggered: `false`.

## Android performance budget

Permanent workflow: `DIREKT Phase 10 Android performance budget`  
Passing evidence run: `29597189450` / run number `21`

The workflow builds and unit-tests the exact debug APK, enforces a 50 MiB artifact ceiling, creates an API 35 x86_64 emulator through repository-owned shell logic, disables animations, installs the APK and records five cold launches through `am start -W -S`.

The app startup path was changed to render a small branded first frame before composing the full customer/provider workspace. Against the same emulator contract, the observed median improved from 6,208 ms to 3,358 ms and the observed p95 improved from 6,876 ms to 4,777 ms.

| Measure | Result | Regression budget |
|---|---:|---:|
| Debug APK size | 11,676,451 bytes | At most 52,428,800 bytes |
| CI build duration | 41 seconds | Evidence only |
| Cold-launch samples | 2,167 / 3,727 / 3,358 / 2,532 / 4,777 ms | Five required |
| Median cold launch | 3,358 ms | At most 4,500 ms |
| p95 cold launch | 4,777 ms | At most 6,000 ms |

These values are calibrated regression gates for an API 35 x86_64 **debug emulator**. They are not production-device targets. Release-build, representative-device and constrained-network performance evidence remains required before a real pilot or public release.

## Managed-environment evidence still required

The passing local/CI exercises do not complete Stage 10F by themselves. Before promotion, the repository must also record:

- exact-project Supabase activation and private-bucket verification;
- managed Supabase backup/restore scope for database metadata and object storage;
- a manually approved immutable private Cloud Run staging deployment and health result;
- scale-to-zero, rollback-to-prior-revision and kill-switch evidence;
- protected Vercel Preview/Staging evidence if that binding is implemented;
- Firebase internal distribution evidence where Android changes require it;
- release-build performance on representative Zambia devices and connectivity;
- an incident-response tabletop with named operational owners and escalation paths;
- current alerting/SLO ownership for the managed environment.

## Evidence handling

Workflow artifacts contain only synthetic counts, durations, status values, source identifiers and diagnostics. They must not contain database credentials, Supabase keys, participant data, evidence object keys or provider secrets.

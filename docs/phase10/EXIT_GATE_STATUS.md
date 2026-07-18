# Phase 10 Exit-Gate Status

**Reviewed:** 2026-07-18  
**Governing issue:** #41  
**Checkpoint PR:** #42 plus managed closeout fixes through #110  
**Authority:** `MASTER_BUILD_PLAN.md` and `docs/phase10/HANDOFF_FROM_PHASE9.md`

## Decision

Phase 10 implementation and required managed synthetic/private-staging exit evidence are **complete**.

Final documentation promotion, Issue #41 closure and synchronization of `build/android-v1` are the remaining administrative promotion actions. Phase 11 real-participant pilot activity is still **not automatically authorized** by Phase 10 completion; it remains subject to the explicit Phase 11 entry checklist.

A remotely reachable IAM-private staging service is not a controlled Zambia pilot. No real participant, evidence, exact-location, unrestricted communications or real-money processing is authorized by this status.

## Exact managed checkpoint

Final managed source: `5d9313333c49d6501944e6ddba4cd408c540ff47`.

| Managed gate | Run | Result |
|---|---:|---|
| Supabase full managed restore | `29641165494` | PASS |
| Firebase internal App Distribution | `29635486574` | PASS |
| Private Cloud Run API + portal deployment | `29647717734` | PASS |
| Independent Cloud Run staging inspection | `29647798494` | PASS |
| Managed rollback/kill-switch/idle/monitoring exercise | `29647821458` | PASS |

See `PHASE10_CLOSEOUT_2026-07-18.md` for the detailed closeout record.

## Stage-by-stage evidence matrix

| Stage | Required outcome | Final Phase 10 status |
|---|---|---|
| 10A | Threat model, security architecture, authorization and tenant isolation | Complete; permanent authorization/security regressions retained |
| 10B | Privacy, retention, deletion, correction, export and legal controls | Complete for Phase 10; real-processing legal approvals retained as Phase 11 entry stop gates |
| 10C | Exact-project private storage/evidence access | Complete on Supabase ref `aeeuscifrxcjmnswqwnq`; 37 migrations, 13 schemas and four private buckets verified |
| 10D | Abuse, enumeration, replay, spam and distributed rate controls | Complete for synthetic/private staging; permanent controls retained |
| 10E | Location privacy, minimization and fallback | Complete with manual/synthetic fallback and disabled unapproved provider adapters |
| 10F | Restore, incident, recovery, performance and alerting | Complete; managed restore, rollback, floating-LATEST recovery, kill switch, restoration, idle readiness and Monitoring passed |
| 10G | Dependency, secret, configuration and environment hardening | Complete; locked installs, protected-literal scans, pinned secrets and bounded IAM retained |
| 10H | Provider/authority/legal approvals or explicit stop gates | Complete for Phase 10 through explicit stop gates; actual approvals remain mandatory before corresponding Phase 11/production use |
| 10I | Final regression, review, handoff and promotion | Technical/managed evidence complete; final documentation merge, Issue #41 closure and branch sync are promotion actions |

## Managed integration status

### Supabase

- Exact project ref: `aeeuscifrxcjmnswqwnq`.
- PostgreSQL 17 and PostGIS active.
- 37 checksummed DIREKT migrations recorded.
- 13 DIREKT application schemas verified.
- Four required Storage buckets verified private; object count remained zero during Phase 10 closeout.
- Browser-facing roles have no direct DIREKT application-schema/table access.
- Managed restore run `29641165494` passed dump, clean restore, integrity/sentinel checks, migration-ledger preservation, forward migration and restored API readiness.

### Google Cloud / Cloud Run

- Project: `direkt-dev-502701`, region `asia-northeast1`.
- Artifact Registry: `direkt-containers`.
- API: `direkt-api`.
- Portal: `direkt-operations-portal-staging`.
- Final exact-source deployment, inspection and operations chain passed on `5d9313333c49d6501944e6ddba4cd408c540ff47`.
- No public invocation bindings remained.
- Runtime identities, exact images, numeric secret versions and effective scale-to-zero/max-one settings were verified.
- Rollback recovery now restores floating `LATEST` traffic, preventing future healthy revisions from being retired by a stale named-revision traffic pin.
- Monitoring alert-policy verification passed with the least-privilege `roles/monitoring.alertPolicyEditor` grant on the deployer.

### Portal hosting

IAM-private Cloud Run is the authoritative protected portal staging target for the Phase 10/Phase 11-entry path. Vercel Preview/Staging is explicitly excluded from this path by the documented programme decision and is not a Phase 10 completion blocker.

### Firebase

Internal App Distribution run `29635486574` passed for the debug application and `direkt-internal-testers` only. External/public distribution remains outside Phase 10 authorization.

## Phase 11 entry rule retained

Phase 10 completion permits Phase 11 planning/entry preparation, not automatic real-pilot activation.

Before real participant processing begins, the Phase 11 checklist must still establish, as applicable:

1. qualified Zambia privacy, consumer, payments, tax/invoicing and related legal findings;
2. controller/processor, transfer and authority-access approvals;
3. approved pilot privacy notice, consent, participant terms, retention and withdrawal rules;
4. named pilot/security/privacy/support/incident owners;
5. bounded cohort, locations, devices/connectivity, support/escalation and stop criteria;
6. approved terms and controls for any map, OTP/communications, registry or payment provider actually used;
7. continued technical disabling of every unapproved adapter.

Production/public release remains a Phase 12 decision.
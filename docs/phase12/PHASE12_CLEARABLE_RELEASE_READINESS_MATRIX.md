# Phase 12 — Clearable Release Readiness Matrix

**Date:** 2026-07-19  
**Status:** All currently safe preauthorization engineering is being completed; formal production release remains blocked  
**Governing programme phase:** Phase 11 remains open under Issue #112

## Purpose

Separate Phase 12 work into three honest states:

1. **repository/engineering work that can be completed now without real participants or production authority**;
2. **preproduction evidence already proven in managed synthetic/private environments**;
3. **release gates that inherently require real pilot evidence, qualified legal/regulatory evidence, production credentials, Play Console activity, production staffing or live production infrastructure**.

This prevents the project from repeatedly rediscovering the same blockers and prevents synthetic/staging evidence from being relabelled as production evidence.

## Phase 12 deliverables versus current status

| Master-plan deliverable | Current status | What is cleared now | What still blocks formal completion |
|---|---|---|---|
| Signed Android App Bundle | **Engineering contract complete; real artifact blocked** | Phase 12A source-controlled versioning, fail-closed protected signing, unsigned reproducibility | real upload key, formal authorization, signed reproducible exact-source AAB |
| Play internal and closed testing | **Runbook/preparation complete; execution blocked** | track order, reviewer/tester requirements, store/data-safety package, release gate | Play developer account state, signed AAB, reviewer identities, actual internal/closed testing and current account-specific eligibility rules |
| Store listing and Data Safety | **Repository preparation complete** | canonical candidate listing, permission inventory, Firebase/Data Safety inventory, content/distribution facts, validator | final privacy/support/deletion URLs, exact release-candidate revalidation, Play form submission, IARC-generated rating |
| Production backend and operations readiness | **Fail-closed architecture/preproduction evidence complete; production activation blocked** | production config invariants, managed restore/rollback/inspection evidence, explicit activation gate matrix | Phase 11 exit, legal gates, real production environment/traffic authorization, production backup restore |
| Support and verification staffing | **Requirements complete; operational staffing not proven** | role/capacity/evidence contract | named/contracted production coverage, access, training, calibration, launch schedule and exercise evidence |
| Monitoring, rollback and staged rollout | **Plan and preproduction pattern evidence complete** | stop criteria, rollout stages, rollback order, managed staging rollback/alert evidence | production monitors/routes active, live vitals baseline, production escalation exercise, actual Play rollout controls |
| Release tag and notes | **Template/contract complete; actual release prohibited** | tag convention, required release record, release-notes structure and provenance fields | authorized release candidate, signed artifact, Play track, go/no-go evidence |
| Current Play policy/target API | **Checked for preparation on 2026-07-19** | target API 36 already configured; policy/source register recorded in Phase 12B | mandatory recheck on exact release date before submission |

## Engineering blockers found during Phase 12 preparation

### 1. Synthetic/preview Android production path

The current Android shell still exposes fictional/synthetic discovery and interaction experiences. That is valid for preauthorization demonstration and automated testing, but it is not a truthful public production marketplace.

**Rule:** a future `release-candidate` or `production` eligibility gate must fail until the evidence-led Phase 11/11I client cutover removes or isolates these preview surfaces from the production path.

This cannot be responsibly “fixed” by blindly wiring unvalidated flows before the real controlled pilot because the master plan requires pilot findings to feed corrections into the same production codebase.

### 2. Account deletion

Current sign-out/session clearing is not an end-to-end account deletion capability. Google Play’s current account-deletion requirement for apps that support account creation requires both an in-app path and a public web request resource, with deletion behavior reflected in Data Safety/privacy disclosures.

**Rule:** formal release remains blocked until the authenticated request, public request route, backend deletion/retention/legal-hold handling, audit, policy wording and qualified review are complete.

### 3. Production traffic is deliberately impossible today

The backend environment schema currently allows production data mode but requires production traffic to remain `disabled` and production payments to remain disabled.

**Rule:** do not weaken this early. A future separate reviewed change may introduce authorized production traffic only after Phase 11 `PROCEED` and all global release gates pass.

## Preproduction evidence that is reusable but not overclaimed

Phase 10 managed evidence already proved:

- clean database restore with integrity, migration-ledger and API readiness checks;
- private Cloud Run deployment and independent staging inspection;
- rollback and forward recovery using safe floating `LATEST` semantics;
- portal-to-API kill switch and bounded IAM restoration;
- staging API 5xx alert-policy verification;
- internal Firebase App Distribution for the debug/internal tester path.

This evidence proves the **mechanisms and runbooks**, not the missing production-specific facts. An actual production backup still must be restore-tested after a production environment/data boundary exists.

## Global release gate status

| Global release gate | Status now |
|---|---|
| Primary Zambia pilot validation complete | **BLOCKED — 11C–11H not executed** |
| Qualified legal review signed | **BLOCKED — external** |
| Privacy notices/policy versioning live | **BLOCKED — final approved production policy not live** |
| Production backups restore-tested | **BLOCKED — no activated production data environment/backup yet** |
| Evidence private/access-tested | **PREPRODUCTION MECHANISM PROVEN; real production boundary still requires final canary** |
| Claims derived, not manually typed | **ENGINEERING INVARIANT IMPLEMENTED/TESTED** |
| Critical/high defects resolved/accepted | **ONGOING release gate; current known release blockers are explicitly recorded** |
| Accessibility/device matrix pass | **PREPRODUCTION automation exists; real Phase 11 device matrix and final release candidate still pending** |
| Support/verification staffing operational | **BLOCKED — requirements defined, staffing evidence pending** |
| Monitoring/incident escalation tested | **STAGING mechanisms tested; production routing/escalation exercise pending** |
| Current Play requirements confirmed | **PREPARATION CHECK DONE 2026-07-19; must recheck at actual release** |

## Permanent release-readiness source files

- `docs/phase12/play/*.json`
- `docs/phase12/release/production_runtime_readiness.json`
- `docs/phase12/release/support_verification_staffing.json`
- `docs/phase12/release/monitoring_rollback_rollout.json`
- `docs/phase12/release/release_package_contract.json`
- `scripts/verify-phase12-final-readiness.py`
- `.github/workflows/phase12-final-readiness.yml`

## Definition of the end of preauthorization Phase 12 work

The repository has cleared everything it can truthfully clear before the external/real-world gates when:

- Phase 12A release engineering remains green;
- Phase 12B Play/listing/permission/Data Safety preparation is promoted;
- production runtime, staffing, monitoring/rollback/rollout and release-package contracts are promoted;
- permanent CI refuses any false production-ready state;
- exact residual blockers are documented;
- `main` and `build/android-v1` are synchronized;
- Issue #112 remains open and formal Phase 12 remains blocked.

At that point, further “Phase 12 completion” work would require facts the repository cannot manufacture: real Phase 11 results, legal/regulatory approvals, operational staffing, production credentials/infrastructure, signed artifacts and actual Play Console testing/release activity.

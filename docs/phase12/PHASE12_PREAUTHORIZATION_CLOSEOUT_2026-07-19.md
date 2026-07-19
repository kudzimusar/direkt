# Phase 12 Preauthorization Closeout — 2026-07-19

**Status:** ALL CURRENTLY CLEARABLE PHASE 12 REPOSITORY/ENGINEERING WORK COMPLETE  
**Formal Phase 12 production release:** NOT AUTHORIZED  
**Governing Phase 11 issue:** #112 remains open  
**Final corrective implementation checkpoint:** PR #140 merged to `main` at `8363e2196739f5bad2393eaa8896d4c43bd64e0f`

## Executive conclusion

DIREKT has completed every Phase 12 item that can truthfully be completed from repository engineering, managed preproduction evidence and release planning without inventing real Zambia pilot results, legal/regulatory approvals, operational staffing, production credentials, signed artifacts or Google Play activity.

This closeout does **not** mark formal Phase 12 complete. The master plan still requires actual Phase 11 primary validation, an evidence-backed 11J `PROCEED` decision and all global release gates before production release execution may cross the boundary.

## Promoted checkpoints

| Checkpoint | PR | Main merge |
|---|---:|---|
| Phase 12 preauthorization release-readiness foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release/versioning/reproducibility/signing contract | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play listing/permissions/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| Remaining clearable Phase 12 release-readiness controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |
| Late release-policy corrective hardening | #140 | `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |

History-preserving branch synchronization followed the promoted checkpoints, including PR #143 after the final corrective hardening.

## What is now complete

### 1. Android release engineering

- production application ID remains `com.kudzimusar.direkt`;
- `compileSdk` and `targetSdk` remain API 36;
- release identity is source-controlled at `12 / 0.12.0-preauth.1 / preauthorization`;
- version/channel rules fail closed;
- protected upload signing requires explicit external inputs and keystore material outside the repository checkout;
- AGP injected-signing overrides are prohibited;
- signed builds require configuration cache disabled before protected credentials are consumed;
- formal release eligibility is checked during Gradle configuration, so `-x verifyFormalReleaseEligibility` cannot bypass false source-controlled release latches;
- a permanent negative CI test proves the `-x` bypass attempt fails;
- no real upload key or signing credential exists in the repository or preauthorization workflows;
- release AAB packaging is reproducible across two independent clean, build-cache-disabled builds.

Verified unsigned AAB SHA-256 remains:

```text
890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169
```

This artifact is preauthorization evidence only and is not for Play upload or distribution.

### 2. Formal release eligibility latches

`android/direkt-app/release/eligibility.properties` carries five evidence assertions, all deliberately `false` in preauthorization:

- `DIREKT_FORMAL_PHASE12_AUTHORIZED`
- `DIREKT_PRODUCTION_CLIENT_READY`
- `DIREKT_ACCOUNT_DELETION_READY`
- `DIREKT_PRODUCTION_OPERATIONS_READY`
- `DIREKT_PLAY_RELEASE_READY`

Preauthorization requires every latch to remain false. Release-candidate/production source requires every latch to be true before release-capable Gradle configuration may proceed. The latches are evidence assertions, not substitutes for the evidence, and protected signing remains a separate control.

### 3. Google Play / Data Safety preparation

Repository-controlled Play preparation now includes:

- store listing candidate copy, reviewer-access requirements and asset specification;
- merged release manifest permission inventory covering both `uses-permission` and `uses-permission-sdk-23`;
- current permission baseline: `android.permission.INTERNET` only;
- resolved `releaseRuntimeClasspath` direct dependency inspection rather than source-line-only dependency parsing;
- selected dependency targets after Gradle `requested -> selected` resolution are validated;
- substitutions to unreviewed modules and project targets fail closed and have permanent regression fixtures;
- Firebase Authentication Data Safety inventory;
- content-rating questionnaire facts without fabricating an IARC rating;
- target-audience, country/device and developer-account readiness facts;
- account-deletion release blocker;
- prohibited blanket trust/approval claims rejected by CI;
- policy-document-only changes trigger the readiness workflow.

### 4. Review-driven hardening completed

Reviews discovered valid defects after earlier checkpoints. None were ignored merely because a previous PR had merged.

The final corrective programme closed:

- exact-head versus merge-ref evidence provenance;
- keystore symlink path resolution;
- configuration-cache-aware release identity input;
- AGP injected-signing override bypass;
- protected signing secret/configuration-cache exposure;
- source-manifest-only permission inspection;
- unreviewed SDK dependency additions;
- release-scoped dependency bypass;
- `uses-permission-sdk-23` permission bypass;
- Gradle `-x` formal eligibility bypass;
- Gradle dependency substitution selecting an unreviewed runtime module/project target;
- missing prohibited store trust/approval claim checks;
- incomplete Phase 12B policy-document workflow path triggers.

The final exact head includes permanent regression tests for the high-risk bypasses rather than relying only on comments or conventions.

### 5. Production backend and operations readiness

Already proven in managed preproduction/private infrastructure:

- clean database restore and integrity/application readiness pattern;
- private Cloud Run deployment and independent inspection;
- backend/portal rollback and forward recovery;
- floating `LATEST`-safe recovery semantics;
- portal-to-API kill switch and bounded IAM restoration;
- staging API 5xx alert policy verification;
- internal Firebase App Distribution path.

Still intentionally **not** claimed:

- production environment deployed/ready for public traffic;
- actual production backup restore-tested;
- production traffic enabled;
- production payment mode enabled.

The backend remains fail-closed for production traffic until a future reviewed release gate deliberately authorizes a production traffic mode.

### 6. Support, verification, monitoring and staged rollout

The repository defines:

- production support/verification/on-call role requirements and four-eyes controls;
- no claim that production staffing is operational without named/contracted evidence;
- monitor classes, immediate stop conditions and numeric pause thresholds;
- staged rollout sequence: internal → closed → 5% → 10% → 25% → 50% → 100% within approved scope;
- observation/promotion rules;
- backend rollback, kill-switch, Android higher-version correction and credential/incident response sequence;
- release tag convention, release record/provenance fields, release-note structure and formal execution runbook.

No production tag, signed AAB, Play track, public rollout or staffing claim has been created because the entry gates are not satisfied.

## Definitive exact-head verification

Final corrective source head before PR #140 promotion:

```text
5cfaa6a1f4382e1fe0fad98480da7ead70037cab
```

The following exact-head gates passed:

- Documentation quality;
- Phase 10 supply-chain/security;
- Android CI;
- Android performance budget;
- Phase 12A release readiness/reproducibility;
- hardened Phase 12B Play readiness using the merged release manifest and selected resolved runtime dependencies;
- Phase 12 final preauthorization truth-boundary gate.

The exact-head release workflow also proved:

- AGP injected-signing bypass fails closed;
- `-x verifyFormalReleaseEligibility` cannot bypass false formal release latches;
- signed release configuration cannot proceed with configuration cache active;
- both clean unsigned release builds are byte-for-byte identical.

The exact-head Play workflow also proved:

- selected module substitution to an unreviewed module is detected;
- selected project substitution is rejected;
- merged `uses-permission-sdk-23` declarations are included in permission certification;
- the selected resolved release dependency surface matches the reviewed inventory.

The Android performance gate recorded one cold-launch outlier run while artifact size remained within budget. Because this corrective head changed release/build-policy controls and not Android runtime behavior, the exact same source was retried once under the established rule; the retry passed. No performance waiver was used.

Latest short-lived exact-head evidence:

- Phase 12A reproducible AAB evidence archive digest: `sha256:2447a7bfbdadddf6277c9ae28fbe69236a24d52aaf076c4e8883701a113d9142`;
- Phase 12B Play-readiness evidence archive digest: `sha256:26083d3232a63240b5f0c205ad67ecd79061594d722c02af087fdc34466099a3`;
- Phase 12 final preauthorization truth-boundary evidence archive digest: `sha256:e6772a7c27923f4c040a28d4e7f699c5f767f37da87ec8675b2abfecd8d10c51`.

The artifacts expire; durable evidence is the promoted source, workflow definitions and GitHub run records.

## Remaining blockers — no repository-only Phase 12 work can truthfully clear these now

### A. Phase 11 evidence and decision

1. Complete actual controlled Zambia pilot evidence for 11C–11H.
2. Perform 11J and record an evidence-backed `PROCEED` decision.

### B. Regulatory/legal/privacy

3. DPC controller-registration evidence and applicable overseas storage/transfer authorization.
4. Qualified Zambia legal/privacy/consumer review.
5. Final approved privacy notice/terms/retention/legal-hold/rights versions live.

### C. Product release blockers

6. Complete evidence-led production Android client cutover so synthetic/fictional/preview marketplace surfaces are removed or isolated from the production path.
7. Complete end-to-end account deletion: in-app request, public web request resource, backend fulfillment/retention/legal-hold behavior, audit and privacy/Data Safety consistency.

### D. Production operations

8. Deploy and validate the actual production backend/portal/data boundary with public traffic still disabled.
9. Restore-test an actual production backup in isolation.
10. Make production support/verification/on-call staffing operational and exercise the escalation path.
11. Activate/test production monitoring and notification routes.

### E. Signed artifact and Play execution

12. Verify the actual Play developer-account status and current account-specific testing requirements.
13. Recheck current Google Play requirements on the exact release date.
14. Create the authorized release candidate, set evidence-backed eligibility latches and protected signing inputs, and build the signed reproducible AAB.
15. Finalize public support/privacy/deletion URLs, screenshots/feature graphic, Data Safety form, IARC content rating and reviewer credentials.
16. Execute Play internal testing, then required closed testing and resolve findings.
17. Perform formal go/no-go and staged production rollout with monitoring/support coverage.
18. Create the final release tag/notes/record only for the approved artifact and rollout.

## Final boundary

No further Phase 12 repository-only item should be marked complete merely by adding documents, toggling latches or generating synthetic evidence. The remaining work requires genuine external evidence or release execution that is prohibited until the governing gates authorize it.

Issue #112 remains open. Formal Phase 12 remains blocked. The next legitimate progression is to clear the Phase 11 real-entry gates, execute the controlled Zambia pilot, complete 11C–11H and reach 11J; only an evidence-backed `PROCEED` may unlock formal release-candidate and production execution.

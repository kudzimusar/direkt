# Phase 12 Preauthorization Closeout — 2026-07-19

**Status:** ALL CURRENTLY CLEARABLE PHASE 12 REPOSITORY/ENGINEERING WORK COMPLETE  
**Formal Phase 12 production release:** NOT AUTHORIZED  
**Governing Phase 11 issue:** #112 remains open  
**Final implementation checkpoint:** PR #136 merged to `main` at `c6bb694046b2fe8e82d3f745330447632169355c`

## Executive conclusion

DIREKT has completed every Phase 12 item that can truthfully be completed from repository engineering, managed preproduction evidence and release planning without inventing real Zambia pilot results, legal/regulatory approvals, operational staffing, production credentials, signed artifacts or Google Play activity.

The remaining gap to formal Phase 12 is no longer hidden implementation work. It is a finite set of real-world release gates that require evidence outside the repository or evidence that can exist only after those external gates authorize the next activity.

This closeout deliberately does **not** mark Phase 12 complete. The master plan requires actual Phase 11 primary validation and an evidence-backed 11J `PROCEED` decision before formal production release work may cross the release boundary.

## Promoted checkpoints

| Checkpoint | PR | Main merge |
|---|---:|---|
| Phase 12 preauthorization release-readiness foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release/versioning/reproducibility/signing contract | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play listing/permissions/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| All remaining clearable Phase 12 release-readiness controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |

History-preserving forward synchronization was performed after each promoted checkpoint, including PRs #130, #135 and #137.

## What is now complete

### 1. Android release engineering

- production application ID remains `com.kudzimusar.direkt`;
- `compileSdk` and `targetSdk` remain API 36;
- release identity is source-controlled at `12 / 0.12.0-preauth.1 / preauthorization`;
- version/channel rules fail closed;
- upload signing is protected by explicit external inputs, external keystore location and a signing enable latch;
- Android Gradle Plugin injected-signing overrides are prohibited;
- protected signed builds require configuration cache disabled before signing credentials are consumed;
- no real upload key or signing credential exists in the repository or preauthorization workflows;
- release AAB packaging is reproducible across two independent clean, build-cache-disabled builds.

The latest exact Phase 12 checkpoint retained the verified unsigned AAB SHA-256:

```text
890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169
```

This artifact is preauthorization evidence only and is not for Play upload or distribution.

### 2. Formal release eligibility latches

`android/direkt-app/release/eligibility.properties` now carries five source-controlled evidence assertions, all deliberately `false`:

- `DIREKT_FORMAL_PHASE12_AUTHORIZED`
- `DIREKT_PRODUCTION_CLIENT_READY`
- `DIREKT_ACCOUNT_DELETION_READY`
- `DIREKT_PRODUCTION_OPERATIONS_READY`
- `DIREKT_PLAY_RELEASE_READY`

Preauthorization requires every latch to remain false. Release-candidate/production packaging requires every latch to be true in addition to protected signing authorization. Gradle release packaging depends on the formal eligibility task, so the normal release task graph cannot silently bypass these gates.

These latches are assertions backed by evidence; they are not substitutes for the evidence and must not be flipped merely to make a build pass.

### 3. Google Play preparation

Repository-controlled Play preparation now includes:

- store listing candidate copy and asset requirements;
- app-access/reviewer requirements;
- exact merged-release-manifest permission inventory;
- current permission baseline: `android.permission.INTERNET` only;
- implementation dependency allowlist tied to the Data Safety review boundary;
- Firebase Authentication Data Safety inventory;
- content-rating questionnaire facts without fabricating an IARC rating;
- target-audience, country/device and developer-account readiness facts;
- account-deletion release blocker;
- permanent CI that rebuilds the merged release manifest, validates the dependency surface and rejects prohibited blanket trust/approval claims.

A post-merge Codex review of PR #134 found four valid gaps: unreviewed SDK additions could escape the inventory, the source manifest was insufficient compared with the merged release manifest, banned store trust/approval claims were not blocked, and the policy document itself did not trigger the gate. All four were corrected and revalidated on the PR #136 exact head before final promotion.

### 4. Production backend and operations readiness

The repository now records the exact production activation boundary instead of treating staging evidence as production evidence.

Already proven in managed preproduction/private infrastructure:

- clean database restore and integrity/application readiness pattern;
- private Cloud Run deployment and independent inspection;
- backend/portal rollback and forward recovery;
- floating `LATEST`-safe recovery semantics;
- portal-to-API kill switch and bounded IAM restoration;
- staging API 5xx alert policy verification;
- internal Firebase App Distribution path.

Still intentionally not claimed:

- production environment deployed/ready for public traffic;
- production backup restore-tested;
- production traffic enabled;
- production payment mode enabled.

The backend configuration continues to force production traffic disabled until a future reviewed Phase 12 release gate deliberately authorizes a new production traffic mode.

### 5. Support and verification staffing

The required public-production role/capacity contract is defined, including:

- release owner;
- incident/on-call owner;
- support lead;
- verification operations lead;
- at least two independent verification reviewers;
- security/privacy escalation ownership;
- backend/platform on-call capability;
- Zambia field lead if field-visited/equivalent claims are enabled.

The repository does **not** claim these roles are operational. Production readiness requires named/contracted coverage, private escalation contacts, access tests, training/calibration, launch schedule, incident/support exercise evidence and demonstrated capacity.

### 6. Monitoring, rollback and staged rollout

The release contract now defines:

- production monitor classes;
- immediate stop conditions;
- numeric pause thresholds;
- staged rollout sequence: internal → closed → 5% → 10% → 25% → 50% → 100% within approved scope;
- observation windows and promotion rules;
- backend rollback sequence;
- Android correction rule using a higher version code rather than version rollback;
- credential/incident response sequence.

Staging mechanisms are proven. Production alert routes, Android-vitals baseline, escalation exercise, operational staffing and actual Play rollout controls remain real release evidence gates.

### 7. Release package and execution runbook

The repository now defines:

- release tag convention;
- required release record/provenance fields;
- release-notes structure and prohibited claims;
- exact source freeze procedure;
- release-date Play policy recheck;
- protected signing procedure;
- internal/closed-test sequence;
- production pre-traffic activation sequence;
- staged rollout/go-no-go/rollback sequence.

No actual production tag, release notes publication, signed AAB or Play track has been created because the entry gate is not satisfied.

## Exact final engineering verification

Exact source head before PR #136 promotion:

```text
a22153d8aaa3c12acff04fdf8fa6953981e5b5a2
```

The following exact-head gates passed:

- Documentation quality;
- Phase 10 supply-chain/security;
- Android CI;
- Android performance budget;
- Phase 12A release readiness/reproducibility;
- hardened Phase 12B Play readiness using the merged release manifest;
- Phase 12 final preauthorization truth-boundary gate.

The Android performance gate initially recorded one cold-launch outlier run while the APK budget passed. Because this checkpoint changed release gating/documentation rather than Android runtime code, the exact same source was retried once. The retry passed the cold-launch budget; no performance waiver was used.

Short-lived evidence tied to the exact head includes:

- Phase 12B Play-readiness evidence artifact archive digest: `sha256:aca3d0d318128ca5dc51726eaf1c8abd56d95522be5b5f8dccf7a024284d4840`;
- Phase 12 final preauthorization evidence archive digest: `sha256:e226fec4773ca9d39ac29c2178495f7cf72ecbcc3fed3ae78cd20c1e0fca240e`;
- Phase 12A reproducible AAB evidence archive digest: `sha256:de3f258978316e6c61abb8bef23f4a9134e66f22333de6710f99aaf75e8bf041`.

The artifacts expire; the durable evidence is the source, workflow definitions, run records and promoted repository state.

## Remaining blockers — no additional repository-only Phase 12 work can truthfully clear these now

### A. Phase 11 evidence and decision

1. Complete actual controlled Zambia pilot evidence for 11C–11H.
2. Perform 11J and record an evidence-backed `PROCEED` decision.

### B. Regulatory/legal/privacy

3. DPC controller-registration evidence and applicable overseas storage/transfer authorization.
4. Qualified Zambia legal/privacy/consumer review.
5. Final approved privacy notice/terms/retention/legal-hold/rights versions live.

### C. Product release blockers

6. Complete evidence-led production Android client cutover so synthetic/fictional/preview marketplace surfaces are removed or isolated from the production path.
7. Complete end-to-end account deletion: in-app request, public web request resource, backend fulfillment/retention/legal-hold behavior, audit and policy/Data Safety consistency.

### D. Production operations

8. Deploy and validate the actual production backend/portal/data boundary with public traffic still disabled.
9. Restore-test an actual production backup in isolation.
10. Make production support/verification/on-call staffing operational and exercise the escalation path.
11. Activate/test production monitoring and notification routes.

### E. Signed artifact and Play execution

12. Verify the actual Play developer-account status and current account-specific testing requirements.
13. Recheck current Google Play requirements on the exact release date.
14. Create the authorized release candidate, set the evidence-backed eligibility latches and protected signing inputs, and build the signed reproducible AAB.
15. Finalize public support/privacy/deletion URLs, screenshots/feature graphic, Data Safety form, content rating/IARC answers and reviewer credentials.
16. Execute Play internal testing, then required closed testing and resolve findings.
17. Perform formal go/no-go and staged production rollout with monitoring/support coverage.
18. Create the final release tag/notes/record only for the approved artifact and rollout.

## Final boundary

No more Phase 12 repository-only work should be marked complete merely by adding documents, toggling variables or generating synthetic evidence. The remaining work requires genuine external evidence or release execution that is prohibited until the governing gates authorize it.

Issue #112 remains open. Formal Phase 12 remains blocked. The next legitimate progression is to clear the Phase 11 real-entry gates, execute the controlled Zambia pilot, complete 11C–11H and reach the 11J decision; only an evidence-backed `PROCEED` may unlock the formal release-candidate and production sequence.

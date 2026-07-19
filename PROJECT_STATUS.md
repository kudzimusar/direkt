# DIREKT Project Status

**Updated:** 2026-07-19 (Asia/Tokyo)  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` — history-preserving synchronization only  
**Programme state:** Phases 0–10 are complete. Phase 11 internal/synthetic readiness is complete; real 11C–11H evidence and 11J remain pending. All currently repository-clearable Phase 12 preauthorization engineering is complete and promoted, including late review hardening. **Formal Phase 12 production release is not authorized.**

## Current checkpoints

| Checkpoint | PR | Main merge |
|---|---:|---|
| Phase 11 entry foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` |
| Phase 11 synthetic pilot | #119 | `7b886b9bee91c1337f4e4ad43f71afa4389644de` |
| Phase 12 preauthorization foundation | #125 | `7b23d812b751345a740a34b77ad1b7890ed15cd1` |
| Phase 12A Android release engineering | #129 | `48f6d2d212d64192819d76d67e157b25f8a5e98b` |
| Phase 12B Play/Data Safety preparation | #134 | `b876c499aed0f135feec39601b58f22c734879cc` |
| Remaining clearable Phase 12 controls | #136 | `c6bb694046b2fe8e82d3f745330447632169355c` |
| Final late-review hardening | #140 | `8363e2196739f5bad2393eaa8896d4c43bd64e0f` |

## Phase 12 preauthorization result

Completed:

- Android release identity/version/channel controls;
- reproducible unsigned AAB packaging;
- fail-closed formal release eligibility controls;
- non-excludable eligibility validation during Gradle configuration;
- merged release permission inspection, including SDK-23 permission declarations;
- selected resolved release runtime dependency inspection;
- dependency substitution regression coverage;
- Play listing, Data Safety, content/distribution and reviewer-access preparation;
- production runtime readiness matrix;
- support/verification staffing requirements;
- monitoring, stop criteria, rollback and staged-rollout plan;
- release package/provenance/runbook requirements;
- permanent Play and final truth-boundary CI gates.

Current Android release identity remains `com.kudzimusar.direkt`, version code `12`, version name `0.12.0-preauth.1`, channel `preauthorization`, with merged permission baseline `android.permission.INTERNET` only.

All five formal release eligibility assertions remain false in preauthorization. No real production artifact or Play release was created.

## Definitive validation

Final corrective exact head before PR #140 promotion:

`5cfaa6a1f4382e1fe0fad98480da7ead70037cab`

Passed:

- Documentation quality;
- supply-chain/security;
- Android CI;
- Android performance budget;
- Phase 12A release/reproducibility gate;
- hardened Phase 12B Play gate;
- Phase 12 final truth-boundary gate.

The final gate set proves task exclusion cannot bypass false formal eligibility assertions, selected dependency substitution cannot hide an unreviewed runtime target, project substitutions are rejected, and SDK-23 permission declarations are included in merged-manifest certification.

Verified unsigned AAB SHA-256: `890b710f18ad7208b6db0e5668193a739052e010462d0beeddb8f752c14dd169`.

Latest evidence archive digests:

- release/AAB: `sha256:2447a7bfbdadddf6277c9ae28fbe69236a24d52aaf076c4e8883701a113d9142`;
- Play readiness: `sha256:26083d3232a63240b5f0c205ad67ecd79061594d722c02af087fdc34466099a3`;
- final truth boundary: `sha256:e6772a7c27923f4c040a28d4e7f699c5f767f37da87ec8675b2abfecd8d10c51`.

One emulator cold-launch run had an outlier while artifact size remained within budget. The same exact source was retried once because the corrective changes were release/build-policy controls rather than runtime behavior; the retry passed. No waiver was used.

## Remaining genuine gates

No repository-only document, toggle, synthetic dataset or unsigned artifact can clear these:

1. actual 11C–11H Zambia pilot evidence;
2. evidence-backed 11J `PROCEED`;
3. required Zambia regulatory/legal/privacy approvals and final live policy versions;
4. evidence-led removal/isolation of synthetic preview marketplace surfaces from production;
5. end-to-end account deletion, including public request and backend fulfillment;
6. actual production environment plus production-backup restore;
7. operational support/verification/on-call staffing and exercises;
8. active/tested production monitoring and escalation;
9. real Play account/current-policy verification, authorized signed reproducible AAB, final forms/assets/content rating and internal/closed testing;
10. formal go/no-go, staged rollout and final release record.

## Boundary

- Phase 10: complete.
- Phase 11 internal/synthetic readiness: complete.
- Phase 11 real evidence and 11J: pending.
- Phase 12A: complete.
- Phase 12B repository preparation: complete.
- All other currently repository-clearable Phase 12 readiness engineering: complete.
- **Formal Phase 12: blocked until Phase 11 supports `PROCEED` and all global release gates pass.**

Detailed closeout: `docs/phase12/PHASE12_PREAUTHORIZATION_CLOSEOUT_2026-07-19.md`. Issue #112 remains open.

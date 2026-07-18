# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phases 0–10 are complete and stable. Phase 11A internal scope/operations decisions are now complete under Issue #112. Real-participant execution remains blocked only by genuine external legal/regulatory/provider activation gates and the production-shaped participant-auth canary; 11C–11J primary evidence has not yet been produced.

## Stable checkpoints

| Phase | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | #30 closed |
| Phase 9 subscription/payment foundation | #35 | `4c78e2419aa4eca225495acaac8e7e0ee81903f1` | #34 closed |
| Phase 10 security/privacy/reliability hardening | #111 final promotion | `369fc72581b3ed27920b8fc949e32cfedf1ad8d9` | #41 closed |
| Phase 11 entry-control foundation | #113 | `53e20e67a877f481fc94458d1d2ea62bf4e47b0f` | #112 remains open |

## Phase 10 final checkpoint

```text
Final managed source: 5d9313333c49d6501944e6ddba4cd408c540ff47
Promotion merge:      369fc72581b3ed27920b8fc949e32cfedf1ad8d9
Issue #41:            closed as completed
```

Authoritative evidence: `docs/phase10/PHASE10_CLOSEOUT_2026-07-18.md`.

## Managed infrastructure retained for Phase 11

| Service | Bound development/staging resource |
|---|---|
| Supabase | project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` — IAM-private staging |
| Cloud Run portal | `direkt-operations-portal-staging` — IAM-private staging |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` |
| Vercel | excluded from the protected Phase 11 entry path by programme decision |

Phase 10 managed evidence remains valid: 37 checked migrations, 13 DIREKT schemas, four private Storage buckets, managed restore, immutable Cloud Run deploy/inspection, rollback/kill-switch/idle/Monitoring exercise and Firebase internal distribution.

## Phase 11 active workstream

**Governing issue:** #112  
**Workstream state:** claimed on `build/android-v1`  
**Control document:** `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`

### 11A decisions completed

- [x] Current official Zambia legal/privacy/payment/provider research refreshed without pretending it is qualified sign-off.
- [x] Controller model selected for bounded pilot filing: Shadreck Kudzanai Musarurwa as individual-controller applicant/operator; no joint controller planned.
- [x] Exact geography approved: Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District.
- [x] Alternative area evaluated: Matero Constituency retained as later stress/expansion candidate.
- [x] Four pilot categories approved for entry: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair.
- [x] Cohort capped at 24 providers + 60 customers in three waves.
- [x] Provider-pathway target set per category: 2 registered businesses, 2 qualified individuals, 2 experienced informal providers where lawful and accurately represented.
- [x] Invite-only recruitment, inclusion/exclusion/conflict rules defined.
- [x] Pilot/Product, Security & Privacy, Support and Incident accountable roles assigned to Shadreck Kudzanai Musarurwa for the bounded pilot.
- [x] Support hours, escalation and numeric stop/pause thresholds approved.
- [x] Representative Android/device/network matrix approved.
- [x] Privacy, layered consent, withdrawal, retention and research-code baseline approved operationally.
- [x] Wave 1 provider minimization approved: Maps disabled/manual-first, Sentry disabled, production communications delivery disabled, real payments disabled.
- [x] Firebase phone OTP selected as the preferred participant-auth direction, subject to implementation, abuse/privacy controls and DPC/provider approval before real use.
- [x] Secondary-evidence substitution boundary documented so official online research cannot be relabelled as primary pilot evidence.

### Remaining real-entry gates

- [ ] DPC controller registration evidence for the approved pilot operator/applicant.
- [ ] Applicable DPC overseas storage/transfer authorization for the exact Supabase/Google/Firebase real-data topology.
- [ ] Qualified Zambia legal/privacy/consumer review of the final participant/provider notice, consent, marketplace/trust wording and retention/legal-hold treatment.
- [ ] Final approved notice/consent version ID recorded.
- [ ] Production-shaped Firebase phone-auth implementation/provider configuration completed and regression-tested while preserving server-side authorization.
- [ ] Private-storage/auth/deletion/withdrawal canary passes on the dedicated pilot environment.
- [ ] Zambia-based field operator/lead appointed before any `field visited` or equivalent claim; this does not block a no-field-claim Wave 1.

### Phase 11 evidence stages

- [ ] 11C real provider cohort/onboarding/evidence validation.
- [ ] 11D real discovery/location/trust-comprehension validation.
- [ ] 11E real enquiries/contact-consent/reviews/complaints validation.
- [ ] 11F real operations/verification/capacity evidence; field component only after field-lead gate.
- [ ] 11G real device/connectivity/reliability evidence.
- [ ] 11H willingness-to-pay/unit-economics evidence without real payment activation.
- [ ] 11I evidence-led corrections and bounded revalidation.
- [ ] 11J STOP / REPEAT / NARROW / PROCEED exit review.

## Important Phase 11 technical truth

The codebase models `DIREKT_DATA_MODE=controlled-pilot`, but the current managed environment remains deliberately fail-closed:

- `PILOT_ENTRY_APPROVED` cannot be set casually;
- Cloud Run staging remains IAM-private;
- synthetic authentication is not an approved real participant path;
- payment remains disabled;
- Android discovery retains manual/list fallback and does not depend on production Maps;
- runtime Sentry is not required for Wave 1.

Therefore real cohort activation still requires the approved participant authentication path and the external regulatory/legal evidence above. No environment-variable change alone can authorize a pilot.

## Current source documents

- `docs/phase11/HANDOFF_FROM_PHASE10.md`
- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/PHASE11A_REAL_PILOT_ENTRY_DECISION_2026-07-19.md`
- `docs/phase11/PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`
- `docs/phase11/PILOT_RECRUITMENT_AND_OPERATIONS_PROTOCOL.md`
- `docs/phase11/SECONDARY_EVIDENCE_SUBSTITUTION_MATRIX.md`
- `docs/phase11/PILOT_VALIDATION_EVIDENCE_REGISTER.md`

## Phase boundaries

- Phase 10: complete.
- Phase 11A: internal decisions complete; real entry externally gated.
- Phase 11C–11J: not complete; real primary/system evidence still required.
- Phase 12: not authorized until the actual Phase 11 exit evidence supports `PROCEED` and the global release gates pass.

Issue #5 remains the historical deferred real-world validation obligation; Issue #112 remains the active Phase 11 execution tracker.

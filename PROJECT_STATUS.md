# DIREKT Project Status

**Updated (Asia/Tokyo):** 2026-07-19  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phases 0–10 are complete and stable. Phase 11 repository-side entry preparation is active under Issue #112. Real-participant controlled-pilot execution remains blocked until the explicit legal/privacy/provider/ownership/cohort/consent/support/device/stop gates are satisfied.

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

## Phase 10 final checkpoint

```text
Final managed source: 5d9313333c49d6501944e6ddba4cd408c540ff47
Promotion merge:      369fc72581b3ed27920b8fc949e32cfedf1ad8d9
Issue #41:            closed as completed
main/build branch:    synchronized before Phase 11 claim
```

Authoritative evidence: `docs/phase10/PHASE10_CLOSEOUT_2026-07-18.md`.

### Managed infrastructure retained for Phase 11 entry preparation

| Service | Bound development/staging resource |
|---|---|
| Supabase | project `direct-app`, ref `aeeuscifrxcjmnswqwnq`, region `ap-northeast-1` |
| Google Cloud | project `direkt-dev-502701`, region `asia-northeast1` |
| Artifact Registry | `direkt-containers` |
| Cloud Run API | `direkt-api` — IAM-private staging |
| Cloud Run portal | `direkt-operations-portal-staging` — IAM-private staging |
| Firebase | project `direkt-dev-502701`, tester group `direkt-internal-testers` |
| Vercel | excluded from the current protected Phase 11 entry path by programme decision |

Phase 10 managed evidence remains valid: 37 checked migrations, 13 DIREKT schemas, four private Storage buckets, managed restore, immutable Cloud Run deploy/inspection, rollback/kill-switch/idle/Monitoring exercise and Firebase internal distribution.

## Phase 11 active workstream

**Governing issue:** #112  
**Workstream state:** claimed on `build/android-v1`  
**Control document:** `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`

### Repository-side progress

- [x] Phase 10 Issue #41 administrative closure completed.
- [x] Phase 11 workstream claimed on the exact synchronized predecessor.
- [x] Phase 11 A–J execution/entry contract recorded.
- [x] Current Zambia official-source legal/privacy/payment questions refreshed without misrepresenting them as qualified sign-off.
- [x] Pilot area decision corrected: Lusaka is provisional design context, not an approved real-pilot boundary.
- [x] Pilot category decision corrected: four seed categories remain provisional, not automatically approved.
- [x] Maps/Sentry repository truth reconciled: external setup is not treated as runtime activation without source and managed evidence.
- [ ] Real-pilot legal/privacy/processor approvals completed.
- [ ] Exact pilot geography/categories/cohort/owners/support/stop criteria approved.
- [ ] Approved participant-access/authentication path exists for the controlled Android cohort.
- [ ] Approved provider/runtime integrations used by the pilot are implemented and regression-tested.
- [ ] Controlled real pilot executed and primary evidence captured.
- [ ] Evidence-led product corrections completed and revalidated.
- [ ] 11J STOP / REPEAT / NARROW / PROCEED exit review completed.

## Important Phase 11 technical truth

The codebase already models `DIREKT_DATA_MODE=controlled-pilot`, but the current managed Phase 10 staging topology is deliberately synthetic/private:

- Cloud Run API and portal are IAM-private;
- synthetic authentication remains the development default and no approved production OTP adapter is active;
- payment remains disabled for real use;
- current Android discovery still uses a synthetic map presentation;
- current Android, NestJS and Next.js packages do not yet prove runtime Maps/Sentry SDK activation.

Therefore a real Android cohort cannot be authorized merely by changing one environment variable. Participant access, authentication, provider approvals, privacy terms and the exact deployment/data topology must be explicitly approved and implemented first.

See:

- `docs/phase11/HANDOFF_FROM_PHASE10.md`
- `docs/phase11/PHASE11_EXECUTION_AND_ENTRY_CONTROL.md`
- `docs/phase11/ZAMBIA_LEGAL_PRIVACY_ENTRY_RESEARCH_2026-07-19.md`
- `docs/phase11/MAPS_SENTRY_RECONCILIATION_2026-07-19.md`

## Current stop gates

Before any real participant/evidence data enters DIREKT:

- qualified Zambia legal/privacy/consumer findings and applicable Data Protection Commission registration/transfer/storage approvals;
- approved pilot notice, consent, retention/deletion and withdrawal rules;
- exact bounded pilot geography/categories/cohort and named operational owners;
- support, escalation, device/network and pause/stop criteria;
- approved Maps/error-monitoring/OTP/communications/registry/payment terms for any integration actually used;
- a production-shaped participant access/authentication path that does not weaken backend authorization or expose privileged Cloud Run/Supabase credentials.

No real money movement is authorized.

## Phase boundaries

- Phase 10: complete — synthetic-only development/protected staging integration and hardening.
- Phase 11: active for entry preparation; real controlled Zambia pilot remains entry-gated.
- Phase 12: not authorized until the actual Phase 11 pilot produces the required primary evidence and an explicit `PROCEED` recommendation satisfies the global release gates.

Issue #5 remains the historical deferred real-world validation obligation; Issue #112 is the active Phase 11 execution tracker.

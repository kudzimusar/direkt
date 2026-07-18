# Phase 10 Risk Closeout Addendum — 2026-07-18

This addendum updates the Phase 10 disposition of risks whose state in `RISK_REGISTER.md` predates the final managed closeout evidence. It does not delete or weaken the canonical risk register.

## Resolved or materially reduced Phase 10 infrastructure risks

### R-077 — wrong Supabase project / protected credential exposure

**Prior state:** blocked until verified access.  
**Phase 10 closeout state:** controlled for the managed development/staging boundary.

Evidence:

- immutable project ref `aeeuscifrxcjmnswqwnq` was verified before managed actions;
- 37 migration-ledger entries and all 13 DIREKT application schemas were inspected;
- four required private Storage buckets were verified;
- managed restore run `29641165494` passed;
- no unrelated Supabase project was substituted;
- protected values remained backend/workflow-only and sanitized evidence was recorded.

Residual risk moves to later production key rotation, access governance and incident monitoring rather than Phase 10 activation.

### Cloud Run deployment/recovery drift

Phase 10 closeout discovered that rollback recovery restored traffic to a named revision, which pinned future traffic and caused later healthy revisions to become `Retired` rather than active latest revisions.

Control added:

- recovery now uses `gcloud run services update-traffic --to-latest`;
- independent staging inspection requires latest-created/latest-ready revision integrity;
- final exact-source chain passed on `5d9313333c49d6501944e6ddba4cd408c540ff47`:
  - deploy `29647717734`;
  - inspection `29647798494`;
  - managed operations `29647821458`.

Residual risk is controlled by retaining independent inspection after deployments and the permanent recovery workflow.

### Managed restore operability

The closeout also corrected native-libpq connection compatibility, `btree_gist` restore prerequisites and restored-API build ordering. Managed restore run `29641165494` then passed clean restore, integrity, migration-ledger, forward-migration and API-readiness checks.

## Risks explicitly carried into Phase 11 entry

The following categories remain open or entry-gated and must not be interpreted as resolved by Phase 10 completion:

- R-004 field-agent collusion/bribery — representative operational controls and pilot evidence;
- R-010 verification economics — real operating-cost and willingness-to-pay evidence;
- R-013 legal interpretation — qualified Zambia legal findings;
- R-014/R-048 map/provider suitability — approved provider, quotas, costs and fallback validation;
- R-015 Android fragmentation — representative device/connectivity matrix;
- R-021 research bias — primary controlled-pilot validation;
- R-022 registry access — written permission/terms before any integration;
- R-023 participant-data handling — approved consent/minimization/private storage procedures;
- R-030 production OTP/abuse cost — approved provider and monitored vendor controls;
- R-037/R-058/R-075 fairness/independence/anti-collusion — representative pilot validation;
- R-062 consent/privacy interpretation — approved pilot copy and qualified review;
- R-066/R-074 queue and reconciliation service levels — named ownership, staffing and escalation exercises;
- R-067 secure Android local retention — approved encrypted storage before sensitive real data;
- R-068 production communications — approved provider, consent-at-send, opt-out, idempotency and audit controls.

## Stop-gate rule

A Phase 11 agent must use this addendum together with `RISK_REGISTER.md`, `docs/phase11/HANDOFF_FROM_PHASE10.md` and `docs/phase10/PHASE10_CLOSEOUT_2026-07-18.md`.

No risk marked for pilot/legal/provider validation may be bypassed merely because Phase 10 infrastructure is green. Unapproved adapters remain disabled and production/public release remains a Phase 12 decision.

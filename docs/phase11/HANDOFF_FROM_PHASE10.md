# Phase 11 Handoff from Phase 10 — Blocked Draft

**Prepared:** 2026-07-18  
**Planned next phase:** Phase 11 — Controlled Zambia pilot validation  
**Predecessor:** Phase 10 — Security, privacy, legal and reliability hardening  
**Authorization state:** **BLOCKED. Phase 11 has not started.**

## Purpose

This draft defines the entry contract for Phase 11 without claiming that Phase 10 is complete. It must not be converted to an active handoff until the Phase 10 exit gate is evidence-backed on one exact reviewed commit and the checkpoint is promoted.

Phase 11 is the first phase that may involve a tightly controlled cohort of consenting real participants. It is not a public launch, unrestricted beta or production release.

## Current stop decision

Phase 11 remains blocked because the repository does not yet contain all required managed-environment and external-approval evidence:

- exact-project Supabase activation for project ref `aeeuscifrxcjmnswqwnq` has not passed in the currently connected environment;
- a manually approved immutable private Cloud Run staging deployment and private smoke result are not recorded on the final Phase 10 source;
- protected Vercel Preview/Staging evidence is not recorded where that portal binding is to be used;
- final Firebase internal distribution evidence is not recorded for the Phase 10 Android source;
- qualified Zambia legal and authority-access evidence remains absent or explicitly stop-gated;
- map, OTP/communications, payment and registry providers remain disabled pending approval;
- the Phase 10 checkpoint PR is not reviewed, merged and synchronized.

No unrelated Supabase project, public Cloud Run mode or placeholder approval may be used to bypass these gates.

## Phase 11 entry checklist

Phase 11 may be claimed only after all items below are true.

### Phase 10 checkpoint

- [ ] Stages 10A–10I are complete against the authoritative plan.
- [ ] All permanent backend, Android, portal, documentation, container, staging-readiness, recovery/reliability and supply-chain workflows pass on one exact reviewed head.
- [ ] No unresolved critical or high security, privacy, legal or reliability defect remains.
- [ ] PR #42 is approved and merged.
- [ ] Issue #41 is closed as completed.
- [ ] `PROJECT_STATUS.md`, `WORKSTREAM_LOCK.md`, decision records and risk records are synchronized without force-pushing.

### Managed environment

- [ ] Supabase project identity is verified as exactly `aeeuscifrxcjmnswqwnq`.
- [ ] All migrations, PostGIS and required private buckets pass verification.
- [ ] Private storage signed-grant expiry, revocation, redaction, retention and deletion evidence passes.
- [ ] Private Cloud Run API and portal revisions deploy from one immutable reviewed source.
- [ ] Public IAM invocation members are absent.
- [ ] Runtime identities, secret allowlists and pinned secret versions are verified.
- [ ] Readiness, rollback, scale-to-zero and kill-switch exercises pass.
- [ ] Protected portal staging and Firebase internal distribution evidence is recorded where applicable.

### Legal, privacy and providers

- [ ] Qualified Zambia privacy, consumer, payments, tax, invoicing and AML findings are recorded.
- [ ] Controller/processor responsibilities and authority-access boundaries are approved.
- [ ] Pilot privacy notice, consent language, participant agreement and data-retention rules are approved.
- [ ] Any map, OTP/communications, registry or payment provider used in the pilot has approved terms, privacy, abuse, quota, cost and operational evidence.
- [ ] Providers not approved remain technically disabled with tested kill switches.

### Pilot operations

- [ ] Named pilot owner, security/privacy owner, support owner and incident commander are assigned.
- [ ] Pilot cohort size, locations, participant roles and recruitment method are documented.
- [ ] Inclusion/exclusion criteria and consent withdrawal procedure are documented.
- [ ] Support hours, escalation channels and stop criteria are approved.
- [ ] Representative Zambia devices, connectivity conditions and operational scenarios are selected.
- [ ] Data minimization, exact-location handling and private evidence rules are understood by the pilot team.
- [ ] No production claim, search indexing, unrestricted invitation or public promotion is enabled.

## Phase 11 authorized validation scope after entry

After the checklist is satisfied and Phase 11 is explicitly claimed, the controlled pilot may validate:

- comprehension of verification, publication and accountability language;
- provider and customer task completion on representative devices and networks;
- private evidence submission with explicit consent and restricted access;
- enquiries, interactions, reviews and complaints under real operational timing;
- support workload, moderation workload and queue ageing;
- location privacy and fallback behavior;
- willingness to pay without enabling uncontrolled production payments;
- pilot costs, operational bottlenecks and stop criteria.

## Boundaries retained in Phase 11

Even after Phase 11 entry:

- the pilot cohort must remain named, bounded and consented;
- public signup and unrestricted invitations remain prohibited;
- real evidence is limited to approved pilot examples and access roles;
- payments remain synthetic or separately approved and tightly bounded;
- external adapters without approval remain disabled;
- production/public release remains a Phase 12 decision;
- pilot results cannot be generalized into public safety or trust claims without evidence.

## Required Phase 11 evidence

The active Phase 11 plan must define and record:

- participant count and consent status;
- device/network matrix;
- task completion, error and abandonment rates;
- trust-language comprehension results;
- support and moderation response times;
- incident, privacy and withdrawal events;
- operating cost and staff effort;
- provider/customer willingness-to-pay evidence;
- defects and stop decisions;
- an explicit recommendation to stop, repeat, narrow or proceed to Phase 12.

## Activation rule

This file remains a blocked draft until the Phase 10 checkpoint records all entry evidence. Merely creating this document does not start Phase 11, authorize real data or authorize participant recruitment.

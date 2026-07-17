# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | RELEASED |
| Owner/agent | None |
| Phase | None claimed |
| Task | Phase 8 checkpoint promoted; Phase 9 awaits an explicit claim |
| Modules/paths | No active write reservation |
| Released at | 2026-07-17 after PR #31 merge, Issue #30 closure and stable-record update |
| Last stable checkpoint | `0182951cdc26a892b3423728bd843e2969b25bc0` |
| Governing issue | None active |

## Latest completed checkpoint

Phase 8 completed through PR #31 and Issue #30.

```text
Phase 8 exact reviewed head: 380687bf8044bc44ec1f70c58e4b71c6b3e3c6a7
Phase 8 merge commit:       0182951cdc26a892b3423728bd843e2969b25bc0
Issue #30:                  closed as completed
```

## Stable Phase 8 capabilities

### Stage 8A — interaction foundation and structured enquiry

- forward-only interaction/enquiry schema and immutable event history;
- server-resolved customer, provider, publication and category scope;
- idempotent bounded structured enquiry creation;
- customer-owned detail/history and cross-identity denial;
- no trust, publication, ranking or payment side effects.

### Stage 8B — provider inbox and response lifecycle

- live provider-scoped inbox/detail replacing the Phase 6 placeholder;
- explicit acknowledged, accepted, declined, needs-information, closed and cancelled states;
- actor, reason, policy version and optimistic revision on transitions;
- invalid, repeated, stale and wrong-provider actions rejected.

### Stage 8C — consent-aware call/WhatsApp handoff

- tracked interaction before handoff;
- current channel-specific customer consent and provider acceptance;
- synthetic disabled-delivery adapters only;
- minimum contact disclosure, expiry, revocation, idempotency and audit.

### Stage 8D — interaction history and review eligibility

- immutable interaction events;
- qualifying owned interaction as the sole review-eligibility source;
- deterministic eligibility window and duplicate prevention;
- private customer/provider/operations history views.

### Stage 8E — reviews, responses, moderation and appeals

- one bounded review per eligible interaction;
- one provider response per review;
- pending, published, withheld, removed and appealed moderation states;
- immutable author/provider appeals and operator reasoned moderation;
- public allowlist with no contact, interaction detail or internal rationale.

### Stage 8F — complaint linkage and client experiences

- customer complaint linkage to an owned tracked interaction;
- separation of public reports, customer complaints and Phase 7 internal incidents;
- Android customer/provider flows and critical offline/consent/moderation states;
- API-only permission-aware operations portal moderation/appeal workspace.

### Stage 8G — checkpoint promotion

- permanent database, API, Android and portal regressions;
- OpenAPI, architecture, authorization, privacy, testing, decision and risk records;
- green backend, Android, portal and documentation workflows on one exact reviewed head;
- review remediation, merge, Issue #30 closure and branch synchronization.

## Next authorized claim

Phase 9 — Subscription and payment foundation is the next planned phase. It is not active until a new agent explicitly updates this file to `CLAIMED`, identifies its governing issue and reserves the required modules/paths.

The Phase 9 agent must first read:

- `MASTER_BUILD_PLAN.md`;
- `docs/phase8/INTERACTION_TRUST_CONTRACT.md`;
- `docs/phase9/HANDOFF_FROM_PHASE8.md`;
- `PROJECT_STATUS.md`;
- `DECISION_LOG.md`;
- `RISK_REGISTER.md`.

## Non-negotiable inherited stop gates

- No real customer, provider, contact, enquiry, review, complaint or appeal data without later authorization.
- No production messaging/call/push adapter, payment provider, credentials, deployment or public pilot under the Phase 8 checkpoint.
- Full chat, attachments and voice/video calling remain deferred.
- Contact data is private and disclosed only after current channel-specific consent and provider acceptance.
- Reviews require an owned qualifying tracked interaction.
- Enquiries, reviews, responses, complaints, appeals, payments and direct edits cannot create claims, publication or ranking.
- Phase 9 commercial state must remain independent from verification, review outcomes and ranking.
- Issue #5 remains a later, non-blocking Zambia pilot-validation obligation.

## Conflict rule

A second agent must not modify paths reserved by an active `CLAIMED` lock. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.

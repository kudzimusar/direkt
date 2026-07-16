# DIREKT Workstream Lock

This file prevents overlapping writes in the single-lane build process.

## Current lock

| Field | Value |
|---|---|
| Status | CLAIMED |
| Owner/agent | OpenAI GPT-5.6 Thinking — Phase 8 enquiries, interactions and reviews agent |
| Phase | Phase 8 — Enquiries, interactions and reviews |
| Task | Implement structured enquiries, provider response lifecycle, consent-aware contact handoff, interaction history, review eligibility, moderation, appeals and complaint linkage |
| Modules/paths | `database`, `backend/direkt-api`, `android/direkt-app`, `admin/direkt-operations-portal`, `docs`, `PROJECT_STATUS.md`, `DECISION_LOG.md`, `RISK_REGISTER.md` |
| Claimed at | 2026-07-16 after Phase 7 checkpoint merge and branch synchronization |
| Expected handoff | Reviewed Phase 8 checkpoint with tracked interactions, consent-scoped handoff, eligible reviews, moderation/appeals, complaint linkage and green permanent CI |
| Last stable checkpoint | `7ea8aa17dbced5f9e56dd259b15216223aa33921` |
| Governing issue | Issue #30 |

## Stable predecessor

Phase 7 completed through PR #29 and Issue #28.

```text
Phase 7 reviewed source head: 0fc6add2ea1bcdebbeb2eb6430049b6061081667
Phase 7 verified final head:  d9e621b659b42797fbf45478d5b7109fdc274459
Phase 7 merge commit:         7ea8aa17dbced5f9e56dd259b15216223aa33921
Issue #28:                    closed as completed
```

## Phase 8 objective

Complete DIREKT's synthetic tracked-interaction loop from a currently eligible public provider publication through a structured enquiry, provider response, channel-specific consent and handoff, interaction history, review eligibility, moderation, appeals and complaint linkage.

## Delivery stages

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

## Non-negotiable stop gates

- No real customer, provider, contact, enquiry, review, complaint or appeal data.
- No production messaging/call/push adapter, payment provider, credentials, deployment or public pilot.
- Full chat, attachments and voice/video calling remain deferred.
- Contact data is private and disclosed only after current channel-specific consent and provider acceptance.
- Reviews require an owned qualifying tracked interaction.
- Enquiries, reviews, responses, complaints, appeals, payments and direct edits cannot create claims, publication or ranking.
- Phase 9 retains subscriptions, invoices, payments, webhooks and commercial enforcement.
- Issue #5 remains a later, non-blocking Zambia pilot-validation obligation.

## Conflict rule

A second agent must not modify the listed Phase 8 paths while this lock is claimed. Read-only review is allowed. A stale or ambiguous lock must be resolved explicitly rather than overwritten by assumption.

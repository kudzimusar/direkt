# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Programme state:** Phase 8 implementation is complete in source and Stage 8G exact-head validation is active under Issue #30 and PR #31.

## Stable checkpoints

| Phase | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |

## Phase 8 implementation state

Issue #30 remains the sole active implementation tracker and PR #31 remains the checkpoint PR.

| Stage | State | Implemented source |
|---|---|---|
| 8A — foundation and structured enquiry | Implemented | forward migrations, bounded idempotent enquiry API, customer scope and immutable events |
| 8B — provider lifecycle | Implemented | actor-resolved provider inbox, explicit transitions, optimistic revisions and invalid-action denial |
| 8C — consent-aware handoff | Implemented | verified contact references, masked hints, 24-hour consent, revocation and disabled delivery |
| 8D — history and eligibility | Implemented | tracked interactions, safe history projections and deterministic review eligibility |
| 8E — reviews and appeals | Implemented | one review/response, moderation, public allowlist, reports and appeal restoration |
| 8F — complaints and clients | Implemented | separate customer complaints, Android customer/provider experiences and portal workspaces |
| 8G — checkpoint promotion | Active | regression, documentation, exact-head gates, review, merge and synchronization |

## Permanent evidence added

- complete backend enquiry and interaction-lifecycle E2E coverage;
- database authorization and lifecycle guards for moderation, appeals and complaints;
- privacy-safe operations interaction projection;
- Android persistent offline enquiry drafts and critical recovery states;
- Android customer/provider interaction, consent, review and response experiences;
- operations portal interaction-history, review-moderation and customer-complaint workspaces;
- OpenAPI route and prohibited-domain checks;
- interaction trust contract, validation matrix and Phase 9 handoff;
- updated decisions and risk treatments.

## Phase 8 boundaries

No real customer, provider, contact, enquiry, review, complaint or appeal data is authorized. No production messaging, call, push, payment, credential, deployment or public pilot is authorized. Full chat, attachments and voice/video calling remain deferred.

Reviews require a qualifying owned tracked interaction. Contact handoff requires current channel-specific consent and stores only a verified contact reference and masked hint. Enquiries, interactions, handoffs, reviews, responses, reports, appeals, complaints and commercial state cannot create verification claims, publication eligibility or trust ranking.

## Current exit work

Before Phase 8 can become stable:

1. backend/PostgreSQL/PostGIS verification must pass;
2. Android unit, lint, debug APK and Compose test APK assembly must pass;
3. operations portal format, lint, type, tests and production build must pass;
4. documentation and repository privacy controls must pass;
5. all permanent workflows must report green on one exact reviewed head;
6. source review findings must be remediated;
7. PR #31 must merge, Issue #30 must close, the implementation branch must synchronize and the workstream lock must release.

## Next phase boundary

Phase 9 remains unclaimed. It owns products, entitlements, subscriptions, invoices, payments, webhooks, reconciliation and commercial enforcement. Its entry contract is documented in `docs/phase9/HANDOFF_FROM_PHASE8.md`.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.

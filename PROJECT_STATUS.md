# DIREKT Project Status

**Updated:** 2026-07-17  
**Stable branch:** `main`  
**Implementation branch:** `build/android-v1` synchronized to stable after checkpoint promotion  
**Programme state:** Phase 8 is complete and stable. Phase 9 is the next planned phase and remains unclaimed.

## Stable checkpoints

| Phase | PR | Merge commit | Issue |
|---|---:|---|---:|
| Phase 4 verification/evidence | #21 | `d9078a78d3677a94a720de2d16483487594b261e` | #20 closed |
| Phase 5 customer discovery | #24 | `11541db4d5ea856404f8fee03c0ca55cf6bab36c` | #23 closed |
| Phase 6 provider workspace | #26 | `3083b54278c73ce74f53db800c2ec0dfc59c4dde` | #25 closed |
| Phase 7 operations workflow | #29 | `7ea8aa17dbced5f9e56dd259b15216223aa33921` | #28 closed |
| Phase 8 enquiries/interactions/reviews | #31 | `0182951cdc26a892b3423728bd843e2969b25bc0` | #30 closed |

## Phase 8 checkpoint

Phase 8 completed through PR #31 and Issue #30.

```text
Phase 8 exact reviewed head: 380687bf8044bc44ec1f70c58e4b71c6b3e3c6a7
Phase 8 merge commit:       0182951cdc26a892b3423728bd843e2969b25bc0
Issue #30:                  closed as completed
```

| Stage | State | Stable capability |
|---|---|---|
| 8A — foundation and structured enquiry | Complete | forward migrations, bounded idempotent enquiry API, customer scope and immutable events |
| 8B — provider lifecycle | Complete | actor-resolved provider inbox, explicit transitions, optimistic revisions and invalid-action denial |
| 8C — consent-aware handoff | Complete | verified contact references, masked hints, 24-hour consent, revocation and disabled delivery |
| 8D — history and eligibility | Complete | tracked interactions, safe history projections and deterministic review eligibility |
| 8E — reviews and appeals | Complete | one review/response, moderation, public allowlist, reports and appeal restoration |
| 8F — complaints and clients | Complete | separate customer complaints, Android customer/provider experiences and portal workspaces |
| 8G — checkpoint promotion | Complete | permanent regression, documentation, exact-head gates, review, merge, closure and synchronization |

## Permanent Phase 8 evidence

- complete backend enquiry and interaction-lifecycle E2E coverage;
- database authorization and lifecycle guards for moderation, appeals and complaints;
- privacy-safe operations interaction projection;
- Android persistent offline enquiry drafts and critical recovery states;
- Android customer/provider interaction, consent, review and response experiences;
- operations portal interaction-history, review-moderation and customer-complaint workspaces;
- OpenAPI route and prohibited-domain checks;
- interaction trust contract, validation matrix and Phase 9 handoff;
- updated decisions and risk treatments.

## Final checkpoint validation

All permanent workflows passed on exact source head `380687bf8044bc44ec1f70c58e4b71c6b3e3c6a7`:

- backend formatting, lint, typecheck, clean migrations, 142 tests, build and OpenAPI checks;
- Android identity/safety checks, unit tests, lint, debug APK and Compose test APK assembly;
- operations portal formatting, lint, typecheck, tests, production build and API-isolation checks;
- documentation validation, archive packaging, Pages source and strict MkDocs build.

No unresolved PR review threads or comments remained. Temporary diagnostic scripts and workflows were removed before checkpoint promotion.

## Phase 8 boundaries

No real customer, provider, contact, enquiry, review, complaint or appeal data is authorized. No production messaging, call, push, payment, credential, deployment or public pilot is authorized. Full chat, attachments and voice/video calling remain deferred.

Reviews require a qualifying owned tracked interaction. Contact handoff requires current channel-specific consent and stores only a verified contact reference and masked hint. Enquiries, interactions, handoffs, reviews, responses, reports, appeals, complaints and commercial state cannot create verification claims, publication eligibility or trust ranking.

## Next phase boundary

Phase 9 remains unclaimed. It owns products, entitlements, subscriptions, invoices, payments, webhooks, reconciliation and commercial enforcement. Its entry contract is documented in `docs/phase9/HANDOFF_FROM_PHASE8.md`.

Phase 9 must be claimed explicitly in `WORKSTREAM_LOCK.md` before implementation begins. It must preserve the Phase 8 interaction trust contract and keep payment, subscription and entitlement state independent from verification, publication, review outcomes and ranking.

Issue #5 remains open as a later, non-blocking Zambia pilot-validation obligation.

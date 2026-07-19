# W4 — Complete Customer Journey

**Status:** CLOSED — repository, regression and managed synthetic customer evidence passed  
**Exact managed source:** `61a6bce54bffcec545a2009ac353596ee1d69f83`  
**Managed run:** `29704996877` — PASS

W4 implements the authenticated browser customer loop against the canonical DIREKT API:

- saved providers;
- tracked enquiry creation and cancellation;
- provider response visibility through enquiry state;
- explicit contact handoff creation and revocation;
- interaction history;
- eligible review creation and review appeal/report paths;
- customer complaint creation and history;
- account contact references required for consented handoff;
- same-origin and CSRF protection for every mutation;
- idempotency keys for enquiry, handoff and complaint creation;
- server-controlled policy versions;
- no direct browser access to Supabase, private Cloud Run credentials, evidence objects or exact private coordinates.

## Closure evidence

The final W4 implementation head passed the W4 contract verifier, functional web build, backend tests/build/OpenAPI, integration runtime audit, controlled staging readiness, recovery, supply-chain, Phase 11 synthetic controls and Android protected-surface/dependency gates. The two review blockers—complaint idempotency propagation and a stale permission marker—were fixed before merge.

Managed run `29704996877` on exact merged source `61a6bce54bffcec545a2009ac353596ee1d69f83` proved through the IAM-private BFF:

1. unauthenticated Cloud Run access is denied;
2. browser authentication and CSRF state are established without exposing DIREKT credentials;
3. missing-origin mutations are rejected;
4. saved-provider state persists and can be removed authoritatively;
5. enquiry creation produces durable backend state;
6. replaying the same idempotency key returns the same enquiry;
7. stale revision mutation is rejected;
8. the enquiry can be cancelled with the current authoritative revision;
9. customer state remains free of private evidence, raw contact and exact-coordinate fields;
10. temporary deployer Invoker access is removed.

Provider-mediated customer states—provider enquiry response, consent-aware handoff eligibility, completed interaction, review eligibility, review/report/appeal and complaint eligibility—cannot safely be fabricated by a customer-only canary. Their browser route/DTO/authorization/idempotency behavior is therefore evidenced by the exact-head W4 contract and backend lifecycle suites, while managed customer evidence covers every mutation the authenticated customer can initiate independently. No provider authority was granted to the customer canary merely to manufacture a full-loop result.

Real participants, real communications, public cutover and Phase 12 production authorization remain separately gated.
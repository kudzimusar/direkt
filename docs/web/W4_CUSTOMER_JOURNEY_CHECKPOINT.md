# W4 — Complete Customer Journey

**Status:** IMPLEMENTING — repository implementation under exact-head verification and managed synthetic closure evidence

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
- idempotency keys for enquiry and handoff creation;
- server-controlled policy versions;
- no direct browser access to Supabase, private Cloud Run credentials, evidence objects or exact private coordinates.

## Closure requirements

W4 is CLOSED only when exact reviewed source proves:

1. all W4 TypeScript and backend tests pass;
2. the W4 contract verifier passes;
3. Android protected-path and dependency gates remain green;
4. automated review has no unresolved P1/P2 finding;
5. managed synthetic evidence proves save → enquiry → handoff → interaction/review/complaint state through the IAM-private BFF;
6. unauthorized, cross-origin, invalid-CSRF, stale-revision and duplicate-idempotency paths fail safely;
7. no private contact/evidence/location fields leak through customer state responses;
8. the exact reviewed head is merged and the implementation lane synchronized.

Real participants, real communications, public cutover and Phase 12 production authorization remain separately gated.
# RC9 Generated-Client Closure Receipt

**Integration:** OpenAPI-generated Kotlin and TypeScript client adoption
**Governing issue:** #261
**State:** CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION
**Claim base:** `030cd577e179863b70f24d99ab237e74660b4325`
**RC9A merge:** `e43efc5050a792a902a1ca94113854541380b56e`
**Implementation PR:** #497
**Exact implementation head:** `04ef57f31414ec5165e353abba74afb8dfdcc901`
**Implementation merge:** `70de95c73128e921cd4d7c667de0e5a442a9e0c0`
**Closeout PR:** #498

## Deterministic generation receipt

- OpenAPI Generator: `7.22.0`;
- generator JAR SHA-256: `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`;
- canonical OpenAPI SHA-256: `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`;
- Kotlin: 111 source files, tree SHA-256 `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`;
- TypeScript: 98 source files, tree SHA-256 `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`;
- byte-for-byte regeneration, credential scanning, immutable receipts, real Kotlin `.class` output and strict TypeScript checking: enforced.

## Bounded runtime adoption

Android adopts only the Firebase-to-DIREKT session exchange through `GeneratedPilotSessionExchangeClient`. HTTPS-only origin validation, 10-second timeouts, redirects/retries disabled, consent, Firebase sign-out, encrypted session storage, push registration, existing error semantics and Android API 23 support remain intact.

The web consumes generated Firebase-auth request/response types only through the server-side BFF adapter. Cloud Run IAM, DIREKT bearer/session propagation, idempotency, timeout, `no-store`, redirect rejection and safe errors remain DIREKT-owned. Generated browser transport remains prohibited.

Generated imports remain fail-closed everywhere except the two reviewed adoption points. Raw JSON date-time strings are normalized; invalid values fail closed. The Play/Data Safety SDK inventory records the resolved Retrofit/Kotlin serialization dependency surface and verifies generated BODY logging is inactive.

## Exact-head regression evidence

| Gate | Run |
|---|---:|
| RC9 generated-client contract | `30273733920` |
| Deterministic generated clients | `30273733953` |
| Phase 12B Play readiness | `30273729323` |
| Android CI/instrumentation | `30273725051` |
| Android performance | `30273725145` |
| Backend CI | `30273729628` |
| Backend container | `30273725018` |
| W7 cross-client regression | `30273725334` |
| Customer/provider PWA | `30273725116`, `30273725164` |
| Supply-chain security | `30273729475` |
| Integration runtime audit | `30273725181` |
| Phase 12A reproducible AAB | `30273725138` |
| Phase 12 final readiness | `30273725312` |
| Phase 10 recovery | `30273725407` |
| Phase 11 synthetic pilot | `30273725194` |
| RC5 / RC6 / RC7 preservation | `30273725088`, `30273725104`, `30273725384` |
| Documentation quality | `30273725186` |

## Exact-main verification

The reviewed PR content was squash-merged unchanged at `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`. The relevant workflows are pull-request triggered and therefore produced no separate push runs for the squash commit. RC9D is branched directly from that exact merge and reruns permanent closure contracts against the main-derived source.

## Authorization boundary

- browser-direct private API: false;
- privileged client credentials: false;
- provider/database/payment secrets in generated clients: false;
- participant data activation: false;
- production authentication/release authorization: false;
- payment-provider or real-money authorization: false.

RC9 closes generated-client tooling and the approved bounded adoption only. Phase 11 real evidence, 11J, legal/privacy and formal Phase 12 production-release gates remain open. RC10 is next but unclaimed.

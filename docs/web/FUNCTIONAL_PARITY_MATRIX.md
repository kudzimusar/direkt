# DIREKT Android ↔ Web/PWA Functional Parity Matrix

**Status:** W7 cross-client parity/regression closure  
**Owner:** Functional PWA parity workstream  
**Governing plan:** `docs/web/FUNCTIONAL_PWA_PARITY_IMPLEMENTATION_PLAN.md`

## Status legend

- `PASS` — implemented against canonical backend authority and supported by exact-head and/or managed evidence.
- `GATED` — intentionally unavailable because a separately controlled external, participant, legal, or runtime gate is not approved; must not be simulated as PASS.
- `N/A` — not applicable to the browser client or to the current managed synthetic cohort.

A W-stage may close only when every applicable capability is `PASS` or explicitly `GATED` with a concrete reason. Core authorization, privacy, session, evidence, enquiry, review and commercial invariants may not be downgraded to `GATED` to avoid a failing test.

## Cross-client foundation

| Capability | Android/current product truth | Web/PWA | W7 status |
|---|---|---|---|
| DIREKT product identity/design semantics | Compose/product design | Same semantic design tokens/trust language | PASS |
| Customer destinations | Discover / Saved / Enquiries / Account | Same four destinations | PASS |
| Provider destinations | Overview / Profile / Enquiries / Account | Same destination model with provider labels | PASS |
| Mobile/tablet/desktop adaptation | Native/adaptive client | Bottom nav / navigation rail / desktop side nav | PASS |
| Installable/offline-safe shell | Native app shell | Manifest + service worker + offline shell | PASS |
| Canonical REST/OpenAPI authority | Active backend; Android integration remains programme-controlled | Reviewed BFF to same API | PASS |
| Direct privileged Supabase/database/Storage authority in browser | Prohibited | Prohibited | PASS |
| Backend-authoritative roles/provider scope | Required | Actor-resolved only | PASS |
| Android source/Gradle/release surface changed by PWA workstream | Must remain stable | No Android refactor | PASS |
| Live Android-runtime ↔ web-runtime state mutation synchronization | Android runtime network activation remains separately controlled in current programme | Web uses canonical backend | GATED — W7 proves contract compatibility and zero Android regression; it does not fabricate Android runtime writes that the existing protected Android surface does not expose |

## Authentication and account — W3 closed

| Capability | Canonical authority | Web/PWA status |
|---|---|---|
| Controlled synthetic auth challenge/session | DIREKT auth service | PASS |
| Firebase-to-DIREKT exchange boundary | `/auth/firebase/exchange` | PASS |
| Real Firebase Web phone-possession activation | Firebase + Phase 11 participant/legal controls | GATED — public Firebase Web configuration/real participant admission not authorized by W7 |
| HttpOnly rotating session envelope | DIREKT auth/session + BFF | PASS |
| Session rotation after access expiry | rotating refresh family | PASS |
| CSRF/same-origin mutation protection | BFF | PASS |
| Session list/revoke/logout | auth session routes | PASS |
| Account profile | `/account/profile` | PASS |
| Provider mode availability | `/provider-workspace/me` | PASS — server-derived; no client provider ID/role |
| Pilot invitation/admission | participant admission controls | GATED — real Phase 11 participant evidence remains open |

**Evidence:** managed W3 run `29703117963` PASS on exact source `012a7b9c24e93087d823661298d051c08ea34ec0`.

## Public discovery — W2 closed

| Capability | Canonical authority | Web/PWA status |
|---|---|---|
| Categories | `/public/categories` | PASS |
| Area/manual location fallback | discovery query/location contract | PASS |
| Provider search/filters | `/public/providers/search` | PASS |
| Provider cards/profile | public provider projection | PASS |
| Scoped trust claims | public claim projection | PASS |
| Availability | public availability projection | PASS |
| Public reviews | public review projection | PASS |
| Share-safe profile | public share projection | PASS |
| Private evidence/contact/private coordinates in public response | Prohibited | PASS — privacy scans/contracts |
| Map runtime | Google Maps runtime separately unproven | GATED — list/manual fallback remains first-class |

**Evidence:** managed W2 run `29694862350` PASS on exact source `4b892b90c42239c81c4f9c6f8c9f5447519dd6f6`.

## Customer journey — W4 closed

| Capability | Canonical authority | Web/PWA status |
|---|---|---|
| Saved-provider shortlist | customer saved-provider domain | PASS |
| Create/list/detail/cancel enquiry | enquiry lifecycle | PASS |
| Enquiry state/history | revisioned enquiry domain | PASS |
| Consent-aware contact handoff | interaction/handoff domain | PASS |
| Handoff list/revoke | interaction/handoff domain | PASS |
| Interaction history | interaction domain | PASS |
| Review eligibility | interaction/review domain | PASS |
| Submit/list/read/appeal/report review | review domain | PASS |
| Interaction complaint/list/detail | complaint domain | PASS |
| Provider-mediated transitions from customer browser | Provider authority | N/A — customer browser cannot fabricate provider authority; canonical lifecycle tests cover protected transitions |

**Evidence:** managed W4 run `29704996877` PASS on exact source `61a6bce54bffcec545a2009ac353596ee1d69f83`, plus exact-head canonical lifecycle/contract tests for provider-mediated states.

## Provider journey — W5 closed

| Capability | Canonical authority | Web/PWA status |
|---|---|---|
| Actor-resolved workspace/readiness | `/provider-workspace/me` | PASS |
| Profile/operating model | provider workspace | PASS |
| Service/category selection/removal | provider/category domain | PASS |
| Availability | provider workspace | PASS |
| Private base/public premises/service area | provider workspace/PostGIS | PASS — private base write-only; public point requires consent |
| Verification/readiness timeline | safe workspace projection | PASS |
| Evidence requirements/status | verification/evidence domain | PASS |
| Recoverable evidence upload/retry/cancel | private upload-intent domain | PASS |
| Provider enquiry inbox/detail/transitions | provider interaction domain | PASS |
| Masked consent-scoped handoff | provider handoff projection | PASS |
| Provider interaction history | interaction domain | PASS |
| Provider reviews/response/appeal | review domain | PASS |
| Fixture-dependent provider enquiry/review mutation in generated W5 cohort | Synthetic fixture availability | N/A where fixture absent — not fabricated; permanent canonical lifecycle suites remain required |

**Evidence:** trusted-main W5 managed provider canary PASS on exact merged source `79228f4bda96106b929aa6183613cb9d2dc127f6`; authoritative bot result on Issue #133 comment `5017630247`.

## Commercial lifecycle — W6 closed

| Capability | Canonical authority | Web/PWA status |
|---|---|---|
| Product catalogue | commercial service | PASS |
| Entitlements | commercial service | PASS — no verification/publication/ranking effects |
| Retry-safe subscription creation | provider commercial routes | PASS — idempotency required |
| Subscription status/cancellation | provider commercial routes | PASS — expected revision |
| Invoice creation/state | commercial service | PASS |
| Synthetic payment-intent lifecycle | commercial payment provider | PASS when backend mode is `synthetic` |
| Disabled payment-provider behavior | commercial payment provider | PASS — initiation fail-closed |
| Payment-intent cancellation/status | commercial service | PASS |
| Receipt projection | commercial service | PASS |
| Browser payment webhook authority | Prohibited | PASS — not exposed/invoked |
| Commercial state changing verification/publication/ranking | Prohibited | PASS |
| Real MTN/Airtel credentials and money movement | External provider/production authorization | GATED — not configured or authorized by W6/W7 |

**Evidence:** trusted-main W6 managed commercial canary PASS on exact merged source `1b5753002afcf115f6f47334f6588648eca7501d`.

## External/runtime gates retained

| Integration | Current truth | W7 treatment |
|---|---|---|
| Google Maps | Externally provisioned/runtime unproven | GATED; preserve manual/list fallback |
| Sentry | Externally provisioned/runtime unproven | GATED; no active-runtime claim |
| Resend | Externally provisioned/runtime adapter unproven | GATED; no delivery claim |
| FCM | Planned | GATED; not required for current browser parity |
| WhatsApp Cloud API | Planned/disabled | GATED; domain handoff only |
| Turnstile | Planned/not active | GATED; not assumed in auth architecture |
| MTN MoMo/Airtel Money | Planned/disabled | GATED; no real money movement |
| Real participant admission | Phase 11 evidence incomplete | GATED |
| Formal Phase 12 production release | Requires 11J PROCEED/global gates | GATED |

## W7 regression acceptance

| Control | Required result |
|---|---|
| Functional web typecheck + W2–W7 contract verifiers + production build | PASS |
| Backend migration + full Jest + build + OpenAPI generation/check | PASS |
| Database Data API/authorization/provider-workspace contract harnesses | PASS |
| Android debug unit tests | PASS |
| Android lint | PASS |
| Android debug assembly | PASS |
| Android debug/release dependency graph resolution | PASS |
| Android protected-path diff | PASS |
| Mobile bottom navigation / tablet rail / desktop side navigation breakpoints | PASS |
| Keyboard focus / skip-link / reduced-motion semantics | PASS |
| Service-worker mutation/private no-cache and network-only rules | PASS |
| No browser-readable DIREKT tokens/private evidence/object keys/service-role credentials | PASS |
| CSRF/origin/provider-scope/direct-API negative contracts | PASS |
| W2–W6 managed exact-source evidence chain reconciled | PASS |
| External/participant/production gates represented honestly | PASS/GATED with reason |

## W8 remains blocked until W7 closes

W7 closure does not authorize public production release. W8 must separately prove an approved route/domain/runtime-identity cutover, preserve the historical synthetic preview, keep the canonical API IAM-private, and retain Phase 11/Phase 12 gates.

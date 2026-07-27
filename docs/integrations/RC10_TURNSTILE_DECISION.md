# RC10 Cloudflare Turnstile Decision

**Decision date:** 2026-07-27 (Asia/Tokyo)
**Governing issue:** #261
**Claim merge:** `e0ee52564eef16cdec1d8eb0a85f17da456cb5b1`
**Implementation PR/head:** #502 / `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`
**Implementation merge:** `620a99ba5465ad38ce012df0a8fa15e458de6505`
**Closure state:** `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`
**Decision:** `NOT CURRENTLY REQUIRED`
**Turnstile runtime:** not active
**Production authorization:** false

## Decision

DIREKT will not install Cloudflare Turnstile at RC10.

The current product does not contain a reviewed anonymous browser flow whose residual risk justifies adding a human-verification challenge. Consequential writes are authenticated and permission-checked. Authentication and public helper routes already pass through DIREKT-owned, database-backed, fail-closed abuse controls. The managed browser runtime is synthetic-only, participant admission and production authentication remain disabled, and external provider modes remain separately gated.

Installing Turnstile globally would add accessibility, privacy, availability and operational dependencies without a demonstrated current risk reduction. It would also risk incorrectly making a third-party challenge a prerequisite for native Android, authentication, discovery or support access. That is prohibited.

## Public-flow threat model

| Flow | Exposure and potential abuse | Existing authority and control | RC10 outcome |
|---|---|---|---|
| `POST /api/v1/auth/challenges` | challenge flooding and contact-delivery cost | enumeration-safe response, synthetic/invite-gated delivery, HMAC-network rate limit `5/300s`, backend admission controls | Turnstile not justified while real public delivery and participant admission remain disabled |
| `POST /api/v1/auth/challenges/verify` | code guessing and session creation attempts | challenge expiry/lock semantics, backend verification, rate limit `10/300s` | no browser challenge; backend verification remains authority |
| `POST /api/v1/auth/firebase/exchange` | token replay or unauthorized pilot admission | Firebase token verification, approved-notice acceptance, external-identity admission, rate limit `10/300s` | no Turnstile; native Android compatibility and identity verification remain authoritative |
| `POST /api/v1/public/discovery/assist` | automated AI/fallback requests and potential model cost | bounded input, deterministic fallback, provider modes fail closed, new rate limit `30/300s` | first-party control sufficient for current synthetic-only mode |
| `POST /api/v1/public/support/assist` | automated Help requests and potential model cost | bounded public facts, deterministic fallback, provider modes fail closed, new rate limit `30/300s` | first-party control sufficient for current synthetic-only mode |
| `POST /api/v1/public/discovery/search-area/normalize` | geocoding request amplification and provider cost | Zambia-bounded input, manual fallback, Maps provider disabled by default, quotas/budgets/timeouts, new rate limit `20/300s` | lower first-party limit is proportionate; no challenge currently justified |
| `GET /api/v1/public/providers/search` | scraping and request amplification | public-safe projection, no private coordinates, rate limit `120/60s` | no challenge for ordinary public read access |
| enquiries, reviews, reports and complaints | spam, harassment or storage/moderation load | authenticated actor, scoped permission, ownership/provider checks, idempotency where applicable and route-specific rate limits | anonymous Turnstile would not replace authorization and is not required |
| payment/provider webhooks | forged or repeated provider events | provider-specific authenticity/status checks, idempotency, reconciliation and bounded route controls | Turnstile is inappropriate for machine-to-machine traffic |

## Abuse-control closure

RC10 closes the three public POST policy gaps identified by the audit:

- `public_discovery_assist`: 30 requests per 300 seconds;
- `public_support_assist`: 30 requests per 300 seconds;
- `public_search_area_normalize`: 20 requests per 300 seconds.

All policies use the existing backend middleware and `security.consume_rate_limit` database function. The network subject is HMAC-SHA-256 hashed before persistence. Raw IP addresses are not used as durable rate-limit keys. Failure of the abuse-control service rejects protected operations with `503`; exhausted policies return `429` with bounded retry metadata.

## Privacy, accessibility and availability

Because Turnstile is not active:

- no Cloudflare Turnstile site key or secret exists in DIREKT runtime;
- no challenge token is collected, stored, logged or sent to Cloudflare;
- no Turnstile package or browser widget is installed;
- Android and other non-browser clients remain unaffected;
- no challenge can block authentication, discovery, Help or accessibility fallback;
- Cloudflare availability cannot become an application prerequisite.

## Re-evaluation triggers

Turnstile requires a new explicit workstream claim and a fresh threat model if any of these become true:

1. unauthenticated public registration or challenge delivery begins to create real SMS, email or WhatsApp cost;
2. participant or production browser authentication is approved and measured bot activity exceeds backend admission and rate controls;
3. an anonymous public form creates material spam, moderation, storage or operational load;
4. production AI or geocoding is enabled for anonymous browser traffic and measured automated use exceeds quotas and first-party controls;
5. security monitoring shows distributed automation that cannot be addressed proportionately with authenticated scope, quotas, rate limits, network controls or provider-side protections;
6. a legal, privacy, accessibility or provider review requires a different abuse-control design.

Any future Turnstile implementation must be limited to the reviewed browser action and must include server-side verification, hostname/action binding, expiry and replay resistance, secret isolation, token non-logging, accessibility fallback, a fail-safe kill switch and tests for provider outage. It must not be global and must not apply to Android or machine-to-machine webhooks.

## Authorization boundary

RC10 does not authorize real participants, production authentication, real external communications, production AI, production Maps, payment-provider activation, real money, private evidence processing or formal Phase 12 release. Those gates remain unchanged.


## Closure evidence

The exact implementation head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38` passed the complete required matrix before PR #502 was squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`:

- RC10 decision contract `30279827057`;
- backend CI/container `30279827068`, `30279826976`;
- runtime audit `30279831964`;
- deterministic generation and RC9 preservation `30279826827`, `30279829353`;
- W7/W8 and functional PWA `30279829473`, `30279826788`, `30279829352`, `30279826525`;
- recovery/staging/Phase 11 synthetic `30279826679`, `30279826805`, `30279829444`;
- RC5/RC6/RC7/RC8 preservation `30279829654`, `30279829433`, `30279829956`, `30279829618`, `30279826638`, `30279829561`;
- documentation quality `30279827241`.

RC10 is closed at this bounded decision and first-party abuse-control boundary. The repository write lane is released. RC11 is next but remains unclaimed.

# Phase 8 Interaction Trust Contract

**Status:** Implemented synthetic contract; production integration remains prohibited  
**Owning phase:** Phase 8 — Enquiries, interactions and reviews  
**Governing issue:** #30  
**Policy baseline:** `phase8-v1`

## Purpose

Phase 8 completes DIREKT's accountable interaction loop after a customer discovers a currently eligible public provider. It records a bounded service enquiry, provider response, time-limited contact consent, tracked interaction history, review eligibility, moderation, appeals and customer complaint linkage.

This contract does not implement chat, attachments, voice/video calls, production WhatsApp or telephone delivery, payments, subscriptions, invoices, ranking purchases or a public pilot.

## Non-negotiable invariants

1. A customer enquiry targets a current public publication, not a client-supplied internal provider or category record.
2. Customer, provider, publication and category scope are resolved or verified by the API and database.
3. Provider workspace scope is derived from one active server-side provider assignment. Zero or ambiguous assignments are rejected.
4. Every lifecycle transition records an actor, reason, policy version, timestamp and optimistic revision.
5. Repeated, stale, invalid, terminal and wrong-scope transitions are rejected.
6. Contact handoff requires an accepted enquiry, an active tracked interaction, a verified customer phone contact and current channel-specific consent.
7. Contact storage contains only a verified contact reference and masked display hint. Raw contact values are not copied into the interaction domain.
8. Contact consent expires after 24 hours and may be revoked immediately. Provider retrieval fails after expiry or revocation.
9. Phase 8 contact delivery is synthetic and disabled. The backend does not place a call or send a WhatsApp message.
10. Review eligibility comes only from an owned accepted-and-closed tracked interaction inside its deterministic review window.
11. One tracked interaction can create at most one review. One review can contain at most one provider response.
12. A review is not public until an authorized moderation transition publishes it.
13. Withheld or removed reviews may be appealed. A denied appeal restores the original moderation state and timestamp; an upheld appeal returns the review to pending moderation.
14. Customer complaints are linked to owned tracked interactions and remain separate from public review reports and Phase 7 internal incidents.
15. Enquiries, interactions, handoffs, reviews, responses, reports, appeals and complaints cannot create or strengthen verification decisions, claims, publication eligibility, trust ranking, entitlements or payment state.

## Structured enquiry boundary

The enquiry payload is deliberately bounded:

- current public provider publication identifier;
- service summary;
- timing category;
- public-safe locality summary;
- preferred handoff channel;
- policy version;
- idempotency key supplied in the request header.

It does not accept free-form chat threads, attachments, audio, video, raw evidence, customer-selected provider scope, payment intent or ranking preferences.

Creation is idempotent. Reusing the same key and request fingerprint returns the existing enquiry. Reusing the key with different content is rejected.

## Provider response lifecycle

Allowed provider transitions are explicit:

```text
received
├─ acknowledged
├─ needs_information
├─ accepted
└─ declined

acknowledged
├─ needs_information
├─ accepted
└─ declined

needs_information
├─ acknowledged
├─ accepted
└─ declined

accepted
└─ closed
```

A customer may cancel a non-terminal enquiry. Accepted enquiries open one tracked interaction. Closing the enquiry completes the tracked interaction and opens its review window. Cancellation never creates review eligibility.

## Contact consent and handoff

A handoff is a privacy-controlled record, not a communication transport.

| Property | Contract |
|---|---|
| Supported channels | Synthetic `call` or `whatsapp` |
| Contact source | Customer-owned verified phone contact |
| Stored contact data | Contact row reference and masked display hint only |
| Consent lifetime | 24 hours |
| Revocation | Immediate, customer-owned and audited |
| Provider visibility | Current masked hint only |
| Raw value exposure | Prohibited |
| External delivery | Disabled |
| Retry behaviour | Idempotent logical request |

The provider cannot request a different customer contact, extend consent, retrieve an expired/revoked handoff or infer a raw value from the API projection.

## Interaction history

Tracked interaction and event history is append-only. Customer and provider projections are scope-filtered. The operations projection is privacy-safe and contains lifecycle state, counts and safe event summaries only.

The operations projection excludes:

- customer identity;
- raw or masked contact values;
- private evidence;
- storage identifiers;
- internal moderation rationale;
- trust or ranking mutation controls.

## Reviews and public output

Review states are:

```text
pending → published | withheld | removed
published → withheld | removed
withheld → published | removed
withheld | removed → appealed
appealed → published | withheld | removed
```

Appeal decisions are `upheld` or `denied`:

- `upheld` returns the review to `pending` for a fresh moderation decision;
- `denied` restores the persisted pre-appeal `withheld` or `removed` state.

Public review output is allowlisted. It may include provider display information, rating, title, body, publication time and one provider response. It excludes customer identity, interaction identifier, contact data, reports, appeal records and internal moderation rationale.

## Customer complaint boundary

Customer complaints use an independent state machine:

```text
submitted → triaged | resolved
triaged → resolved | closed
resolved → closed
```

Every operations transition requires an active global permission, expected revision, reason and policy version. Complaint rows and event history are immutable outside the state-machine functions.

Customer complaints do not create Phase 7 internal incidents automatically, and the operations complaint projection contains no internal incident data.

## Database enforcement

The database provides the final trust boundary through:

- foreign keys and scope-consistency checks;
- immutable event and terminal-history triggers;
- optimistic revision checks;
- provider-assignment checks;
- global operations-permission checks;
- contact-consent scope validation;
- review-eligibility validation;
- one-review, one-response and one-active-appeal constraints;
- server-controlled moderation, appeal and complaint functions;
- no-delete guards for material interaction records.

Controller authorization is necessary but not sufficient. Direct calls to privileged database state machines by unauthorized identities are rejected.

## Android contract

The Android app provides customer and provider modes in one native application while preserving server authority.

Customer experience includes:

- persistent low-bandwidth enquiry draft;
- stable logical retry identifier;
- retryable interruption state;
- stale-revision refresh state;
- consent expiry and renewal state;
- tracked history, review eligibility and appeal state.

Provider experience includes:

- actor-resolved enquiry inbox;
- explicit concurrency-safe transitions;
- current masked handoff state;
- one provider review response;
- review appeal state.

Local recovery storage is synthetic metadata only. It must not contain raw contact values, access tokens, evidence bytes, evidence URIs, object paths or hashes.

## Operations portal contract

The portal consumes the versioned backend API only. It has separate workspaces for:

- privacy-safe interaction history;
- review moderation and appeal decisions;
- customer complaint transitions;
- Phase 7 internal incidents.

Portal navigation and disabled buttons are usability controls, not authorization boundaries. The backend and database remain authoritative.

## Production stop gates

Before real communication or customer data is permitted, DIREKT still requires:

- qualified Zambia privacy, consumer and communications review;
- approved WhatsApp/call/SMS providers and terms;
- production identity, secure Android storage and secret management;
- distributed abuse controls and rate limits;
- notification delivery, retry and opt-out policy;
- retention/deletion policy for interactions, reviews and complaints;
- staffed moderation, complaint and appeal service levels;
- representative low-connectivity and device validation;
- controlled Zambia pilot authorization.

Phase 8 implementation does not satisfy these production gates.

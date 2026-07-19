# Phase 11A External Entry Action Register — 2026-07-19

**Status:** SYNTHETIC READINESS COMPLETE — REAL-PARTICIPANT ENTRY EXTERNALLY GATED  
**Governing issue:** #112  
**Programme timezone:** Asia/Tokyo

## Purpose

This register separates work DIREKT can complete internally from evidence that only a regulator, qualified Zambia reviewer, approved external provider configuration or real participant can supply.

Synthetic readiness is complete and does not authorize real participant processing.

## Gate register

| Gate | Current status | Evidence required to close | Synthetic substitute allowed? |
|---|---|---|---|
| DPC controller registration | EXTERNAL PENDING — application draft | DPC registration/certificate/reference for the actual controller | No |
| Overseas storage authorization | EXTERNAL PENDING | DPC authorization/reference for exact real-data storage topology | No |
| Overseas transfer authorization | EXTERNAL PENDING | DPC authorization/reference for exact real-data transfer topology | No |
| Zambia-qualified legal/privacy/consumer review | EXTERNAL PENDING | Signed/private review reference covering exact pilot data flow and wording | No |
| Final real participant notice/consent | BLOCKED by qualified review | Final version ID/hash/effective date approved for real use | No |
| Firebase real phone-auth configuration | TECHNICAL IMPLEMENTATION COMPLETE; REAL CONFIG EXTERNAL-GATED | Zambia SMS policy, signing credentials, quotas/abuse controls, provider disclosure, legal/DPC approval and real canary | No |
| Private storage/auth/deletion/withdrawal canaries | SYNTHETIC/REGRESSION COVERAGE COMPLETE; REAL CANARY PENDING | Approved real-pilot environment canary results | No |
| Zambia field lead | PENDING; not required for no-field-claim Wave 1 | Named/trained Zambia operator plus safety/check-in process | No |
| Real 11C–11H validation | NOT STARTED | Consented Zambia participant/operation/device/economic evidence | No |
| 11J exit decision | NOT STARTED | Evidence-backed STOP / REPEAT / NARROW / PROCEED record | No |

## Internal work already complete

- exact pilot geography and comparison area;
- limited four-category scope;
- cohort cap and three-wave structure;
- provider-pathway mix;
- named accountable roles;
- support hours and numeric pause/stop rules;
- privacy/consent/withdrawal/retention operating baseline;
- research-code/privacy boundary;
- fail-closed Firebase exchange/invite implementation;
- fail-closed synthetic activation implementation;
- managed Supabase Phase 11 schema migration;
- managed 24-provider/60-customer synthetic activation;
- 48 complete synthetic verification lifecycles;
- 24 publications;
- 60 enquiry scenarios, 24 reviews and 6 complaints;
- zero-contact/zero-real-invite/zero-storage-object/zero-field-visit/zero-payment invariants;
- synthetic/system 11C–11H functional/model coverage;
- regression and evidence-led corrections documented.

## Real-pilot activation order

The real participant path must execute in this order:

1. record DPC controller registration evidence;
2. record applicable overseas storage/transfer authorization;
3. record Zambia-qualified legal/privacy/consumer review;
4. finalize and hash the real participant notice/consent version;
5. configure Firebase real phone auth under approved provider/legal boundaries;
6. deploy/verify the protected real-pilot configuration with traffic still disabled;
7. run invitation/auth/private-storage/withdrawal/deletion canaries;
8. document canary results and owner approval;
9. only then permit `PILOT_ENTRY_APPROVED=true` and bounded Wave 1 invitations.

`PILOT_ENTRY_APPROVED=true` is a technical latch, not evidence that the gates above exist.

## Optional integrations deliberately removed from the Wave 1 critical path

- Google Maps — disabled/manual-list-first;
- Sentry real-participant telemetry — disabled until separately approved/privacy-tested;
- production WhatsApp/call delivery — disabled;
- real payments — disabled;
- automated authority/registry integrations — not required;
- field-visited trust claim — disabled until field lead gate passes;
- Cloudflare — no new critical runtime dependency introduced for Phase 11.

## Evidence storage rule

Public repository artifacts may contain only sanitized references, hashes, aggregate/system counts and pseudonymous evidence IDs.

Do not commit:

- passport/NRC copies or numbers;
- private addresses or raw phone numbers;
- legal privileged advice;
- regulator credentials;
- participant identities;
- real evidence files;
- exact private coordinates;
- OTPs, tokens, secrets or API keys.

## Current programme boundary

```text
Phase 11 synthetic functional readiness: COMPLETE
Phase 11 managed synthetic activation: COMPLETE
Phase 11 real-participant entry: EXTERNAL GATES PENDING
11C–11H PRIMARY-PILOT evidence: PENDING
11J exit decision: PENDING
Formal Phase 12 authorization: NOT GRANTED
```

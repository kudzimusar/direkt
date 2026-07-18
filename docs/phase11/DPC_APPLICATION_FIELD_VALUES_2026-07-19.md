# Phase 11A Zambia DPC Application Field Values — 2026-07-19

**Status:** SUBMISSION WORKSHEET — NOT A REGULATOR FILING OR APPROVAL  
**Use:** Copy the non-sensitive answers below into the applicable Zambia Data Protection Commission registration/authorization process after confirming the current portal/form wording. Fill personal identity/contact fields privately; never commit identity documents, passport/NRC numbers, home address, private email/phone, signatures or regulator credentials to this public repository.

## Filing direction

| Field | Proposed entry / decision |
|---|---|
| Applicant/controller type | Individual data controller, unless qualified Zambia advice or DPC direction requires a different applicant/entity structure |
| Controller/operator name | Shadreck Kudzanai Musarurwa |
| Trading/product name | DIREKT controlled pilot |
| Country of pilot activity | Zambia |
| Pilot location | Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District |
| Pilot access model | Invite-only, adult participants only |
| Maximum cohort | 24 providers + 60 customers across three waves; maximum 8 providers + 20 customers per wave |
| Public launch | No |
| Payments | Disabled; pricing/willingness-to-pay research only |

## Applicant fields that must be completed privately

Do not commit these values:

- applicant residential/business address as legally required;
- applicant email and phone used for regulator correspondence;
- passport/NRC/identity number and copy where requested;
- proof of identity/residence/registration where requested;
- signature/declaration;
- DPO/representative personal details if legally required;
- payment/reference details;
- portal credentials.

## Nature of processing

Suggested concise description:

> DIREKT is an invite-only controlled pilot of a verification-led local-services marketplace. It authenticates invited customers and service providers, supports check-specific provider verification, bounded local discovery, tracked service enquiries, reviews/complaints, support/security/audit and explicit product-validation research. The pilot is restricted to Kabwata and Chilenje wards in Lusaka and is not a public launch.

## Categories of data subjects

Use only those actually processed:

- invited adult customer participants;
- invited adult service-provider participants;
- authorized pilot support/reviewer/operations personnel;
- field personnel only if the later field-verification gate is separately activated;
- complainants/reporters where an approved complaint process requires it.

## Categories of personal data

### Account/authentication

- phone/contact data;
- account/session identifiers;
- authentication/security/audit metadata;
- policy/consent/withdrawal records.

### Provider verification

As applicable to the specific approved check:

- name/identity evidence;
- business-registration evidence;
- qualification/trade-test/professional/licence evidence;
- provider category/service/profile data;
- operating model/service area;
- private premises/location evidence where necessary;
- evidence review/correction/expiry metadata.

### Customer/interaction

- selected area/landmark or separately approved location input;
- service-category/enquiry information;
- enquiry/response/interaction status;
- separately consented contact-handoff state;
- review/report/complaint information.

### Pilot validation

- pseudonymous research code;
- task/usability observations;
- device/network context needed for reliability findings;
- optional interview/recording data only with separate approval/consent.

## Sensitive/high-risk data considerations

State accurately rather than minimizing the risk:

- identity/qualification documents may contain sensitive identifiers and photographs;
- precise premises/location data can create physical-security/privacy risk;
- phone/contact and account-linkage data can enable identity linkage;
- complaint/free-text/evidence content may contain unexpectedly sensitive information;
- security/audit data may reveal device/network/access patterns.

Controls:

- data minimization;
- private evidence storage;
- server-side authorization;
- no public evidence URLs;
- reduced-precision public location;
- HMAC/pseudonymous identifiers where raw values are unnecessary;
- bounded retention/deletion;
- audit/access controls;
- fail-closed provider/runtime activation.

## Purposes of processing

Suggested purposes:

1. invite-only participant authentication and account security;
2. provider onboarding and check-specific verification;
3. provider discovery/service-area matching;
4. tracked enquiries/interactions and separately consented contact handoff;
5. reviews, complaints, corrections and appeals;
6. support, fraud prevention, security, audit and incident handling;
7. controlled-pilot usability/reliability/operational research;
8. legal/regulatory/data-subject request handling.

No data sale or unrelated advertising profiling is authorized for Phase 11.

## Lawful basis section

Do not self-certify a final legal basis from this worksheet. Submit the final basis-by-purpose matrix only after qualified Zambia review.

Working classification for review:

- required account/security/fraud/audit processing may rely on contract/legitimate/legal-obligation bases where counsel confirms;
- phone authentication/provider processing disclosure must match the approved provider/transfer basis;
- optional precise location, recording, optional research participation and optional contact handoff should remain separate explicit consent where legally appropriate;
- provider evidence/check processing must have a specific approved purpose/basis and not rely on blanket consent wording.

## Recipients / processor categories

Disclose only the exact services approved for real Wave 1.

Planned required Wave 1 technology boundaries:

- Supabase managed PostgreSQL/PostGIS/private object storage;
- Google Cloud managed application/runtime infrastructure;
- Firebase Authentication for approved phone verification;
- Firebase App Distribution only where used for restricted pilot artifact distribution.

Not required for Wave 1 real-data processing unless separately approved:

- Google Maps runtime/location APIs;
- Sentry real-participant telemetry;
- automated WhatsApp/call delivery;
- payment providers.

## Overseas storage / transfer

Answer **Yes** where the approved real topology stores/processes personal data outside Zambia.

Current technical plan includes managed infrastructure outside Zambia. Do not answer “No” merely to simplify registration.

Provide the exact approved topology/data-flow document and obtain the required separate authorization/lawful mechanism before real participant processing where the DPC process requires it.

Current planned flows requiring review include:

```text
Zambia participant Android device
→ Firebase/Google phone-auth infrastructure
→ DIREKT backend/runtime on approved Google Cloud boundary
→ Supabase PostgreSQL/PostGIS/private storage
→ authorized DIREKT operations users
```

Optional providers stay out of the flow until separately approved.

## Storage outside Zambia

Answer based on the exact approved environment, not the developer's physical location.

The current managed architecture includes data services outside Zambia. The application should identify:

- provider/service;
- region/country where known and contractually relevant;
- data categories;
- purpose;
- retention/deletion behavior;
- subprocessors/authority-request terms as applicable;
- security controls;
- transfer/storage authorization reference once issued.

## Joint controllers

Working answer: no joint controller is intentionally designed into the current pilot.

Do not make this final until qualified review confirms whether any partner, verifier, field organization or other party independently determines processing purposes/means.

## Data Protection Officer / representative

Working state: unresolved pending qualified review and DPC direction.

Do not invent a DPO title merely to satisfy the form. Record the actual appointed person/qualification only if required and formally appointed.

## Risks and mitigations

| Risk | Mitigation to declare where accurate |
|---|---|
| Identity/evidence exposure | private object storage; restricted server-mediated access; no public URLs; audit |
| Cross-account authorization | backend-owned roles/scopes; negative-authorization tests; no client-authoritative access |
| Phone-number recycling/account takeover | Firebase subject HMAC binding; different subject cannot inherit bound phone; legacy/unbound phone requires recovery |
| Unrestricted pilot signup | HMAC-phone invite required; canonical policy binding; server wave caps |
| Consent/version drift | canonical `account.policy_versions` + `account.consents`; exact runtime notice version; fresh invite/re-consent after revoked current-policy consent |
| Precise-location exposure | manual-first Wave 1; no Maps required; reduced public precision; private coordinates not public discovery data |
| Excessive evidence retention | approved retention schedule; evidence deletion/hold workflow; private storage canary |
| Provider misuse/fraud | check-specific claims, reviewer workflow, complaints, audit, suspension/expiry controls |
| OTP/auth abuse | Zambia-only pilot scope, Firebase abuse controls/quotas, backend rate limit, invite required before DIREKT identity/session creation |
| Public launch before evidence | traffic mode/Phase 12 gates; invite-only distribution; no production payments |

## Data flow documentation to attach/reference

Provide the final approved versions of:

- system/data-flow diagram;
- data-processing register;
- processor/subprocessor matrix;
- retention/deletion schedule;
- security/privacy controls summary;
- pilot participation notice;
- consent/lawful-basis matrix;
- incident/breach procedure;
- data-subject rights/request procedure;
- overseas storage/transfer application/materials.

## Declaration discipline

Before submission:

- compare every answer with the current DPC portal/form;
- use the exact real processor topology, not planned-but-disabled integrations;
- do not claim DPC/counsel/provider approval before it exists;
- do not attach public GitHub links containing unnecessary infrastructure/security details if a private reviewed submission package is more appropriate;
- keep a private copy of the exact submitted answers/documents and regulator reference;
- add only safe evidence metadata to `PHASE11A_EXTERNAL_ENTRY_ACTION_REGISTER_2026-07-19.md` after submission/outcome.

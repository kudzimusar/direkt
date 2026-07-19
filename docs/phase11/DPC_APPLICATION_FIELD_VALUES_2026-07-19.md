# Phase 11 DPC Application Field Values — 2026-07-19

**Status:** NON-SENSITIVE DRAFT — NOT A REGULATOR SUBMISSION OR APPROVAL  
**Controller path:** Shadreck Kudzanai Musarurwa — Individual Data Controller  
**DPC application status:** Draft

## Purpose

Provide truthful, non-sensitive draft wording for the Zambia Data Protection Commission application and related overseas storage/transfer requests. Private identity/contact/document fields stay outside GitHub and must be entered directly in the official process.

## Applicant/controller

| Field | Draft value |
|---|---|
| Applicant type | Individual |
| Data-service role | Data Controller |
| Controller | Shadreck Kudzanai Musarurwa |
| Registered Zambia company/entity | None currently |
| Joint controller | None planned for bounded pilot |
| Public privacy contact | `privacy@direkt.forum` once mailbox/alias is operational |
| Public support contact | `support@direkt.forum` once mailbox/alias is operational |
| Zambia +260 contact | Available — private value, enter only in official/private system |
| Zambia physical/correspondence address | Available — private value, enter only in official/private system |
| NRC/passport | Private document required by official process; never store in repo |

## System/service description

**Database/application name:** DIREKT

Suggested service description:

> DIREKT is a controlled local-services discovery, provider-profile, scoped-verification and accountability platform. The bounded Zambia pilot helps adult customers discover service providers while presenting specific verification claims and limitations rather than a blanket guarantee of competence or safety.

## Pilot scope

- Geography: Kabwata Ward and Chilenje Ward, Lusaka District.
- Comparison candidate: Matero; not automatically activated.
- Categories: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair.
- Maximum real pilot cohort: 24 providers + 60 customers, plus a small number of authorized operational/review/support users.
- Recruitment: invite-only.
- Minors: excluded.
- Real payments: disabled in Phase 11.

## Approximate records

For application planning, use a truthful bounded maximum rather than pretending the synthetic cohort represents real people.

Suggested answer:

> Up to approximately 90 pilot-related identity records, covering a maximum of 24 providers, 60 customers and a small authorized operational/support complement.

Synthetic/demo records do not count as real data subjects.

## Data-subject categories

- adult customers;
- service providers and provider representatives;
- authorized reviewers;
- support personnel;
- pilot operations/security/incident personnel.

## Information processed

As applicable and minimized:

- phone/account identifier for approved authentication;
- display/legal name where required;
- service category, provider pathway and operating model;
- service area/locality and optional public premises location where separately allowed;
- provider identity, business-registration, qualification or claim-specific evidence;
- verification cases, reviewer recommendations, scoped claims and audit history;
- enquiries, interactions, reviews and complaints;
- policy/consent/withdrawal records;
- limited device/security diagnostics and access logs.

Not required by default for customers:

- national ID/passport;
- exact home coordinate;
- continuous/background location;
- address book/contacts;
- payment credentials.

## Processing purposes

- account authentication and security;
- controlled pilot participation;
- provider profile management;
- local service discovery;
- verification of specific provider claims;
- tracked enquiries and accountability;
- review/complaint/support handling;
- fraud, abuse and incident prevention/investigation;
- audit/compliance evidence;
- controlled pilot measurement and product improvement.

## Sensitive/special-category risk answer

Do not automatically answer `No` merely because DIREKT does not seek sensitive traits.

Draft position:

> Potentially applicable depending on claim-specific evidence or identity documents submitted. DIREKT minimizes requested evidence, stores original provider evidence privately, prohibits unnecessary sensitive data collection and does not expose original evidence publicly.

Final statutory classification and lawful basis require qualified Zambia review.

## Candidate lawful-basis matrix

This is a legal-review draft, not a final legal conclusion.

| Purpose | Candidate basis subject to qualified review |
|---|---|
| Voluntary controlled-pilot participation/research | Consent where appropriate |
| Optional research interview/recording | Separate explicit consent |
| Optional precise location | Separate permission/consent where required |
| Contact handoff | Per-interaction consent/authorization |
| Requested account/service functionality | Contract/service necessity where legally applicable |
| Security, abuse prevention and audit | Legitimate interest and/or legal obligation where applicable |
| Required regulatory/legal retention | Legal obligation where applicable |

## Overseas storage/transfer disclosure

Draft answer: **Yes** for the approved real-data topology if it uses the current Supabase/Google/Firebase resources outside Zambia.

Expected real-data processors/sub-processors may include, only when actually activated and approved:

- Supabase/PostgreSQL/private Storage infrastructure;
- Google Cloud infrastructure;
- Firebase Authentication for approved phone authentication.

Wave 1 minimization:

- Google Maps not required;
- Sentry real-participant telemetry disabled;
- production WhatsApp/call delivery disabled;
- payments disabled.

Separate DPC overseas storage/transfer authorization remains an external hard gate before real participant data uses the overseas topology.

## Risks

- unauthorized disclosure of identity/provider evidence;
- raw contact exposure;
- private/precise location exposure;
- account takeover/authentication abuse;
- authorization failure or cross-provider access;
- fraudulent/misleading trust claims;
- excessive collection;
- retention beyond need;
- unapproved overseas processing;
- processor compromise;
- trust wording causing users to overestimate what was checked;
- enquiry/contact abuse;
- device/session compromise.

## Mitigations

- data minimization and purpose limitation;
- check-specific trust claims and explicit limitations;
- private evidence storage;
- backend-owned authorization/state transitions;
- role/permission controls and four-eyes review where required;
- audit history;
- encrypted transport and protected cloud resources;
- invite-only pilot admission;
- rotating DIREKT sessions after Firebase exchange;
- policy-version consent records;
- withdrawal/deletion controls;
- reduced public location precision;
- retention limits and legal-hold controls;
- immediate-stop incident rules;
- real payments disabled;
- Maps/Sentry/production communications minimized out of Wave 1.

## Fields that must remain private/manual

Enter only into the official/private process:

- physical address;
- raw +260 phone number;
- NRC/passport number and image;
- signatures/declarations;
- regulator login/payment data;
- any private legal opinion or privileged advice.

## Submission truth rule

Do not use demo identities, synthetic providers/customers, invented lawyer names, fabricated certificates or fake authorization references in the regulator application.

Synthetic system counts may demonstrate technical readiness, but the DPC application must describe actual intended processing and real applicant/controller details truthfully.

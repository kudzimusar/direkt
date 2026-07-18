# Zambia DPC Registration and Overseas Transfer/Storage Application Pack

**Status:** READY FOR EXTERNAL SUBMISSION — NOT YET FILED/APPROVED  
**Pilot:** DIREKT controlled pilot — Kabwata + Chilenje wards, Lusaka  
**Applicant/controller path:** Shadreck Kudzanai Musarurwa — Individual Data Controller / DIREKT pilot operator

## Purpose

This pack translates the current DIREKT architecture and Phase 11A decisions into the information needed for the Zambia Data Protection Commission registration and overseas storage/transfer process.

It is a filing-preparation artifact, not a regulator-issued certificate or authorization.

## 1. Applicant/controller details to submit

Use the exact legal identity/contact/address details required by the DPC portal for:

- applicant type: **Individual**;
- role: **Data Controller**;
- applicant/controller: **Shadreck Kudzanai Musarurwa**;
- trading/project name: **DIREKT**, where the form permits a project/trading description;
- physical/postal/contact details: enter the applicant’s legally valid details at submission time;
- Data Protection Officer/contact: use the accountable privacy contact approved for the bounded pilot, subject to DPC requirements on whether a formal DPO appointment is required.

Do not invent a Zambian company registration number, TPIN, office address or DPO credential that does not exist.

## 2. Categories of data subjects

- customer pilot participants;
- provider owners/representatives;
- internal operations/support/reviewer users;
- later field-verification personnel where activated;
- people whose information is lawfully contained in a complaint/incident record, minimized to what is necessary.

No child-focused processing is planned. Initial pilot participants are adults only.

## 3. Personal-data categories

### Account/authentication

- phone number processed by the approved authentication provider;
- hashed/minimized contact reference in DIREKT;
- account/session identifiers;
- device/session security metadata;
- consent/notice version records.

### Provider verification

Only when required for a specific check:

- legal/display name;
- identity-document evidence;
- business-registration evidence;
- qualification/trade/licence evidence;
- premises/service-area/location evidence;
- work-history/reference evidence where an approved requirement calls for it;
- evidence-review and audit metadata.

### Customer/service interaction

- selected area/landmark;
- service category and bounded enquiry text;
- tracked interaction status;
- time-limited contact handoff consent where separately approved;
- review/report/complaint records.

### Security/operations

- access/audit events;
- minimized IP/user-agent fingerprints where required for security;
- incident/abuse records;
- support records.

### Research/validation

- pseudonymous research code;
- consent status;
- interview/task findings;
- optional recording only under separate explicit consent;
- device/network condition needed to interpret reliability evidence.

## 4. Sensitive/high-risk data handling

Potentially high-risk material includes:

- identity-document evidence;
- qualification/licence evidence;
- exact private premises/base coordinates;
- phone/contact information;
- complaint/incident content;
- authentication/session/security metadata.

Controls:

- original evidence in private object storage only;
- database stores opaque references and minimized metadata;
- short-lived, assignment-scoped evidence access;
- no public evidence URL;
- no exact private provider coordinates in discovery;
- no raw evidence/contact/private coordinates in GitHub, Pages, CI artifacts or telemetry;
- backend authorization is authoritative;
- four-eyes controls remain for high-risk decisions;
- payments disabled.

## 5. Purposes of processing

- authenticate controlled-pilot participants;
- create/manage customer/provider accounts;
- verify only the specific provider claims requested and evidenced;
- provide bounded local-service discovery within the approved pilot area;
- support tracked enquiries/interactions/reviews/complaints;
- operate support, moderation, security and incident response;
- measure usability, reliability, trust comprehension and operating capacity for the controlled pilot;
- meet legal/regulatory/security obligations and handle data-subject requests.

No sale of personal data, behavioral advertising or unrelated marketing use is part of Phase 11.

## 6. Lawful-basis/consent position for qualified review

The pilot baseline uses explicit informed participation/processing notices and separate consent for optional processing such as precise device location, recording and contact handoff.

The exact statutory lawful basis for each processing purpose must be confirmed in the qualified Zambia legal review and reflected in the DPC filing. Do not describe every processing purpose as consent-based if another lawful basis is required or more appropriate.

## 7. Recipients/processors

### Supabase

Intended use:

- managed PostgreSQL/PostGIS boundary;
- private object storage for approved evidence/data.

Current development project region recorded by DIREKT: `ap-northeast-1`.

### Google Cloud / Firebase

Intended pilot use:

- participant phone authentication after approval;
- controlled deployment/runtime infrastructure where approved;
- internal Android distribution remains separate from participant authentication.

Current project: `direkt-dev-502701`; current Google Cloud region recorded by DIREKT: `asia-northeast1`.

### Disabled/not required for Wave 1

- Google Maps runtime;
- Sentry real-data telemetry;
- production WhatsApp/call delivery adapter;
- payment provider;
- automated registry integrations.

If any are later activated, update the DPC/provider data-flow record before they receive real pilot data.

## 8. Overseas storage/transfer declaration

The pilot’s intended Supabase and Google/Firebase processing is not confined to Zambia.

Therefore the application must answer the overseas transfer/storage questions truthfully and request/record the applicable separate authorization **before real participant data is processed in those services**.

The filing should include, as requested by the DPC:

- destination countries/regions and processor entities as accurately known at filing time;
- categories of personal data transferred/stored;
- purposes;
- recipients/sub-processors;
- security controls;
- retention/deletion behavior;
- contractual safeguards and incident obligations;
- data-flow diagram;
- risk assessment/mitigations.

Do not assume that registering as a controller automatically grants overseas storage/transfer authorization.

## 9. Data-flow description

```text
Participant Android device
  ↓ HTTPS
Firebase Authentication (phone OTP, only after approval)
  ↓ Firebase ID token
DIREKT NestJS API
  ↓ backend-authoritative identity/session/authorization
Supabase PostgreSQL/PostGIS
  ↓ only when required
Private Supabase object storage for evidence
  ↓ controlled staff access
Internal operations portal through DIREKT API only
```

Wave 1 fallback:

```text
No Maps dependency
No Sentry real-data capture
No payment provider
No production WhatsApp delivery
```

## 10. Risk-and-mitigation summary

| Risk | Key mitigation |
|---|---|
| Identity/evidence disclosure | private buckets, minimized DB references, scoped short-lived staff access, audit |
| Cross-provider access | backend actor/scope resolution, DB constraints, deny regressions |
| Private-location exposure | service areas/reduced precision, private/public geometry separation, manual area fallback |
| OTP abuse/cost | Zambia-only SMS region, quotas/budgets, Firebase abuse controls, rate limits, monitoring |
| Cross-border processing | DPC authorization before real use, processor terms, minimized provider set |
| Excessive retention | documented deletion schedule, withdrawal process, deletion canaries |
| False verification claims | check-specific claim cards, evidence/expiry rules, no blanket verified flag |
| Secondary research mistaken for validation | evidence classifications and substitution matrix |
| Public exposure during pilot | invite-only waves, no indexing/public promotion, traffic gate |

## 11. Retention schedule attachment

Attach/reference `PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`.

Important maxima include:

- failed/uncompleted auth challenge metadata: 7 days;
- original provider evidence: target deletion within 30 days after final decision/appeal window unless approved hold;
- interaction data: 90 days after closure;
- minimized audit/verification/complaint records: generally up to 180 days after relevant closure/pilot close;
- raw research recordings: delete after validated notes, target 14 days and absolute pilot maximum 30 days;
- consent/version/withdrawal receipt: minimized, up to 12 months after pilot close.

These remain subject to qualified Zambia review/DPC direction before real entry.

## 12. Data-subject rights process

Channels and exact contact details must be placed in the final approved privacy notice.

Operational process supports:

- access;
- correction;
- objection/restriction;
- withdrawal of optional consent;
- deletion/erasure subject to lawful holds;
- contact-grant revocation;
- complaint/escalation.

Target internal handling times are documented in the privacy baseline but are not represented as statutory deadlines.

## 13. Documents/evidence to prepare privately for submission

- applicant identification/contact documents required by DPC;
- completed controller registration form/portal submission;
- data-flow diagram;
- data-processing register;
- processor/sub-processor list and terms;
- overseas transfer/storage application/supporting information;
- security/privacy controls summary;
- retention/deletion schedule;
- participant/provider privacy notice and consent versions after legal review;
- incident/breach response procedure;
- rights-request procedure;
- any DPO designation evidence if required.

Do **not** upload private applicant identity documents or regulator credentials to the public GitHub repository.

## 14. Completion evidence required in DIREKT

Once externally completed, record only safe metadata:

```text
DPC controller registration:
- reference/certificate ID: <private-safe reference or redacted identifier>
- issue/approval date:
- expiry/review date if applicable:
- scope/conditions:

Overseas storage/transfer authorization:
- reference:
- approval date:
- approved processors/locations/data classes:
- conditions/expiry:
```

Store original certificates/authorization correspondence privately.

Only after this evidence and the other Phase 11A gates pass may the technical `PILOT_ENTRY_APPROVED` latch be considered for activation.

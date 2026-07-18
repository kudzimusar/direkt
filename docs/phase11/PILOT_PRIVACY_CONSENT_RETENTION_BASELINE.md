# Phase 11 Pilot Privacy, Consent and Retention Baseline

**Status:** PRODUCT-APPROVED BASELINE — QUALIFIED ZAMBIA REVIEW AND DPC AUTHORIZATION STILL REQUIRED BEFORE REAL DATA  
**Owner:** Shadreck Kudzanai Musarurwa  
**Applies to:** bounded Phase 11 controlled Zambia pilot only

## 1. Processing principles

The pilot uses the minimum personal data required to:

- authenticate a participant;
- operate a customer/provider account;
- verify specific provider claims;
- support bounded discovery and enquiries;
- investigate complaints/incidents;
- measure the pilot without exposing participant identity in repository artifacts.

The pilot must remain lawful, transparent, purpose-limited, data-minimized, accurate, time-limited and secure. Participants retain access/correction/objection/restriction/erasure and complaint rights subject to any lawful retention requirement.

## 2. Participant groups and minimum data

### Customers

Minimum:

- phone number/account identifier for approved authentication;
- display name or pseudonymous display label;
- selected pilot area/landmark;
- service category and bounded enquiry details;
- interaction/review/complaint records created through the platform;
- consent/version/withdrawal records;
- minimized device/app diagnostics required for reliability.

Not required by default:

- national ID/passport;
- exact home coordinate;
- continuous/background location;
- address book/contacts;
- marketing profile;
- payment credentials.

### Providers

Minimum as applicable to the claim/pathway:

- phone/account identifier;
- legal/display name;
- provider pathway and operating model;
- service category and service area;
- identity/business/qualification/location evidence required for the specific requested claim;
- private evidence object references and audit history;
- enquiry/interaction/review/complaint records;
- consent/version/withdrawal records.

Exact private base/premises coordinates and original evidence remain private and are never included in public discovery output unless a separate public-premises consent rule explicitly permits the precise location.

## 3. Consent layers

Consent is not one blanket checkbox.

| Consent/purpose | Required? | Rule |
|---|---|---|
| Pilot participation and account processing | Yes | required before real pilot data is created |
| Firebase phone authentication/provider disclosure | Yes if activated | phone number transfer/use must be disclosed before OTP request |
| Device precise location | No | optional; denial preserves manual area/landmark path |
| Public precise premises | No | only for a customer-facing fixed premises with explicit provider consent |
| Customer contact handoff | Per interaction | channel-specific, time-limited, revocable |
| Research interview | No | separate from product participation |
| Audio/video recording | No | separate explicit consent; no service penalty for refusal |
| Marketing/promotions | No | prohibited in Phase 11 unless separately introduced and approved |

Consent withdrawal must not require a participant to provide more personal data than reasonably necessary to identify the relevant pilot account/research code.

## 4. Required participant notice content

Before account/pilot enrollment, the notice must explain in plain language:

- who operates the pilot and how to contact the accountable owner;
- that this is a controlled test, not a public production service;
- what data is collected and why;
- which checks DIREKT performs and what it does **not** verify;
- which data may be shown publicly to the bounded cohort;
- that private evidence and exact private provider locations are not public;
- which processors/providers receive data;
- that approved cloud/auth processing may occur outside Zambia and requires the applicable authorization;
- how long each data class is retained;
- how to withdraw, revoke a contact grant, request access/correction/deletion or complain;
- the immediate-stop/incident process;
- that refusing optional location/recording does not block core manual participation;
- that no real payment is required in Phase 11.

## 5. Withdrawal and deletion behavior

On withdrawal:

1. stop new non-required processing for the participant;
2. revoke active contact-handoff grants;
3. prevent new public/profile discovery where applicable;
4. cancel unneeded pending evidence/upload sessions;
5. separate research lookup keys from analysis data;
6. delete or anonymize data according to the schedule below unless a documented legal, fraud, security, complaint or dispute hold applies;
7. record a minimized withdrawal receipt and completion status.

Withdrawal must not silently delete evidence needed to resolve an active complaint/security incident before an approved hold is resolved.

## 6. Pilot retention schedule

These are maximum operational pilot periods and may be shortened. Qualified Zambia review/DPC direction can require a change before real entry.

| Data class | Maximum pilot retention |
|---|---|
| Failed/uncompleted auth challenge metadata | 7 days |
| Active account/contact identifier | pilot participation + 30 days after withdrawal/close |
| Original provider evidence file after final decision | 30 days after final decision/appeal window, then delete unless an approved hold exists |
| Minimized verification decision/claim/audit metadata | 180 days after pilot close |
| Enquiry and interaction data | 90 days after interaction closes |
| Time-limited contact grant | 24 hours active; minimized audit receipt up to 180 days |
| Review/complaint/appeal data | 180 days after closure |
| Security/access/audit logs | 180 days |
| Raw research audio/video | delete within 14 days after validated notes/transcript; absolute maximum 30 days |
| Pseudonymous research notes | 180 days after pilot close |
| Consent/notice/withdrawal receipt | 12 months after pilot close, minimized to what is needed to prove the consent/version/action |
| Device diagnostics | 30 days raw; aggregate non-identifying metrics may be retained longer |
| Payment data | none — real payments disabled |

No retention period authorizes keeping data that is no longer needed where deletion is legally and operationally possible.

## 7. Data-location and processor restrictions

Before real pilot data:

- DPC controller registration must be evidenced;
- applicable separate authorization for overseas storage/transfer must be evidenced;
- approved processor terms must cover the services receiving real data;
- only the minimum provider set needed for the approved wave is enabled.

Wave 1 data-flow minimization:

- Supabase/private storage: only after DPC approval for the exact overseas topology;
- Google Cloud/Firebase Authentication: only after approval and participant disclosure;
- Google Maps: disabled initially;
- Sentry: disabled initially;
- payment provider: disabled;
- external WhatsApp/SMS delivery other than the approved authentication provider: disabled.

## 8. Research-code separation

- repository/GitHub uses only `P11-*` evidence IDs and aggregate counts;
- participant identity/contact lookup keys stay in approved private storage;
- research notes use pseudonymous codes;
- no exact private location, evidence file, phone/email, recording or identity document is committed to GitHub or public CI artifacts;
- any quoted participant statement must be de-identified and reviewed for re-identification risk.

## 9. Rights-request handling target

Pilot operational target:

- acknowledge access/correction/deletion/objection request within 2 support days;
- resolve simple correction/revocation within 5 support days;
- escalate deletion/complex rights requests immediately to the privacy accountable owner where a hold or processor propagation is involved.

These are internal service targets, not representations of statutory deadlines.

## 10. Breach/incident rule

Any suspected exposure of identity evidence, private coordinates, raw contact information, auth tokens or cross-provider data triggers:

- immediate containment;
- participant intake freeze for the affected path;
- evidence preservation without broadening access;
- incident-owner review;
- assessment of required DPC/data-subject notification under the approved legal process;
- documented restart decision.

## 11. Approval state

Product/operationally approved:

- layered consent model;
- manual-location fallback;
- data minimization baseline;
- withdrawal workflow;
- retention maxima;
- processor minimization for Wave 1;
- research-code separation.

Still required before real entry:

- qualified Zambia legal/privacy review of the final wording and retention/legal-hold treatment;
- DPC registration and overseas storage/transfer authorization evidence;
- processor terms for activated providers;
- final participant-facing copy version and version ID recorded in the evidence register.

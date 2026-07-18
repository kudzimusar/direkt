# DIREKT Controlled Pilot Participation Notice — Candidate

**Policy key:** `pilot_participation_notice`  
**Candidate version:** `2026-07-19-draft-1`  
**Status:** DRAFT FOR QUALIFIED ZAMBIA LEGAL/PRIVACY REVIEW — NOT APPROVED FOR PARTICIPANT USE  
**Pilot operator/controller direction:** Shadreck Kudzanai Musarurwa operating the bounded DIREKT controlled pilot, subject to final qualified review and regulator filing outcome.

> **Do not display this draft to real participants and do not register it as an active `account.policy_versions` record.** The final approved version must contain the correct participant-facing controller contact details, legal/regulatory wording, processor disclosures and document hash before real recruitment.

## 1. What this pilot is

DIREKT is testing a verification-led local-services marketplace in a small, invite-only controlled pilot in Zambia.

The first approved operating boundary is:

- Kabwata Ward and Chilenje Ward;
- Kabwata Constituency;
- Lusaka District;
- Zambia.

The pilot is not a public launch. Access is limited to invited adult participants and the pilot may be paused, narrowed or stopped at any time for safety, privacy, reliability, legal or operational reasons.

The initial service categories are:

- plumbing and water repair;
- electrical repair/services;
- motor-vehicle mechanics;
- appliance/electronics repair.

Participation in a category does not mean DIREKT has confirmed that a provider may lawfully perform every regulated activity in that category. DIREKT displays only the specific checks actually completed and approved.

## 2. Who is responsible for your data

The intended controller/operator for this bounded pilot is:

**Shadreck Kudzanai Musarurwa, operating the DIREKT controlled pilot.**

Before this notice may be used with real participants, the final approved copy must insert the legally valid participant-facing controller/privacy contact details required by the Zambia Data Protection Commission and qualified legal review.

**Controller/privacy contact:** `[TO BE INSERTED IN THE FINAL APPROVED PRIVATE COPY BEFORE USE]`

Do not replace this placeholder with an invented email address, office address, phone number, registration number or company identity.

## 3. Why DIREKT processes information

Subject to the final approved lawful-basis analysis, DIREKT expects to process only information needed to:

- authenticate invited pilot participants;
- create and secure customer/provider accounts;
- confirm specific provider identity, contact, business, qualification, licence or location facts where a check requires them;
- allow customers to discover providers within the bounded pilot area;
- support service enquiries and approved contact handoff;
- support reviews, complaints, corrections and appeals;
- operate moderation, security, fraud prevention, audit and incident response;
- provide participant support;
- measure whether the pilot is usable, reliable, understandable and operationally viable;
- respond to valid data-subject, legal or regulatory requirements.

DIREKT does not authorize the sale of participant personal data, unrelated advertising profiling or unrelated secondary use under this Phase 11 pilot.

## 4. Information that may be processed

Only information necessary for the approved journey should be collected.

### Account and authentication

- your phone number for approved phone verification;
- account and session identifiers;
- security and audit metadata needed to protect the account;
- the version/status of notices and consent records applicable to your pilot participation.

### Provider participants

Depending on the specific check requested:

- legal/display name;
- identity evidence;
- business-registration evidence;
- qualification, trade-test, professional or licence evidence where applicable;
- service/category information;
- operating model and service area;
- private premises/location evidence where a check requires it;
- supporting work-history/reference evidence where an approved requirement calls for it;
- evidence-review, correction, expiry and audit metadata.

DIREKT should not collect a document merely because it is available. Evidence must be tied to a defined check and purpose.

### Customer and service interactions

- selected area/landmark or other approved location input;
- service category and bounded enquiry information;
- enquiry/response/interaction status;
- separately consented contact-handoff state where enabled;
- review, report or complaint information.

### Pilot research and validation

- pseudonymous research/participant code;
- task completion and usability observations;
- device/network condition needed to understand reliability findings;
- optional interview notes;
- optional audio/video recording only after separate explicit recording consent.

Research participation beyond what is necessary to operate the account/service must remain separately explained and voluntary.

## 5. Phone authentication and Firebase

If the real pilot authentication gate is approved and activated, DIREKT intends to use Firebase Authentication to verify recent possession of an invited Zambia phone number.

The expected flow is:

```text
Android participant
→ Firebase phone verification / OTP
→ Firebase ID token
→ DIREKT backend verifies the token
→ DIREKT creates or resumes the authorized DIREKT session
```

Important limits:

- phone verification proves recent control of the phone number; it does not grant provider, staff, reviewer or administrator authority;
- DIREKT backend permissions remain authoritative;
- a phone number already associated with another external identity cannot silently transfer to a different Firebase identity;
- new DIREKT pilot identities require a current invite tied to the approved notice version;
- Firebase may process phone-number/authentication/security information under its applicable service terms and abuse-prevention controls;
- standard SMS/network charges may apply depending on the participant's provider and plan;
- the exact Google/Firebase processing and overseas transfer/storage disclosure must be approved before this notice is activated.

## 6. Service providers and overseas processing

DIREKT's planned pilot architecture may use managed technology providers including:

- **Supabase** for PostgreSQL/PostGIS and approved private object storage;
- **Google Cloud** for approved application/runtime infrastructure;
- **Firebase Authentication** for approved phone verification and identity-token issuance.

The current technical topology includes processing/storage outside Zambia. Real participant data must not be enabled until the applicable Zambia Data Protection Commission registration and overseas storage/transfer requirements have been resolved and the final approved notice accurately describes the authorized topology.

Wave 1 does **not** require the following providers to receive real participant data:

- Google Maps runtime/location APIs;
- Sentry real-participant error telemetry;
- automated WhatsApp/call delivery providers;
- payment providers.

They remain disabled unless separately approved and added to the applicable notice/data-processing records before use.

## 7. Location privacy

DIREKT is designed so core discovery does not require continuous or background location access.

For Wave 1:

- manual area/landmark discovery remains available;
- Maps runtime is not required;
- denying device location must not block the core discovery journey;
- provider fixed, mobile and hybrid operating models must remain representable;
- exact private provider base coordinates are not public discovery data;
- precise public premises location may only be used later where it is necessary, appropriate, separately approved and explicitly consented/authorized.

Private location evidence, when required for a defined check, must use restricted evidence handling rather than public profile storage.

## 8. Provider verification and trust claims

DIREKT does not treat payment or registration alone as proof that a provider is safe, competent or trustworthy.

Public/pilot trust information must remain check-specific, for example:

- identity checked;
- contact checked;
- business registration checked;
- qualification/certificate checked;
- premises/location checked;
- not checked;
- pending;
- expired.

A check indicates only what DIREKT actually assessed under the relevant evidence and policy. It is not a guarantee of future work quality, safety, legality or outcome.

The final participant/provider wording must be approved through qualified Zambia legal/consumer review before real use.

## 9. Consent and choices

The final approved experience must distinguish required pilot processing from optional processing.

### Required for pilot account entry

Before requesting real OTP authentication, an invited participant must:

- receive the final approved pilot participation notice;
- see the exact active notice version;
- explicitly accept the required account/authentication/pilot-processing terms that qualified review identifies as consent-based or otherwise requires acknowledgement;
- have a current invite for that same approved policy version.

The backend records the exact policy version and consent/status in the canonical consent model.

### Separate optional choices

The following must not be bundled into general pilot access where separately optional:

- precise device location;
- research interview participation beyond required operational testing;
- audio/video recording;
- optional public quotation/attribution;
- contact handoff to call/WhatsApp where separate consent is required;
- any future marketing communication.

Declining an optional item should not automatically remove access to unrelated pilot functionality.

## 10. Withdrawal and changing your mind

Participants may withdraw optional consent and may request to leave the pilot through the final approved privacy/support channel.

Current technical controls are designed so that:

- current-policy consent revocation blocks creation of a new Firebase-backed DIREKT session unless a fresh invitation and explicit re-consent are later approved;
- contact-handoff consent can be independently revoked where applicable;
- active sessions may need to be revoked as part of the operational withdrawal procedure;
- deletion/restriction requests must propagate through approved DIREKT systems and relevant processors subject to lawful retention/hold requirements.

The exact legal effect, response process and retention exceptions must be confirmed in the final approved notice and operating procedure.

## 11. Retention and deletion — candidate maximums

The following are product/operations candidate maximums pending qualified Zambia review and regulator direction:

| Data class | Candidate maximum / action |
|---|---|
| Failed or incomplete authentication/challenge metadata | target deletion within 7 days unless security investigation requires an approved hold |
| Original provider verification evidence | target deletion within 30 days after final decision/appeal window unless approved legal/security/complaint hold applies |
| Interaction/enquiry operational data | generally up to 90 days after closure unless complaint/security/legal need requires a documented hold |
| Minimized verification/audit/complaint records | generally up to 180 days after relevant closure or pilot close, subject to qualified retention requirements |
| Raw optional research recordings | delete after validated notes are produced; target 14 days, absolute candidate pilot maximum 30 days |
| Consent/version/withdrawal receipt | minimized record generally up to 12 months after pilot close, subject to qualified legal requirements |
| Security/incident data | only as long as required for investigation, legal obligations and approved evidence retention |

The final legally approved schedule may change these periods. DIREKT must not promise deletion faster than its approved processors/backups can actually achieve.

## 12. Security and access controls

DIREKT's pilot security model includes:

- server-side authorization as the source of truth;
- private evidence storage;
- no public evidence URLs;
- minimized database references to evidence;
- encrypted Android DIREKT session storage using Android Keystore controls;
- rotating DIREKT refresh sessions after Firebase authentication;
- restricted invitation and operations permissions;
- masked/HMAC contact handling for pilot invitations;
- audit logging of sensitive operations;
- no real payment processing;
- no unrestricted public pilot access;
- fail-closed configuration if approvals or required runtime bindings are absent.

No system can guarantee absolute security. Any suspected incident should be reported through the final approved support/privacy contact immediately.

## 13. Your rights and requests

Subject to applicable Zambia law and identity verification, participants may have rights including access, correction, objection/restriction, withdrawal of consent where applicable, deletion/erasure where applicable and complaint/escalation.

The final approved notice must provide:

- the controller/privacy contact for rights requests;
- the support/escalation route;
- applicable Zambia Data Protection Commission complaint/contact information;
- the approved identity-verification process for rights requests;
- any statutory response timelines and lawful exceptions confirmed by qualified review.

This draft deliberately does not invent those personalized/legal contact details.

## 14. Complaints, safety and incidents

Participants should be able to report:

- suspected false identity/credential claims;
- inappropriate provider/customer conduct;
- privacy or security concerns;
- unsafe field activity;
- misleading trust wording;
- service/review disputes.

DIREKT may pause a provider, feature, category, participant cohort or the whole pilot when the approved stop criteria are met.

Field-visit claims remain disabled until a Zambia-based field operator/lead is appointed, trained and approved under the pilot safety/operations process.

## 15. Payments and charges

DIREKT Phase 11 does not authorize real payment collection or money movement.

The pilot may ask research questions about pricing or willingness to pay, but:

- participants should not be charged by DIREKT under this Phase 11 notice;
- synthetic invoice/receipt artifacts are not tax invoices;
- payment status must not change verification/trust status;
- any later real payment/subscription activation requires separate legal/provider/tax/invoicing approval and updated participant/provider terms.

Participants may still incur ordinary telecom/data/SMS costs from their own network/provider when using their device.

## 16. Changes to this notice

Every approved notice must have an immutable version and document hash in DIREKT's canonical policy-version register.

A materially changed notice must not silently inherit prior consent. Where the approved change requires renewed consent/acknowledgement, DIREKT must require the current version before new pilot sessions or processing covered by the change.

## 17. Final approval checklist

This draft becomes usable only after all applicable boxes are satisfied:

- [ ] qualified Zambia legal/privacy/consumer review completed;
- [ ] controller identity/filing structure confirmed;
- [ ] required Zambia Data Protection Commission registration evidence recorded;
- [ ] required overseas storage/transfer authorization or lawful mechanism recorded for the exact topology;
- [ ] processor/service list and data locations confirmed;
- [ ] lawful basis by purpose confirmed;
- [ ] controller/privacy/support contact inserted;
- [ ] rights/complaint wording confirmed;
- [ ] category-specific legal limitations confirmed;
- [ ] retention/legal-hold wording approved;
- [ ] Firebase disclosure and provider configuration approved;
- [ ] final document version chosen;
- [ ] final document cryptographic hash generated;
- [ ] final policy record inserted into `account.policy_versions` under `pilot_participation_notice`;
- [ ] Android/runtime configured to the exact same final notice version;
- [ ] managed consent/withdrawal/deletion canaries pass.

Until then, this file is a review instrument only.

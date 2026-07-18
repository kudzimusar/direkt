# DIREKT Phase 11 Zambia Qualified Legal Review Brief

**Status:** READY FOR QUALIFIED REVIEW — NOT LEGAL SIGN-OFF  
**Pilot owner/operator:** Shadreck Kudzanai Musarurwa  
**Pilot:** invite-only controlled pilot in Kabwata + Chilenje wards, Lusaka

## Review objective

Provide a bounded Zambia legal/privacy/consumer review sufficient to determine whether DIREKT may begin the controlled Phase 11 pilot under the exact scope below, and identify any mandatory changes before real participant processing.

This brief intentionally avoids asking counsel to review a hypothetical public production launch. Phase 12 remains separate.

## Exact pilot scope for review

- geography: Kabwata Ward + Chilenje Ward only;
- categories: plumbing/water repair, electrical repair/services, motor-vehicle mechanics, appliance/electronics repair;
- maximum cohort: 24 providers + 60 customers in three invite-only waves;
- participants: adults only;
- provider pathways: registered business, qualified individual, experienced informal provider where lawful;
- Maps: disabled/manual-first Wave 1;
- Sentry: disabled Wave 1;
- payments: disabled throughout Phase 11;
- production WhatsApp/call delivery: disabled Wave 1;
- field-visit claim: disabled until a Zambia-based field lead is appointed/trained;
- intended authentication: Firebase phone OTP after approval;
- intended database/private evidence storage: Supabase managed infrastructure;
- backend: NestJS API with server-side authorization;
- public launch/indexing: prohibited.

## Questions requiring an explicit written answer

### 1. Controller/entity status

- Can Shadreck Kudzanai Musarurwa lawfully register/operate the bounded pilot as an individual data controller before a separate DIREKT legal entity is incorporated/registered?
- Is a Zambia-resident representative, local establishment or other appointment required for this non-resident/operator structure?
- Is a formal Data Protection Officer required for this pilot scale/data profile, and if so what qualification/appointment requirements apply?
- Does any other participant/partner become a joint controller under the proposed operating model?

### 2. DPC registration and cross-border processing

- Confirm the required controller/processor registration path.
- Confirm the separate authorization required for storage/transfer outside Zambia for the exact Supabase/Google/Firebase topology.
- Confirm required safeguards/contracts/data-flow documentation.
- Confirm whether any data category in the pilot triggers additional approval/notification requirements.
- Confirm the applicable breach-notification process/timing and data-subject notification threshold.

### 3. Lawful basis and consent

For each purpose, identify the correct lawful basis rather than treating all processing as blanket consent:

- account/authentication;
- provider identity verification;
- business/qualification/licence evidence;
- location/service-area processing;
- public trust-claim display to the bounded cohort;
- enquiries/interactions/reviews/complaints;
- security/audit/fraud prevention;
- pilot research/analytics;
- optional precise device location;
- optional recording;
- optional contact handoff.

Confirm whether the layered consent model in `PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md` is legally sufficient with the recommended wording changes.

### 4. Participant privacy notice

Review final wording for:

- controller/operator identity and contact;
- purposes/data categories;
- processor/overseas processing disclosure;
- rights/withdrawal/complaints;
- retention;
- optional location/recording/contact consent;
- authentication-provider disclosure;
- controlled-pilot limitations;
- data breach/incident contact.

Provide mandatory wording or disclosures that must appear before recruitment.

### 5. Retention/deletion/legal holds

Review the proposed maximum periods and identify:

- periods that are too long/short;
- records that must legally be retained longer;
- lawful fraud/security/complaint/dispute holds;
- required processor/backup deletion behavior;
- proof-of-consent/withdrawal retention;
- whether original provider evidence may be deleted 30 days after final decision/appeal window while retaining minimized audit/claim metadata.

### 6. Marketplace/trust claims and consumer protection

Review whether DIREKT may describe individual results using check-specific statements such as:

- identity checked;
- contact checked;
- business registration checked;
- qualification/certificate checked;
- premises/location checked/visited;
- not checked / expired / pending.

Confirm prohibited or risky wording, especially:

- “verified professional”;
- “trusted/safe/guaranteed”;
- claims that imply DIREKT warrants competence or outcome;
- statements about informal providers;
- ranking/sponsorship disclosure obligations.

Confirm the minimum complaint/redress, correction and appeal wording required in the pilot.

### 7. Provider pathways and category-specific law

For each pilot category clarify:

- when ordinary service provision requires a specific statutory licence/registration;
- when TEVETA/trade qualifications are evidence of training only rather than a legal licence;
- when PACRA registration applies to a business claim;
- when ERB/NCC or another authority applies;
- whether any selected activity should be excluded from the pilot because the legal scope is too ambiguous/high-risk.

Pay particular attention to electrical work and specialist plumbing/water-system activities.

### 8. Informal providers

Confirm whether DIREKT may include experienced informal providers when:

- the service can lawfully be offered without a specific professional/statutory licence;
- DIREKT does not claim an unverified qualification/business registration;
- the pathway is not presented as a lower-quality class or used as a discriminatory ranking proxy.

Identify any categories/activities where this pathway is not legally appropriate.

### 9. Firebase phone authentication

Review disclosure/consent requirements for:

- sending/storing phone numbers with Google/Firebase for authentication and abuse prevention;
- cross-border processing;
- SMS costs/standard rates disclosure;
- account recovery/number recycling/ported-number risks;
- data-subject rights across provider/DIREKT records.

### 10. Research and participant recruitment

Review:

- invite-only purposive recruitment;
- adult-only participation;
- conflict-of-interest disclosure;
- optional separate research interviews/recordings;
- no default compensation in Wave 1;
- future fixed stipend rule not contingent on positive feedback/verification;
- de-identified quotes/aggregate reporting.

Confirm whether any ethics/research approval beyond privacy/contract consent is legally required for this commercial product-validation pilot.

### 11. Complaints, incidents and safety

Confirm:

- required complaint/redress rights and escalation channels;
- when law enforcement/regulator reporting is mandatory;
- handling of potentially fraudulent identity/certificate evidence;
- limits of platform responsibility when customer/provider contact moves off-platform;
- field-agent duties/liability before field verification is activated.

### 12. Payments/tax

Phase 11 moves no real money. Confirm that:

- willingness-to-pay interviews/research do not themselves activate payment-service licensing;
- no receipt/tax invoice representation should be made from synthetic artifacts;
- any later provider subscription/customer payment must receive separate payment/provider/tax/invoicing review before activation.

## Documents supplied for review

At minimum:

- `PHASE11A_REAL_PILOT_ENTRY_DECISION_2026-07-19.md`;
- `PILOT_PRIVACY_CONSENT_RETENTION_BASELINE.md`;
- `PILOT_RECRUITMENT_AND_OPERATIONS_PROTOCOL.md`;
- `DPC_REGISTRATION_AND_TRANSFER_APPLICATION_PACK.md`;
- `ZAMBIA_LEGAL_PRIVACY_ENTRY_RESEARCH_2026-07-19.md`;
- `MAPS_SENTRY_RECONCILIATION_2026-07-19.md`;
- `docs/legal/DATA_PROCESSING_REGISTER.md`;
- `docs/legal/CONSENT_AND_POLICY_VERSIONING.md`;
- `docs/security/PRIVACY_MODEL.md`;
- `docs/security/LOCATION_PRIVACY.md`;
- current participant/provider notice and consent drafts once finalized.

## Required output from qualified reviewer

A written decision record containing:

- reviewer name/firm/qualification and date;
- jurisdictional assumptions;
- documents/version reviewed;
- `APPROVED`, `APPROVED WITH CONDITIONS`, or `BLOCKED` for the bounded Phase 11 pilot;
- mandatory wording/product/data-flow changes;
- controller/DPO/local-representative conclusion;
- DPC registration/transfer/storage conclusion;
- category-specific restrictions;
- retention/legal-hold conclusions;
- consumer/complaint requirements;
- re-review triggers;
- unresolved questions.

Store the signed/legal original privately. Record only safe decision metadata in GitHub.

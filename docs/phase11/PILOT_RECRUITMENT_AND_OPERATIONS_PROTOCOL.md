# Phase 11 Pilot Recruitment and Operations Protocol

**Status:** APPROVED OPERATING BASELINE — REAL RECRUITMENT BLOCKED UNTIL EXTERNAL ENTRY GATES PASS  
**Owner:** Shadreck Kudzanai Musarurwa  
**Pilot area:** Kabwata Ward + Chilenje Ward, Lusaka District  
**Maximum cohort:** 24 providers + 60 customers

## 1. Recruitment model

The pilot is invite-only and purposive. It is not an open beta, public signup campaign or representative population survey.

Recruitment channels may include:

- direct invitations to providers operating in or serving the approved wards;
- local trade/business/community referrals;
- provider-to-provider referrals, subject to pathway/category quotas;
- direct invitations to adult customers who live in, work in or need services in the approved wards;
- community/contact referrals that do not disclose another person’s private information without permission.

No social-media mass campaign, public search indexing, unrestricted invite links or paid acquisition campaign is permitted in the initial three waves.

## 2. Provider inclusion criteria

A provider must:

- be at least 18 years old where the provider is an individual representative;
- operate in or explicitly serve Kabwata or Chilenje Ward;
- offer at least one approved pilot category;
- fit an existing DIREKT provider pathway without forced classification;
- consent to controlled-pilot processing and the applicable evidence workflow;
- provide only the evidence required for the specific claims requested;
- be able to receive support through the approved pilot channels;
- agree that DIREKT checks are scoped and do not constitute a blanket competence/safety guarantee.

Target mix per category:

- 2 registered businesses;
- 2 qualified individuals;
- 2 experienced informal providers where lawful and where no unverified licence/qualification claim is implied.

## 3. Provider exclusion criteria

Exclude or defer when:

- the provider cannot lawfully offer the represented service or required statutory status is unresolved;
- identity/representation cannot be established to the minimum approved standard;
- the provider requests a trust claim that DIREKT cannot verify honestly;
- evidence handling would require an unapproved processor/data flow;
- there is an unresolved serious safety, fraud or impersonation concern;
- the provider is outside the approved geography and does not serve it;
- cohort/category capacity is already full.

Exclusion is not a public fraud finding. Record only the appropriate internal reason and safe participant-facing explanation.

## 4. Customer inclusion criteria

A customer participant must:

- be at least 18 years old;
- live in, work in or have a genuine service-use case in Kabwata or Chilenje Ward;
- use a supported Android device for app-task testing where app participation is required;
- provide informed pilot consent;
- understand that the pilot is controlled and may be paused or stopped;
- agree not to submit unnecessary third-party personal data in enquiries/reviews.

## 5. Customer exclusion criteria

Exclude or defer:

- minors;
- anyone unable or unwilling to provide informed consent;
- requests entirely outside the approved area/categories;
- use cases involving imminent emergencies or services DIREKT is not designed to handle;
- participation where coercion, undisclosed conflict of interest or unsafe research conditions are present.

## 6. Conflict-of-interest controls

Recruitment must record, privately and minimally:

- whether a participant is related to or financially connected with the pilot owner/operator;
- whether a customer is evaluating a provider they recruited or have a close relationship with;
- whether a provider/reviewer/field operator has a relationship that could affect an evidence decision.

Conflicted participants may still contribute usability research where appropriate, but their evidence must be labelled and excluded from independence-sensitive conclusions.

High-risk verification decisions retain existing four-eyes/independent-approver controls. The accountable pilot owner cannot use role concentration to bypass those controls.

## 7. Compensation

Wave 1 has **no default monetary compensation** for product use, provider verification outcome, positive review, recommendation or favourable feedback.

A later fixed research participation stipend may be introduced only when:

- budget and tax/accounting treatment are approved;
- the amount is not contingent on positive feedback, verification approval or continued participation;
- the participant can withdraw without losing already-earned compensation;
- the payment method does not activate the DIREKT marketplace payment system.

## 8. Wave structure

### Wave 0 — readiness dry run

Synthetic/non-personal only:

- final configuration verification;
- consent/notice walkthrough;
- support and incident tabletop;
- Firebase auth canary only after provider/DPC gates;
- private-storage/upload and deletion canary;
- device/network smoke tests.

### Wave 1 — maximum 8 providers + 20 customers

Goals:

- onboarding and authentication;
- provider evidence workflow without field-visit claims;
- manual area/landmark discovery;
- trust-card comprehension;
- tracked enquiry and review/accountability loop where approved;
- support/withdrawal/deletion drills.

Maps, Sentry, production WhatsApp delivery and real payments remain disabled.

### Wave 2 — maximum additional 8 providers + 20 customers

Open only when Wave 1 has no unresolved critical/high blocker and thresholds remain within control.

May expand:

- provider pathway/category balance;
- device/network diversity;
- enquiry/response volume;
- optional separately approved provider integrations.

### Wave 3 — maximum additional 8 providers + 20 customers

Open only after a formal Wave 2 review.

Purpose:

- validate repeatability at the full 24-provider/60-customer cap;
- measure queue/support capacity;
- confirm or reject the initial geography/category/economic assumptions.

## 9. Supply-before-demand rule

For each category:

- onboard and make eligible at least 3 discoverable providers before recruiting customer demand for that category;
- if supply falls below 3 eligible providers, pause new customer invitations for that category;
- do not fabricate listings or relax trust requirements to avoid empty results.

## 10. Support and escalation

Support hours, Central Africa Time:

- Monday–Friday: 08:00–16:00;
- Saturday: 09:00–12:00;
- Sunday/public holidays: critical security/privacy response only.

Named accountable owner for initial pilot: Shadreck Kudzanai Musarurwa.

Priority handling:

- P0: security/privacy/safety — immediate containment and affected-path freeze;
- P1: trust/auth/evidence blocker — same operating day;
- P2: workflow/support defect — next business day;
- P3: usability/request — evidence backlog.

## 11. Pause and stop thresholds

Apply the stricter of this protocol and the permanent security/privacy immediate-stop rules.

- any unauthorized evidence/contact/private-coordinate disclosure: stop affected processing;
- any auth/authz bypass or cross-provider access: stop the pilot;
- 2+ material privacy/security incidents in 7 days: freeze new invitations;
- >10% core-task blocking failure over rolling 20 tasks: pause affected journey;
- >10% unrecoverable upload failures over 10 consecutive real uploads: freeze evidence intake;
- >25% active verification cases older than 48 hours: freeze provider recruitment;
- >40% accepted enquiries unanswered after 24 hours in a completed wave: pause affected-category customer invitations;
- >10 unresolved support cases or oldest normal case >24 support hours: freeze new invitations;
- fewer than 3 eligible discoverable providers in a category: pause demand recruitment for that category.

## 12. Field-verification boundary

Wave 1 does not activate a `field visited` or equivalent public claim.

Before field verification:

- appoint a Zambia-based field operator/lead;
- complete identity/role/background/contract/training controls as applicable;
- approve travel/safety/check-in/escalation procedure;
- validate evidence capture and private-location handling;
- preserve reviewer independence/four-eyes requirements;
- run a synthetic/tabletop exercise before a real visit.

Field observation remains advisory and cannot create a final trust decision by itself.

## 13. Research evidence rules

Each finding is tagged as:

- `PRIMARY-PILOT` — observed from a consented real participant/operation;
- `SECONDARY-OFFICIAL` — regulator/statistics/local-government/provider source;
- `SYSTEM-METRIC` — measured from the approved runtime;
- `ASSUMPTION` — not yet validated;
- `REQUEST` — participant preference, not automatically a requirement.

No secondary source may be relabelled as a participant result.

## 14. External entry gate

Recruitment remains blocked until the checklist records at least:

- applicable DPC controller registration evidence;
- applicable DPC overseas storage/transfer authorization;
- qualified Zambia review of final participant/provider legal/privacy wording;
- approved final notice/consent version;
- approved real participant authentication implementation/provider configuration;
- private-storage/data-path readiness and deletion/withdrawal canary;
- named internal access list and incident/support contacts.

Repository readiness alone does not authorize invitations.

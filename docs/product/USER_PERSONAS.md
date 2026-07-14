# DIREKT User Personas

Personas are hypotheses until Phase 1A field research confirms or changes them.

## 1. Ruth — household customer

**Context:** Needs a plumber after a recurring leak. Uses an Android phone and mobile data carefully.

**Goals**
- find someone serving her area;
- know whether contact and qualification details were checked;
- avoid a fake intermediary;
- contact the provider quickly;
- preserve a record if the provider does not arrive.

**Risks**
- assuming a wide service area means a verified physical location;
- sharing exact home details too early;
- weak connectivity during search.

**Design implications**
- manual area search;
- concise trust summary;
- contact-sharing consent;
- low-data list mode;
- tracked enquiry and safety reminders.

## 2. Kelvin — mobile sole-trader plumber

**Context:** Has no storefront, serves several neighbourhoods, and relies on referrals.

**Goals**
- demonstrate identity and qualifications;
- specify where he travels;
- upload evidence from a low-cost Android device;
- receive useful leads;
- understand renewal requirements.

**Risks**
- exposing his home address;
- upload interruption;
- confusing subscription payment with verification completion.

**Design implications**
- service area separate from private base evidence;
- resumable onboarding;
- check-by-check progress;
- clear fee language;
- provider availability and enquiry inbox.

## 3. Chipo — registered workshop owner

**Context:** Runs a fixed-premises automotive workshop with employees.

**Goals**
- publish a reliable business pin;
- manage multiple services and staff access;
- show registration and premises checks;
- respond consistently;
- monitor reviews and enquiries.

**Design implications**
- organization and member roles;
- fixed public location with consent;
- business evidence;
- multi-user access in later MVP increments;
- response analytics.

## 4. Mwansa — property manager/institutional buyer

**Context:** Needs repeatable access to compliant providers for several properties.

**Goals**
- filter by current required checks;
- compare service areas and response;
- retain an auditable supplier shortlist;
- receive certificate-expiry updates.

**Design implications**
- explicit verification filters;
- saved lists;
- currentness indicators;
- institutional functionality after core consumer flow.

## 5. Thandiwe — verification reviewer

**Context:** Reviews multiple evidence types from a desktop.

**Goals**
- see complete case context;
- distinguish public and private fields;
- use consistent reason codes;
- request corrections;
- avoid approving expired or mismatched evidence.

**Risks**
- decision fatigue;
- insecure downloads;
- inconsistent judgement.

**Design implications**
- structured checklist;
- secure viewer;
- previous-decision history;
- quality sampling;
- escalation and four-eyes controls.

## 6. Joseph — field verification agent

**Context:** Travels to provider premises with intermittent connectivity.

**Goals**
- receive clear assignments;
- navigate to private verification location;
- collect structured evidence;
- work offline temporarily;
- submit an auditable visit.

**Risks**
- device loss;
- unsafe visit;
- collusion/coercion;
- uploading wrong provider evidence.

**Design implications**
- role-restricted mobile web/Android field flow;
- assignment token and case identity;
- offline draft with secure storage;
- check-in/out and safety protocol;
- supervisor review.

## 7. Naledi — trust and safety supervisor

**Context:** Handles serious complaints and suspicious verification patterns.

**Goals**
- connect reports, interactions, evidence and prior actions;
- apply proportionate restrictions;
- document reasons;
- support appeals;
- identify systemic fraud.

**Design implications**
- case timeline;
- severity and SLA;
- audit and restricted notes;
- cross-provider pattern controls;
- controlled exports.

## Persona validation criteria

Phase 1 research must document:

- which assumptions were confirmed/rejected;
- language and digital-literacy differences;
- actual device/connectivity patterns;
- provider evidence availability;
- user interpretation of trust wording;
- gender, disability and safety considerations.

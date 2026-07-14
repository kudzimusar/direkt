# DIREKT Event Taxonomy

## Naming

`domain_object_action`, for example `discover_search_submitted`.

## Common fields

- event version;
- anonymous/user safe ID;
- session;
- app/API version;
- timestamp;
- role/mode;
- coarse area/category;
- correlation ID where operational;
- outcome/error code;
- no sensitive content.

## Required events

### Discover
`discover_area_selected`, `discover_search_submitted`, `discover_results_viewed`, `provider_profile_viewed`, `provider_trust_opened`.

### Enquiry
`enquiry_started`, `enquiry_submitted`, `enquiry_contact_consented`, `enquiry_provider_viewed`, `enquiry_responded`, `interaction_outcome_recorded`.

### Provider
`provider_onboarding_started`, `provider_step_completed`, `evidence_upload_started/completed/failed`, `verification_case_viewed`, `verification_correction_submitted`.

### Trust/operations
Operational audit is separate. Aggregate events include queue/decision timings without evidence payload.

### Commercial
`plan_viewed`, `subscription_started`, `payment_pending/succeeded/failed`, with internal references rather than sensitive provider payload.

## Governance

Every event has owner, purpose, fields, retention and dashboard. Remove unused events.

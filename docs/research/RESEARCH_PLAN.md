# DIREKT Phase 1A Research Plan

## 1. Objective

Validate the real Zambian operating environment before DIREKT fixes its pilot area, initial service categories, verification rules, Android constraints, communication model, payment assumptions or field-operations design.

The research must answer whether DIREKT can create a trustworthy marketplace without misleading users, excluding legitimate informal providers or exposing sensitive location and identity evidence.

## 2. Decisions controlled by this phase

Phase 1A must provide evidence for:

1. initial pilot city, district or tightly bounded operating area;
2. first four or fewer provider categories;
3. category-specific identity, business, qualification, licence and premises evidence;
4. fixed-premises, mobile and hybrid provider models;
5. public location precision and private evidence rules;
6. Android device, operating-system, storage, camera and connectivity constraints;
7. preferred customer-provider contact channels;
8. whether in-app messaging is required for MVP;
9. feasible OTP, SMS, maps, geocoding and payment-provider selection criteria;
10. verification staffing, field-visit process, cost and turnaround targets;
11. permanent Android application ID decision inputs;
12. legal and privacy questions requiring qualified review.

## 3. Research questions

### Customer discovery and trust

- How do customers currently find local providers?
- Which information is usually missing or unreliable?
- What types of scams, impersonation, poor work or location failures occur?
- What evidence would increase confidence without implying a guarantee?
- Does the customer understand separate verification claims such as phone, identity, business, qualification and premises?
- At what point does the customer prefer to call, message or meet the provider?
- What should happen when a provider fails to respond or causes harm?

### Provider participation

- How do providers describe their operating area and availability?
- Which providers have fixed premises, travel to customers or use both models?
- What identity, training, licence, association, business or work-history evidence exists in practice?
- Which legitimate providers lack formal registration or certification?
- What verification process feels reasonable, affordable and non-exploitative?
- What value would justify a subscription or verification fee?
- What devices, data bundles and digital skills do providers have?

### Verification operations

- Which checks can be completed through official systems or issuing bodies?
- Which checks require document inspection, phone confirmation or field visits?
- How should expired, unavailable, disputed or unverifiable evidence be represented?
- What is a practical field-agent route, safety and escalation model?
- What fraud patterns should be expected?
- What evidence can be retained, for how long and at what precision?

### Location and technology

- Do participants use street addresses, compounds, landmarks, map pins, Plus Codes, bus stops or phone directions?
- How accurate and stable are map pins for provider discovery?
- What must remain private for home-based or mobile providers?
- How often are devices offline, low on storage, sharing SIMs or using older Android versions?
- What image upload size and retry behaviour is realistic?

## 4. Participant segments and minimum targets

These are minimum targets, not statistical claims.

| Segment | Minimum target | Required diversity |
|---|---:|---|
| Customers who recently hired a local provider | 12 | gender, age, income context, neighbourhood, smartphone confidence |
| Customers who experienced fraud, non-performance or wrong-location information | 4 within the customer sample | different incident types; no unnecessary sensitive details |
| Providers | 16 | at least 4 candidate categories; fixed, mobile and hybrid models |
| Informal or sole providers | 6 within provider sample | include providers without formal business registration |
| Formally registered providers | 4 within provider sample | inspect registration/credential processes, not public document copies |
| Verification or field-operation candidates | 5 | field agents, trade bodies, training/certification or compliance perspectives |
| Institutional buyers or property/facility managers | 4 | procurement and supplier-verification expectations |
| Accessibility participants | 4 across relevant samples | low vision, motor, literacy or older-device considerations where feasible |

The research lead may increase samples when evidence remains contradictory or a category behaves differently.

## 5. Candidate geography strategy

The research must compare at least two areas before approving the pilot. One may be Lusaka because of operational access and provider density, but Lusaka is not automatically approved.

Compare candidates using:

- customer and provider density;
- address and map-pin usability;
- fraud/trust need;
- availability of verification partners;
- field-agent travel cost and safety;
- network reliability and device diversity;
- ability to recruit a controlled pilot cohort;
- risk of producing findings that do not transfer beyond affluent central areas.

## 6. Candidate category strategy

Begin desk and interview work across these candidate categories without approving them prematurely:

- plumbing;
- electrical services;
- motor mechanics;
- building/renovation trades;
- appliance repair;
- cleaning services;
- tailoring;
- borehole, pump or water-system services.

A category enters the pilot only if:

1. customer demand is recurring and location-sensitive;
2. fraud, quality or discovery problems are meaningful;
3. evidence rules can be explained honestly;
4. enough providers can be recruited;
5. verification cost is proportionate;
6. the platform can avoid implying competence beyond what was checked;
7. complaints and safety risks are operationally manageable.

## 7. Methods

### A. Official desk research

Use current official authority sources to identify candidate registries, qualification systems, licence requirements and legal questions. Record source date, authority, exact claim and limitation in `DESK_RESEARCH_REGISTER.md`.

### B. Semi-structured interviews

Use the committed guides. Ask open questions before presenting DIREKT concepts to avoid leading participants.

### C. Contextual observation

Observe how users locate a provider, share directions, inspect a business and use their phone. Do not record exact private coordinates in the repository.

### D. Document walkthroughs

Ask providers to describe or privately show the types of evidence they possess. Record document type, issuing body, expiry behaviour and verification method. Do not copy personal identifiers into GitHub.

### E. Concept comprehension tests

Use synthetic cards for:

- phone verified;
- identity checked;
- qualification checked;
- premises visited;
- check expired;
- check pending;
- DIREKT did not check this claim.

Measure whether participants can accurately explain each state.

### F. Lightweight pricing research

Test value, willingness and trade-offs without treating stated willingness to pay as confirmed demand. Compare free listing, verification fee, monthly subscription and lead-fee reactions.

## 8. Research sequence

### Stage 1 — Preparation

- claim workstream;
- finalize instruments;
- create coded participant plan;
- establish private consent and source-storage process;
- confirm local research coordinator and recruitment channels;
- identify legal questions before collecting sensitive data.

### Stage 2 — Exploratory interviews

- first 4 customers;
- first 4 providers from different categories;
- first 2 verification stakeholders;
- review terminology and amend instruments without deleting prior versions.

### Stage 3 — Main fieldwork

- complete minimum samples;
- conduct location and device observations;
- inspect evidence types privately;
- update research log after each session.

### Stage 4 — Synthesis

- code recurring findings;
- identify contradictory evidence;
- update assumptions register;
- complete pilot-area and category scorecards;
- draft evidence matrix and trust-language changes.

### Stage 5 — Validation

- test corrected flows with representative participants;
- obtain legal review for legal conclusions;
- verify official-source claims remain current;
- conduct Phase 1A exit review.

## 9. Evidence quality rules

A decision cannot rely on:

- one participant;
- web articles without authoritative confirmation;
- founder preference alone;
- a registration system existing without evidence that DIREKT can legally and operationally query it;
- a certificate image without issuer confirmation rules;
- urban smartphone behaviour generalized to all target users;
- stated willingness to pay without behavioural testing.

Critical decisions should normally have at least two evidence types, such as participant reports plus observation, or official source plus document walkthrough.

## 10. Deliverables

- research instruments and consent protocol;
- coded research log;
- assumptions register;
- pilot-area decision;
- pilot-category decision;
- category evidence matrix;
- technology/connectivity findings;
- location/addressing findings;
- payment/communication findings;
- legal research register;
- updated personas and journeys;
- updated verification and pilot documentation;
- Phase 1A exit review.

## 11. Stop conditions

Stop and escalate when:

- a participant may be placed at risk;
- consent is unclear;
- real evidence would need to be committed publicly;
- a legal rule is uncertain;
- an authority’s verification mechanism cannot be confirmed;
- a provider category requires competence assessment DIREKT cannot perform;
- researchers are asked to pay bribes or bypass official processes;
- field-agent safety cannot be managed;
- evidence suggests the proposed trust language is misleading.

## 12. Phase gate

Phase 1B may begin only after the owner approves `PHASE_1A_EXIT_REVIEW.md`. Android scaffolding remains blocked until Phase 1A and Phase 1B satisfy their respective gates.
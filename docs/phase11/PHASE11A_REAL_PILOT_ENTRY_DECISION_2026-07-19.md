# Phase 11A Real-Pilot Entry Decision — 2026-07-19

**Status:** OPERATIONAL DECISIONS APPROVED; REGULATORY/PROVIDER ACTIVATION GATES STILL CLOSED  
**Owner approval:** Shadreck Kudzanai Musarurwa  
**Governing issue:** #112  
**Stable source baseline:** `53e20e67a877f481fc94458d1d2ea62bf4e47b0f`

## Purpose

This record converts the remaining Phase 11A unknowns into concrete, bounded pilot decisions using:

- the existing DIREKT Phase 1–10 research and architecture;
- current official Zambia regulator/statistics/local-government sources;
- current official provider documentation;
- the owner’s explicit authority to make pilot product and operational decisions.

It does **not** convert desk research into fake primary participant evidence. Legal certificates, transfer/storage authorizations, provider contracts and actual pilot results remain external evidence gates where they cannot truthfully be produced from online research.

## 1. Regulatory/controller decision

### Pilot data-controller filing path

For the bounded Phase 11 pilot, the designated applicant/controller path is:

```text
Shadreck Kudzanai Musarurwa
Individual Data Controller / DIREKT pilot operator
```

Reason:

- no separately registered DIREKT legal entity is recorded in the repository;
- the Zambia Data Protection Commission (DPC) explicitly provides an `Individual` data-controller category;
- the DPC states that individuals and organizations processing personal data must register;
- the DPC states that a controller/processor need not be established in Zambia for the law to apply where it processes personal data of people residing in Zambia.

This is an operational filing decision, not a claim that registration has already been granted.

### Controller/processor model

- **Controller:** the DIREKT pilot operator, represented by Shadreck Kudzanai Musarurwa, determines the purposes and means of the pilot processing.
- **Joint controller:** none planned for the initial pilot.
- **Processors/sub-processors:** any approved cloud/auth/communications/monitoring provider that processes pilot personal data on DIREKT’s instructions.
- **Current overseas infrastructure:** Supabase and Google Cloud/Firebase remain outside Zambia; real participant use requires the applicable DPC overseas storage/transfer authorization before processing begins.
- **Sentry:** not used for the initial real-data wave unless separately approved and privacy-canary validated.
- **Google Maps:** not required for the initial real-data wave; manual area/landmark/Plus Code discovery remains the initial location mode.

### External evidence still required before `PILOT_ENTRY_APPROVED=true`

- DPC controller registration certificate/reference;
- DPC authorization for the exact overseas storage/transfer topology used by the pilot;
- processor/data-processing terms for providers receiving real pilot data;
- qualified Zambia legal review of the final participant/provider notices, marketplace wording and any category-specific legal claims.

The DPC registration portal expressly asks whether data is transferred or stored outside Zambia and states that separate authorization is required when the answer is yes.

## 2. Exact pilot geography

### Approved initial operating boundary

**Kabwata Ward + Chilenje Ward, Kabwata Constituency, Lusaka District.**

Explicitly excluded from the initial cohort:

- Kamwala Ward;
- Libala Ward;
- Kamulanga Ward;
- all other Lusaka wards/constituencies unless a later controlled expansion decision is recorded.

The Electoral Commission/National Assembly record identifies Kabwata Constituency’s five wards as Kamwala, Kabwata, Libala, Chilenje and Kamulanga. The two selected wards create a narrow, administratively recognizable operating area while preserving mixed residential, market, service and transport contexts.

### Why Kabwata + Chilenje

- Lusaka remains Zambia’s largest urban/commercial concentration and therefore minimizes initial geographic dispersion.
- Kabwata Constituency has current local-government investment and active community infrastructure.
- Chilenje has an active market/community-services context and a council-recognized ward identity.
- Kabwata and Chilenje provide a manageable two-ward boundary instead of an uncontrolled city-wide pilot.
- The area supports the existing DIREKT manual area/landmark discovery design without requiring precise public coordinates.

### Alternative evaluated

**Matero Constituency** is retained as the primary comparison/expansion candidate.

Why not first:

- it provides valuable different infrastructure, affordability and peri-urban learning, but would broaden operational dispersion before the first verification/support process is proven;
- official sources describe significant water/sanitation, drainage/flood and service-access issues that make it a strong second-area stress test rather than the lowest-risk first controlled boundary.

### Boundary behavior

- customer invitations require declared residence/use in the two approved wards or a service need occurring there;
- providers may be fixed, mobile or hybrid but must actively serve at least one approved ward;
- private provider bases remain private;
- service-area matching may cross ward edges internally only when the provider explicitly serves the selected ward;
- no public exact home/mobile-provider coordinate is exposed;
- expansion requires a recorded owner decision after the first controlled wave.

## 3. Approved pilot categories

The initial pilot keeps the four established Phase 1 design categories:

1. plumbing and water-repair services;
2. electrical repair/services;
3. motor-vehicle mechanics;
4. appliance/electronics repair.

Rationale:

- the categories already anchor the implemented DIREKT requirement/version/provider-pathway model;
- current Ministry/TEVETA programme listings show active trade/craft pathways for automotive mechanics, electrical engineering, electronics systems maintenance/repair and plumbing/sheet metal, providing real evidence pathways for qualified providers;
- the four categories exercise fixed-premises, mobile and hybrid provider models;
- they create both urgent and planned service-use cases without introducing medical, financial or similarly higher-regulatory-risk professional services.

### Claim restrictions

- a TEVETA/trade certificate claim is separate from business registration, location and identity claims;
- an educational/trade qualification must not be represented as an ERB, NCC or other statutory licence unless that exact licence/registration has been checked;
- registered-business, qualified-individual and experienced-informal pathways remain visibly distinct evidence contexts, not quality tiers;
- payment cannot alter verification, publication or ranking.

## 4. Cohort cap and wave structure

### Maximum initial cohort

| Role | Cap | Structure |
|---|---:|---|
| Providers | 24 | 6 per category |
| Customers | 60 | target 15 primary-use participants per category; unique participants may use more than one category |
| Operations/support accounts | 6 | internal approved users only |
| **Maximum participant/customer-provider cohort** | **84** | excludes internal staff accounts |

### Provider-pathway target per category

- 2 registered businesses;
- 2 qualified individuals;
- 2 experienced informal providers where the service can lawfully be offered without a claimed statutory licence.

This is a recruitment target, not permission to misclassify a provider. Evidence determines the actual pathway.

### Invite waves

Use three bounded waves, each no larger than:

- 8 providers;
- 20 customers.

No next wave opens until the prior wave’s security/privacy, support, verification-queue and task-failure checks are reviewed.

## 5. Named ownership

For Phase 11A and the first remote-controlled wave:

| Role | Named owner |
|---|---|
| Pilot/Product Owner | Shadreck Kudzanai Musarurwa |
| Security & Privacy Accountable Owner | Shadreck Kudzanai Musarurwa |
| Support Owner | Shadreck Kudzanai Musarurwa |
| Incident Commander | Shadreck Kudzanai Musarurwa |

Role concentration is accepted only for the bounded pilot and must be revisited before public production. High-risk verification and financial controls continue to require the existing independent/four-eyes permissions where implemented; naming one accountable owner does not bypass those controls.

### Field operations

No field-verification claim may be activated in Wave 1 until a Zambia-based field operator/lead is formally appointed and trained. A provider can still participate using document/issuer/manual evidence pathways, but `field visited` or equivalent claims remain unavailable without the controlled field workflow.

## 6. Support hours and escalation

Pilot support hours use Central Africa Time (CAT):

- Monday–Friday: **08:00–16:00 CAT**;
- Saturday: **09:00–12:00 CAT**;
- Sunday/public holidays: closed except critical security/privacy incident response.

Escalation:

- P0 security/privacy/safety event: immediate pilot freeze for affected processing and incident-commander escalation;
- P1 blocking trust/auth/evidence defect: same operating day;
- P2 workflow/support defect: next business day;
- ordinary usability/request feedback: pilot evidence backlog.

## 7. Numeric pause/stop thresholds

In addition to the permanent immediate-stop rules:

- **Any** unauthorized personal-data/evidence/private-location disclosure: stop affected processing immediately.
- **Any** authentication/authorization bypass or cross-provider data access: stop the pilot immediately.
- **2 or more** material privacy/security incidents in any rolling 7-day period: freeze all new invitations pending review.
- Core task blocking/failure rate **>10% in a rolling 20 completed/attempted pilot tasks**: pause the affected journey.
- Unrecoverable evidence-upload failure **>10% across any 10 consecutive real upload attempts**: freeze evidence intake.
- More than **25% of active verification cases older than 48 hours**: freeze new provider recruitment until queue recovery.
- More than **40% of accepted enquiries unanswered after 24 hours** in a completed wave: pause new customer invitations for the affected category.
- Support backlog **>10 unresolved cases** or oldest normal-priority case **>24 support hours**: freeze new invitations.
- Fewer than **3 eligible discoverable providers** in a category across the approved area after supply onboarding: do not recruit demand for that category until supply recovers.

These thresholds are pilot control limits, not product success claims.

## 8. Device and network matrix

The Android app currently supports `minSdk=23` and targets API 36. The real pilot must cover at least:

| Class | Minimum pilot coverage |
|---|---|
| Low-end legacy | Android 8–10, 2–3 GB RAM, 32–64 GB storage |
| Common mid-range | Android 11–13, 4 GB RAM, 64–128 GB storage |
| Current reference | Android 14–16, 6 GB+ RAM |
| Accessibility | small screen + increased font/display scale |
| Network | stable Wi-Fi, stable mobile data, slow/high-latency mobile data, intermittent/dropout |
| Location | permission granted, denied and unavailable |
| Lifecycle | cold start, background/foreground, process death/restart |

Official Zambia ICT survey materials show significant heterogeneity in phone/device/internet access; displayed public microdata counts are not treated as population estimates. The matrix therefore deliberately includes low-end and degraded-connectivity conditions.

## 9. Authentication/provider decision

### Selected real-pilot authentication direction

**Firebase Authentication phone-number OTP** is the preferred participant authentication provider for Phase 11, because Firebase/Google Cloud is already part of the controlled DIREKT infrastructure boundary and Firebase documents Zambia (`ZM`) as a supported phone-auth region.

Required before activation:

- implement backend token exchange/verification without trusting client role claims;
- enable only Zambia in the Firebase SMS region policy for the pilot;
- use project billing/quotas appropriate for SMS and set abuse budgets/alerts;
- register exact Android SHA fingerprints and use Play Integrity/App Check controls where supported;
- disclose that the phone number is sent/stored by Google for phone authentication/abuse prevention;
- obtain the required DPC overseas transfer/storage authorization before real use;
- preserve a recovery/support path for SMS delivery failure and ported-number issues.

Until those conditions pass, `AUTH_CHALLENGE_MODE` remains disabled for real pilot traffic and `PILOT_ENTRY_APPROVED` remains false.

## 10. Maps, telemetry, communications and payments

### Wave 1

- Google Maps runtime: **disabled/not required**; use manual area, landmark and Plus Code inputs.
- Sentry: **disabled/not required**; use the existing protected platform logging/monitoring boundary with privacy minimization.
- Real WhatsApp/call delivery adapter: **disabled** until separate consent/provider review; tracked enquiry remains available.
- Payments: **disabled**; Phase 11 willingness-to-pay testing uses research questions only.

The Bank of Zambia states that persons intending to conduct payment business require designation under the national payment-system framework. DIREKT therefore does not move real money in Phase 11.

### Later pilot wave

Maps, Sentry or communications may be enabled only through a separate provider/data-flow approval record and regression evidence. Their absence does not block the initial controlled wave because the product already has manual/fallback paths.

## 11. Phase 11A closure matrix

| Gate | Decision/status |
|---|---|
| Exact geography | **DECIDED** — Kabwata + Chilenje wards |
| Alternative area | **EVALUATED** — Matero retained for later stress/expansion test |
| Categories | **DECIDED** — four-category baseline retained |
| Cohort cap/mix | **DECIDED** — 24 providers + 60 customers, 3 waves |
| Named accountable owners | **DECIDED** — Shadreck Kudzanai Musarurwa for four accountable roles |
| Support hours/escalation | **DECIDED** |
| Numeric pause/stop criteria | **DECIDED** |
| Device/network matrix | **DECIDED** |
| Controller model | **DECIDED** — individual-controller filing path for bounded pilot |
| DPC controller registration | **EXTERNAL ACTION REQUIRED** |
| Overseas storage/transfer authorization | **EXTERNAL ACTION REQUIRED** |
| Privacy/consent/retention baseline | **PRODUCT-APPROVED; qualified review still required** |
| Participant authentication direction | **DECIDED** — Firebase phone OTP; implementation/approval pending |
| Maps initial mode | **DECIDED** — manual-first, Maps disabled Wave 1 |
| Sentry initial mode | **DECIDED** — disabled Wave 1 |
| Communications initial mode | **DECIDED** — no production delivery adapter Wave 1 |
| Payment mode | **DECIDED** — disabled throughout Phase 11 |
| Zambia-based field lead | **NOT YET NAMED** — field claims disabled until appointed |

## 12. What online evidence can and cannot clear

Online/official evidence is sufficient to decide:

- a bounded pilot geography;
- category scope and likely evidence pathways;
- device/network stress matrix;
- controller/processor architecture;
- provider selection direction and data-flow risks;
- cohort caps, support model and stop thresholds.

It is **not** a truthful substitute for:

- DPC certificate/authorization;
- qualified legal sign-off;
- real participant consent;
- provider onboarding completion/abandonment rates;
- trust-language comprehension;
- real enquiry response behavior;
- field-verification time/cost;
- real device failure rates;
- willingness-to-pay evidence.

Those remain Phase 11 primary evidence and cannot be marked complete from desk research.

## Sources used for this decision

Official/current sources include:

- Zambia Data Protection Commission registration portal and FAQ;
- Zambia Data Protection Act/registration resources;
- Zambia Statistics Agency 2022 Census/ICT/LCMS resources;
- Lusaka City Council Kabwata/Matero constituency and community infrastructure records;
- Electoral Commission/National Assembly Kabwata ward records;
- Ministry/TEVETA current 2026 training programme listings;
- Energy Regulation Board licensing guidance;
- PACRA official registry site;
- Bank of Zambia payment-systems designation guidance;
- Firebase Authentication current Android/limits/region documentation.

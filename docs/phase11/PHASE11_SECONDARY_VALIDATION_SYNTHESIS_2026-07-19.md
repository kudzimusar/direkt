# Phase 11 Secondary Validation Synthesis — 2026-07-19

**Status:** SECONDARY/ONLINE EVIDENCE SYNTHESIS — NARROWS 11C–11H BUT DOES NOT REPLACE REAL PILOT EVIDENCE  
**Governing issue:** #112

## Purpose

The Phase 11 plan requires real controlled-pilot evidence. This synthesis uses current official/credible online sources and the repository's prior Zambia research to remove questions that do not need to be rediscovered with participants.

It is valid for:

- locking conservative Wave 1 scope;
- choosing which claims/features remain disabled;
- defining provider evidence pathways;
- defining what must be measured rather than guessed;
- reducing the number of open assumptions entering the real pilot.

It is **not** valid as a substitute for:

- actual onboarding completion/abandonment;
- trust-language comprehension;
- real enquiry/response behavior;
- field/reviewer/support timing;
- real-device/network failure rates;
- willingness to pay;
- regulator/legal approval;
- participant consent or outcomes.

## Source families used

Authoritative/current source families include:

- Zambia Data Protection Commission — registration, rights, data-protection framework and overseas storage/transfer questions;
- Zambia Information and Communications Technology Authority — ICT/mobile/connectivity market evidence;
- Zambia Statistics Agency where applicable for population/household context;
- Electoral Commission of Zambia / Lusaka local-government sources — ward/constituency geography;
- TEVETA — vocational/trade training and qualification pathways;
- Energy Regulation Board — electrical/energy-sector regulatory boundaries;
- National Council for Construction — contractor/construction registration boundaries;
- PACRA — business-registration/identity source;
- Bank of Zambia — payment-system/provider boundaries;
- Competition and Consumer Protection Commission — consumer-protection/redress context;
- current Firebase/Google official documentation for Android phone authentication and backend ID-token verification.

All product claims must still cite the exact authoritative source/issuer relevant to the individual check.

---

# 11C — Provider cohort and evidence validation

## Conclusions that can be locked before primary pilot

### 1. Keep the four-category Wave 1 set

Wave 1 remains limited to:

1. plumbing/water repair;
2. electrical repair/services;
3. motor-vehicle mechanics;
4. appliance/electronics repair.

Rationale:

- all four represent practical local-service discovery/use cases;
- formal vocational/trade evidence pathways exist for at least relevant subsets through TEVETA and related issuers;
- business-registration evidence can be separately checked through PACRA where applicable;
- electrical and some construction-related work create a useful test of category-specific statutory boundaries rather than a one-size-fits-all credential model;
- the four categories create variation between fixed-premises, mobile and hybrid providers.

Do not add more categories before Wave 1 evidence unless a critical recruitment failure requires a documented substitution.

### 2. Keep three provider pathways

Provider recruitment should intentionally include:

- registered businesses;
- qualified/trade-trained individuals;
- experienced informal providers where participation and public wording remain lawful and honest.

This is required to test whether DIREKT can create **partial, check-specific trust** without unfairly converting formal business registration into the only path to marketplace visibility.

### 3. Verification claims remain decomposed

Never collapse into a blanket `verified provider` state.

Candidate independent claims:

- identity checked;
- phone/contact checked;
- business registration checked;
- qualification/trade certificate checked;
- category-specific licence/registration checked where applicable;
- premises/location checked;
- not checked;
- pending;
- expired.

### 4. Electrical category remains high-caution

Do not infer that a general training certificate authorizes every electrical activity.

Before public qualification/licence claims:

- identify exact issuer;
- identify exact credential type/scope;
- identify expiry/revocation where applicable;
- confirm whether ERB, another statutory body, employer/training issuer or other authority is the authoritative source for the specific activity.

### 5. NCC registration is not a blanket artisan requirement

NCC evidence may be relevant to particular contractors/projects/entities. Do not require it automatically from every plumber, electrician, mechanic or small repair provider.

### 6. PACRA is a business-registration check, not competence proof

A PACRA record can support a business-identity/registration claim. It must not be converted into a competence, safety or work-quality claim.

## What still requires Wave 1 primary evidence

- provider recruitment acceptance rate;
- onboarding completion/abandonment by pathway/category;
- what evidence providers actually possess and can reasonably submit;
- rejection/resubmission reasons;
- comprehension of independent trust claims;
- real verification turnaround;
- perceived fairness for informal versus registered/qualified providers;
- support burden.

**11C secondary conclusion:** scope/evidence architecture can be locked; performance/usability outcomes remain PRIMARY REQUIRED.

---

# 11D — Discovery, location and trust comprehension

## Conclusions that can be locked

### 1. Wave 1 remains manual/list-first

Do not make Google Maps a prerequisite for Wave 1.

Required discovery inputs:

- approved area/ward;
- landmark/free-text area description where supported;
- provider service area;
- fixed/mobile/hybrid operating model.

Location permission denial must not block core discovery.

### 2. Kabwata + Chilenje remains the controlled operating boundary

This is an operational boundary, not a claim that the two wards are representative of Zambia as a whole.

Matero remains a later comparison/expansion candidate; do not expand automatically.

### 3. Exact provider base coordinates remain private

For mobile/hybrid providers, public discovery should be based on service area, not an invented exact public pin.

For fixed premises, precise public location should be enabled only if:

- genuinely customer-facing;
- necessary/useful;
- separately approved;
- provider consent/authorization is clear;
- privacy/safety controls permit it.

### 4. Trust comprehension must be measured per claim

Participants must be asked separately what they think each claim means.

Do not ask only whether they “trust the badge.”

## What still requires Wave 1 primary evidence

- how customers naturally describe/search locations;
- manual search success/no-result rate;
- permission-denial recovery;
- whether provider service areas feel accurate;
- customer interpretation of identity/business/qualification/location claims;
- whether `not checked`, `pending` and `expired` are understood;
- whether a map materially improves discovery enough to justify later provider/privacy cost.

**11D secondary conclusion:** manual/list-first and reduced-precision privacy model can be locked; comprehension and discovery effectiveness remain PRIMARY REQUIRED.

---

# 11E — Enquiries, contact handoff, reviews and complaints

## Conclusions that can be locked

### 1. Keep tracked enquiry before off-platform contact

The baseline remains:

```text
provider discovery
→ tracked enquiry
→ provider response
→ separate time-bounded contact handoff consent where enabled
→ interaction history
→ review/complaint eligibility
```

This preserves accountability without prematurely building full in-app chat.

### 2. Do not add full chat before evidence

A participant request for chat is a feature request, not proof that tracked enquiry + consented handoff fails.

Add chat only if Wave 1 shows a validated problem that cannot be solved safely with the existing model.

### 3. Automated WhatsApp/call providers remain off in Wave 1

The product can measure whether participants want/understand call or WhatsApp handoff without activating an automated communications provider.

Any later provider requires legal/privacy/provider review and updated data-processing records.

### 4. Reviews remain interaction-linked

Review eligibility should continue to be tied to an accountable DIREKT interaction rather than unrestricted anonymous review creation.

## What still requires Wave 1 primary evidence

- enquiry completion and abandonment;
- provider response/unanswered rate;
- response time;
- whether customers understand the boundary between DIREKT and off-platform contact;
- consent/revocation comprehension;
- review completion/moderation burden;
- complaint rate/type and support workload;
- whether full chat is actually necessary.

**11E secondary conclusion:** interaction architecture can be locked; response/accountability behavior remains PRIMARY REQUIRED.

---

# 11F — Operations and field capacity

## Conclusions that can be locked

### 1. Disable field-visit claims in Wave 1

No public `field checked`/`premises visited` claim should be activated until:

- a Zambia-based operator/lead is named;
- safety and identity procedures are approved;
- travel/assignment workflow is tested;
- cost/capacity can be measured honestly.

Wave 1 can still validate document/evidence review, corrections, complaints and queue handling.

### 2. Four-eyes/high-risk controls remain necessary

High-impact trust state changes, exceptions and overrides should keep the existing authorization/audit separation. Pilot convenience is not a reason to permit direct DB status fixes.

### 3. Operations capacity is a release variable

Queue age, support backlog and evidence-review time are not merely analytics. They determine whether the pilot must pause/narrow.

## What still requires Wave 1 primary evidence

- reviewer minutes per evidence/case;
- support contacts per participant;
- queue ageing;
- rework/rejection burden;
- complaint/escalation load;
- actual field-route/cost data if field checks are later activated;
- fraud/collusion indicators.

**11F secondary conclusion:** field claim stays disabled and operations controls remain; capacity/timing remains PRIMARY REQUIRED.

---

# 11G — Device, connectivity and reliability

## Conclusions that can be locked

### 1. Android-first remains appropriate

The repository should continue to optimize the native Android path rather than introduce an iOS/web participant client during Phase 11.

### 2. Design for variable connectivity, not constant broadband

Wave 1 testing must retain:

- timeouts and safe retry;
- idempotent mutation behavior;
- interrupted upload recovery;
- app/process restart recovery;
- low-bandwidth behavior;
- manual location fallback;
- no background-location dependency.

### 3. Repository minimum SDK is not a substitute for real device coverage

A technically supported Android version does not prove usable performance on low-memory/low-storage devices.

The pilot matrix must include actual recruited-device diversity and record device/network context without unnecessarily identifying participants.

## What still requires Wave 1 primary evidence

- actual Android version distribution in the cohort;
- low-memory/storage failures;
- startup/navigation latency on real devices;
- intermittent-network failure rate;
- upload retry/recovery behavior;
- OTP delivery/auth behavior across Zambia networks;
- font/screen/accessibility issues;
- crash/ANR rate under real pilot use.

**11G secondary conclusion:** Android/offline-resilient design assumptions are strong enough to retain; real reliability rates remain PRIMARY REQUIRED.

---

# 11H — Pricing and unit economics

## Conclusions that can be locked

### 1. Keep real payments disabled

Phase 11 should measure willingness to pay without moving real money.

This avoids introducing payment-provider/legal/tax/reconciliation risk before product/trust value is validated.

### 2. Payment must remain independent from trust

No subscription/payment state may automatically:

- approve evidence;
- create verification claims;
- increase trust level;
- bypass expiry/review;
- change provider competence/safety wording.

### 3. Use cost accounting, not guessed profitability

Measure at minimum:

```text
provider acquisition/recruitment cost
+ evidence review time/cost
+ support/moderation cost
+ infrastructure/auth/SMS cost
+ field cost if activated
= activation/servicing cost by provider pathway/category
```

Then compare separately with stated willingness to pay. Do not present hypothetical willingness as revenue.

### 4. Pricing questions should test ranges and trade-offs

Research should distinguish:

- one-time verification/application fee;
- recurring provider subscription;
- category/provider-pathway differences;
- perceived value of visibility versus trust checks;
- willingness to pay for optional features;
- reasons for refusal.

No price should be called validated until real provider responses exist.

## What still requires Wave 1 primary evidence

- provider perceived value;
- acceptable price ranges;
- billing-cycle preference;
- willingness-to-pay by category/pathway;
- real support/review/infrastructure cost;
- field cost if activated;
- conversion/activation friction.

**11H secondary conclusion:** payment-disabled research model and unit-economics measurement framework can be locked; price/revenue viability remains PRIMARY REQUIRED.

---

# Cross-stage decisions now locked for Wave 1

| Decision | Status after secondary synthesis |
|---|---|
| Geography | LOCKED: Kabwata + Chilenje only for Wave 1 |
| Categories | LOCKED: 4 categories only |
| Cohort | LOCKED: invite-only, max 8 providers + 20 customers per wave |
| Provider pathways | LOCKED: registered + qualified + experienced-informal where lawful/accurate |
| Android | LOCKED as participant client |
| Maps | DISABLED / NOT REQUIRED for Wave 1 |
| Precise location | OPTIONAL/SEPARATE; never required for core discovery |
| Sentry real-participant telemetry | DISABLED unless separately approved |
| Automated WhatsApp/call provider | DISABLED unless separately approved |
| Payments | DISABLED; research only |
| Field-visit trust claim | DISABLED until field gate passes |
| Full chat | DEFERRED pending evidence |
| Blanket `verified` badge | PROHIBITED |
| Invite-only Firebase phone auth | TECHNICAL PATH LOCKED; real activation external-gated |
| Public launch | PROHIBITED |

## Effect on Phase 11

Online/secondary evidence has now done everything it can safely do for 11C–11H before real entry:

- scope is narrow;
- categories are bounded;
- provider evidence architecture is defined;
- high-risk integrations are deliberately removed from Wave 1 dependencies;
- device/reliability scenarios are defined;
- interaction architecture is fixed for validation;
- pricing/payment boundary is fixed;
- primary questions are explicit and smaller.

The remaining 11C–11H metrics are intrinsically behavioral/operational. They can be recorded only after lawful Wave 1 participants actually use the system.

Do not convert this synthesis into invented percentages, completion rates, willingness-to-pay figures or a Phase 11 `PROCEED` decision.

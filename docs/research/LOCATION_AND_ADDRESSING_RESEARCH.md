# DIREKT Location and Addressing Research

**Status:** Open; no map provider or public location-precision decision approved.

## Objective

Determine how customers and providers in the pilot context actually describe, share, verify and protect locations. DIREKT must improve discovery without publishing unsafe or falsely precise information.

## Location concepts to separate

1. **Customer task location** — where service is needed; private by default.
2. **Provider public area** — broad discoverable area or service zone.
3. **Provider fixed premises** — location customers may visit, subject to consent and verification.
4. **Provider private evidence location** — coordinates/photos used for verification but not necessarily public.
5. **Provider service area** — where a mobile/hybrid provider is willing to travel.
6. **Field-visit location** — operational route data restricted to authorized staff.
7. **Search origin** — customer’s current or manually selected area; minimize retention.

These fields must never be collapsed into one coordinate.

## Research questions

- Which address elements are commonly known and stable?
- How are compounds, townships, roads, plots and landmarks used?
- Do people trust map pins, live location or Plus Codes?
- What happens when the pin points to the wrong entrance or centre of a property?
- How often is a call required to complete directions?
- How do mobile providers define coverage?
- What public location detail is safe for home-based providers?
- How do providers change premises or operate from shared locations?
- What makes customers believe a provider has a real local presence?
- What should a “premises visited” check prove and not prove?

## Observation tasks

### Customer task

Ask participants to describe how they would send a provider to a fictional or consented location. Record method and friction, not the coordinate.

### Provider task

Ask providers to mark:

- where they are based at broad level;
- whether customers visit;
- normal travel radius or named zones;
- areas they avoid or charge more for;
- how they explain location when maps fail.

### Field-agent task

Simulate locating a consenting or fictional provider using the information a reviewer would receive. Record travel time band, calls, ambiguity and safety concerns.

## Candidate public representations

Test with customers and providers:

- neighbourhood/compound only;
- approximate pin with privacy radius;
- verified premises pin;
- service-area polygon or named zones;
- “travels to customers” without premises pin;
- distance band rather than exact distance;
- landmark-based text;
- fixed/mobile/hybrid icon and explanation.

## Accuracy states

Proposed states for research:

- `PROVIDER_DECLARED_AREA`;
- `PIN_SUBMITTED_PRIVATE`;
- `PREMISES_EVIDENCE_REVIEWED`;
- `FIELD_VISIT_COMPLETED`;
- `PUBLIC_PREMISES_APPROVED`;
- `LOCATION_STALE`;
- `RECHECK_REQUIRED`;
- `LOCATION_DISPUTED`.

These are research concepts, not approved database states.

## Public-copy examples to test

- “Serves customers in [named areas]. Provider supplied this service area.”
- “Fixed premises privately confirmed by DIREKT on [date]. Exact evidence is not public.”
- “Customers may visit this location; confirm opening hours before travelling.”
- “Mobile provider: travels to customer locations.”
- “Location check requires renewal.”
- “A location check does not confirm workmanship, availability or ownership of the premises.”

## Privacy rules

- home address hidden by default;
- customer exact location shared only for a justified interaction;
- coordinates logged at no greater precision than needed;
- field-route data restricted;
- public map pins require explicit provider approval and evidence rules;
- a premises visit must not expose family members or unrelated occupants;
- photos must avoid faces, vehicle plates and neighbouring private property where possible;
- location history must not become employee/agent surveillance.

## Map-provider evaluation criteria

Phase 1A provides inputs; selection occurs only after cost and technical review.

| Criterion | Evidence needed |
|---|---|
| Coverage and POI quality in candidate areas | field comparison |
| Geocoding of local place names | test dataset |
| Pin and entrance accuracy | observations |
| Offline/cache capability | device tests |
| Android SDK size/performance | prototype benchmark |
| Pricing and free-tier stability | current provider terms |
| Data residency/privacy terms | legal/security review |
| Usage restrictions and attribution | legal/technical review |
| Reverse-geocoding quality | field test |
| Vendor lock-in and abstraction feasibility | architecture review |

## Staleness and correction

Research must define:

- provider confirmation frequency;
- customer stale-location reports;
- relocation workflow;
- evidence required for correction;
- temporary closure;
- disputed pin handling;
- removal of public pin after suspension;
- audit history without exposing prior private locations.

## Exit outputs

- location-method frequency by segment and area;
- pin/direction task findings;
- approved terminology for fixed, mobile and hybrid providers;
- public/private precision recommendation;
- field-visit and renewal recommendation;
- map-provider test dataset using synthetic or consented locations;
- unresolved legal/privacy questions;
- updated design and architecture requirements.
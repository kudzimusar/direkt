# DIREKT Location Architecture

## Location classes

| Class | Purpose | Public? |
|---|---|---|
| Search origin | Customer-selected/current area for query | Not retained beyond need |
| Service area | Where provider claims to travel | Yes, appropriately generalized |
| Public premises | Customer-visitable business location with consent | Yes |
| Private evidence location | Identity/premises verification | No |
| Field visit location | Operational visit proof | No |
| Interaction service area | Safe area for enquiry | Restricted |

These records must not share one unrestricted field.

## Data model

- place hierarchy;
- point geometry;
- polygon/radius service area;
- source and accuracy;
- consent/public precision;
- verification status;
- created/updated/effective dates;
- geocoder/provider metadata;
- manual corrections.

## Search

1. normalize query/service;
2. resolve selected area;
3. filter provider publication/category/currentness;
4. test service-area/premises match;
5. calculate distance where meaningful;
6. rank with relevance/trust/response/freshness;
7. return public geometry only.

## Privacy

- no background customer tracking;
- request foreground location only at search;
- round/minimize analytics coordinates;
- hide home/private provider point;
- exact public point requires operating-model fit and consent;
- logs avoid exact coordinates;
- field agents access only assigned private location for limited time.

## Accuracy

A map pin is not automatically verified. UI labels:

- “Provider-set service area”
- “Public business location”
- “Location checked by DIREKT”
- “Approximate area”

## Provider abstraction

Map tiles, geocoding, autocomplete and routing are accessed through interfaces where practical. Vendor selection considers Zambia coverage, offline behaviour, licence terms, cost and Android integration.

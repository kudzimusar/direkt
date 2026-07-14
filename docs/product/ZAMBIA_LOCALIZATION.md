# Zambia Localization

This document defines localization research and baseline requirements. It is not a substitute for Zambian legal advice.

## Geographic model

Support controlled hierarchy:

- country: Zambia;
- province;
- district;
- locality/township/compound/ward as validated;
- landmark/free-text directions;
- map coordinates;
- service-area geometry or radius;
- public precision and private evidence precision.

Do not assume every provider/customer has a formal street address.

## Phone and identity

- normalize Zambian numbers and retain country code;
- allow phone-first onboarding if research supports it;
- do not assume one SIM or device equals one person;
- define accepted identity documents with legal/operations review;
- provide safe recovery when numbers change;
- protect identity numbers through masking and access controls.

## Business and professional evidence

Potential sources/checks include:

- provider-submitted registration evidence;
- PACRA business information where lawfully and technically available;
- sector-specific licences or association memberships;
- qualification certificates;
- tax or council evidence only when necessary and legally reviewed;
- premises and field evidence.

A registry result is one check, not a guarantee of competence.

## Language

- English is the initial product language unless field research changes this.
- Architecture must support localization from the start.
- Phase 1 must test comprehension and demand for major local languages.
- Trust/legal wording must be professionally translated and reviewed, not machine-published without review.
- Search synonyms may include local service terms.

## Currency and payments

- store Zambian kwacha values in minor units with `ZMW`;
- display locale-appropriate formatting;
- evaluate current mobile-money/card/bank options during Phase 1;
- do not commit to a provider until fees, settlement, API quality, webhooks, refunds and compliance are reviewed.

## Connectivity and devices

Research:

- Android versions and RAM/storage;
- shared devices;
- mobile data cost and intermittent service;
- camera quality and document capture;
- notification reliability;
- common app update behaviour.

Design baseline:

- compressed imagery;
- resumable/recoverable uploads;
- manual location selection;
- low-data list mode;
- local drafts;
- explicit retry and progress;
- avoid mandatory background location.

## Safety and inclusion

Investigate:

- risk of publishing home-business locations;
- customer/provider gender and safety concerns;
- disability and literacy needs;
- informal-provider evidence paths that remain credible;
- rural versus urban field-verification cost;
- discrimination risk in ranking and reviews.

## Institutional relationships

Potential partners, subject to approval:

- trade/professional associations;
- local councils and relevant authorities;
- training/certification institutions;
- consumer protection organizations;
- property managers and community organizations.

Partnership does not permit DIREKT to claim government endorsement without written authorization.

## Legal workstream

Qualified Zambia counsel must review:

- data protection and privacy obligations;
- consumer protection;
- electronic transactions and consent;
- marketplace terms;
- payments and taxation;
- employment/contractor classification;
- evidence retention;
- complaint/referral obligations;
- promotional and verification claims.

# DIREKT Search and Discovery

## Query inputs

- normalized text/category/service;
- chosen search origin/area;
- optional distance;
- operating model;
- check filters;
- availability;
- pagination;
- sort mode.

## Eligibility filter

Before ranking:

- provider published;
- category/service active;
- no blocking enforcement;
- required minimum checks current according to policy;
- service-area/premises matches;
- data not administratively hidden.

A policy may allow visibly unverified profiles in later products, but MVP publication rules must be explicit.

## Ranking candidates

- text/category relevance;
- service-area match;
- distance;
- current check coverage;
- profile/location freshness;
- response performance with minimum sample;
- review aggregate with minimum sample;
- availability;
- labelled sponsorship in a separate controlled slot.

## Explainability

Return public reason labels such as “Serves your selected area”, “Location checked” and “Usually responds within…”, only when supported.

## Geospatial behaviour

- fixed premises: distance to public point;
- mobile: service-area compatibility, not misleading “distance from home”;
- hybrid: both;
- no precise private point in result.

## No-results recovery

Suggest area/category adjustments, not fabricated providers. Record anonymous aggregate demand where consent/policy allows.

## Quality tests

Relevance fixtures, boundary geometry, stale/expired checks, suspended provider exclusion, privacy projection, pagination stability and sponsored labelling.

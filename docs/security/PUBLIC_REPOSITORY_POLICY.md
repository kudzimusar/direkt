# DIREKT Public Repository Policy

## Purpose

The repository is public to support collaboration, GitHub Pages, transparent planning and remote testing. Public does not mean production-safe storage or open licence.

## Prohibited content

- real customer/provider personal data;
- identity documents/certificates;
- private coordinates/addresses;
- credentials/tokens/keys;
- production logs/database dumps;
- complaint allegations;
- proprietary vendor material;
- unlicensed images/fonts/data.

## Allowed content

- source code;
- planning documents;
- synthetic fixtures;
- generated anonymous test reports;
- static prototypes clearly labelled;
- public references and approved assets.

## Synthetic data

Names, numbers, businesses, locations and documents must be fictional and not accidentally resemble real identity records. Use clearly marked test references.

## CI controls

Secret scanning, pattern checks, dependency scanning and Pages build validation. A leaked secret must be rotated even if removed from Git.

## Pages

Assume every Pages asset is globally accessible and cacheable. No authentication or private API keys.

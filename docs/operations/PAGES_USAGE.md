# DIREKT Public Web / GitHub Pages Usage

## Purpose

DIREKT uses GitHub Pages as the **public static origin** for documentation and synthetic/non-sensitive remote-review surfaces. The owner-facing canonical domain is:

```text
https://direkt.forum/
```

The historical `https://kudzimusar.github.io/direkt/` project URL is no longer the canonical product/documentation entry point and must not be presented as current owner-facing access.

## Current edge topology

```text
Vercel Domains (registrar)
        ↓
Cloudflare authoritative DNS
        ↓
GitHub Pages public static origin
        ├─ /          documentation/status/public non-sensitive material
        ├─ /app/      customer/provider installable synthetic PWA
        └─ /prototype historical Phase 1B synthetic design artifact
```

Cloudflare is the DNS/email edge, not the privileged application backend. IAM-private Cloud Run services must remain protected regardless of public DNS/web changes.

## Public customer/provider PWA

`/app/` is authorized for remote visual/product testing using synthetic data only.

It may include responsive customer/provider UI, fictional provider/enquiry/evidence-status data, Android-aligned design tokens, installable manifest/service worker, offline static shell and clearly labelled integration/gate explanations.

It must not include real login/session tokens, participant identities/contact data, evidence bytes/object keys/private signed URLs, exact private coordinates, database/Supabase privileged credentials, service-account material, production provider credentials or production-signing material.

## Why Pages is not the Android runtime

GitHub Pages serves static HTML/CSS/JavaScript/assets. Native Android remote testing uses GitHub Actions build artifacts, Firebase App Distribution and later Play testing after formal release gates. The PWA provides browser parity for product concepts, not Android runtime equivalence.

## Why Pages is not the operations portal

The operations portal is privileged and remains protected on Cloud Run staging or another explicitly approved protected host. Pages/public PWA must never host authenticated operations or shortcut IAM/private API design.

## Build pipeline

`.github/workflows/pages.yml` remains the static deployment workflow. It validates documentation/public-PWA contract, packages planning documentation, runs `scripts/build_pages_source.py`, builds MkDocs strictly and deploys the static artifact.

`scripts/build_pages_source.py` copies approved root controls, `docs/`, historical `prototype/`, `web/direkt-pwa/` to `/app/`, and the planning-pack download where present.

## Canonical-domain checks

Repository content must use `https://direkt.forum/` for current public links. Remaining `kudzimusar.github.io/direkt` references must be explicitly historical/technical rather than current product URLs.

Custom-domain/DNS state is external configuration and must be recorded in `docs/integrations/CURRENT_INTEGRATION_STATUS.md` when changed.

## Cloudflare boundary

Current external provisioning records Cloudflare authoritative DNS for `direkt.forum`, approved Email Routing aliases and DMARC monitoring. Turnstile is **not active** until its failed 403 permission/setup issue, widget creation and source/runtime verification are resolved.

Do not claim Cloudflare application-security controls that are not configured and proven.

## Allowed public content

- documentation and diagrams;
- fictional/synthetic PWA and historical prototype;
- test instructions;
- anonymized/aggregate approved reports;
- release notes and non-sensitive build guidance;
- links to authorized Android distribution instructions.

## Prohibited public content

- backend/API credentials;
- privileged operations UI/data;
- real identities/certificates/evidence;
- private coordinates/contact linkage;
- production database/provider secrets;
- unapproved sensitive-data forms;
- unrestricted signing material;
- claims that synthetic content is real pilot/production evidence.

## Public-review labelling rule

Every synthetic PWA/prototype must state synthetic/fictional review mode, no real submissions where applicable, no real participant data and relevant backend/integration limitations.

## Troubleshooting

- **Canonical domain does not resolve:** inspect Cloudflare DNS and GitHub Pages custom-domain state; do not edit backend IAM as a DNS fix.
- **Old GitHub Pages URL appears in docs:** update stale source/config links or label them historical.
- **PWA route missing:** verify `web/direkt-pwa`, Pages source generation, static validation and deployed artifact.
- **PWA install/offline issue:** verify manifest scope/start URL/service-worker relative paths under `/app/`.
- **Sensitive material published:** disable public deployment as necessary, remove/rotate affected material and follow incident response.

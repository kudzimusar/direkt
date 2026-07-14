# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main` for stable checkpoints  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 1A completed with accepted limitations; Phase 1B interaction design and synthetic prototype authorized.

## Current phase

| Item | State |
|---|---|
| Repository created | Complete |
| Public visibility confirmed | Complete |
| Comprehensive planning pack | Complete |
| Documentation validation workflow | Complete; successful runs observed |
| GitHub Pages workflow | Complete; public site live at `https://kudzimusar.github.io/direkt/` |
| Android CI workflow | Installed and operational; native build path activates after Phase 2 scaffolding |
| Firebase tester distribution | Installed; blocked until package name, Firebase app and secrets are approved |
| Sequential build branch | Active: `build/android-v1` |
| Phase 1A research baseline | Complete with accepted limitations |
| Active phase | Phase 1B — interaction design and synthetic prototype |
| Product code | Not started; Phase 2 follows the Phase 1B checkpoint |
| Public pilot | Not authorized |

## Phase 1A decision

Primary interviews are not currently practical for the project owner. The project will not remain blocked indefinitely on manual recruitment.

Phase 1A therefore exits using:

- current Zambian institutional sources;
- census and public market evidence;
- conservative product and safety assumptions;
- explicit `PROVISIONAL` classification;
- later mandatory validation gates.

The authoritative baseline is:

- `docs/research/SECONDARY_RESEARCH_BASELINE.md`;
- `docs/research/PHASE_1A_EXIT_REVIEW.md`;
- `docs/research/ASSUMPTIONS_REGISTER.md`;
- `docs/research/CATEGORY_EVIDENCE_MATRIX.md`.

This is enough to design and scaffold. It is not evidence that representative customers or providers have approved the product.

## Approved provisional product baseline

| Area | Decision |
|---|---|
| Default market context | Lusaka District |
| Later pilot boundary | Selected Lusaka neighbourhoods, to be confirmed before pilot |
| Initial categories | Plumbing, electrical repairs, motor-vehicle mechanics, appliance/electronics repair |
| Provider types | Fixed premises, mobile and hybrid |
| Provider pathways | Registered business, qualified individual, or experienced informal provider with transparent missing claims |
| Trust model | Separate claim cards; no blanket `safe` or `fully verified` badge |
| Location | Area, neighbourhood, landmark, pin and optional Plus Code; private precision minimized |
| Customer contact | Tracked enquiry, then consent-aware call or WhatsApp handoff |
| Customer payments | Deferred from first MVP |
| Provider payments | Subscription adapter later; MTN MoMo and Airtel Money are candidates only |
| Android | Native Kotlin/Compose, offline drafts, compression, retry and low-bandwidth behaviour |

## Remote build and testing state

- `.github/workflows/pages.yml` validates and deploys documentation and synthetic prototypes.
- `.github/workflows/android-ci.yml` will test, lint and assemble the Android project after Phase 2 scaffolding.
- `.github/workflows/android-distribute.yml` will distribute controlled APK builds after Firebase setup.
- GitHub Pages is the Phase 1B review surface, not an Android runtime.

## Exact next executable workstream

**Phase 1B: synthetic interactive DIREKT prototype**

The next agent must create and publish a fictional, non-sensitive prototype covering:

1. customer onboarding and area selection;
2. category and nearby-provider discovery;
3. list/map switching and no-location fallback;
4. provider profile and separate trust claims;
5. clear `checked`, `expired`, `pending`, `not supplied` and `not checked` states;
6. fixed-premises, mobile and hybrid location presentation;
7. tracked enquiry followed by call/WhatsApp handoff;
8. provider onboarding and evidence progress;
9. rejected evidence and resubmission guidance;
10. operations review and decision flow.

The prototype must:

- use only synthetic Zambian names, businesses, places and documents;
- work on mobile and desktop browsers;
- be hosted through GitHub Pages;
- support structured remote feedback;
- include accessibility, low-bandwidth, offline and error states;
- make no claim that the backend or verification engine is already implemented.

## Phase 1B exit gate

Phase 1B is complete when:

- the main customer, provider and operations flows are interactive;
- each trust claim clearly exposes scope and limitations;
- prototype navigation works on Pages;
- design documentation and screen inventory match the prototype;
- feedback findings and design corrections are recorded;
- documentation checks pass;
- the Phase 2 Android namespace/package decision is recorded;
- Phase 2 technical scaffolding is explicitly authorized.

## Deferred validation — not current blockers

The following remain mandatory before later gates, but do not stop Phase 1B:

- Zambia customer and provider interviews;
- real device/connectivity testing;
- real provider evidence examples in private storage;
- field-verification cost/capacity measurement;
- qualified Zambia legal review;
- authority data-access agreements;
- payment/map/SMS vendor contracts;
- willingness-to-pay and pricing evidence.

## Stop gates still in force

- No public provider onboarding.
- No real identity documents, certificates or private coordinates.
- No production regulator integration.
- No customer payment or escrow implementation.
- No public pilot or Play Store production release.
- No payment-derived trust status.
- No blanket safety or verification claim.

## GitHub lifecycle

Routine checkpoint PRs, CI verification, safe merges and eligible issue closure are handled by the active repository agent. The owner should not need to perform routine GitHub administration manually.

## Next checkpoint

After Phase 1B, create, verify and automatically merge the Phase 1B checkpoint PR into `main`, confirm Pages deployment, close completed design issues, synchronize `build/android-v1`, and authorize Phase 2.

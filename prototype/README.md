# DIREKT Phase 1B Prototype

This directory contains a dependency-free, static interaction prototype for GitHub Pages.

## Purpose

The prototype validates the coherence of customer, provider and operations flows before native Android scaffolding. It uses fictional people, businesses, documents, reviews, locations and cases.

## Open locally

Open `index.html` in a modern browser. No build command, API, package installation or credentials are required.

## Published path

After the Pages workflow succeeds:

`https://kudzimusar.github.io/direkt/prototype/`

## Experiences

- **Customer:** onboarding, area selection, category discovery, list/map results, provider profile, trust details, tracked enquiry and contact-sharing consent.
- **Provider:** onboarding pathway, operating model, evidence requirements, upload recovery, action-required correction, verification timeline and enquiry inbox.
- **Operations:** dashboard, verification queue, case review, private evidence preview, decision form and audit history.

## State simulator

The prototype control panel can display:

- slow network;
- offline mode;
- loading;
- no results;
- location permission denied;
- recoverable error.

## Safety

- No real submission occurs.
- No phone number or WhatsApp destination is used.
- Review notes are stored only in browser `localStorage`.
- No third-party scripts, analytics or remote assets are loaded.
- The evidence viewer contains a fictional, visibly synthetic document.
- General Lusaka area names provide market context but no private coordinates.

## Limitations

This prototype does not prove that the Android client, API, database, identity checks, regulator integrations, payments, evidence storage, audit system or field verification have been implemented.

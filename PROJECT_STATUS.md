# DIREKT Project Status

**Updated:** 2026-07-14  
**Authoritative branch:** `main`  
**Implementation branch:** `build/android-v1`  
**Current programme state:** Phase 0 documentation baseline complete; Android CI and tester-distribution workflows installed; Pages and Firebase require owner-side activation settings.

## Current phase

| Item | State |
|---|---|
| Repository created | Complete |
| Public visibility confirmed | Complete |
| Comprehensive planning pack | Complete |
| Documentation validation workflow | Added; first successful run must be observed |
| GitHub Pages workflow | Added; one-time Source setting still requires owner confirmation |
| Android CI workflow | Added and dormant until Gradle project scaffolding exists |
| Firebase tester-distribution workflow | Added; blocked on approved package name, Firebase project and repository secrets |
| Sequential build branch | Created and fast-forwarded to current `main` baseline |
| Product code | Not started |
| Approved next phase | Phase 1A — Zambia discovery and assumptions validation |

## Current source of truth

The baseline documentation in this repository controls the build. Earlier presentations and conversations are useful discovery material but do not override the committed specifications.

## Remote build and testing state

The following workflows are present on `main` and `build/android-v1`:

- `.github/workflows/pages.yml` — builds and deploys the MkDocs documentation site;
- `.github/workflows/android-ci.yml` — preflights the Android directory, then runs unit tests, Android lint and debug APK assembly when the Gradle project exists;
- `.github/workflows/android-distribute.yml` — manually builds and distributes a tested APK to Firebase App Distribution tester groups.

GitHub Pages is not an Android runtime. It is the documentation and synthetic-prototype surface. Native builds are tested on Android devices using GitHub Actions artifacts or Firebase App Distribution.

See `docs/operations/REMOTE_ANDROID_TESTING.md`.

## Immediate owner actions

1. In GitHub, open **Settings → Pages**.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Open **Actions** and manually run **Deploy DIREKT documentation to Pages** on `main` if no run has started.
4. Confirm both Pages jobs complete and open `https://kudzimusar.github.io/direkt/`.
5. Do not run the Firebase distribution workflow yet.
6. Complete Phase 1A and formally approve the permanent Android application ID/package name.
7. After that decision, create/register the Firebase Android app and add:
   - `FIREBASE_ANDROID_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
8. Review `docs/product/PRODUCT_REQUIREMENTS.md`, `docs/trust/VERIFICATION_MODEL.md`, `design.md` and `docs/operations/REMOTE_ANDROID_TESTING.md`.
9. Begin Phase 1A research; do not scaffold product code yet.

## Exact next approved workstream

**Phase 1A: Zambia discovery and assumptions validation**

The assigned agent must:

- read all control documents;
- claim `WORKSTREAM_LOCK.md`;
- create a structured research repository section;
- identify a pilot area and candidate provider categories;
- create interview and observation instruments;
- record findings without unnecessary personal data;
- update the assumptions, evidence matrix, journeys and pilot plan;
- produce an explicit Phase 1A exit review.

## Known decisions

- Native Android Version 1.
- Internal admin portal may be web-based.
- Backend is a modular TypeScript/NestJS API backed by PostgreSQL/PostGIS.
- One controlled build lane; no feature PR workflow.
- GitHub Pages is limited to static, synthetic and non-sensitive material.
- GitHub Actions is the native Android build and test engine.
- Firebase App Distribution is the preferred early field-tester delivery channel after package-name approval.
- Verification and payment are separate.
- Exact private provider locations are not public by default.

## Open decisions requiring Phase 1 evidence

- initial pilot city/area;
- initial provider categories;
- permanent Android application ID/package name;
- approved map/geocoding provider;
- approved payment/mobile-money provider;
- phone OTP/SMS vendor;
- final minimum Android SDK based on device research;
- formal evidence and issuing-body rules per category;
- pilot subscription price;
- whether in-app messaging is needed before public launch.

## Blockers

No technical blocker exists for documentation or workflow setup. Native APK assembly is intentionally unavailable until the Android Gradle project is scaffolded. Firebase distribution is intentionally blocked until the permanent package name and Firebase credentials are approved.

Product implementation remains blocked until Phase 1A assumptions and field constraints are validated.

## Status update template

Every implementation handoff must update:

- current phase and task;
- commit and branch;
- completed acceptance criteria;
- tests and results;
- migrations;
- blockers and known limitations;
- security/privacy impact;
- exact next authorized task.

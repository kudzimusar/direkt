# DIREKT Remote Android Testing

## Decision

DIREKT uses three separate remote-testing surfaces because a native Android application cannot be executed by GitHub Pages.

1. **GitHub Pages** publishes documentation, synthetic browser prototypes, testing instructions and non-sensitive reports.
2. **GitHub Actions** compiles, tests and packages the native Android application, then stores the APK as a workflow artifact.
3. **Firebase App Distribution** delivers selected pre-release APKs to named testers on physical Android devices.

Google Play internal or closed testing is introduced later for release-candidate validation. It is not the first development feedback channel.

## Why Pages is not the Android runtime

GitHub Pages is static hosting. It can serve HTML, CSS, JavaScript, images and downloadable public files, but it does not run Kotlin, Android services, a mobile operating system, the DIREKT backend or an APK inside the browser.

Pages is therefore used for:

- the public product and technical documentation;
- synthetic clickable prototypes;
- remote review instructions;
- public changelogs and approved test summaries;
- links that direct authorized testers to the correct distribution channel.

Do not publish real verification evidence, identities, credentials, private coordinates, production data or unrestricted test APKs through Pages.

## Stage 1: GitHub Actions build artifacts

Workflow: `.github/workflows/android-ci.yml`

The workflow runs when Android files change on `main` or `build/android-v1`, and can also be started manually.

Before the Android project exists, the workflow completes a preflight check and reports that it is waiting for the Gradle scaffold. After the scaffold exists, it performs:

1. JDK setup;
2. Gradle dependency and build-cache setup;
3. unit tests;
4. Android lint;
5. debug APK assembly;
6. upload of test/lint reports;
7. upload of the debug APK as a short-lived GitHub Actions artifact.

### Tester use

A technical collaborator can:

1. open the repository's **Actions** tab;
2. open a successful **DIREKT Android CI** run;
3. download the `direkt-debug-apk-*` artifact;
4. extract the ZIP;
5. install the APK on an authorized Android test device after enabling installation from that source.

This channel is appropriate for developers and closely managed collaborators. It is less suitable for broad non-technical testing because installation and update handling are manual.

## Stage 2: Firebase App Distribution

Workflow: `.github/workflows/android-distribute.yml`

Firebase App Distribution is the preferred channel for Zambia pilot testers because it manages tester invitations, build notifications, tester groups and pre-release delivery.

The workflow is intentionally manual. A human selects **Run workflow**, confirms the tester group and supplies release notes. It then:

1. validates that the Android project exists;
2. validates required repository secrets;
3. runs unit tests and Android lint;
4. builds the debug APK;
5. authenticates to Firebase with a service account;
6. distributes the APK to the selected tester group;
7. retains the exact distributed APK as a GitHub Actions artifact for traceability.

### Required Firebase setup

Do not configure Firebase until the Android application ID/package name is formally approved. Firebase treats the registered Android package name as case-sensitive and it cannot be changed for that Firebase app after registration.

After the package name is approved:

1. create or select the DIREKT Firebase project;
2. register the Android app using the exact approved package name;
3. enable App Distribution;
4. create the tester group `direkt-testers` or another approved alias;
5. invite only authorized test accounts;
6. create a least-privilege CI service account for App Distribution;
7. add the following GitHub repository secrets:
   - `FIREBASE_ANDROID_APP_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
8. manually run **DIREKT Android Tester Distribution** from the Actions tab.

Never commit the service-account JSON, Firebase credentials, signing keys or tester email lists to the repository.

## Stage 3: Google Play internal and closed testing

Use Google Play testing when the application has a stable application ID, release signing, versioning, store metadata and privacy declarations.

This stage validates the installation and update path that production users will receive. It is not a substitute for rapid development distribution.

Recommended progression:

1. internal testing for the core team;
2. closed testing for approved pilot groups;
3. open testing only after privacy, safety, support and operational controls are ready;
4. production rollout with staged percentage controls.

Release candidates should be Android App Bundles signed through the controlled release-signing process. Debug APKs must never be promoted as production releases.

## Remote testing matrix

| Need | Channel | Audience | Output |
|---|---|---|---|
| Review product documents | GitHub Pages | colleagues and stakeholders | static website |
| Review an early interaction concept | GitHub Pages | colleagues and pilot advisers | synthetic browser prototype |
| Verify every code change | GitHub Actions | engineering agents and maintainers | tests, reports and debug APK |
| Install a build quickly | GitHub Actions artifact | technical collaborators | downloadable debug APK |
| Manage recurring field testers | Firebase App Distribution | invited Zambia testers | emailed/in-app pre-release delivery |
| Validate store installation and updates | Google Play testing | controlled release testers | signed AAB through Play |

## Data and safety rules

Remote test builds must use a dedicated non-production backend and synthetic or explicitly consented test data. The following must not appear in public Pages content or unrestricted artifacts:

- national identity documents;
- professional certificates submitted by real providers;
- exact private premises or residential coordinates;
- access tokens, API keys or service-account material;
- production database records;
- complaint or incident evidence;
- unredacted tester contact lists.

## Build traceability

Every distributed build must be traceable to:

- the Git commit SHA;
- the workflow run number;
- build type;
- test results;
- release notes;
- target tester group;
- distribution timestamp;
- backend environment.

Do not distribute a build if tests or lint fail. Do not overwrite an existing release artifact with content from a different commit.

# DIREKT GitHub Pages Usage

## Purpose

GitHub Pages publishes DIREKT documentation, synthetic browser prototypes, test instructions and non-sensitive reports for remote collaboration.

Planned URL:

`https://kudzimusar.github.io/direkt/`

GitHub Pages does **not** execute the native Android application. Android builds are produced by GitHub Actions and installed on Android devices through workflow artifacts or Firebase App Distribution.

See [`REMOTE_ANDROID_TESTING.md`](REMOTE_ANDROID_TESTING.md).

## One-time owner setup

The deployment workflow already exists at `.github/workflows/pages.yml`. The repository owner must complete the GitHub setting that cannot be changed through a documentation commit:

1. Open repository **Settings**.
2. Select **Pages** under **Code and automation**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions**.
5. Select **Deploy DIREKT documentation to Pages**.
6. Choose **Run workflow** on `main` if a run is not already active.
7. Confirm both the `build` and `deploy` jobs succeed.
8. Open the deployed URL and verify navigation and the planning-pack download.

The `github-pages` deployment environment is created automatically by the workflow. Only `main` is authorized to trigger the current Pages deployment.

## Content pipeline

`scripts/build_pages_source.py` copies approved root control documents, `docs/` and the planning archive into a generated Pages source directory. MkDocs builds the static site. GitHub Actions uploads and deploys the static artifact from `main`.

## Role in remote testing

Pages supports remote review of:

- product and technical decisions;
- synthetic clickable interaction prototypes;
- screenshots and non-sensitive demonstration media;
- test scripts and structured feedback instructions;
- approved aggregate pilot findings;
- build status guidance and links to the appropriate Android distribution channel.

Pages must not host the live DIREKT backend or simulate a feature in a way that could be confused with implemented Android functionality.

## Allowed

- Markdown documentation;
- diagrams;
- synthetic static prototypes;
- test instructions or forms that do not collect sensitive data;
- anonymized and aggregate test reports;
- public release notes;
- downloadable planning documents;
- links to authorized Android test-distribution instructions.

## Prohibited

- backend or API hosting;
- authentication;
- the operations portal;
- repository or cloud secrets;
- real identities or certificates;
- private coordinates;
- live complaint cases;
- production database or API keys;
- forms that send sensitive data to unapproved services;
- unrestricted public distribution of internal Android test builds;
- any claim that the static prototype is the native Android application.

## Prototype rules

Every prototype must:

1. be clearly labelled as a prototype;
2. use fictional data;
3. disable real submissions;
4. identify the tested scenario and version;
5. include an approved feedback route;
6. avoid collecting identity, certificate or precise-location evidence.

A static prototype is not evidence that backend, verification or security functionality exists.

## Troubleshooting

- **Workflow not enabled:** complete the Pages Source setting and select GitHub Actions.
- **Build does not start:** confirm the workflow is on `main` and Actions are enabled for the repository.
- **Broken links:** run `mkdocs build --strict` and the documentation validator.
- **Missing page:** check the source generator and MkDocs navigation.
- **404 after repository rename:** confirm repository name, project-path base URL and Pages settings.
- **Sensitive material published:** disable Pages, remove the source and artifact, rotate any exposed credential and follow the incident-response process.

# DIREKT GitHub Pages Usage

## Purpose

GitHub Pages publishes DIREKT documentation, synthetic browser review surfaces, test instructions and non-sensitive reports for remote collaboration.

Canonical owner-facing URL:

`https://direkt.forum/`

The historical technical project URL `https://kudzimusar.github.io/direkt/` is not the current canonical public entry point.

GitHub Pages does **not** execute the native Android application. Android builds are produced by GitHub Actions and installed on Android devices through workflow artifacts or Firebase App Distribution. Pages additionally hosts the synthetic customer/provider PWA at `/app/`; that browser client is not an Android emulator and does not imply live backend access.

See [`REMOTE_ANDROID_TESTING.md`](REMOTE_ANDROID_TESTING.md) and [`REMOTE_UI_TESTING.md`](REMOTE_UI_TESTING.md).

## Current public edge

```text
Vercel Domains (registrar)
  → Cloudflare authoritative DNS
  → GitHub Pages public static origin
      /          documentation/non-sensitive material
      /app/      customer/provider synthetic PWA
      /prototype historical Phase 1B synthetic prototype
```

Cloudflare DNS/public web changes do not authorize public Cloud Run/API access.

## One-time owner setup

The deployment workflow already exists at `.github/workflows/pages.yml`. The repository owner must complete the GitHub setting that cannot be changed through a documentation commit:

1. Open repository **Settings**.
2. Select **Pages** under **Code and automation**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions**.
5. Select **Deploy DIREKT documentation to Pages**.
6. Choose **Run workflow** on `main` if a run is not already active.
7. Confirm both the `build` and `deploy` jobs succeed.
8. Open `https://direkt.forum/` and verify navigation, `/app/` and the planning-pack download.

The `github-pages` deployment environment is created automatically by the workflow. Only `main` is authorized to trigger the current Pages deployment.

## Content pipeline

`scripts/build_pages_source.py` copies approved root control documents, `docs/`, the historical prototype, `web/direkt-pwa/` and the planning archive into the generated Pages source directory. MkDocs builds the static site. GitHub Actions uploads and deploys the static artifact from `main`.

## Role in remote testing

Pages supports remote review of:

- product and technical decisions;
- the installable synthetic customer/provider PWA;
- historical synthetic interaction prototypes;
- screenshots and non-sensitive demonstration media;
- test scripts and structured feedback instructions;
- approved aggregate pilot findings;
- build status guidance and links to Android distribution.

Pages must not host the live DIREKT backend, privileged operations or real participant/private evidence data. The PWA must clearly distinguish synthetic review states from runtime-active integrations.

## Allowed

- Markdown documentation;
- diagrams;
- synthetic static prototypes/PWA;
- test instructions or forms that do not collect sensitive data;
- anonymized and aggregate test reports;
- public release notes;
- downloadable planning documents;
- links to authorized Android test-distribution instructions.

## Prohibited

- backend or API hosting;
- real authentication/session material;
- the operations portal;
- repository or cloud secrets;
- real identities or certificates;
- private coordinates;
- live complaint cases;
- production database or provider keys;
- forms that send sensitive data to unapproved services;
- unrestricted public distribution of internal Android test builds;
- any claim that the PWA/prototype is the native Android runtime;
- any claim that a configured external provider is runtime-active without supporting evidence.

## Synthetic review rules

Every public synthetic prototype/PWA must:

1. be clearly labelled as synthetic/prototype review;
2. use fictional data;
3. disable real submissions unless a separately approved live path exists;
4. identify the tested scenario/client;
5. include an approved feedback/contact route where appropriate;
6. avoid collecting identity, certificate, private contact or precise-location evidence;
7. avoid privileged API/session material in service-worker/browser caches.

A static review surface is not evidence that its represented backend/provider integration is live.

## Cloudflare boundary

Current external provisioning records Cloudflare authoritative DNS, approved Email Routing aliases and initial DMARC monitoring. Cloudflare Turnstile is **not active** until its current permission/setup blocker, widget/keys and source verification pass.

## Troubleshooting

- **Workflow not enabled:** complete the Pages Source setting and select GitHub Actions.
- **Build does not start:** confirm the workflow is on `main` and Actions are enabled.
- **Broken links:** run `mkdocs build --strict` and documentation/PWA validators.
- **Missing `/app/`:** check `web/direkt-pwa`, `scripts/build_pages_source.py`, PWA CI and deployed artifact.
- **Canonical domain problem:** inspect Cloudflare DNS and GitHub Pages custom-domain state; do not weaken backend IAM as a DNS fix.
- **404 after repository/domain change:** confirm custom-domain and path/base settings.
- **Sensitive material published:** disable Pages as needed, remove/rotate affected material and follow incident response.

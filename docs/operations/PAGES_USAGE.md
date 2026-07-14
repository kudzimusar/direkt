# DIREKT GitHub Pages Usage

## Purpose

GitHub Pages publishes DIREKT documentation, synthetic prototypes, test instructions and non-sensitive reports for remote collaboration.

Planned URL:

`https://kudzimusar.github.io/direkt/`

## One-time owner setup

After the Pages workflow exists:

1. Open repository **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions** and confirm the Pages workflow succeeds.
5. Open the deployed URL and verify navigation/download.

## Content pipeline

`scripts/build_pages_source.py` copies root control documents, `docs/` and the planning archive into a generated `_pages_src` directory. MkDocs builds it. GitHub Actions uploads and deploys the static artifact from `main`.

## Allowed

- Markdown documentation;
- diagrams;
- synthetic static prototypes;
- test instructions/forms that do not collect data;
- anonymized/aggregate test reports;
- public release notes;
- downloadable planning pack.

## Prohibited

- backend/API hosting;
- authentication;
- operations portal;
- secrets;
- real identities/certificates;
- private coordinates;
- live complaint cases;
- production database/API keys;
- forms that send sensitive data to unapproved services.

## Prototype rules

Clearly label prototype, use fictional data, disable real submissions and include feedback route. A static prototype is not evidence that backend/security functionality exists.

## Troubleshooting

- workflow not enabled: complete Source setting;
- broken links: run `mkdocs build --strict`;
- missing page: check source generator and MkDocs nav;
- 404 after rename: confirm repository name/path/base URL;
- sensitive publish: disable workflow, remove artifact/source, rotate any exposed secret and follow incident process.

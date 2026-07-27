# DIREKT generated API clients

These directories contain deterministic source generated from the canonical checked NestJS OpenAPI document by `scripts/rc9/generate-clients.sh`.

- `kotlin/src/main/kotlin` — OpenAPI Generator `kotlin` / `jvm-retrofit2` / `kotlinx_serialization` output.
- `typescript/src` — OpenAPI Generator `typescript-fetch` output.
- `GENERATION_RECEIPT.json` — generator artifact, canonical OpenAPI, configuration and source-tree digests.

RC9A compiles these clients as standalone contract artifacts only. They are **not wired into Android, browser, PWA, operations or backend runtime behavior**.

Do not edit generated source manually. Regenerate with:

```bash
pushd backend/direkt-api
npm ci --ignore-scripts
npm run openapi:check
popd
bash scripts/rc9/generate-clients.sh --write
```

CI uses `--check` and fails on byte-for-byte drift. The generator JAR version and SHA-256 are pinned in `clients/generator/openapi-generator.json`.

Generated code must never contain privileged credentials, production endpoints, participant data or client-selected authorization/trust/payment authority. TypeScript authenticated transport remains server-side behind the DIREKT BFF; Kotlin runtime migration is a later reviewed RC9 slice.

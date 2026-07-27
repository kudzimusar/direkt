#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RECEIPT = json.loads((ROOT / "clients/generated/GENERATION_RECEIPT.json").read_text(encoding="utf-8"))
GENERATOR_SHA = RECEIPT["generator"]["sha256"]
SPEC_SHA = RECEIPT["canonicalOpenApi"]["sha256"]
KOTLIN_FILES = RECEIPT["outputs"]["kotlin"]["sourceFiles"]
KOTLIN_TREE = RECEIPT["outputs"]["kotlin"]["treeSha256"]
TYPESCRIPT_FILES = RECEIPT["outputs"]["typescript"]["sourceFiles"]
TYPESCRIPT_TREE = RECEIPT["outputs"]["typescript"]["treeSha256"]


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def insert_once(path: str, marker: str, block: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if block.strip() in text:
        return
    count = text.count(marker)
    if count != 1:
        raise AssertionError(f"{path}: expected one marker, found {count}: {marker!r}")
    target.write_text(text.replace(marker, block + marker, 1), encoding="utf-8")


implementation = "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md"
replace_once(
    implementation,
    "**Branch:** `integration/rc9-generated-clients`  ",
    "**Branch:** `feat/rc9a-deterministic-generated-clients`  ",
)
replace_once(
    implementation,
    "**State:** CLAIMED / RC9A DETERMINISTIC FOUNDATION PENDING",
    "**State:** RC9A IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / RUNTIME UNWIRED",
)
replace_once(
    implementation,
    "- Backend CI already generates and uploads the checked OpenAPI artifact, but no generated client package is currently produced or drift-checked.",
    "- Backend CI generates and uploads the checked OpenAPI artifact. RC9A now derives committed Kotlin and TypeScript source trees from that exact document and fails on byte-for-byte regeneration drift.",
)
insert_once(
    implementation,
    "### RC9B — Kotlin auth/session slice\n",
    f"""### RC9A deterministic foundation receipt

RC9A is source/build foundation only and remains runtime-unwired.

- OpenAPI Generator CLI: `7.22.0`;
- official Maven JAR SHA-256: `{GENERATOR_SHA}`;
- canonical OpenAPI SHA-256: `{SPEC_SHA}`;
- canonical surface: OpenAPI 3.0.0, 135 paths, 148 operations and 74 schemas;
- Firebase exchange operation: `AuthController_exchangeFirebaseSession`, tag `authentication`;
- Kotlin source: `{KOTLIN_FILES}` files, tree SHA-256 `{KOTLIN_TREE}`;
- TypeScript source: `{TYPESCRIPT_FILES}` files, tree SHA-256 `{TYPESCRIPT_TREE}`;
- committed output: generated source only; generator-owned wrappers, publishing tasks, docs and tests are excluded;
- Kotlin compile harness: Kotlin 2.2.20, serialization 1.9.0, OkHttp logging 5.1.0 and Retrofit 3.0.0;
- TypeScript compile harness: strict/no-emit through the web workspace's pinned TypeScript compiler;
- drift gate: regenerate the checked canonical spec and compare source plus immutable receipt byte-for-byte;
- Android runtime import: false;
- browser/BFF runtime import: false;
- participant data, privileged client credentials and production authorization: false.

RC9A does not replace the current Android `HttpsURLConnection` session path or the server-side BFF transport. Those migrations remain separate reviewed RC9B/RC9C slices.

""",
)

lock = "WORKSTREAM_LOCK.md"
replace_once(
    lock,
    "| Implementation branch | `integration/rc9-generated-clients`, based on `main@030cd577e179863b70f24d99ab237e74660b4325`. |",
    "| Implementation branch | `feat/rc9a-deterministic-generated-clients`, based on the claimed baseline `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`. |",
)
replace_once(
    lock,
    "| Stable baseline | `main@030cd577e179863b70f24d99ab237e74660b4325`; RC0–RC8 are closed and regression-protected. Canonical OpenAPI generation/checking is active. Android currently uses a manual HTTPS/JSON session-exchange path; the web client uses manually maintained contracts behind the reviewed server-side BFF. Fully generated runtime clients are not yet active. |",
    f"| Stable baseline | RC9 claim merged at `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`; RC0–RC8 remain closed. RC9A generates deterministic standalone Kotlin/TypeScript source from canonical OpenAPI `{SPEC_SHA}` with generator JAR `{GENERATOR_SHA}`. Android and BFF runtime wiring remain unchanged. |",
)
replace_once(
    lock,
    "| Current task | RC9A — pin generator strategy, create deterministic canonical contract artifact and byte-for-byte drift gate; then migrate one Kotlin auth/session slice and adopt TypeScript generated contract types without replacing the BFF transport. |",
    "| Current task | RC9A — deterministic generated source, standalone compilation, immutable receipt and drift gate are implemented on PR #496; exact-head regression and review remain before merge. RC9B/RC9C runtime adoption must not begin early. |",
)

status = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| Fully generated Kotlin/TypeScript client packages | **RC9 CLAIMED / DETERMINISTIC FOUNDATION PENDING** | Pin OpenAPI Generator 7.22.0, add reproducible drift control, migrate one Kotlin auth/session slice, and adopt TypeScript contract types only behind the server-side BFF. No generated runtime client is active yet. |",
    f"| Fully generated Kotlin/TypeScript client packages | **RC9A IMPLEMENTED / RUNTIME UNWIRED / REGRESSION PENDING** | Generator 7.22.0 JAR `{GENERATOR_SHA}` produces committed source from canonical OpenAPI `{SPEC_SHA}` with byte-for-byte drift enforcement and standalone Kotlin/TypeScript compilation. Android and BFF runtime imports remain false; RC9B/RC9C are separate. |",
)
replace_once(
    status,
    "11. RC9 generated Kotlin/TypeScript clients — **CLAIMED / RC9A deterministic generation first**.",
    "11. RC9 generated Kotlin/TypeScript clients — **RC9A IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / RUNTIME UNWIRED**.",
)

ledger = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "11. RC9 OpenAPI generated Kotlin/TypeScript client adoption decision/migration — **CLAIMED** on `main@030cd577e179863b70f24d99ab237e74660b4325`; deterministic generation/drift control precedes any runtime migration; Android auth/session is the first candidate slice; TypeScript remains BFF-only.",
    f"11. RC9 OpenAPI generated Kotlin/TypeScript client adoption — **RC9A IMPLEMENTED / RUNTIME UNWIRED / EXACT-HEAD REGRESSION PENDING** from claimed baseline `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`; generator `7.22.0` JAR `{GENERATOR_SHA}`; canonical OpenAPI `{SPEC_SHA}`; Kotlin `{KOTLIN_FILES}` files/tree `{KOTLIN_TREE}`; TypeScript `{TYPESCRIPT_FILES}` files/tree `{TYPESCRIPT_TREE}`; byte-for-byte drift and standalone compile gates active; Android auth/session remains the first later slice and TypeScript remains BFF-only.",
)

project = "PROJECT_STATUS.md"
replace_once(
    project,
    "- runtime integration closure — **RC1–RC8 are closed at synthetic-only managed boundaries; RC8 exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` passed managed run `30241092949/1` with artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`)**.",
    f"- runtime integration closure — **RC1–RC8 are closed at synthetic-only managed boundaries; RC9 is claimed and RC9A deterministic generated source is implemented but runtime-unwired, using canonical OpenAPI `{SPEC_SHA}` and pinned generator JAR `{GENERATOR_SHA}`**.",
)
replace_once(
    project,
    "RC9 is now the sole active repository lane. The approved order is: (1) deterministic OpenAPI artifact and pinned generator/drift control; (2) one incremental Kotlin auth/session migration preserving current Android behavior; (3) TypeScript generated contract adoption only behind the reviewed server-side BFF; (4) full backend/Android/web/portal/security regression and status reconciliation. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
    "RC9 is the sole active repository lane. RC9A deterministic source generation, immutable receipt, standalone compilation and byte-for-byte drift enforcement are implemented on PR #496 but remain regression/review pending and runtime-unwired. After RC9A merges, the approved order remains one incremental Kotlin auth/session slice, then TypeScript contract adoption only behind the server-side BFF, followed by cross-client closure. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
)

print("RC9A_FOUNDATION_STATUS_PATCH|PASS")
print(f"generator_sha256={GENERATOR_SHA}")
print(f"canonical_openapi_sha256={SPEC_SHA}")
print(f"kotlin_source_files={KOTLIN_FILES}")
print(f"typescript_source_files={TYPESCRIPT_FILES}")

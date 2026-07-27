#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "030cd577e179863b70f24d99ab237e74660b4325"


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


lock = "WORKSTREAM_LOCK.md"
replace_once(lock, "| Status | RELEASED |", "| Status | CLAIMED — RC9 OpenAPI-generated client adoption |")
replace_once(
    lock,
    "| Owner/agent | None — RC8 is closed; Issue #261 remains the runtime-integration tracker. |",
    "| Owner/agent | Active repository agent — Issue #261 RC9 generated-client checkpoint. |",
)
replace_once(
    lock,
    "| Authorized scope | No active write lane. RC8 evidence is immutable/regression-protected. RC9 may begin only through a new explicit claim. Real money, participant data, production endpoints, customer-to-provider payments, escrow, wallet/payout authority and payment influence over verification/trust remain prohibited. |",
    "| Authorized scope | Decide and implement deterministic OpenAPI-generated Kotlin and TypeScript contract clients incrementally. Preserve the Android backend-only boundary, the server-side Next.js BFF/private Cloud Run IAM boundary, offline/error semantics and all RC0–RC8 evidence. No privileged direct backend, database, provider-secret, production, participant or real-money activation is authorized. |",
)
replace_once(
    lock,
    "| Protected surface | Closed RC0–RC8 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1` and RC8 run `30241092949/1` on `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`; UIA Issue #354; backend/database/OpenAPI and commercial ledger trust boundaries; private API/BFF IAM; provider credentials; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
    "| Protected surface | Closed RC0–RC8 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1` and RC8 run `30241092949/1`; canonical OpenAPI authorization/privacy checks; Android auth/session storage, signing, Maps/FCM/Crashlytics and Play/Data Safety; customer/provider web BFF/private Cloud Run IAM; operations portal; UIA Issue #354; VC1–VC8 Design DNA; Phase 11/12 gates. |",
)
replace_once(
    lock,
    "| Implementation branch | None — `docs/rc8-managed-closure` is the bounded closeout branch only. |",
    "| Implementation branch | `integration/rc9-generated-clients`, based on `main@030cd577e179863b70f24d99ab237e74660b4325`. |",
)
replace_once(
    lock,
    "| Stable baseline | RC5–RC8 are closed. RC8 exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` passed managed run `30241092949/1` with artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). Application provider registration, participant use, production credentials/endpoints and real-money movement remain disabled. UIA Issue #354 remains parked/open. |",
    "| Stable baseline | `main@030cd577e179863b70f24d99ab237e74660b4325`; RC0–RC8 are closed and regression-protected. Canonical OpenAPI generation/checking is active. Android currently uses a manual HTTPS/JSON session-exchange path; the web client uses manually maintained contracts behind the reviewed server-side BFF. Fully generated runtime clients are not yet active. |",
)
replace_once(
    lock,
    "| Current task | None. RC9 OpenAPI-generated client adoption/decision is next in sequence but is not claimed. |",
    "| Current task | RC9A — pin generator strategy, create deterministic canonical contract artifact and byte-for-byte drift gate; then migrate one Kotlin auth/session slice and adopt TypeScript generated contract types without replacing the BFF transport. |",
)
replace_once(
    lock,
    "| Governing issue | Issue #261 — Runtime integration closure after W8. No active repository lane; Issue #354 UIA remains parked/read-only. |",
    "| Governing issue | Issue #261 — Runtime integration closure after W8. RC9 is the sole active bounded repository lane; Issue #354 UIA remains parked/read-only. |",
)

insert_once(
    lock,
    "## Runtime integration closure contract\n",
    """## RC9 implementation contract — CLAIMED

1. The canonical input is the exact backend-generated OpenAPI 3 document after the permanent authorization, privacy, deferred-domain and sensitive-field checks pass.
2. OpenAPI Generator is pinned to stable version `7.22.0`; generation must run locally/CI without an online generator service and with timestamps hidden.
3. Generated output is reproducible and committed or otherwise hash-pinned; CI regenerates from the same spec/config and fails on byte drift.
4. Kotlin adoption is incremental. The first runtime slice is the existing Firebase-to-DIREKT auth/session exchange; current UI, encrypted session storage, consent, fail-closed configuration, timeouts and error semantics must remain intact.
5. The Kotlin target is `jvm-retrofit2` with `kotlinx_serialization`; generated code must not introduce Android API-level regressions, unreviewed cleartext, permissive certificate handling or direct provider/database credentials.
6. TypeScript generation supplies canonical contract models/operation types to the server-only BFF. It must not move authenticated browser calls to the client, reveal the private Cloud Run API origin or replace the reviewed infrastructure-token/session boundary.
7. Generated transport defaults may not become authority for authorization, trust, payment, retry, idempotency or offline-success decisions. DIREKT-owned wrappers/interceptors preserve those policies.
8. Additive API changes remain backward compatible; breaking changes require `/api/v2`. Unknown/new response fields must not crash released clients, and enum evolution requires an explicit safe policy.
9. Cross-client evidence must include backend OpenAPI, generator drift, Android unit/lint/build/instrumentation and functional web type/security/build regressions before migration promotion.
10. RC9 closes only after the generator/versioning decision, deterministic drift proof, the approved incremental Kotlin slice, reviewed TypeScript adoption/decision, documentation reconciliation and exact-head regressions. No production, participant, privileged direct-access or payment authorization changes.

""",
)
replace_once(
    lock,
    "- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision after backend integration/API shape stabilizes; migrate incrementally with cross-client regressions.",
    "- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision. **CLAIMED — deterministic generation and incremental migration from `main@030cd577e179863b70f24d99ab237e74660b4325`; no production/participant or privileged direct-access change.**",
)
replace_once(
    lock,
    "No repository write lane is active. RC0–RC8 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC9 source work requires a new explicit claim. Real-money, participant and production authorization remain blocked.",
    "RC9 is the sole active repository write lane. RC0–RC8 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC10+ source work must not begin until RC9 is closed or explicitly transitioned. Real-money, participant and production authorization remain blocked.",
)

project = "PROJECT_STATUS.md"
replace_once(
    project,
    "**Active repository write lane:** RELEASED — RC1–RC8 are closed at documented synthetic-only managed boundaries; RC9 is next but unclaimed",
    "**Active repository write lane:** RC9 OpenAPI-generated Kotlin/TypeScript client adoption under Issue #261; RC1–RC8 remain closed",
)
replace_once(
    project,
    "No repository write lane is active. RC9 OpenAPI-generated Kotlin and TypeScript client adoption/decision is next in sequence, but it requires a new explicit claim and must preserve all RC0–RC8, Android, backend, web/PWA, operations, supply-chain and release gates. RC8 does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
    "RC9 is now the sole active repository lane. The approved order is: (1) deterministic OpenAPI artifact and pinned generator/drift control; (2) one incremental Kotlin auth/session migration preserving current Android behavior; (3) TypeScript generated contract adoption only behind the reviewed server-side BFF; (4) full backend/Android/web/portal/security regression and status reconciliation. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
)

status = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    status,
    "| Fully generated Kotlin/TypeScript client packages | **NOT CURRENT RUNTIME INTEGRATION** | RC9 incremental adoption/decision after API shape stabilizes. |",
    "| Fully generated Kotlin/TypeScript client packages | **RC9 CLAIMED / DETERMINISTIC FOUNDATION PENDING** | Pin OpenAPI Generator 7.22.0, add reproducible drift control, migrate one Kotlin auth/session slice, and adopt TypeScript contract types only behind the server-side BFF. No generated runtime client is active yet. |",
)
replace_once(
    status,
    "11. RC9 generated Kotlin/TypeScript clients.",
    "11. RC9 generated Kotlin/TypeScript clients — **CLAIMED / RC9A deterministic generation first**.",
)

ledger = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    ledger,
    "11. RC9 OpenAPI generated Kotlin/TypeScript client adoption decision/migration.",
    "11. RC9 OpenAPI generated Kotlin/TypeScript client adoption decision/migration — **CLAIMED** on `main@030cd577e179863b70f24d99ab237e74660b4325`; deterministic generation/drift control precedes any runtime migration; Android auth/session is the first candidate slice; TypeScript remains BFF-only.",
)

print("RC9_CLAIM_PATCH|PASS")

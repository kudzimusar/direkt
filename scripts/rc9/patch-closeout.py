#!/usr/bin/env python3
"""Reconcile RC9 closure state across authoritative repository documents."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(relative: str, old: str, new: str) -> None:
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one RC9 closeout replacement in {relative}, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


# Workstream lock: release RC9 without claiming RC10.
replace_once(
    "WORKSTREAM_LOCK.md",
    """| Status | CLAIMED — RC9 OpenAPI-generated client adoption |
| Owner/agent | Active repository agent — Issue #261 RC9 generated-client checkpoint. |
| Authorized scope | Decide and implement deterministic OpenAPI-generated Kotlin and TypeScript contract clients incrementally. Preserve the Android backend-only boundary, the server-side Next.js BFF/private Cloud Run IAM boundary, offline/error semantics and all RC0–RC8 evidence. No privileged direct backend, database, provider-secret, production, participant or real-money activation is authorized. |
| Protected surface | Closed RC0–RC8 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1` and RC8 run `30241092949/1`; canonical OpenAPI authorization/privacy checks; Android auth/session storage, signing, Maps/FCM/Crashlytics and Play/Data Safety; customer/provider web BFF/private Cloud Run IAM; operations portal; UIA Issue #354; VC1–VC8 Design DNA; Phase 11/12 gates. |
| Implementation branch | `feat/rc9a-deterministic-generated-clients`, based on the claimed baseline `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`. |
| Stable baseline | RC9 claim merged at `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`; RC0–RC8 remain closed. RC9A generates deterministic standalone Kotlin/TypeScript source from canonical OpenAPI `1ea6b983c49c95db88db1a1432d9e6e0078fe124a3196f00c485b86dbe2db519` with generator JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`. Android and BFF runtime wiring remain unchanged. |
| Current task | RC9A — deterministic generated source, standalone compilation, immutable receipt and drift gate are implemented on PR #496; exact-head regression and review remain before merge. RC9B/RC9C runtime adoption must not begin early. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC9 is the sole active bounded repository lane; Issue #354 UIA remains parked/read-only. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |""",
    """| Status | RELEASED — RC9 CLOSED AND PRESERVED |
| Owner/agent | None. RC9 is closed under Issue #261; RC10 is next but remains unclaimed. |
| Authorized scope | No active repository write lane. Any RC10 Turnstile decision or later integration work requires a new explicit claim from current `main`. |
| Protected surface | Closed RC0–RC9 evidence, including RC5 run `30183466799`, RC6 run `30137700769`, RC7 run `30234521983/1`, RC8 run `30241092949/1`, RC9 exact-head matrix on `04ef57f31414ec5165e353abba74afb8dfdcc901` and implementation merge `70de95c73128e921cd4d7c667de0e5a442a9e0c0`; canonical OpenAPI authorization/privacy checks; Android auth/session storage, signing, Maps/FCM/Crashlytics and Play/Data Safety; customer/provider web BFF/private Cloud Run IAM; operations portal; UIA Issue #354; VC1–VC8 Design DNA; Phase 11/12 gates. |
| Implementation branch | None. PR #497 was squash-merged to `main`; RC9D is documentation/receipt closeout only. |
| Stable baseline | `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0` contains RC9A–RC9C. OpenAPI Generator `7.22.0` remains checksum-pinned; canonical OpenAPI SHA-256 is `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`; generated Kotlin/TypeScript trees remain deterministic and bounded runtime adoption is enforced. |
| Current task | RC9D closeout: reconcile status, ledger, receipt, permanent verifier and release the lane. No RC10 source work is included. |
| Governing issue | Issue #261 — Runtime integration closure after W8. RC9 is closed; UIA Issue #354 remains parked/read-only; RC10 is unclaimed. |
| Formal programme phase | Phase 11 real evidence remains open; formal Phase 12 production release is not authorized. |
| Production-release authorization | BLOCKED pending real Phase 11 evidence, 11J `PROCEED` and all global release gates. |""",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "## RC9 implementation contract — CLAIMED",
    "## RC9 implementation contract — CLOSED AND PRESERVED",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "10. RC9 closes only after the generator/versioning decision, deterministic drift proof, the approved incremental Kotlin slice, reviewed TypeScript adoption/decision, documentation reconciliation and exact-head regressions. No production, participant, privileged direct-access or payment authorization changes.",
    "10. RC9 is `CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION`: PR #497 exact head `04ef57f31414ec5165e353abba74afb8dfdcc901` passed the complete backend, Android, web/PWA, W7, security, runtime-audit, Phase 10–12 and RC5–RC9 matrix, then squash-merged at `70de95c73128e921cd4d7c667de0e5a442a9e0c0`. Generated imports remain limited to the reviewed Android auth wrapper and server-only BFF type adapter. No production, participant, privileged direct-access, provider-secret, payment-provider or real-money authorization changed.",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision. **CLAIMED — deterministic generation and incremental migration from `main@030cd577e179863b70f24d99ab237e74660b4325`; no production/participant or privileged direct-access change.**",
    "- RC9 — OpenAPI-generated Kotlin and TypeScript client adoption/decision. **CLOSED — deterministic generation, Android Firebase-session exchange adoption and server-only BFF type adoption merged through PR #497 at `70de95c73128e921cd4d7c667de0e5a442a9e0c0`; exact-head matrix passed on `04ef57f31414ec5165e353abba74afb8dfdcc901`; no production/participant or privileged direct-access change.**",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "RC9 is the sole active repository write lane. RC0–RC8 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC10+ source work must not begin until RC9 is closed or explicitly transitioned. Real-money, participant and production authorization remain blocked.",
    "The repository write lane is RELEASED. RC0–RC9 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC10+ source work must not begin until a new explicit claim is recorded from current `main`. Real-money, participant and production authorization remain blocked.",
)

# Project status.
replace_once(
    "PROJECT_STATUS.md",
    "**Active repository write lane:** RC9 OpenAPI-generated Kotlin/TypeScript client adoption under Issue #261; RC1–RC8 remain closed",
    "**Active repository write lane:** none — RC1–RC9 are closed under Issue #261; RC10 is next but unclaimed",
)
replace_once(
    "PROJECT_STATUS.md",
    "- runtime integration closure — **RC1–RC8 are closed at synthetic-only managed boundaries; RC9 is claimed and RC9A deterministic generated source is implemented but runtime-unwired, using canonical OpenAPI `1ea6b983c49c95db88db1a1432d9e6e0078fe124a3196f00c485b86dbe2db519` and pinned generator JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`**.",
    "- runtime integration closure — **RC1–RC9 are closed at their documented bounded boundaries. RC9 deterministic Kotlin/TypeScript generation and bounded Android/server-only BFF adoption merged at `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`, using canonical OpenAPI `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063` and pinned generator JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`**.",
)
replace_once(
    "PROJECT_STATUS.md",
    "- RC8 sandbox payments are **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** at source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`, run `30241092949/1`, artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`): MTN success, Stripe unpaid Checkout, PayPal unapproved order, immutable reconciliation and cleanup passed; application provider registration, DPO/Airtel/Flutterwave runtime binding, participant use and real money remain disabled;\n- payment rails may be sandbox-proven while real money remains disabled;",
    "- RC8 sandbox payments are **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** at source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3`, run `30241092949/1`, artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`): MTN success, Stripe unpaid Checkout, PayPal unapproved order, immutable reconciliation and cleanup passed; application provider registration, DPO/Airtel/Flutterwave runtime binding, participant use and real money remain disabled;\n- RC9 generated clients are **CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION** at implementation merge `70de95c73128e921cd4d7c667de0e5a442a9e0c0`: Kotlin and TypeScript generation are checksum-pinned and byte-drift enforced; Android uses the generated Firebase-session exchange behind a DIREKT-owned safe wrapper; the web uses generated auth types only behind the server-side BFF; direct browser/private API, privileged credentials, participant activation and production authority remain false;\n- payment rails may be sandbox-proven while real money remains disabled;",
)
replace_once(
    "PROJECT_STATUS.md",
    "VC1–VC8 and RC1–RC8 are closed at their documented boundaries. RC8 closed on exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` through run `30241092949/1` and artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`).\n\nRC9 is the sole active repository lane. RC9A deterministic source generation, immutable receipt, standalone compilation and byte-for-byte drift enforcement are implemented on PR #496 but remain regression/review pending and runtime-unwired. After RC9A merges, the approved order remains one incremental Kotlin auth/session slice, then TypeScript contract adoption only behind the server-side BFF, followed by cross-client closure. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts.",
    "VC1–VC8 and RC1–RC9 are closed at their documented boundaries. RC8 closed on exact source `ccc4e9463d810ddf554182b1607c22d3a7c8c8d3` through run `30241092949/1` and artifact `8643323319` (`sha256:bbb4600eb5a062552947e91c878dd09c6d1e4dc307ae4783c7fa1fb4cf6e4935`). RC9 implementation PR #497 passed its complete exact-head matrix on `04ef57f31414ec5165e353abba74afb8dfdcc901` and squash-merged to `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`.\n\nNo repository write lane is active. RC10 Turnstile threat-model work is next in sequence but unclaimed and must begin only through a new lock from current `main`. RC8 remains closed and does not authorize application payment-provider activation, participant payment data, production credentials/endpoints, real money, customer-to-provider payments, escrow, wallets or payouts. RC9 does not authorize browser-direct private API access, privileged client credentials, participant/production auth or release.",
)

# Current integration status register.
replace_once(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Fully generated Kotlin/TypeScript client packages | **RC9A IMPLEMENTED / RUNTIME UNWIRED / REGRESSION PENDING** | Generator 7.22.0 JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329` produces committed source from canonical OpenAPI `1ea6b983c49c95db88db1a1432d9e6e0078fe124a3196f00c485b86dbe2db519` with byte-for-byte drift enforcement and standalone Kotlin/TypeScript compilation. Android and BFF runtime imports remain false; RC9B/RC9C are separate. |",
    "| Fully generated Kotlin/TypeScript client packages | **RC9 CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION** | Generator 7.22.0 JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329` produces committed source from canonical OpenAPI `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`. Kotlin has 111 files/tree `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`; TypeScript has 98 files/tree `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`. Android imports the generated auth/session client only through its reviewed safe wrapper; TypeScript generated auth types remain server-only behind the BFF. |",
)
replace_once(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "11. RC9 generated Kotlin/TypeScript clients — **RC9A IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / RUNTIME UNWIRED**.",
    "11. RC9 generated Kotlin/TypeScript clients — **CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION**; PR #497 exact head `04ef57f31414ec5165e353abba74afb8dfdcc901` passed the full matrix and merged at `70de95c73128e921cd4d7c667de0e5a442a9e0c0`.",
)

# Live ledger.
replace_once(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Fully generated Kotlin client | `NOT ADOPTED` | Requires reviewed incremental migration after API shape stabilizes. |\n| Fully generated TypeScript client | `NOT ADOPTED` | Requires reviewed incremental migration after API shape stabilizes. |",
    "| Fully generated Kotlin client | `CLOSED — BOUNDED RUNTIME ADOPTION` | Deterministic generated tree is committed and byte-drift enforced. Android adopts only the Firebase-to-DIREKT session exchange behind the DIREKT-owned HTTPS-only/no-redirect/no-retry wrapper. |\n| Fully generated TypeScript client | `CLOSED — SERVER-ONLY TYPE ADOPTION` | Deterministic generated tree is committed and strict-typechecked. Generated auth request/response types are consumed only by the server-side BFF adapter; generated browser transport remains prohibited. |",
)
replace_once(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "11. RC9 OpenAPI generated Kotlin/TypeScript client adoption — **RC9A IMPLEMENTED / RUNTIME UNWIRED / EXACT-HEAD REGRESSION PENDING** from claimed baseline `main@658b72eadbeb2a9308a7b2e59dd7a81524fe0c5a`; generator `7.22.0` JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`; canonical OpenAPI `1ea6b983c49c95db88db1a1432d9e6e0078fe124a3196f00c485b86dbe2db519`; Kotlin `109` files/tree `ab6cd201e8a74df0c31319e882e3b419617a1539518f7151fa71ffe695c440c1`; TypeScript `96` files/tree `19aa7625ac7e338d01e9947dfaad8d5660cbe17ab9bdc912fb36e04fb659276f`; byte-for-byte drift and standalone compile gates active; Android auth/session remains the first later slice and TypeScript remains BFF-only.",
    "11. RC9 OpenAPI generated Kotlin/TypeScript client adoption — **CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION**. Generator `7.22.0` JAR `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`; canonical OpenAPI `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`; Kotlin `111` files/tree `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`; TypeScript `98` files/tree `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`. PR #497 exact head `04ef57f31414ec5165e353abba74afb8dfdcc901` passed the full regression matrix and merged at `70de95c73128e921cd4d7c667de0e5a442a9e0c0`. Android generated imports are confined to the reviewed auth wrapper; TypeScript generated imports are confined to the server-only BFF type adapter. Production/participant authorization and privileged direct access remain false.",
)
replace_once(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "## Evidence / receipt discipline",
    """### RC9 generated-client closure receipt

```text
Integration: OpenAPI-generated Kotlin and TypeScript client adoption (RC9)
Previous state: RC9A deterministic generated source merged; RC9B/RC9C bounded runtime adoption pending
New state: CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION
Claim base: 030cd577e179863b70f24d99ab237e74660b4325
RC9A merge: e43efc5050a792a902a1ca94113854541380b56e
Implementation PR/head: #497 / 04ef57f31414ec5165e353abba74afb8dfdcc901
Implementation merge: 70de95c73128e921cd4d7c667de0e5a442a9e0c0
Generator: OpenAPI Generator 7.22.0; JAR sha256 3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329
Canonical OpenAPI: sha256 1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063
Generated output: Kotlin 111 files/tree ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc; TypeScript 98 files/tree 04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe
Android adoption: generated AuthenticationApi/request/response used only through GeneratedPilotSessionExchangeClient; HTTPS-only; 10-second timeouts; redirects/retries disabled; consent, sign-out, encrypted session storage, push registration and API 23 preserved
Web adoption: generated auth request/response types only through server-side generated-auth-contracts adapter; Cloud Run IAM, DIREKT session headers, idempotency, timeout, no-store, redirect rejection and safe errors remain DIREKT-owned
Focused fixes: raw JSON date-time normalization; invalid date-time rejection; generated-import allowlist limited to the two reviewed adapters; compiler/build artifacts excluded from authored-source scan
Play/Data Safety: reviewed Retrofit/Kotlin serialization runtime dependencies inventoried; generated BODY logger is not activated because the DIREKT wrapper supplies its own safe OkHttp builder
Exact-head evidence: RC9 contract 30273733920; deterministic generation 30273733953; Phase 12B 30273729323; Android CI 30273725051; Android performance 30273725145; Backend CI 30273729628; Backend container 30273725018; W7 30273725334; PWA 30273725116 and 30273725164; supply-chain 30273729475; runtime audit 30273725181; Phase 12A 30273725138; Phase 12 final 30273725312; recovery 30273725407; Phase 11 synthetic 30273725194; RC5/RC6/RC7 30273725088/30273725104/30273725384; documentation 30273725186
Exact-main verification: squash merge commit exists at 70de95c73128e921cd4d7c667de0e5a442a9e0c0 with the reviewed PR content unchanged; relevant workflows are pull-request triggered and produced no separate push runs for the squash commit
Privacy/security: browser-direct private API false; privileged client credentials false; provider/database/payment secrets false; participant data false; production authorization false; payment-provider/real-money authorization false
Fallback/kill switch: existing DIREKT wrappers, BFF boundary, manual/error semantics and fail-closed configuration remain authoritative; generated transport defaults are not authorization, trust, payment, retry, idempotency or offline-success authority
Known blockers: none for RC9 closure; Phase 11 real evidence, 11J, legal/privacy and production-release gates remain externally open
Next exact step: RC10 Turnstile threat-model decision, only after a new explicit workstream claim; otherwise close as not currently justified
Ledger updated: YES
```

## Evidence / receipt discipline""",
)

# Implementation document state.
replace_once(
    "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md",
    "**State:** RC9B/RC9C IMPLEMENTED / EXACT-HEAD REGRESSION PENDING / BOUNDED RUNTIME ADOPTION",
    "**State:** RC9 CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION",
)
replace_once(
    "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md",
    "## RC9D closure sequence\n\nRC9 closes only after:\n\n1. canonical OpenAPI and generator drift checks pass;\n2. generated Kotlin produces real `.class` output and generated TypeScript passes strict typechecking;\n3. Android unit, lint, desugaring and APK/release-readiness gates pass;\n4. web type, auth, generated-adapter, PWA and cross-client gates pass;\n5. backend, operations, runtime-audit, supply-chain, Phase 10–12 and RC5–RC9 regressions pass on the exact PR head;\n6. PR #497 merges;\n7. the merged exact-main source is verified;\n8. status, ledger, lock and Issue #261 evidence are reconciled and the lane is released or explicitly transitioned to RC10.",
    "## RC9D closure evidence\n\nRC9 implementation PR #497 passed its complete exact-head matrix on `04ef57f31414ec5165e353abba74afb8dfdcc901` and squash-merged at `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`. The permanent RC9 contract and deterministic-generation workflows passed alongside Android CI/instrumentation, Android performance, backend/OpenAPI, web/PWA/W7, supply-chain, runtime audit, Phase 10–12 and RC5–RC7 preservation gates. The authoritative receipt is recorded in `RC9_CLOSURE_RECEIPT.md` and `LIVE_INTEGRATION_LEDGER.md`.\n\nThe repository lane is released after the RC9D closeout merge. RC10 is next but unclaimed; it must begin from current `main` through a new explicit claim.",
)

# Dedicated closure receipt.
receipt = ROOT / "docs/integrations/RC9_CLOSURE_RECEIPT.md"
receipt.write_text(
    """# RC9 Generated-Client Closure Receipt

**Integration:** OpenAPI-generated Kotlin and TypeScript client adoption  
**Governing issue:** #261  
**State:** CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION  
**Claim base:** `030cd577e179863b70f24d99ab237e74660b4325`  
**RC9A merge:** `e43efc5050a792a902a1ca94113854541380b56e`  
**Implementation PR:** #497  
**Exact implementation head:** `04ef57f31414ec5165e353abba74afb8dfdcc901`  
**Implementation merge:** `70de95c73128e921cd4d7c667de0e5a442a9e0c0`  
**Closeout PR:** CLOSEOUT_PR_PENDING

## Deterministic generation receipt

- OpenAPI Generator: `7.22.0`;
- generator JAR SHA-256: `3f1e6ce5c6ad4f15242c6170ab43aad4bad771622617eeece4a7d4f72ffaf329`;
- canonical OpenAPI SHA-256: `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`;
- Kotlin: 111 source files, tree SHA-256 `ba3e4b7ab4f2eeaf3fafd96bdf2bbbddfd2feb8ebbbe71f4f309c825eb7991cc`;
- TypeScript: 98 source files, tree SHA-256 `04cecfb32400eac04d5818ee1bb22e8394d822e2d350c8cfcc4f3a64eee982fe`;
- byte-for-byte regeneration, credential scanning, immutable receipts, real Kotlin `.class` output and strict TypeScript checking: enforced.

## Bounded runtime adoption

Android adopts only the Firebase-to-DIREKT session exchange through `GeneratedPilotSessionExchangeClient`. HTTPS-only origin validation, 10-second timeouts, redirects/retries disabled, consent, Firebase sign-out, encrypted session storage, push registration, existing error semantics and Android API 23 support remain intact.

The web consumes generated Firebase-auth request/response types only through the server-side BFF adapter. Cloud Run IAM, DIREKT bearer/session propagation, idempotency, timeout, `no-store`, redirect rejection and safe errors remain DIREKT-owned. Generated browser transport remains prohibited.

Generated imports remain fail-closed everywhere except the two reviewed adoption points. Raw JSON date-time strings are normalized; invalid values fail closed. The Play/Data Safety SDK inventory records the resolved Retrofit/Kotlin serialization dependency surface and verifies generated BODY logging is inactive.

## Exact-head regression evidence

| Gate | Run |
|---|---:|
| RC9 generated-client contract | `30273733920` |
| Deterministic generated clients | `30273733953` |
| Phase 12B Play readiness | `30273729323` |
| Android CI/instrumentation | `30273725051` |
| Android performance | `30273725145` |
| Backend CI | `30273729628` |
| Backend container | `30273725018` |
| W7 cross-client regression | `30273725334` |
| Customer/provider PWA | `30273725116`, `30273725164` |
| Supply-chain security | `30273729475` |
| Integration runtime audit | `30273725181` |
| Phase 12A reproducible AAB | `30273725138` |
| Phase 12 final readiness | `30273725312` |
| Phase 10 recovery | `30273725407` |
| Phase 11 synthetic pilot | `30273725194` |
| RC5 / RC6 / RC7 preservation | `30273725088`, `30273725104`, `30273725384` |
| Documentation quality | `30273725186` |

## Exact-main verification

The reviewed PR content was squash-merged unchanged at `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0`. The relevant workflows are pull-request triggered and therefore produced no separate push runs for the squash commit. RC9D is branched directly from that exact merge and reruns permanent closure contracts against the main-derived source.

## Authorization boundary

- browser-direct private API: false;
- privileged client credentials: false;
- provider/database/payment secrets in generated clients: false;
- participant data activation: false;
- production authentication/release authorization: false;
- payment-provider or real-money authorization: false.

RC9 closes generated-client tooling and the approved bounded adoption only. Phase 11 real evidence, 11J, legal/privacy and formal Phase 12 production-release gates remain open. RC10 is next but unclaimed.
""",
    encoding="utf-8",
)

# Permanent verifier: require closure state and receipt.
verifier = ROOT / "scripts/rc9/verify-generated-client-contract.py"
text = verifier.read_text(encoding="utf-8")
text = text.replace(
    '"""Verify the permanent RC9 generated-client architecture and claim contract."""',
    '"""Verify the permanent RC9 generated-client architecture and closure contract."""',
    1,
)
text = text.replace(
    'IMPLEMENTATION = ROOT / "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md"\n',
    'IMPLEMENTATION = ROOT / "docs/integrations/RC9_GENERATED_CLIENTS_IMPLEMENTATION.md"\nCLOSURE = ROOT / "docs/integrations/RC9_CLOSURE_RECEIPT.md"\n',
    1,
)
text = text.replace(
    '    IMPLEMENTATION,\n    BACKEND_PACKAGE,',
    '    IMPLEMENTATION,\n    CLOSURE,\n    BACKEND_PACKAGE,',
    1,
)
old_contract = '''require(LOCK, "CLAIMED — RC9 OpenAPI-generated client adoption")
require(LOCK, "RC9 implementation contract — CLAIMED")
require(LOCK, "RC9 is the sole active repository write lane")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "030cd577e179863b70f24d99ab237e74660b4325")
require(PROJECT, "Active repository write lane:** RC9 OpenAPI-generated Kotlin/TypeScript client adoption")
require(PROJECT, "RC9 is the sole active repository lane")
require(STATUS, "Fully generated Kotlin/TypeScript client packages")
require_any(
    STATUS,
    (
        "RC9A IMPLEMENTED / RUNTIME UNWIRED / REGRESSION PENDING",
        "RC9B/C IMPLEMENTED / BOUNDED RUNTIME ADOPTION / REGRESSION PENDING",
        "RC9 CLOSED",
    ),
    "RC9 state",
)
require(STATUS, "RC9 generated Kotlin/TypeScript clients")
require_any(
    LEDGER,
    (
        "RC9 OpenAPI generated Kotlin/TypeScript client adoption — **RC9A IMPLEMENTED / RUNTIME UNWIRED / EXACT-HEAD REGRESSION PENDING**",
        "RC9 OpenAPI generated Kotlin/TypeScript client adoption — **RC9B/C IMPLEMENTED / BOUNDED RUNTIME ADOPTION / EXACT-HEAD REGRESSION PENDING**",
        "RC9 OpenAPI generated Kotlin/TypeScript client adoption — **CLOSED**",
    ),
    "RC9 ledger state",
)
'''
new_contract = '''require(LOCK, "RELEASED — RC9 CLOSED AND PRESERVED")
require(LOCK, "RC9 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "The repository write lane is RELEASED")
require(LOCK, "RC10 is next but remains unclaimed")
require(LOCK, "RC8 implementation contract — CLOSED AND PRESERVED")
require(LOCK, "70de95c73128e921cd4d7c667de0e5a442a9e0c0")
require(PROJECT, "Active repository write lane:** none")
require(PROJECT, "RC1–RC9 are closed")
require(PROJECT, "RC10 is next but unclaimed")
require(STATUS, "Fully generated Kotlin/TypeScript client packages")
require(STATUS, "RC9 CLOSED — DETERMINISTIC / BOUNDED RUNTIME ADOPTION")
require(STATUS, "RC9 generated Kotlin/TypeScript clients — **CLOSED")
require(LEDGER, "RC9 OpenAPI generated Kotlin/TypeScript client adoption — **CLOSED")
require(LEDGER, "### RC9 generated-client closure receipt")
for needle in (
    "State:** CLOSED — DETERMINISTIC GENERATED CLIENTS / BOUNDED RUNTIME ADOPTION",
    "Implementation PR:** #497",
    "04ef57f31414ec5165e353abba74afb8dfdcc901",
    "70de95c73128e921cd4d7c667de0e5a442a9e0c0",
    "30273733920",
    "30273729323",
    "30273725051",
    "browser-direct private API: false",
    "production authentication/release authorization: false",
    "RC10 is next but unclaimed",
):
    require(CLOSURE, needle)
'''
if old_contract not in text:
    raise SystemExit("RC9 closeout verifier contract block not found")
text = text.replace(old_contract, new_contract, 1)
text = text.replace(
    'print("claim_base=030cd577e179863b70f24d99ab237e74660b4325")',
    'print("claim_base=030cd577e179863b70f24d99ab237e74660b4325")\nprint("implementation_merge=70de95c73128e921cd4d7c667de0e5a442a9e0c0")\nprint("closure_state=closed")\nprint("workstream_lane=released")\nprint("rc10_claimed=false")',
    1,
)
verifier.write_text(text, encoding="utf-8")

print("RC9_CLOSEOUT_PATCH|PASS")

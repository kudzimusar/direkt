#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = "47285575862cbf08845eaeabe093afea1ea79bd1"
RUN = "30234521983/1"
ARTIFACT = "8641270327"
DIGEST = "sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde"


def replace_once(path: str, old: str, new: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one occurrence, found {count}: {old!r}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def append_once(path: str, marker: str, block: str) -> None:
    target = ROOT / path
    text = target.read_text(encoding="utf-8")
    if block.strip() in text:
        return
    count = text.count(marker)
    if count != 1:
        raise AssertionError(f"{path}: expected one insertion marker, found {count}: {marker!r}")
    target.write_text(text.replace(marker, block + marker, 1), encoding="utf-8")


# Consume the one-shot trigger and preserve the exact successful receipt.
replace_once(
    "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md",
    "STATUS=ARMED",
    "STATUS=CONSUMED",
)
append_once(
    "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md",
    "After terminal managed evidence is recorded,",
    f"Closure receipt: exact main `{SOURCE}` passed managed run `{RUN}`. Artifact `{ARTIFACT}` has digest `{DIGEST}`. Backend service-identity OAuth, final APK key restriction, API 36 map readiness and cleanup all passed; participant and production authorization remained false.\n\n",
)

# Disable automatic main-push mutation after the one-shot trigger is consumed.
workflow = ".github/workflows/rc7-maps-managed.yml"
replace_once(
    workflow,
    '''  push:\n    branches:\n      - main\n    paths:\n      - ".github/workflows/rc7-maps-managed.yml"\n      - "scripts/rc7/run-maps-managed.sh"\n      - "scripts/rc7/collect-testlab-failure.py"\n      - "scripts/rc7/bootstrap-maps-managed.sh"\n      - "scripts/rc7/verify-maps-contract.py"\n      - "scripts/rc7/verify-managed-workflow-context.py"\n      - "backend/direkt-api/src/location/**"\n      - "backend/direkt-api/src/config/environment.ts"\n      - "backend/direkt-api/test/unit/location/**"\n      - "backend/direkt-api/test/unit/config/environment-maps.spec.ts"\n      - "android/direkt-app/app/src/androidTest/java/com/kudzimusar/direkt/Rc7MapsRuntimeTest.kt"\n      - "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/PrivacySafeMapCard.kt"\n      - "docs/integrations/RC7_MAPS_MANAGED_TRIGGER.md"\n      - "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md"\n''',
    "",
)
replace_once(
    workflow,
    "    if: github.event_name != 'pull_request'",
    "    if: github.event_name == 'workflow_dispatch'",
)

# Close and release the workstream lock while preserving all stop gates.
lock = "WORKSTREAM_LOCK.md"
replace_once(lock, "| Status | CLAIMED — RC7 Google Maps runtime integration |", "| Status | RELEASED — RC7 Google Maps runtime integration closed |")
replace_once(lock, "| Owner/agent | Active repository agent — Issue #261 RC7 Maps checkpoint. |", "| Owner/agent | None. RC7 is closed; RC8 requires an explicit new claim. |")
replace_once(
    lock,
    "| Authorized scope | Audit the existing PostGIS/discovery location boundary; activate only Maps SDK for Android and backend Geocoding needed for the reviewed RC7 flow; implement separate restricted credentials, privacy-safe map rendering, sanitized backend normalization, quotas, kill switch, manual/list fallback, managed synthetic evidence and exact-head regressions. Places and Routes remain excluded unless a separate reviewed need is proven. |",
    "| Authorized scope | No active write lane. Preserve RC0–RC7 evidence and all production/participant stop gates; RC8 sandbox payment work requires a separate explicit claim. |",
)
replace_once(
    lock,
    "| Implementation branch | `integration/runtime-closure-261`, fast-forwarded from exact `main@10cc243c1d051422b37e2f7481bba1dca4a2f5ed`. |",
    f"| Implementation branch | None after RC7 closure. Exact RC7 source: `{SOURCE}`. |",
)
replace_once(
    lock,
    "| Stable baseline | RC5 is closed at exact source `c3744430a7beb1cd47246d858df9ac1379a068ac` through isolated managed run `30183466799` and schema-valid artifact `8626329335`; RC6 is closed at run `30137700769`. UIA Issue #354 remains parked/open. Production and participant activation remain disabled. |",
    f"| Stable baseline | RC5 and RC6 remain closed. RC7 is closed at exact source `{SOURCE}` through managed run `{RUN}` and artifact `{ARTIFACT}` (`{DIGEST}`). UIA Issue #354 remains parked/open. Production and participant activation remain disabled. |",
)
replace_once(lock, "| Current task | RC7 — implement and prove privacy-safe Google Maps Android rendering plus backend-controlled Geocoding with separate credentials, bounded quotas, fallback and kill switch. |", "| Current task | None. RC7 is closed; RC8 is the next dependency-safe checkpoint but is not claimed. |")
replace_once(lock, "| Governing issue | Issue #261 — Runtime integration closure after W8. RC7 is the sole active bounded write lane; Issue #354 UIA remains parked/read-only. |", "| Governing issue | Issue #261 — Runtime integration closure after W8. RC7 is closed; Issue #354 UIA remains parked/read-only. |")
replace_once(lock, "## RC7 implementation contract — CLAIMED", "## RC7 implementation contract — CLOSED AND PRESERVED")
replace_once(
    lock,
    "9. Managed closure must prove exact reviewed source, restricted key/API metadata, backend synthetic Geocoding, Android map load and privacy-safe marker/service-area semantics while preserving the original failure evidence if any attempt fails.",
    f"9. Managed closure is proven on exact source `{SOURCE}` through run `{RUN}`: restricted key/API metadata, backend synthetic Geocoding, final APK restriction, API 36 map readiness and cleanup all passed. Artifact `{ARTIFACT}` (`{DIGEST}`) preserves the sanitized receipt; earlier failures remain preserved.",
)
replace_once(
    lock,
    "10. RC7 does not authorize participant Maps usage, private-location publication, production authentication, real communications, real money, Phase 11 exit or Phase 12 release.",
    "10. RC7 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY`. It does not authorize participant Maps usage, private-location publication, production authentication, real communications, real money, Phase 11 exit or Phase 12 release.",
)
replace_once(
    lock,
    "- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch. **CLAIMED — implementation and managed evidence in progress.**",
    f"- RC7 — Google Maps runtime activation with separate restricted Android/backend credentials, privacy-safe publication semantics, quotas, manual/list fallback and kill switch. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY — exact source `{SOURCE}`; run `{RUN}`; artifact `{ARTIFACT}` (`{DIGEST}`); production/participant authorization false.**",
)
replace_once(
    lock,
    "RC7 is the sole active repository write lane on `integration/runtime-closure-261`. RC0–RC6 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC8+ source work must not begin until RC7 is closed or explicitly transitioned. Production and participant authorization remain blocked.",
    "No repository write lane is active. RC0–RC7 evidence remains immutable/regression-protected, UIA Issue #354 remains parked/read-only, and RC8 source work requires an explicit new claim. Production and participant authorization remain blocked.",
)

# Promote the canonical status and ledger to the evidenced synthetic-only active state.
replace_once(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Exact-main run `30231743285/1` passed backend OAuth, budget, quota, clean no-cache build and semantic certificate extraction, proving one valid final APK SHA-1. The final APK certificate differed from the provisional build-time restriction, so the run failed closed before Test Lab. The correction re-restricts the same key to the actual packaged APK package+certificate pair, verifies metadata/API target, waits for propagation, and only then starts API 36 Test Lab. |",
    f"| Google Maps Platform | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY** | RC7 closed on exact source `{SOURCE}` through managed run `{RUN}`. Backend Geocoding v4 passed under the assigned Cloud Run service identity and address-only OAuth scope; the Android key was restricted to the final packaged APK certificate and Maps SDK target; API 36 Test Lab passed 1/1 with zero flaky retries; cleanup passed. Artifact `{ARTIFACT}` has digest `{DIGEST}`. Manual/list fallback remains active; production/participant Maps and private-coordinate publication remain disabled. |",
)
replace_once(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT remain prohibited. Run `30231743285/1` on `bcb30008c245a6a10ae3348b831259cef6dee441` passed WIF, fresh owner budget attestation, quota, immutable backend OAuth canary, clean no-cache build, semantic certificate parsing and cleanup. Artifact `8640363497`, digest `sha256:dfb312b7bebb8bbb2d6b45e2bd2d008fb04fa1475f6cfc73eaf4353f88bc9d83`, recorded one valid final APK SHA-1 (`73B272B19F9FAAF4EA02DEA0790B96B7675A6490`) that differed from the provisional restriction (`236674CF2789751759438E78E43A63A3584F44E0`); no Test Lab matrix was created. The correction verifies a final package+APK-certificate key restriction before Test Lab. |",
    f"| Google Maps Platform | `ACTIVE — SYNTHETIC-ONLY MANAGED CANARY` | RC7 closed on exact source `{SOURCE}` through run `{RUN}`. WIF, fresh owner budget attestation, 60/min Geocoding quota, immutable backend service-identity OAuth canary, clean no-cache APK build, one valid final APK certificate, exact final Android key restriction, API 36 Test Lab map-ready assertion (1/1, zero flaky retries), and Cloud Run cleanup all passed. Artifact `{ARTIFACT}`, digest `{DIGEST}`. Backend keys, Maps secrets, Direct VPC egress, Cloud NAT, Places, Routes, participant use, production authorization and private-coordinate publication remain prohibited/disabled. |",
)

# Record the terminal receipt in the RC7 implementation notes.
replace_once("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md", "**Status:** Claimed; corrective source and managed proof in progress", "**Status:** CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY")
replace_once("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md", "**Corrective baseline:** `main@bcb30008c245a6a10ae3348b831259cef6dee441`", f"**Closure source:** `main@{SOURCE}`")
append_once(
    "docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md",
    "## Credential and authentication boundary",
    f"## Closure receipt\n\nExact-main managed run `{RUN}` on `{SOURCE}` completed successfully. The contract job and privacy-safe runtime job both passed. Backend service-identity OAuth Geocoding returned `PASS`; the clean APK exposed one valid certificate; the Android key was re-restricted to that final certificate and Maps SDK target; Firebase Test Lab `MediumPhone.arm` API 36 passed 1/1 with zero flaky retries; manual/list fallback remained available; Cloud Run cleanup passed. Artifact `{ARTIFACT}` has digest `{DIGEST}`. The trigger is consumed and automatic main-push execution is removed. Production authorization, participant data and private-provider-coordinate publication all remained false.\n\n",
)

# Reconcile project-level status.
project = "PROJECT_STATUS.md"
replace_once(project, "**Updated:** 2026-07-26 (Asia/Tokyo)", "**Updated:** 2026-07-27 (Asia/Tokyo)")
replace_once(project, "**Active repository write lane:** none; RC5 and RC6 are closed at synthetic-only managed boundaries", "**Active repository write lane:** none; RC1–RC7 are closed at documented synthetic-only managed boundaries")
replace_once(project, "- runtime integration closure — **RC1–RC6 are closed at synthetic-only managed boundaries; RC5 Firebase Test Lab passed the isolated API 26/33/36 managed matrix**.", "- runtime integration closure — **RC1–RC7 are closed at synthetic-only managed boundaries; RC7 Google Maps passed backend OAuth and API 36 map-ready evidence**.")
replace_once(project, "- Maps and other externally provisioned integrations require their own runtime evidence before being represented as active;", f"- RC7 Google Maps is **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED CANARY** at source `{SOURCE}`, run `{RUN}`, artifact `{ARTIFACT}` (`{DIGEST}`); participant/production Maps and private-coordinate publication remain disabled; other integrations still require their own runtime evidence before being represented as active;")
replace_once(project, "VC1–VC8 and RC1–RC6 are closed at their documented boundaries. No active repository write lane exists.", "VC1–VC8 and RC1–RC7 are closed at their documented boundaries. No active repository write lane exists.")
replace_once(
    project,
    "RC7 Google Maps is the next dependency-safe integration checkpoint, but it is **not claimed or started** by RC5 closure. Before RC7 source changes:\n\n1. start from current merged `main`;\n2. recheck RC5/RC6 exact-head evidence and the current integration ledger;\n3. claim a new bounded lane in `WORKSTREAM_LOCK.md`;\n4. preserve privacy-safe publication, manual/list fallback, quotas, kill switch and private-coordinate non-leakage;\n5. keep participant/production authorization and formal Phase 12 release blocked.",
    "RC8 sandbox-only payment-provider reconciliation is the next dependency-safe integration checkpoint, but it is not claimed. Before RC8 source changes:\n\n1. start from current merged `main`;\n2. recheck RC0–RC7 exact-head evidence and the current integration ledger;\n3. claim a new bounded lane in `WORKSTREAM_LOCK.md`;\n4. keep all real-money movement, escrow and participant/production authorization disabled;\n5. preserve backend-authoritative ledger/webhook reconciliation and all verification/trust separation rules.",
)

# Convert the permanent verifiers from implementation-gated to closed-state assertions.
contract = "scripts/rc7/verify-maps-contract.py"
replace_once(contract, '        "CLAIMED — RC7 Google Maps runtime integration",', '        "RELEASED — RC7 Google Maps runtime integration closed",')
replace_once(contract, '        "RC7 implementation contract — CLAIMED",', '        "RC7 implementation contract — CLOSED AND PRESERVED",')
replace_once(contract, '        "RC7 is the sole active repository write lane",', '        "No repository write lane is active",')
replace_once(contract, '    require(status, "IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS", "current Maps state")', '    require(status, "ACTIVE — SYNTHETIC-ONLY MANAGED CANARY", "closed Maps state")')
replace_once(contract, '    require(ledger, "IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS", "live Maps ledger state")', '    require(ledger, "ACTIVE — SYNTHETIC-ONLY MANAGED CANARY", "closed Maps ledger state")')
replace_once(contract, '        "branches:\\n      - main",', '        "if: github.event_name == \'workflow_dispatch\'",')
replace_once(
    contract,
    '    if not any(state in managed_trigger for state in ("STATUS=ARMED", "STATUS=CONSUMED")):\n        raise AssertionError("Managed RC7 trigger must be ARMED before proof or CONSUMED after closure.")',
    '    require(managed_trigger, "STATUS=CONSUMED", "consumed managed proof trigger")\n    prohibit(managed_workflow, r"^  push:", "automatic RC7 main-push execution after closure")',
)
replace_once(contract, '    print("managed_proof=exact_main_wif_cost_bounded")', '    print("managed_proof=closed_exact_main_wif_cost_bounded")')

context = "scripts/rc7/verify-managed-workflow-context.py"
insert_marker = '    workflow = WORKFLOW.read_text(encoding="utf-8")\n'
insert_block = '''    workflow = WORKFLOW.read_text(encoding="utf-8")\n    if re.search(r"^  push:", workflow, flags=re.MULTILINE):\n        raise AssertionError("Closed RC7 workflow must not run automatically on main pushes.")\n    require_once(\n        workflow,\n        "if: github.event_name == 'workflow_dispatch'",\n        "Closed RC7 managed mutation must be manual-dispatch only.",\n    )\n'''
replace_once(context, insert_marker, insert_block)
replace_once(context, '    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")', '    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")\n    print("automatic_main_push=false")\n    print("managed_trigger=consumed")')

print("RC7_CLOSURE_PATCH|PASS")

#!/usr/bin/env python3
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXPECTED_REF = "refs/heads/docs/rc5-closure"
PROVEN_SOURCE = "c3744430a7beb1cd47246d858df9ac1379a068ac"
PROVEN_RUN = "30183466799"
PROVEN_ARTIFACT = "8626329335"
PROVEN_DIGEST = "sha256:03a40951a23c937d8b0fd2990a7d2652afbd1172631c0b480af756aebd92a843"
PROJECT_ID = "direkt-testlab-502701-20260726"
PROJECT_NUMBER = "482116157386"


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise SystemExit(f"required file missing: {path}")
    return target.read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    target = ROOT / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


def remove_if_present(path: str) -> None:
    target = ROOT / path
    if target.exists():
        if not target.is_file():
            raise SystemExit(f"refusing to remove non-file: {path}")
        target.unlink()


if os.environ.get("GITHUB_REF") != EXPECTED_REF:
    raise SystemExit(f"closure builder may run only on {EXPECTED_REF}")

# WORKSTREAM_LOCK.md
path = "WORKSTREAM_LOCK.md"
text = read(path)
replacements = [
    (
        "| Status | CLAIMED — RC5 Firebase Test Lab device-matrix closure |",
        "| Status | RELEASED — RC5 Firebase Test Lab device-matrix closure complete; RC7 not claimed |",
        "lock status",
    ),
    (
        "| Owner/agent | Active repository agent — Issue #261 runtime integration closure, resumed RC5 Firebase Test Lab checkpoint. |",
        "| Owner/agent | No active repository write lane. RC5 is closed and preserved under Issue #261; later RC7+ work requires a new explicit claim. |",
        "lock owner",
    ),
    (
        "| Authorized scope | RC5 only: complete final owner-side read-only verification of the existing least-privilege Test Lab resources, execute the exact-current-main managed Firebase Test Lab matrix through the preserved proof bridge, retain sanitized artifacts/results, reconcile the permanent verifier/status ledger and close RC5 only on machine-enforced success. No UIA source changes, RC6 changes, Maps, payments, generated-client migration, Turnstile, production auth, real-participant activation or production release is authorized in this lane. |",
        "| Authorized scope | No active implementation scope. RC5 closure evidence and permanent isolated Test Lab workflow/verifier are preserved. UIA remains parked; RC7 Maps, payments, generated clients, Turnstile, production auth, real-participant activation and production release are not authorized without a new bounded claim. |",
        "authorized scope",
    ),
    (
        "| Protected surface | Closed RC6 WhatsApp source/workflows and managed evidence run `30137700769`; UIA browser/Android/operations owner-review surfaces and Issue #354; backend/database/OpenAPI trust and authorization boundaries; private API/BFF IAM; operations authorization/private evidence controls; payments; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety; RC0–RC4 closure evidence. |",
        "| Protected surface | Closed RC0–RC6 evidence, including RC5 managed run `30183466799` and RC6 managed run `30137700769`; UIA Issue #354; backend/database/OpenAPI trust boundaries; private API/BFF IAM; payments; VC1–VC8 Design DNA; Phase 11/12 gates; Android auth/signing/Play/Data Safety. |",
        "protected surface",
    ),
    (
        "| Implementation branch | `integration/rc5-readonly-preflight-498f606` from exact current `main@498f606195edfed75f29535d7b93e8038681287c`. |",
        "| Implementation branch | None — closure reconciliation branch only; no later runtime lane is claimed. |",
        "implementation branch",
    ),
    (
        "| Stable baseline | RC6 is closed/preserved at `main@498f606195edfed75f29535d7b93e8038681287c`; managed run `30137700769` and initial failure Issue #404 remain preserved, with participant/production WhatsApp disabled. RC5 source PR #377, IAM correction PR #379 and the owner-created least-privilege roles/results bucket remain preserved. Draft PR #378 is stale and unmergeable against current main; it must remain unmerged and be replaced only after the new exact-current-main read-only infrastructure preflight proves `RESULT|ready` with no resource mutation or Test Lab matrix execution. UIA Issue #354 remains parked/open. |",
        f"| Stable baseline | RC5 is closed at exact source `{PROVEN_SOURCE}` through isolated managed run `{PROVEN_RUN}` and schema-valid artifact `{PROVEN_ARTIFACT}`; failures remain preserved in their issues. RC6 remains closed at run `30137700769`. UIA Issue #354 remains parked/open. Production and participant activation remain disabled. |",
        "stable baseline",
    ),
    (
        "| Current task | RC5 — execute an exact-current-main read-only Test Lab infrastructure/catalog preflight, publish a sanitized dedicated receipt, and authorize a synchronized managed matrix bridge only if the receipt is ready. |",
        "| Current task | None. RC5 closure reconciliation is complete; RC7+ remains blocked until explicitly claimed and re-coordinated. |",
        "current task",
    ),
    (
        "| Governing issue | Issue #261 — Runtime integration closure after W8. RC6 is closed at its synthetic-only managed boundary; Issue #354 UIA remains parked/open; RC5 is resumed/open. |",
        "| Governing issue | Issue #261 — Runtime integration closure after W8. RC5 and RC6 are closed at synthetic-only managed boundaries; Issue #354 UIA remains parked/open. |",
        "governing issue",
    ),
    (
        "- W8 implementation claim is **RELEASED**. Current implementation ownership is RC5 under Issue #261 as declared in the Current lock table above.",
        "- W8 implementation claim is **RELEASED**. No later implementation lane is currently claimed; RC5 closure is preserved below.",
        "W8 ownership note",
    ),
    (
        "## RC5 implementation contract — ACTIVE — SOURCE COMPLETE; MANAGED MATRIX PENDING",
        "## RC5 implementation contract — CLOSED AND PRESERVED",
        "RC5 heading",
    ),
    (
        "7. GitHub Actions must authenticate through existing Workload Identity Federation and use the narrowest practical Test Lab/result-storage permissions; project Editor/Owner and long-lived service-account keys are prohibited.",
        "7. GitHub Actions authenticates through existing Workload Identity Federation. Broad Test Lab authority is confined to the dedicated, empty Spark project `direkt-testlab-502701-20260726`; `roles/editor` is isolated there, `roles/owner` and service-account keys remain prohibited, and the main DIREKT project receives no broadening.",
        "RC5 authority rule",
    ),
    (
        "10. RC5 remains `IMPLEMENTED_GATED / MANAGED MATRIX PENDING` until final owner-controlled resource verification, exact-current-main managed Test Lab execution, sanitized result/artifact evidence, permanent verifier promotion and status/ledger reconciliation are complete. Draft PR #378 is preserved and may proceed only after the owner-side verification checkpoint passes; it must not merge on assumed or stale infrastructure state.",
        f"10. RC5 is `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX`: exact source `{PROVEN_SOURCE}` passed run `{PROVEN_RUN}` on `MediumPhone.arm` API 26, 33 and 36 with zero flaky retries. Artifact `{PROVEN_ARTIFACT}` (`{PROVEN_DIGEST}`) is schema-valid. Participant/production authorization remains false; historical failures and superseded v2 infrastructure remain evidence only.",
        "RC5 closure rule",
    ),
    (
        "9. UIA Issue #354 remains open for remaining owner-access/acceptance evidence but is read-only/parked while RC5 owns the single write lane.",
        "9. UIA Issue #354 remains open and parked. RC5 no longer owns a write lane; UIA or RC7+ requires an explicit new claim before source changes.",
        "UIA lane rule",
    ),
    (
        "- RC5 — Firebase Test Lab device-matrix automation. **ACTIVE RESUMED / NOT CLOSED — source PR #377 plus IAM correction PR #379 are merged; least-privilege custom roles and dedicated results bucket are preserved; final owner-side verification and exact-current-main managed matrix proof remain required; draft PR #378 is preserved and gated on verified infrastructure state.**",
        f"- RC5 — Firebase Test Lab device-matrix automation. **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX — dedicated Spark project `{PROJECT_ID}`; exact source `{PROVEN_SOURCE}`; managed run `{PROVEN_RUN}`; API 26/33/36; zero flaky retries; participant/production authorization false.**",
        "RC5 sequence",
    ),
    (
        "RC5 Firebase Test Lab is the sole active implementation lane under Issue #261. RC6 is closed and preserved at its synthetic-only managed boundary; its provider, secret, webhook and production-disable controls must not be weakened. PR #378 may proceed only after final owner-side read-only verification confirms the existing least-privilege resources, and RC5 cannot be represented as closed without exact-current-main managed Test Lab proof. UIA Issue #354 remains parked/read-only. RC7+ source work must not begin until RC5 releases or is explicitly re-coordinated.",
        "No active implementation lane exists. RC5 and RC6 are closed and preserved at synthetic-only managed boundaries. UIA Issue #354 remains parked/read-only. RC7+ source work must not begin until a new explicit bounded claim is recorded; production and participant authorization remain blocked.",
        "conflict rule",
    ),
]
for old, new, label in replacements:
    text = replace_once(text, old, new, label)
write(path, text)

# PROJECT_STATUS.md
path = "PROJECT_STATUS.md"
text = read(path)
text = replace_once(text, "**Updated:** 2026-07-25 (Asia/Tokyo)", "**Updated:** 2026-07-26 (Asia/Tokyo)", "project status date")
text = replace_once(text, "**Active repository write lane:** RC5 Firebase Test Lab resumed under Issue #261; RC6 closed at its synthetic-only managed boundary", "**Active repository write lane:** none; RC5 and RC6 are closed at synthetic-only managed boundaries", "project active lane")
text = replace_once(text, "- runtime integration closure — **RC1–RC4 and RC6 are closed at synthetic-only managed boundaries; RC5 Firebase Test Lab is resumed and remains open pending final owner verification plus exact-current-main matrix proof**.", "- runtime integration closure — **RC1–RC6 are closed at synthetic-only managed boundaries; RC5 Firebase Test Lab passed the isolated API 26/33/36 managed matrix**.", "programme state")
text = replace_once(text, "- Maps and other externally provisioned integrations require their own runtime evidence before being represented as active;", f"- RC5 Firebase Test Lab is **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**: isolated project `{PROJECT_ID}`, exact source `{PROVEN_SOURCE}`, run `{PROVEN_RUN}`, API 26/33/36 and zero flaky retries;\n- Maps and other externally provisioned integrations require their own runtime evidence before being represented as active;", "integration truth")
old_next = """## 9. Next execution rule

VC1–VC8 and Issue #259 are closed. No active repository write lane exists.

The next planned material checkpoint is **RC2 — Sentry API/portal runtime observability** under Issue #261. Before RC2 source changes:

1. start from current merged `main`;
2. recheck predecessor exact-head regressions and current integration ledger;
3. claim a new bounded workstream lane in `WORKSTREAM_LOCK.md`;
4. preserve all VC, trust, privacy, integration and Phase 11/12 release controls;
5. close RC2 only with the source/runtime/privacy/managed-evidence requirements in the runtime-integration closure plan.
"""
new_next = """## 9. Next execution rule

VC1–VC8 and RC1–RC6 are closed at their documented boundaries. No active repository write lane exists.

RC7 Google Maps is the next dependency-safe integration checkpoint, but it is **not claimed or started** by RC5 closure. Before RC7 source changes:

1. start from current merged `main`;
2. recheck RC5/RC6 exact-head evidence and the current integration ledger;
3. claim a new bounded lane in `WORKSTREAM_LOCK.md`;
4. preserve privacy-safe publication, manual/list fallback, quotas, kill switch and private-coordinate non-leakage;
5. keep participant/production authorization and formal Phase 12 release blocked.
"""
text = replace_once(text, old_next, new_next, "project next rule")
write(path, text)

# CURRENT_INTEGRATION_STATUS.md
path = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
text = read(path)
text = replace_once(text, "**Authoritative as-of date:** 2026-07-25 (Asia/Tokyo)", "**Authoritative as-of date:** 2026-07-26 (Asia/Tokyo)", "status date")
text = replace_once(text, "Managed project: `direkt-dev-502701` (`264358173369`), region `asia-northeast1`.", f"Managed application project: `direkt-dev-502701` (`264358173369`), region `asia-northeast1`. Dedicated synthetic Test Lab project: `{PROJECT_ID}` (`{PROJECT_NUMBER}`), Spark plan/billing disabled; broad Test Lab execution authority is isolated there only.", "managed projects")
text = replace_once(text, "| Firebase Test Lab | **ACTIVE RESUMED CHECKPOINT / IMPLEMENTED_GATED — MANAGED MATRIX PENDING** | RC5 source repairs the current Android instrumentation contract, executes it in Android CI, builds an exact-source Test Lab workflow, selects a 2–3 device matrix from the live virtual catalog, and preserves the owner-provisioned custom-role/dedicated-results-bucket boundary. Final owner-side verification and exact-current-main managed matrix evidence remain required before closure. |", f"| Firebase Test Lab | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX** | Dedicated Spark project `{PROJECT_ID}`; exact source `{PROVEN_SOURCE}` passed managed run `{PROVEN_RUN}` on `MediumPhone.arm` API 26, 33 and 36 with zero flaky retries. Artifact `{PROVEN_ARTIFACT}` digest `{PROVEN_DIGEST}` was schema-validated. Results use Firebase-managed default storage inside the isolated project. Participant/production authorization remains false. |", "Firebase Test Lab status")
text = replace_once(text, "7. RC5 Firebase Test Lab — **ACTIVE RESUMED / NOT CLOSED — IMPLEMENTED_GATED / MANAGED MATRIX PENDING**; source contract, local instrumentation, least-privilege roles and dedicated results bucket are preserved. Final owner-side read-only verification and exact-current-main managed Test Lab evidence remain required before closure.", f"7. RC5 Firebase Test Lab — **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**; isolated project `{PROJECT_ID}`, exact source `{PROVEN_SOURCE}`, managed run `{PROVEN_RUN}`, API 26/33/36, zero flaky retries and production authorization false.", "status RC5 sequence")
write(path, text)

# LIVE_INTEGRATION_LEDGER.md
path = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
text = read(path)
text = replace_once(text, "**Last reconciled:** 2026-07-25 (Asia/Tokyo)", "**Last reconciled:** 2026-07-26 (Asia/Tokyo)", "ledger date")
text = replace_once(text, "| Google Cloud project | `ACTIVE` | `direkt-dev-502701`, project number `264358173369`. |", f"| Google Cloud application project | `ACTIVE` | `direkt-dev-502701`, project number `264358173369`. |\n| Firebase Test Lab isolated project | `ACTIVE — SYNTHETIC TESTING ONLY` | `{PROJECT_ID}`, project number `{PROJECT_NUMBER}`, Spark plan/billing disabled; existing GitHub WIF deployer has `roles/editor` only in this empty Test Lab project; no service-account key, participant data or production workloads. |", "ledger project rows")
text = replace_once(text, "| Firebase Test Lab | `ACTIVE RESUMED / NOT CLOSED — IMPLEMENTED_GATED / MANAGED MATRIX PENDING` | RC5 source and local instrumentation are integrated; least-privilege custom roles and dedicated 30-day results bucket are preserved. Final owner-side read-only verification and exact-current-main managed matrix proof remain required. Draft proof bridge #378 remains preserved and gated on verified infrastructure state; no production/participant authorization is created. |", f"| Firebase Test Lab | `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX` | Exact source `{PROVEN_SOURCE}` passed run `{PROVEN_RUN}` in isolated Spark project `{PROJECT_ID}` on `MediumPhone.arm` API 26, 33 and 36 with zero flaky retries. Artifact `{PROVEN_ARTIFACT}` digest `{PROVEN_DIGEST}` is schema-valid. Firebase-managed results remain synthetic/public-safe; production/participant authorization is false. |", "ledger Test Lab row")
marker = "### RC6 WhatsApp Cloud API closure receipt"
receipt = f"""### RC5 Firebase Test Lab closure receipt

```text
Integration: Firebase Test Lab Android device-matrix automation (RC5)
Previous state: IMPLEMENTED_GATED / MANAGED MATRIX PENDING
New state: CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX
Isolated project: {PROJECT_ID} ({PROJECT_NUMBER}), Spark plan, billing disabled
Identity: direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com through existing GitHub Workload Identity Federation; roles/editor scoped only to the isolated Test Lab project; no service-account key
Exact proven source: {PROVEN_SOURCE}
Managed execution: run {PROVEN_RUN}/1 completed SUCCESS
Matrix: MediumPhone.arm / API 26, API 33 and API 36; en; portrait; exactly three devices
Execution controls: flaky retries 0; orchestrator false; video false; performance metrics false; automatic Google login false; five-minute timeout
Artifact: {PROVEN_ARTIFACT}; digest {PROVEN_DIGEST}; schema direkt.rc5.isolated-test-lab-receipt.v1; result passed; exitCode 0; category PASSED
Data boundary: synthetic-public-safe-only; participantData false; productionAuthorization false; Firebase-managed default results storage inside isolated project
Historical evidence: failed v2/private-input and selector-newline attempts remain preserved in their GitHub issues and were not rewritten as passes
```

"""
if marker not in text:
    raise SystemExit("ledger RC6 marker missing")
text = text.replace(marker, receipt + marker, 1)
write(path, text)

# RC5 isolated lane documentation
path = "docs/integrations/RC5_ISOLATED_TEST_LAB.md"
text = read(path)
text = replace_once(text, "RC5 remains open until a managed Android instrumentation matrix passes on all selected virtual devices with zero flaky retries.", f"RC5 is closed at the synthetic-only managed boundary. Exact source `{PROVEN_SOURCE}` passed managed run `{PROVEN_RUN}/1` on all three selected virtual devices with zero flaky retries.", "isolated doc state")
text = replace_once(text, "A successful preflight does not close RC5. Closure requires a schema-valid managed receipt with `result: passed`, exit code zero, three selected targets and all enforced runtime controls, followed by regression and documentation reconciliation.", f"Canonical closure evidence is Issue #449 and artifact `{PROVEN_ARTIFACT}` (`{PROVEN_DIGEST}`): schema-valid receipt `result: passed`, exit code zero, category `PASSED`, three selected targets, and all enforced runtime controls. This closure does not authorize participants, production authentication, private evidence, external communications, real payments or production release.", "isolated doc closure")
write(path, text)

# Permanent closure verifier.
write(
    "scripts/rc5/verify-test-lab-closure.py",
    f'''#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

def read(path: str) -> str:
    target = ROOT / path
    assert target.is_file(), f"missing {{path}}"
    return target.read_text(encoding="utf-8")

lock = read("WORKSTREAM_LOCK.md")
status = read("PROJECT_STATUS.md")
register = read("docs/integrations/CURRENT_INTEGRATION_STATUS.md")
ledger = read("docs/integrations/LIVE_INTEGRATION_LEDGER.md")
doc = read("docs/integrations/RC5_ISOLATED_TEST_LAB.md")
workflow = read(".github/workflows/firebase-test-lab-isolated.yml")
contract = read(".github/workflows/rc5-test-lab-isolated-contract.yml")
runner = read("scripts/rc5/run-test-lab-isolated-managed.sh")

for text in (lock, status, register, ledger, doc):
    assert "{PROVEN_SOURCE}" in text
    assert "{PROVEN_RUN}" in text
    assert "{PROJECT_ID}" in text

assert "RC5 implementation contract — CLOSED AND PRESERVED" in lock
assert "CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX" in lock
assert "No active implementation lane exists" in lock
assert "RC7+ source work must not begin until a new explicit bounded claim" in lock
assert "Firebase Test Lab | **CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX**" in register
assert "Firebase Test Lab | `CLOSED — ACTIVE SYNTHETIC-ONLY MANAGED MATRIX`" in ledger
assert "{PROVEN_ARTIFACT}" in register and "{PROVEN_ARTIFACT}" in ledger
assert "{PROVEN_DIGEST}" in register and "{PROVEN_DIGEST}" in ledger
assert "DIREKT Firebase Test Lab isolated Android matrix" in workflow
assert "RUN-DIREKT-ISOLATED-TEST-LAB" in workflow
assert "DIREKT RC5 isolated Test Lab contract" in contract
assert '--num-flaky-test-attempts 0' in runner
assert '--no-use-orchestrator' in runner
assert '--no-record-video' in runner
assert '--no-performance-metrics' in runner
assert '--no-auto-google-login' in runner
assert 'productionAuthorization: false' in runner
assert 'participantData: false' in runner

obsolete = {[
    '.github/workflows/firebase-test-lab.yml',
    '.github/workflows/firebase-test-lab-managed.yml',
    '.github/workflows/rc5-test-lab-contract.yml',
    '.github/workflows/rc5-test-lab-preflight.yml',
    '.github/workflows/rc5-test-lab-preflight-once.yml',
    '.github/workflows/rc5-test-lab-managed-v2-contract.yml',
    '.github/workflows/rc5-test-lab-managed-v2-proof-contract.yml',
    '.github/workflows/rc5-test-lab-managed-v2-proof-once.yml',
    '.github/workflows/rc5-test-lab-managed-v2-retry-contract.yml',
    '.github/workflows/rc5-test-lab-managed-v2-retry-once.yml',
    '.github/workflows/rc5-test-lab-input-readback-contract.yml',
    '.github/workflows/rc5-test-lab-input-readback-once.yml',
    '.github/workflows/rc5-test-lab-isolated-preflight-once.yml',
    '.github/workflows/rc5-test-lab-isolated-proof-contract.yml',
    '.github/workflows/rc5-test-lab-isolated-proof-once.yml',
]}
for path in obsolete:
    assert not (ROOT / path).exists(), f"obsolete RC5 workflow remains: {{path}}"

print("rc5_test_lab_closure=PASS")
print("managed_run={PROVEN_RUN}")
print("matrix=api26_api33_api36_zero_flaky_retries")
print("production_authorization=false")
''',
)
write(
    ".github/workflows/rc5-test-lab-closure-contract.yml",
    '''name: DIREKT RC5 Test Lab closure contract

"on":
  pull_request:
    branches:
      - main
    paths:
      - WORKSTREAM_LOCK.md
      - PROJECT_STATUS.md
      - docs/integrations/**
      - scripts/rc5/**
      - .github/workflows/*test-lab*
  push:
    branches:
      - main
    paths:
      - WORKSTREAM_LOCK.md
      - PROJECT_STATUS.md
      - docs/integrations/**
      - scripts/rc5/**
      - .github/workflows/*test-lab*

permissions:
  contents: read

jobs:
  verify:
    name: Verify closed isolated Test Lab evidence and permanent controls
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-python@v6
        with:
          python-version: "3.13"
      - name: Verify RC5 closure
        run: python3 scripts/rc5/verify-test-lab-closure.py
      - name: Parse permanent Test Lab workflows and shell
        shell: bash
        run: |
          set -euo pipefail
          ruby -e 'require "yaml"; YAML.safe_load(File.read(".github/workflows/firebase-test-lab-isolated.yml"), aliases: true); YAML.safe_load(File.read(".github/workflows/rc5-test-lab-isolated-contract.yml"), aliases: true)'
          bash -n scripts/rc5/run-test-lab-isolated-managed.sh
          bash -n scripts/rc5/run-test-lab-isolated-preflight.sh
      - name: Publish closure summary
        shell: bash
        run: |
          {
            echo '### RC5 Firebase Test Lab closure'
            echo '- Exact source: `c3744430a7beb1cd47246d858df9ac1379a068ac`'
            echo '- Managed run: `30183466799/1`'
            echo '- Matrix: API 26 / 33 / 36, zero flaky retries'
            echo '- Project: isolated Spark Test Lab only'
            echo '- Participant/production authorization: false'
          } >> "${GITHUB_STEP_SUMMARY}"
''',
)

# Remove obsolete execution bridges and superseded active v2 workflows. History remains in Git and issues.
obsolete_files = [
    ".github/workflows/firebase-test-lab.yml",
    ".github/workflows/firebase-test-lab-managed.yml",
    ".github/workflows/rc5-test-lab-contract.yml",
    ".github/workflows/rc5-test-lab-preflight.yml",
    ".github/workflows/rc5-test-lab-preflight-once.yml",
    ".github/workflows/rc5-test-lab-managed-v2-contract.yml",
    ".github/workflows/rc5-test-lab-managed-v2-proof-contract.yml",
    ".github/workflows/rc5-test-lab-managed-v2-proof-once.yml",
    ".github/workflows/rc5-test-lab-managed-v2-retry-contract.yml",
    ".github/workflows/rc5-test-lab-managed-v2-retry-once.yml",
    ".github/workflows/rc5-test-lab-input-readback-contract.yml",
    ".github/workflows/rc5-test-lab-input-readback-once.yml",
    ".github/workflows/rc5-test-lab-isolated-preflight-once.yml",
    ".github/workflows/rc5-test-lab-isolated-proof-contract.yml",
    ".github/workflows/rc5-test-lab-isolated-proof-once.yml",
]
for item in obsolete_files:
    remove_if_present(item)

# Self-remove branch-only builder assets.
remove_if_present(".github/workflows/rc5-closure-source-builder.yml")
remove_if_present("scripts/rc5/apply-rc5-closure.py")

print("rc5_closure_builder=PASS")

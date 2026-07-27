#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
WAVE0_VERIFIER = ROOT / "scripts/phase11/verify-wave0-finishing-line.py"
RECEIPT = ROOT / "docs/design/UIA_CURRENT_MAIN_OWNER_REVIEW_RECEIPT.md"
UIA_VERIFIER = ROOT / "scripts/uia/verify-current-main-owner-review.py"
UIA_CONTRACT = ROOT / ".github/workflows/uia-current-main-owner-review-contract.yml"

SOURCE = "bb84968453b891dd511faddc093a8874fce8abc4"
WEB_RUN = "30314869549"
ANDROID_RUN = "30314870954"
OPERATIONS_RUN = "30314872253"
CANONICAL_RUN = "30315044253"
PR_NUMBER = os.environ["PR_NUMBER"]

if not PR_NUMBER.isdigit():
    raise SystemExit(f"Invalid PR number: {PR_NUMBER}")


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"UIA final closeout missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace(LOCK, "| Status | CLAIMED — UIA EXACT-CURRENT-MAIN OWNER-REVIEW REFRESH |", "| Status | RELEASED — UIA CURRENT-MAIN OWNER REVIEW CLOSED AND PRESERVED |")
replace(LOCK, "| Owner/agent | Active repository agent — Issue #354 UIA current-main owner-review refresh. |", "| Owner/agent | None. UIA current-main owner-review refresh is closed; Issue #112 remains the sole open programme issue. |")
replace(LOCK, "| Authorized scope | Refresh the exact-current-main synthetic owner-review browser/PWA, internal Android and IAM-private operations staging surfaces; verify canonical access; publish evidence; close Issue #354. No participant processing, production auth, private evidence activation, external communications, real money or Phase 12 release. |", "| Authorized scope | No active repository write scope. A new explicit claim is required for actual Phase 11 external evidence, a formal STOP decision, or participant-backed execution. |")
replace(LOCK, "| Implementation branch | `chore/uia-current-main-refresh`, based on the UIA claim merge from exact `main@348aedfdc29d4cc82bcc4296648db844d7fd5e44`. |", f"| Implementation branch | None. UIA final closeout PR #{PR_NUMBER} records managed source `{SOURCE}` and the four approved owner-review runtimes. |")
replace(LOCK, "| Current task | UIA current-main refresh only. Promote and prove the present synthetic owner-review surfaces, then release the lane. Phase 11 remains `ENTRY_BLOCKED_EXTERNAL`; `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |", "| Current task | None. UIA is closed. Phase 11 remains `ENTRY_BLOCKED_EXTERNAL`; P11-G01–P11-G13 remain open, `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |")
replace(LOCK, "| Governing issue | Issue #354 governs UIA refresh. Issue #112 remains separately open for external entry gates and real pilot evidence. |", "| Governing issue | Issue #112 remains open for external entry gates and final programme disposition. Issue #354 is closed and preserved. |")
replace(LOCK, "## UIA owner-review promotion contract — CLAIMED FOR CURRENT-MAIN REFRESH", "## UIA owner-review promotion contract — CLOSED AND PRESERVED")
replace(LOCK, "9. UIA Issue #354 is the sole active refresh lane. All RC0–RC11 and Phase 11 evidence remain immutable/regression-protected.", f"9. UIA Issue #354 closed after exact source `{SOURCE}` passed browser/PWA run `{WEB_RUN}`, Android internal-distribution run `{ANDROID_RUN}`, IAM-private operations run `{OPERATIONS_RUN}` and canonical-domain run `{CANONICAL_RUN}`.")
replace(LOCK, "10. UIA closes only after the owner has straightforward current access to the final VC browser, Android and protected operations surfaces and Issue #354 explicitly distinguishes visual/synthetic review, connected development/staging UI testing, real Phase 11 participant UAT and production release.", "10. UIA is `CLOSED — CURRENT-MAIN SYNTHETIC OWNER REVIEW PROVEN`: browser access is canonical, Android is internal/preauthorization-only, operations is IAM-private/synthetic, real participant UAT has not run and production release remains unauthorized.")
replace(LOCK, "- UIA — post-VC owner-review promotion. **CLAIMED — exact-current-main synthetic browser/PWA, internal Android and IAM-private operations refresh; Issue #354 is the sole active lane.**", f"- UIA — post-VC owner-review promotion. **CLOSED — CURRENT-MAIN SYNTHETIC OWNER REVIEW PROVEN — source `{SOURCE}`; browser `{WEB_RUN}`; Android `{ANDROID_RUN}`; operations `{OPERATIONS_RUN}`; canonical `{CANONICAL_RUN}`; participant/production authorization false.**")
replace(LOCK, "The repository write lane is CLAIMED for UIA current-main owner-review refresh only. RC0–RC11, Phase 11C–11J readiness and Wave 0 finishing-line evidence remain immutable/regression-protected. Real participants, participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.", "The repository write lane is RELEASED. RC0–RC11, UIA, Phase 11C–11J readiness and Wave 0 finishing-line evidence remain immutable/regression-protected. Real participants, participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.")

replace(PROJECT, "**Active repository write lane:** none; Wave 0 finishing-line controls are closed and actual external-evidence reconciliation is next but unclaimed", "**Active repository write lane:** none; UIA current-main owner review is closed and final Phase 11 disposition is next but unclaimed")
replace(PROJECT, "- VC1–VC8 world-class product/AI modernization — **complete and merged**;", "- VC1–VC8 world-class product/AI modernization — **complete and merged**;\n- UIA current-main owner-review access — **CLOSED AND PRESERVED / SYNTHETIC BROWSER + INTERNAL ANDROID + IAM-PRIVATE OPERATIONS PROVEN**;")

replace(
    WAVE0_VERIFIER,
    'require(PROJECT, "Active repository write lane:** none; Wave 0 finishing-line controls are closed")',
    'require(PROJECT, "Active repository write lane:** none;")\nrequire(PROJECT, "Phase 11 Wave 0 finishing-line controls — **CLOSED AND PRESERVED")',
)

RECEIPT.parent.mkdir(parents=True, exist_ok=True)
RECEIPT.write_text(f"""# UIA Current-Main Owner-Review Receipt

**State:** CLOSED AND PRESERVED
**Issue:** #354
**Managed source:** `{SOURCE}`
**Final closeout PR:** #{PR_NUMBER}
**Production release:** false
**Real participant UAT:** not run

## Managed evidence

| Surface | Run | Result | Boundary |
|---|---:|---|---|
| Customer/provider browser and BFF | `{WEB_RUN}` | passed | public synthetic-only owner review; private API/BFF boundary preserved |
| Native Android | `{ANDROID_RUN}` | passed | Firebase App Distribution to `direkt-internal-testers`; debug/preauthorization only |
| API and operations portal | `{OPERATIONS_RUN}` | passed | Cloud Run IAM-private, synthetic-only, consequential actions not authorized |
| Canonical owner-review host | `{CANONICAL_RUN}` | passed | `https://app.direkt.forum`; DNS/TLS/PWA/BFF/session/privacy checks passed |

## Owner access paths

- Browser/PWA: `https://app.direkt.forum`
- Android: Firebase App Distribution, package `com.kudzimusar.direkt.debug`, tester group `direkt-internal-testers`
- Operations: Cloud Run service `direkt-operations-portal-staging` in project `direkt-dev-502701`, region `asia-northeast1`; IAM-authenticated access only

## Acceptance separation

1. **Visual/synthetic review — complete.** Current managed surfaces represent the reviewed product without participant data.
2. **Connected development/staging testing — complete at the approved synthetic boundary.** Browser/BFF, internal Android and private operations staging were promoted from one exact merged source.
3. **Real Phase 11 participant UAT — not run.** Issue #112 and P11-G01–P11-G13 remain authoritative.
4. **Production release — not authorized.** No production auth, participant communication, participant telemetry/Maps, private participant evidence, production AI or real money was enabled.

## Final decision

UIA is closed. This receipt proves current presentation and owner access only and does not weaken the Phase 11 `ENTRY_BLOCKED_EXTERNAL` decision.
""", encoding="utf-8")

UIA_VERIFIER.write_text(f'''#!/usr/bin/env python3
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"
PROJECT = ROOT / "PROJECT_STATUS.md"
RECEIPT = ROOT / "docs/design/UIA_CURRENT_MAIN_OWNER_REVIEW_RECEIPT.md"


def require(path: Path, needle: str) -> None:
    if needle not in path.read_text(encoding="utf-8"):
        raise SystemExit(f"UIA contract missing {{needle!r}} in {{path.relative_to(ROOT)}}")


for path in (LOCK, PROJECT, RECEIPT):
    if not path.is_file():
        raise SystemExit(f"UIA contract missing {{path.relative_to(ROOT)}}")
for needle in (
    "UIA owner-review promotion contract — CLOSED AND PRESERVED",
    "CURRENT-MAIN SYNTHETIC OWNER REVIEW PROVEN",
    "The repository write lane is RELEASED",
    "PILOT_ENTRY_APPROVED` remains false",
):
    require(LOCK, needle)
require(PROJECT, "Active repository write lane:** none;")
require(PROJECT, "UIA current-main owner-review access — **CLOSED AND PRESERVED")
for needle in (
    "Managed source:** `{SOURCE}`",
    "`{WEB_RUN}`",
    "`{ANDROID_RUN}`",
    "`{OPERATIONS_RUN}`",
    "`{CANONICAL_RUN}`",
    "Real Phase 11 participant UAT — not run",
    "Production release — not authorized",
    "https://app.direkt.forum",
    "direkt-internal-testers",
    "direkt-operations-portal-staging",
):
    require(RECEIPT, needle)
for script in (
    "scripts/rc11/verify-final-integration-closure.py",
    "scripts/phase11/verify-primary-pilot-readiness.py",
    "scripts/phase11/evaluate-wave0-gates.py",
    "scripts/phase11/verify-wave0-finishing-line.py",
):
    result = subprocess.run([sys.executable, script], cwd=ROOT)
    if result.returncode:
        raise SystemExit(result.returncode)
print("UIA_CURRENT_MAIN_OWNER_REVIEW|PASS")
print("source={SOURCE}")
print("browser_run={WEB_RUN}")
print("android_run={ANDROID_RUN}")
print("operations_run={OPERATIONS_RUN}")
print("canonical_run={CANONICAL_RUN}")
print("participant_processing=false")
print("production_authorization=false")
''', encoding="utf-8")
UIA_VERIFIER.chmod(0o755)

UIA_CONTRACT.write_text('''name: DIREKT UIA current-main owner-review contract

on:
  pull_request:
    paths:
      - "WORKSTREAM_LOCK.md"
      - "PROJECT_STATUS.md"
      - "docs/design/UIA_CURRENT_MAIN_OWNER_REVIEW_RECEIPT.md"
      - "scripts/uia/verify-current-main-owner-review.py"
      - "scripts/phase11/verify-wave0-finishing-line.py"
      - ".github/workflows/uia-current-main-owner-review-contract.yml"
  push:
    branches: [main]
    paths:
      - "WORKSTREAM_LOCK.md"
      - "PROJECT_STATUS.md"
      - "docs/design/UIA_CURRENT_MAIN_OWNER_REVIEW_RECEIPT.md"
      - "scripts/uia/verify-current-main-owner-review.py"
      - "scripts/phase11/verify-wave0-finishing-line.py"

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-python@v6
        with:
          python-version: "3.12"
      - name: Verify current-main owner-review closure
        run: python3 scripts/uia/verify-current-main-owner-review.py
''', encoding="utf-8")

print("UIA_FINAL_CLOSEOUT_PATCH|PASS")

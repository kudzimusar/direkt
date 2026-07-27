#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = ROOT / "WORKSTREAM_LOCK.md"


def replace(old: str, new: str) -> None:
    text = LOCK.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"UIA claim missing expected lock text: {old}")
    LOCK.write_text(text.replace(old, new, 1), encoding="utf-8")


replace(
    "| Status | RELEASED — PHASE 11 WAVE 0 FINISHING LINE CLOSED AND PRESERVED |",
    "| Status | CLAIMED — UIA EXACT-CURRENT-MAIN OWNER-REVIEW REFRESH |",
)
replace(
    "| Owner/agent | None. Wave 0 repository finishing-line work is closed; Issue #112 remains open for actual external evidence and participant-backed execution. |",
    "| Owner/agent | Active repository agent — Issue #354 UIA current-main owner-review refresh. |",
)
replace(
    "| Authorized scope | No active repository write scope. A new explicit claim is required to reconcile actual regulator, counsel, owner, provider-console or managed real-environment evidence. |",
    "| Authorized scope | Refresh the exact-current-main synthetic owner-review browser/PWA, internal Android and IAM-private operations staging surfaces; verify canonical access; publish evidence; close Issue #354. No participant processing, production auth, private evidence activation, external communications, real money or Phase 12 release. |",
)
replace(
    "| Implementation branch | None. Wave 0 implementation PR #512 merged at `f561658d140aaf214fa6eaca99c80bcc98ee284f`; closeout PR #513 exact head `1e4291ef669ca01eb4f639b2f1734a85d8448a63` merged at `632dd0bdbb2a3b8c24bd285918deff3e54bd3ba9`. |",
    "| Implementation branch | `chore/uia-current-main-refresh`, based on the UIA claim merge from exact `main@348aedfdc29d4cc82bcc4296648db844d7fd5e44`. |",
)
replace(
    "| Current task | None. Terminal decision is `ENTRY_BLOCKED_EXTERNAL`. P11-G01–P11-G13 remain open, `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |",
    "| Current task | UIA current-main refresh only. Promote and prove the present synthetic owner-review surfaces, then release the lane. Phase 11 remains `ENTRY_BLOCKED_EXTERNAL`; `PILOT_ENTRY_APPROVED` remains false and PRIMARY-PILOT evidence count remains 0. |",
)
replace(
    "| Governing issue | Issue #112 remains open for external entry gates, Wave 0 authorization, real 11C–11H evidence, 11I corrections and 11J decision. |",
    "| Governing issue | Issue #354 governs UIA refresh. Issue #112 remains separately open for external entry gates and real pilot evidence. |",
)
replace(
    "## UIA owner-review promotion contract — PARKED AND PRESERVED",
    "## UIA owner-review promotion contract — CLAIMED FOR CURRENT-MAIN REFRESH",
)
replace(
    "9. UIA Issue #354 remains open and parked. RC5 no longer owns a write lane; UIA or RC7+ requires an explicit new claim before source changes.",
    "9. UIA Issue #354 is the sole active refresh lane. All RC0–RC11 and Phase 11 evidence remain immutable/regression-protected.",
)
replace(
    "- UIA — post-VC owner-review promotion. **PARKED / OPEN — PR #385 merged at `fed6db8ab7c479b5e47095b4f0a752514122a4f6`; Issue #354 remains open for remaining owner-access evidence; read-only during RC7.**",
    "- UIA — post-VC owner-review promotion. **CLAIMED — exact-current-main synthetic browser/PWA, internal Android and IAM-private operations refresh; Issue #354 is the sole active lane.**",
)
replace(
    "The repository write lane is RELEASED. RC0–RC11, Phase 11C–11J readiness and Wave 0 finishing-line evidence remain immutable/regression-protected. Real participants, participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.",
    "The repository write lane is CLAIMED for UIA current-main owner-review refresh only. RC0–RC11, Phase 11C–11J readiness and Wave 0 finishing-line evidence remain immutable/regression-protected. Real participants, participant data, real money and production authorization remain blocked until the explicit Phase 11 entry checklist is satisfied.",
)

print("UIA_CURRENT_MAIN_REFRESH_CLAIM|PASS")

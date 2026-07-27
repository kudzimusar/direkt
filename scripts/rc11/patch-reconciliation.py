#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"RC11 patch missing expected text in {path.relative_to(ROOT)}: {old}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")

lock = ROOT / "WORKSTREAM_LOCK.md"
replace(lock,
    "| Implementation branch | `chore/rc11-final-integration-closure`, based on `main@feead13e1650e8326f86c372ab4be2b8c9bf544b`. |",
    "| Implementation branch | `docs/rc11-final-integration-closure`, based on RC11 claim merge `main@7f0b6b76a78572b6bb90694814037c370935e3b9`. |")
replace(lock,
    "| Stable baseline | `main@feead13e1650e8326f86c372ab4be2b8c9bf544b` contains closed RC0–RC10 evidence and the RC10 closeout receipt. |",
    "| Stable baseline | `main@7f0b6b76a78572b6bb90694814037c370935e3b9` contains the reviewed RC11 claim and immutable RC0–RC10 closure evidence. |")
replace(lock,
    "| Current task | RC11A–RC11D — prove combined regressions, index managed evidence, reconcile truthful statuses and hand off cleanly to Phase 11 real-pilot preparation. |",
    "| Current task | RC11A–RC11C reconciliation implemented; exact-head regression and RC11D closure/handoff remain pending. |")
replace(lock,
    "## Runtime integration closure contract",
    """## RC11 implementation contract — CLAIMED

1. RC11 is reconciliation and closure only; it may not activate a new provider, SDK, participant channel, production environment or real-money path.
2. RC11A requires the combined Android, backend, database, OpenAPI, generated-client, customer/provider PWA, operations portal and integration-runtime regression matrix on one exact head.
3. RC11B maintains one managed evidence index that records exact source, run, artifact and boundary where available without inventing identifiers.
4. RC11C reconciles the live ledger and current integration register while preserving `PENDING_PROVIDER`, `BLOCKED`, `DISABLED`, `IMPLEMENTED_GATED`, `SANDBOX_PROVEN` and `EXTERNALLY_PROVISIONED` distinctions.
5. Synthetic, sandbox and managed-canary evidence may never be relabelled as PRIMARY-PILOT or production evidence.
6. Client applications retain no provider, database, payment or telemetry-admin credentials; backend authorization remains authoritative.
7. Payment cannot create trust, verification, publication or ranking authority; AI cannot become consequential authority.
8. Real participants, production authentication, participant communications/telemetry/Maps, production AI, real money and Phase 12 release remain blocked.
9. RC11D requires a dedicated exact-head closure receipt, permanent verifier, Issue #261 completion and released lane.
10. The clean handoff names Phase 11C–11J execution preparation as next, but real pilot activity remains prohibited until the Phase 11 entry checklist is genuinely satisfied.

## Runtime integration closure contract""")
replace(lock,
    "- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **CLAIMED — RC11A–RC11D IN PROGRESS from `main@feead13e1650e8326f86c372ab4be2b8c9bf544b`.**",
    "- RC11 — combined integration regression, managed evidence index, live ledger/status reconciliation and lane release. **IMPLEMENTED — RC11A–RC11C RECONCILED / EXACT-HEAD REGRESSION AND RC11D CLOSEOUT PENDING.**")

project = ROOT / "PROJECT_STATUS.md"
replace(project,
    "**Active repository write lane:** none; RC1–RC10 are closed and RC11 is next but unclaimed",
    "**Active repository write lane:** RC11 final integration closure under Issue #261")
replace(project,
    "- runtime integration closure — **RC1–RC10 are closed at their documented bounded boundaries. RC10 is `CLOSED — NOT CURRENTLY REQUIRED / TURNSTILE NOT ACTIVE`; explicit first-party rate limits protect public discovery assistance, public Help and search-area normalization. RC11 is next but unclaimed.**",
    "- runtime integration closure — **RC1–RC10 are closed at their documented bounded boundaries. RC11 final reconciliation is implemented with a managed evidence index and truthful blocked/provider-state preservation; exact-head regression and closeout remain pending.**")
replace(project,
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. Turnstile remains not active and unprovisioned; the uncovered public POST routes use the existing fail-closed database abuse-control boundary. The repository write lane is released and RC11 remains unclaimed.",
    "RC10 is closed on implementation PR #502 exact head `cdab6622e0cc06e35cddca2bb5bc8ea70c027b38`, squash-merged at `620a99ba5465ad38ce012df0a8fa15e458de6505`. RC11 is the sole active lane: its final evidence/status reconciliation is implemented, but closure still requires exact-head regression, receipt promotion, Issue #261 completion and lane release. Real Phase 11 evidence remains externally gated.")

status = ROOT / "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace(status,
    "13. RC11 combined integration regression/evidence index/lane release — **NEXT BUT UNCLAIMED**.",
    "13. RC11 combined integration regression/evidence index/lane release — **RC11 IMPLEMENTED — FINAL RECONCILIATION / REGRESSION PENDING**; managed evidence index and blocked/provider-state reconciliation are complete, while exact-head matrix, closure receipt and lane release remain pending.")

ledger = ROOT / "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace(ledger,
    "13. RC11 full combined regression and lane release — **NEXT BUT UNCLAIMED**.",
    "13. RC11 full combined regression and lane release — **IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING**. `RC11_MANAGED_EVIDENCE_INDEX.md` records RC0–RC10 evidence and retained blocked/provider states; the permanent RC11 verifier and exact-head matrix must pass before release.")
anchor = "\nAirtel is revisited immediately when provider approval arrives. Flutterwave remains deferred until onboarding reopens.\n"
receipt = """
### RC11 final integration reconciliation

```text
Integration: Final combined runtime-integration reconciliation (RC11)
Previous state: RC0–RC10 closed; RC11 claimed
New state: IMPLEMENTED — EXACT-HEAD REGRESSION AND CLOSEOUT PENDING
Claim merge: 7f0b6b76a78572b6bb90694814037c370935e3b9
Repo/source changes: canonical managed evidence index, permanent RC11 verifier, live ledger/current status/project status reconciliation and explicit retained blocked/provider states
Managed evidence: RC0–RC10 exact source/run/artifact identifiers indexed where available; no identifier fabricated for provider-managed evidence without a GitHub run
Privacy/security: no participant data, provider secret, production credential, exact private coordinate or raw evidence introduced
Fallback/kill switch: existing provider-specific fail-closed modes and manual fallbacks preserved
Production authorization: NOT AUTHORIZED
Known blockers: Phase 11 real entry, DPC/legal/notice/Firebase real canary, PRIMARY-PILOT evidence, participant communications/telemetry/Maps, real money and Phase 12 release
Next exact step: pass the exact final-head matrix, publish RC11D closure receipt, close Issue #261 and release the lane to Phase 11C–11J execution preparation
Ledger updated: YES
```
"""
text = ledger.read_text(encoding="utf-8")
if anchor not in text:
    raise SystemExit("RC11 ledger anchor missing")
ledger.write_text(text.replace(anchor, "\n" + receipt + anchor, 1), encoding="utf-8")

print("RC11_RECONCILIATION_PATCH|PASS")

#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parents[2]
path = root / "scripts/rc11/verify-final-integration-closure.py"
text = path.read_text(encoding="utf-8")
replacements = {
    '"RC11A combined regression",': '"RC11A requires the combined",',
    '"RC11B managed evidence index",': '"RC11B maintains one managed evidence index",',
    '"RC11C ledger/status reconciliation",': '"RC11C reconciles the live ledger",',
    '"RC11D closure/handoff",': '"RC11D requires a dedicated exact-head closure receipt",',
}
for old, new in replacements.items():
    if old not in text:
        raise SystemExit(f"RC11 closeout verifier phrase not found: {old}")
    text = text.replace(old, new, 1)
path.write_text(text, encoding="utf-8")
print("RC11_CLOSEOUT_VERIFIER_PHRASING_PATCH|PASS")

#!/usr/bin/env python3
"""Bind the RC9 closure documents to the exact merged main checkpoint."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(relative: str, old: str, new: str) -> None:
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected one exact-main receipt replacement in {relative}, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    "WORKSTREAM_LOCK.md",
    "| Implementation branch | None. PR #497 was squash-merged to `main`; RC9D is documentation/receipt closeout only. |",
    "| Implementation branch | None. PR #497 and RC9D closeout PR #498 are merged; no repository write lane is active. |",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "| Stable baseline | `main@70de95c73128e921cd4d7c667de0e5a442a9e0c0` contains RC9A–RC9C. OpenAPI Generator `7.22.0` remains checksum-pinned; canonical OpenAPI SHA-256 is `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`; generated Kotlin/TypeScript trees remain deterministic and bounded runtime adoption is enforced. |",
    "| Stable baseline | `main@957b19192443b2511f1bf784595591b25b5e7a2e` contains the complete RC9 implementation and closeout receipt. OpenAPI Generator `7.22.0` remains checksum-pinned; canonical OpenAPI SHA-256 is `1c13b69a34c30b84347b02ecddcf4f5b55c21e1958f036d4dc29c9106784e063`; generated Kotlin/TypeScript trees remain deterministic and bounded runtime adoption is enforced. |",
)
replace_once(
    "WORKSTREAM_LOCK.md",
    "| Current task | RC9D closeout: reconcile status, ledger, receipt, permanent verifier and release the lane. No RC10 source work is included. |",
    "| Current task | None. RC9 is complete and preserved; RC10 remains unclaimed and requires a new explicit claim from current `main`. |",
)
replace_once(
    "docs/integrations/RC9_CLOSURE_RECEIPT.md",
    "**Closeout PR:** #498\n",
    "**Closeout PR:** #498\n**Closeout merge:** `957b19192443b2511f1bf784595591b25b5e7a2e`\n",
)

verifier = ROOT / "scripts/rc9/verify-generated-client-contract.py"
text = verifier.read_text(encoding="utf-8")
old = '''    "70de95c73128e921cd4d7c667de0e5a442a9e0c0",
    "30273733920",'''
new = '''    "70de95c73128e921cd4d7c667de0e5a442a9e0c0",
    "957b19192443b2511f1bf784595591b25b5e7a2e",
    "30273733920",'''
if text.count(old) != 1:
    raise SystemExit("RC9 exact-main receipt verifier insertion point is not unique")
text = text.replace(old, new, 1)
text = text.replace(
    'print("implementation_merge=70de95c73128e921cd4d7c667de0e5a442a9e0c0")',
    'print("implementation_merge=70de95c73128e921cd4d7c667de0e5a442a9e0c0")\nprint("closeout_merge=957b19192443b2511f1bf784595591b25b5e7a2e")',
    1,
)
verifier.write_text(text, encoding="utf-8")

print("RC9_EXACT_MAIN_RECEIPT_PATCH|PASS")

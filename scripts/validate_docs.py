#!/usr/bin/env python3
"""Validate DIREKT planning documentation."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md", "AGENTS.md", "MASTER_BUILD_PLAN.md", "PROJECT_STATUS.md",
    "WORKSTREAM_LOCK.md", "DEFINITION_OF_DONE.md", "design.md",
    "docs/product/PRODUCT_REQUIREMENTS.md",
    "docs/trust/VERIFICATION_MODEL.md",
    "docs/architecture/SYSTEM_ARCHITECTURE.md",
    "docs/android/ANDROID_PRODUCT_SPEC.md",
    "docs/security/PUBLIC_REPOSITORY_POLICY.md",
    "docs/testing/QUALITY_GATES.md",
    "docs/operations/AGENT_WORKFLOW.md",
    "docs/operations/PAGES_USAGE.md",
]
errors = []

for rel in REQUIRED:
    if not (ROOT / rel).is_file():
        errors.append(f"Missing required file: {rel}")

for path in sorted(list(ROOT.glob("*.md")) + list((ROOT / "docs").rglob("*.md"))):
    text = path.read_text(encoding="utf-8")
    rel = path.relative_to(ROOT)
    h1 = re.findall(r"(?m)^# ", text)
    if len(h1) != 1:
        errors.append(f"{rel}: expected exactly one H1, found {len(h1)}")
    if len(text.strip()) < 120:
        errors.append(f"{rel}: document is too short")
    for marker in ("TODO", "TBD", "CHANGEME", "INSERT_SECRET"):
        if marker in text:
            errors.append(f"{rel}: unresolved marker {marker}")
    if re.search(r"(?i)(api[_-]?key|secret|password)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}", text):
        errors.append(f"{rel}: possible committed secret")

if errors:
    print("Documentation validation failed:")
    for e in errors:
        print(f"- {e}")
    sys.exit(1)

print(f"Documentation validation passed ({len(list(ROOT.glob('*.md')))+len(list((ROOT/'docs').rglob('*.md')))} Markdown files).")

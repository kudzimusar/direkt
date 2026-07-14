#!/usr/bin/env python3
"""Create the downloadable DIREKT documentation archive."""
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "downloads" / "DIREKT_PLANNING_PACK.zip"
OUT.parent.mkdir(exist_ok=True)

include_roots = [
    "README.md", "AGENTS.md", "MASTER_BUILD_PLAN.md", "PROJECT_STATUS.md",
    "WORKSTREAM_LOCK.md", "DECISION_LOG.md", "CHANGELOG.md",
    "DEFINITION_OF_DONE.md", "RISK_REGISTER.md", "GLOSSARY.md",
    "design.md", "CONTRIBUTING.md", "SECURITY.md", "LICENSE.md",
    "docs", "scripts", ".github", "mkdocs.yml", "requirements-docs.txt",
    "PLANNING_PACK_MANIFEST.json", ".gitignore", ".editorconfig",
    ".markdownlint.json", ".env.example", "android", "backend", "admin",
    "database", "infrastructure", "tests",
]

with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    for rel in include_roots:
        path = ROOT / rel
        if not path.exists():
            continue
        if path.is_file():
            zf.write(path, rel)
        else:
            for item in sorted(path.rglob("*")):
                if item.is_file():
                    zf.write(item, item.relative_to(ROOT))

print(OUT)

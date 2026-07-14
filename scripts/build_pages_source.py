#!/usr/bin/env python3
"""Build the MkDocs source tree from repository documentation."""
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "_pages_src"
if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

root_docs = [
    "AGENTS.md", "MASTER_BUILD_PLAN.md", "PROJECT_STATUS.md",
    "WORKSTREAM_LOCK.md", "DECISION_LOG.md", "CHANGELOG.md",
    "DEFINITION_OF_DONE.md", "RISK_REGISTER.md", "GLOSSARY.md",
    "design.md", "CONTRIBUTING.md", "SECURITY.md", "LICENSE.md",
]
for rel in root_docs:
    src = ROOT / rel
    if src.exists():
        shutil.copy2(src, OUT / rel)

shutil.copytree(ROOT / "docs", OUT / "docs")

# Repository-relative index link becomes the Pages home link.
index_path = OUT / "docs" / "INDEX.md"
if index_path.exists():
    index_path.write_text(index_path.read_text(encoding="utf-8").replace("../README.md", "../index.md"), encoding="utf-8")

download_src = ROOT / "downloads" / "DIREKT_PLANNING_PACK.zip"
if download_src.exists():
    (OUT / "downloads").mkdir()
    shutil.copy2(download_src, OUT / "downloads" / download_src.name)

# MkDocs expects index.md
shutil.copy2(ROOT / "README.md", OUT / "index.md")
print(f"Pages source generated at {OUT}")

#!/usr/bin/env python3
"""Build the MkDocs source tree from repository documentation and prototype assets."""
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

# Publish the dependency-free Phase 1B prototype as static Pages content.
# The repository README documents the prototype source, while index.html is
# the public route. Excluding README.md prevents both files mapping to the
# same MkDocs destination under strict mode.
prototype_src = ROOT / "prototype"
if prototype_src.exists():
    shutil.copytree(
        prototype_src,
        OUT / "prototype",
        ignore=shutil.ignore_patterns("README.md"),
    )

# Repository-relative index link becomes the Pages home link.
index_path = OUT / "docs" / "INDEX.md"
if index_path.exists():
    index_path.write_text(
        index_path.read_text(encoding="utf-8").replace("../README.md", "../index.md"),
        encoding="utf-8",
    )

# Add a direct prototype link to the generated Pages landing document.
readme = (ROOT / "README.md").read_text(encoding="utf-8")
prototype_callout = """

## Open the interactive prototype

[Launch the DIREKT Phase 1B prototype](prototype/index.html)

The prototype uses fictional data, makes no real submissions and does not represent an implemented backend or verification service.
"""
if "## Open the interactive prototype" not in readme:
    readme = readme.replace("## Download the planning pack", prototype_callout + "\n## Download the planning pack")

# MkDocs expects index.md.
(OUT / "index.md").write_text(readme, encoding="utf-8")

download_src = ROOT / "downloads" / "DIREKT_PLANNING_PACK.zip"
if download_src.exists():
    (OUT / "downloads").mkdir()
    shutil.copy2(download_src, OUT / "downloads" / download_src.name)

print(f"Pages source generated at {OUT}")

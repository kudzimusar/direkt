#!/usr/bin/env python3
"""Build the MkDocs source tree from repository documentation and public synthetic UI assets."""
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

# Retain the dependency-free Phase 1B prototype as a historical static review artifact.
prototype_src = ROOT / "prototype"
if prototype_src.exists():
    shutil.copytree(
        prototype_src,
        OUT / "prototype",
        ignore=shutil.ignore_patterns("README.md"),
    )

# Preserve the dependency-free synthetic customer/provider PWA as an explicit preview.
# During W8 transition the historical /app/ path remains intact for backwards compatibility,
# while /preview/ becomes the permanent explicit synthetic/historical route. The functional
# Next.js/BFF application is deployed separately to a server runtime and is never copied here.
pwa_src = ROOT / "web" / "direkt-pwa"
if pwa_src.exists():
    shutil.copytree(pwa_src, OUT / "app")
    shutil.copytree(pwa_src, OUT / "preview")

# Repository-relative index link becomes the Pages home link.
index_path = OUT / "docs" / "INDEX.md"
if index_path.exists():
    index_path.write_text(
        index_path.read_text(encoding="utf-8").replace("../README.md", "../index.md"),
        encoding="utf-8",
    )

readme = (ROOT / "README.md").read_text(encoding="utf-8")
prototype_callout = """

## Open the interactive prototype

[Launch the DIREKT Phase 1B prototype](prototype/index.html)

The prototype uses fictional data, makes no real submissions and does not represent an implemented backend or verification service.
"""
if "## Open the interactive prototype" not in readme:
    marker = "## Download the planning pack"
    if marker in readme:
        readme = readme.replace(marker, prototype_callout + "\n" + marker, 1)
    else:
        readme = readme.rstrip() + prototype_callout + "\n"

pwa_callout = """

## Open the remote customer/provider UI

[Launch the DIREKT customer/provider synthetic preview](preview/index.html)

The preview is an installable **synthetic remote-review build** for desktop, tablet and mobile. It contains no real participant data, makes no real submissions and does not bypass the protected backend, pilot or production gates. The historical `app/` path is retained during the W8 controlled-cutover transition.
"""
if "## Open the remote customer/provider UI" not in readme:
    marker = "## Download the planning pack"
    if marker in readme:
        readme = readme.replace(marker, pwa_callout + "\n" + marker, 1)
    else:
        readme = readme.rstrip() + pwa_callout + "\n"
else:
    start = readme.index("## Open the remote customer/provider UI")
    marker = "## Download the planning pack"
    end = readme.find(marker, start)
    if end == -1:
        readme = readme[:start].rstrip() + pwa_callout + "\n"
    else:
        readme = readme[:start].rstrip() + "\n" + pwa_callout.strip() + "\n\n" + readme[end:]

(OUT / "index.md").write_text(readme, encoding="utf-8")

download_src = ROOT / "downloads" / "DIREKT_PLANNING_PACK.zip"
if download_src.exists():
    (OUT / "downloads").mkdir()
    shutil.copy2(download_src, OUT / "downloads" / download_src.name)

print(f"Pages source generated at {OUT}")

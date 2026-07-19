#!/usr/bin/env python3
"""Validate DIREKT planning documentation and the public synthetic PWA contract."""
from pathlib import Path
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md", "AGENTS.md", "MASTER_BUILD_PLAN.md", "PROJECT_STATUS.md",
    "WORKSTREAM_LOCK.md", "DEFINITION_OF_DONE.md", "design.md",
    "docs/product/PRODUCT_REQUIREMENTS.md",
    "docs/trust/VERIFICATION_MODEL.md",
    "docs/architecture/SYSTEM_ARCHITECTURE.md",
    "docs/architecture/PWA_ARCHITECTURE.md",
    "docs/android/ANDROID_PRODUCT_SPEC.md",
    "docs/design/PWA_UI_SPECIFICATION.md",
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "docs/security/PUBLIC_REPOSITORY_POLICY.md",
    "docs/testing/QUALITY_GATES.md",
    "docs/testing/PWA_TEST_PLAN.md",
    "docs/operations/AGENT_WORKFLOW.md",
    "docs/operations/PAGES_USAGE.md",
    "docs/operations/REMOTE_UI_TESTING.md",
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

pwa = ROOT / "web" / "direkt-pwa"
pwa_required = ["index.html", "styles.css", "app.js", "manifest.webmanifest", "sw.js", "icon.svg"]
for rel in pwa_required:
    if not (pwa / rel).is_file():
        errors.append(f"Missing PWA file: web/direkt-pwa/{rel}")

if (pwa / "manifest.webmanifest").is_file():
    try:
        manifest = json.loads((pwa / "manifest.webmanifest").read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"PWA manifest invalid JSON: {exc}")
    else:
        if manifest.get("display") != "standalone":
            errors.append("PWA manifest must use standalone display")
        if not str(manifest.get("start_url", "")).startswith("./"):
            errors.append("PWA start_url must remain scoped under the static app path")
        if manifest.get("scope") != "./":
            errors.append("PWA scope must be ./")

if (pwa / "index.html").is_file():
    html = (pwa / "index.html").read_text(encoding="utf-8")
    for required_text in (
        "Synthetic remote UI review", "No real submissions", "manifest.webmanifest",
        "noindex,nofollow,noarchive", 'id="main-content"',
    ):
        if required_text not in html:
            errors.append(f"PWA index missing required contract text: {required_text}")

if pwa.is_dir():
    public_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in pwa.rglob("*") if path.is_file())
    prohibited_patterns = {
        "database URL": r"postgres(?:ql)?://",
        "Supabase secret/service key": r"(?i)(SUPABASE_(?:SECRET|SERVICE)|service_role)",
        "Google private key": r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----",
        "credential-bearing URL": r"https?://[^\s/:]+:[^\s/@]+@",
    }
    for label, pattern in prohibited_patterns.items():
        if re.search(pattern, public_text):
            errors.append(f"Public PWA contains prohibited {label}")

if errors:
    print("Documentation validation failed:")
    for e in errors:
        print(f"- {e}")
    sys.exit(1)

count = len(list(ROOT.glob("*.md"))) + len(list((ROOT / "docs").rglob("*.md")))
print(f"Documentation/PWA validation passed ({count} Markdown files + public synthetic PWA contract).")

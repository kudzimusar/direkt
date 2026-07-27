#!/usr/bin/env python3
from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    target = Path(path)
    text = target.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"missing expected source in {path}")
    target.write_text(text.replace(old, new, 1), encoding="utf-8")


def replace_table_row(path: str, prefix: str, replacement: str) -> None:
    target = Path(path)
    lines = target.read_text(encoding="utf-8").splitlines()
    indexes = [index for index, line in enumerate(lines) if line.startswith(prefix)]
    if len(indexes) != 1:
        raise SystemExit(f"expected one table row in {path}, found {len(indexes)}")
    lines[indexes[0]] = replacement
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


managed = "scripts/rc7/run-maps-managed.sh"
replace_once(
    managed,
    '''python3 - "${apksigner_stdout}" "${apk_certificate_digests_file}" <<'PYCERT'
from pathlib import Path
import re
import sys

source = Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
pattern = re.compile(''',
    '''python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}" <<'PYCERT'
from pathlib import Path
import re
import sys

source = "\\n".join(
    Path(path).read_text(encoding="utf-8", errors="replace")
    for path in sys.argv[1:3]
)
pattern = re.compile(''',
)
replace_once(
    managed,
    '''Path(sys.argv[2]).write_text("\\n".join(digests) + ("\\n" if digests else ""), encoding="utf-8")''',
    '''Path(sys.argv[3]).write_text("\\n".join(digests) + ("\\n" if digests else ""), encoding="utf-8")''',
)
replace_once(
    managed,
    '''acceptedSignerLabelForms: ["numbered", "sdk_range"], cleanBuild: true, buildCacheEnabled: false, rawStdoutIncluded: false, rawStderrIncluded: false}''',
    '''acceptedSignerLabelForms: ["numbered", "sdk_range"], parsedStreams: ["stdout", "stderr"], cleanBuild: true, buildCacheEnabled: false, rawStdoutIncluded: false, rawStderrIncluded: false}''',
)

contract = "scripts/rc7/verify-maps-contract.py"
replace_once(
    contract,
    '''        "acceptedSignerLabelForms",
        "rawStdoutIncluded",''',
    '''        "acceptedSignerLabelForms",
        "parsedStreams",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        "rawStdoutIncluded",''',
)

context = "scripts/rc7/verify-managed-workflow-context.py"
replace_once(
    context,
    '''        "acceptedSignerLabelForms:",
        "rawStdoutIncluded:",''',
    '''        "acceptedSignerLabelForms:",
        "parsedStreams:",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        "rawStdoutIncluded:",''',
)
replace_once(
    context,
    '''    print("unique_certificate_digest_required=true")''',
    '''    print("unique_certificate_digest_required=true")
    print("apksigner_stdout_and_stderr_parsed=true")''',
)

replace_table_row(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** |",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Exact-main run `30230730145/1` passed backend OAuth, budget, quota, restricted key metadata, clean no-cache Android build and cleanup. Its v3 certificate artifact recorded `apksignerExitCode=0` and zero stdout-derived digests. The correction parses both private signer streams, normalizes and deduplicates numbered/SDK-range SHA-1 records, and still requires exactly one digest equal to the restricted key before API 36 Test Lab. |",
)
replace_table_row(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` |",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT remain prohibited. Run `30230730145/1` on `28481cd2d83a32259bd5b30784afefd575a51c58` passed WIF, fresh owner budget attestation, quota, key restriction, immutable backend OAuth canary, clean no-cache Android build and cleanup. Artifact `8640052645`, digest `sha256:ec3f89f20a59df2d5d92d40b3429b10c2c3d6684c25a07059489d035e3437e82`, recorded `apksignerExitCode=0`, `certificateDigestCount=0`, and no Test Lab matrix. The correction parses both private signer streams and requires one unique matching SHA-1 digest before Test Lab. |",
)

notes = Path("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md")
text = notes.read_text(encoding="utf-8")
text = text.replace(
    "**Corrective baseline:** `main@7c899295b176f767fd3da53f19b029b5582eae8a`",
    "**Corrective baseline:** `main@28481cd2d83a32259bd5b30784afefd575a51c58`",
    1,
)
anchor = "## Credential and authentication boundary\n"
section = '''## APK signer-stream correction

Exact-main run `30230730145/1` on `28481cd2d83a32259bd5b30784afefd575a51c58` passed backend service-identity OAuth, the fresh one-JPY budget attestation, quota, restricted Android key metadata, clean no-build-cache APK creation and Cloud Run cleanup. Artifact `8640052645` has digest `sha256:ec3f89f20a59df2d5d92d40b3429b10c2c3d6684c25a07059489d035e3437e82`. `apksigner` exited zero, but stdout-only parsing returned zero certificate digests; Test Lab correctly did not start.

The corrected extractor parses both private signer stdout and stderr through the same strict numbered/SDK-range SHA-1 pattern, normalizes and deduplicates matches, and still requires exactly one unique digest equal to the Android key restriction. The sanitized artifact records only `parsedStreams: ["stdout", "stderr"]`; raw signer streams remain ephemeral, are never printed and are never uploaded.

'''
if section not in text:
    if anchor not in text:
        raise SystemExit("missing implementation-notes anchor")
    text = text.replace(anchor, section + anchor, 1)
notes.write_text(text, encoding="utf-8")

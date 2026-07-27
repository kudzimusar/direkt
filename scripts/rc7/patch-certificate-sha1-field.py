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
    '''pattern = re.compile(
    r"^Signer (?:#[0-9]+|\\([^)]*\\)) certificate SHA-1 digest:\\s*([0-9A-Fa-f:]+)\\s*$",
    flags=re.MULTILINE,
)''',
    '''pattern = re.compile(
    r"certificate SHA-1 digest:\\s*([0-9A-Fa-f:]+)",
    flags=re.IGNORECASE,
)''',
)
replace_once(
    managed,
    '''acceptedSignerLabelForms: ["numbered", "sdk_range"], parsedStreams: ["stdout", "stderr"], cleanBuild: true''',
    '''digestFieldPattern: "certificate_sha1_digest", presentationPrefixIndependent: true, parsedStreams: ["stdout", "stderr"], cleanBuild: true''',
)

contract = "scripts/rc7/verify-maps-contract.py"
replace_once(
    contract,
    '''        "acceptedSignerLabelForms",
        "parsedStreams",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        "rawStdoutIncluded",''',
    '''        "digestFieldPattern",
        "presentationPrefixIndependent",
        "parsedStreams",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        'r"certificate SHA-1 digest:\\\\s*([0-9A-Fa-f:]+)"',
        "flags=re.IGNORECASE",
        "rawStdoutIncluded",''',
)
replace_once(
    contract,
    '''        "Signer (?:#[0-9]+|\\\\([^)]*\\\\)) certificate SHA-1 digest",
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',''',
    '''        'r"certificate SHA-1 digest:\\\\s*([0-9A-Fa-f:]+)"',
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',''',
)

context = "scripts/rc7/verify-managed-workflow-context.py"
replace_once(
    context,
    '''        "acceptedSignerLabelForms:",
        "parsedStreams:",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        "rawStdoutIncluded:",''',
    '''        "digestFieldPattern:",
        "presentationPrefixIndependent:",
        "parsedStreams:",
        'python3 - "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"',
        "for path in sys.argv[1:3]",
        "Path(sys.argv[3]).write_text",
        'r"certificate SHA-1 digest:\\\\s*([0-9A-Fa-f:]+)"',
        "flags=re.IGNORECASE",
        "rawStdoutIncluded:",''',
)
replace_once(
    context,
    '''        "Signer (?:#[0-9]+|\\\\([^)]*\\\\)) certificate SHA-1 digest",
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',''',
    '''        'r"certificate SHA-1 digest:\\\\s*([0-9A-Fa-f:]+)"',
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',''',
)
replace_once(
    context,
    '''    print("apksigner_stdout_and_stderr_parsed=true")''',
    '''    print("apksigner_stdout_and_stderr_parsed=true")
    print("certificate_sha1_field_semantic_match=true")
    print("signer_presentation_prefix_required=false")''',
)

replace_table_row(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** |",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Exact-main run `30231201667/1` passed backend OAuth, budget, quota, restricted key metadata, clean no-cache Android build and cleanup. Both private signer streams were parsed, but the prefix-anchored parser still returned zero digests. The correction matches the AOSP-defined `certificate SHA-1 digest:` field independently of signer presentation text, normalizes/deduplicates matches, and still requires exactly one digest equal to the restricted key before API 36 Test Lab. |",
)
replace_table_row(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` |",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT remain prohibited. Run `30231201667/1` on `e5c93419da91bc2276c0d02fa87568ac0e75b22f` passed WIF, fresh owner budget attestation, quota, key restriction, immutable backend OAuth canary, clean no-cache Android build and cleanup. Artifact `8640205143`, digest `sha256:c545c1e4e49ba54d2269882af5a3cae0f8366e699b34b639f9f4dca7a9a853da`, recorded `apksignerExitCode=0`, both streams parsed, `certificateDigestCount=0`, and no Test Lab matrix. The correction semantically matches `certificate SHA-1 digest:` without requiring a signer-prefix shape and still requires one unique matching digest before Test Lab. |",
)

notes = Path("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md")
text = notes.read_text(encoding="utf-8")
text = text.replace(
    "**Corrective baseline:** `main@28481cd2d83a32259bd5b30784afefd575a51c58`",
    "**Corrective baseline:** `main@e5c93419da91bc2276c0d02fa87568ac0e75b22f`",
    1,
)
anchor = "## Credential and authentication boundary\n"
section = '''## Certificate SHA-1 field correction

Exact-main run `30231201667/1` on `e5c93419da91bc2276c0d02fa87568ac0e75b22f` passed backend service-identity OAuth, the fresh one-JPY budget attestation, quota, restricted Android key metadata, clean no-build-cache APK creation and Cloud Run cleanup. Artifact `8640205143` has digest `sha256:c545c1e4e49ba54d2269882af5a3cae0f8366e699b34b639f9f4dca7a9a853da`. Both private signer streams were parsed, but the remaining signer-prefix/start-of-line constraint returned zero digests; Test Lab correctly did not start.

AOSP's `ApkSignerTool.printCertificate` emits the stable field `<name> certificate SHA-1 digest: <hex>`. The corrected parser matches the exact `certificate SHA-1 digest:` field anywhere in either private stream, independent of the presentation prefix. It does not match `public key SHA-1 digest`. Matches are normalized and deduplicated, and exactly one digest must equal the Android key restriction. Raw signer streams remain ephemeral, unprinted and unuploaded.

'''
if section not in text:
    if anchor not in text:
        raise SystemExit("missing implementation-notes anchor")
    text = text.replace(anchor, section + anchor, 1)
notes.write_text(text, encoding="utf-8")

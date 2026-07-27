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
    matches = [index for index, line in enumerate(lines) if line.startswith(prefix)]
    if len(matches) != 1:
        raise SystemExit(f"expected one table row in {path}, found {len(matches)}")
    lines[matches[0]] = replacement
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")


managed = "scripts/rc7/run-maps-managed.sh"
old = '''apksigner_stderr="${RUNNER_TEMP}/rc7-apksigner.stderr"
set +e
apksigner_output="$("${apksigner_bin}" verify --print-certs "${app_apk}" 2> "${apksigner_stderr}")"
apksigner_code=$?
set -e
apk_certificate_sha1="$(awk -F': ' '/Signer #1 certificate SHA-1 digest:/{print $2; exit}' <<< "${apksigner_output}" \\
  | tr -d ':' \\
  | tr '[:lower:]' '[:upper:]')"
apk_certificate_format_valid=false
if [[ "${apk_certificate_sha1}" =~ ^[0-9A-F]{40}$ ]]; then
  apk_certificate_format_valid=true
fi
certificate_matches=false
if ${apk_certificate_format_valid} && [[ "${apk_certificate_sha1}" = "${android_sha1^^}" ]]; then
  certificate_matches=true
fi
jq -n \\
  --arg packageName "${ANDROID_PACKAGE}" \\
  --arg expectedCertificateSha1 "${android_sha1^^}" \\
  --arg actualCertificateSha1 "${apk_certificate_sha1}" \\
  --argjson apksignerExitCode "${apksigner_code}" \\
  --argjson certificateFormatValid "${apk_certificate_format_valid}" \\
  --argjson matchesRestrictedKey "${certificate_matches}" \\
  '{schema: "direkt.rc7.android-apk-certificate.v2", packageName: $packageName, expectedCertificateSha1: $expectedCertificateSha1, actualCertificateSha1: (if $actualCertificateSha1 == "" then null else $actualCertificateSha1 end), apksignerExitCode: $apksignerExitCode, certificateFormatValid: $certificateFormatValid, matchesRestrictedKey: $matchesRestrictedKey, cleanBuild: true, buildCacheEnabled: false, rawStderrIncluded: false}' \\
  > "${RUNNER_TEMP}/rc7-android-apk-certificate.json"
receipt "android_apk_certificate_sha1=${apk_certificate_sha1:-unavailable}"
receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"
receipt "android_apk_certificate_matches_key=${certificate_matches}"
if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then
  cat "${RUNNER_TEMP}/rc7-android-apk-certificate.json" >&2
  exit 1
fi
rm -f "${apksigner_stderr}"
'''
new = '''apksigner_stdout="${RUNNER_TEMP}/rc7-apksigner.stdout"
apksigner_stderr="${RUNNER_TEMP}/rc7-apksigner.stderr"
apk_certificate_digests_file="${RUNNER_TEMP}/rc7-apk-certificate-digests.txt"
set +e
"${apksigner_bin}" verify --print-certs "${app_apk}" \\
  > "${apksigner_stdout}" \\
  2> "${apksigner_stderr}"
apksigner_code=$?
set -e
python3 - "${apksigner_stdout}" "${apk_certificate_digests_file}" <<'PYCERT'
from pathlib import Path
import re
import sys

source = Path(sys.argv[1]).read_text(encoding="utf-8", errors="replace")
pattern = re.compile(
    r"^Signer (?:#[0-9]+|\\([^)]*\\)) certificate SHA-1 digest:\\s*([0-9A-Fa-f:]+)\\s*$",
    flags=re.MULTILINE,
)
digests = sorted(
    {
        match.replace(":", "").upper()
        for match in pattern.findall(source)
        if re.fullmatch(r"[0-9A-Fa-f]{40}|(?:[0-9A-Fa-f]{2}:){19}[0-9A-Fa-f]{2}", match)
    }
)
Path(sys.argv[2]).write_text("\\n".join(digests) + ("\\n" if digests else ""), encoding="utf-8")
PYCERT
mapfile -t apk_certificate_digests < "${apk_certificate_digests_file}"
certificate_digest_count="${#apk_certificate_digests[@]}"
apk_certificate_sha1=""
if [[ "${certificate_digest_count}" -eq 1 ]]; then
  apk_certificate_sha1="${apk_certificate_digests[0]}"
fi
apk_certificate_format_valid=false
if [[ "${certificate_digest_count}" -eq 1 && "${apk_certificate_sha1}" =~ ^[0-9A-F]{40}$ ]]; then
  apk_certificate_format_valid=true
fi
certificate_matches=false
if ${apk_certificate_format_valid} && [[ "${apk_certificate_sha1}" = "${android_sha1^^}" ]]; then
  certificate_matches=true
fi
jq -n \\
  --arg packageName "${ANDROID_PACKAGE}" \\
  --arg expectedCertificateSha1 "${android_sha1^^}" \\
  --arg actualCertificateSha1 "${apk_certificate_sha1}" \\
  --argjson apksignerExitCode "${apksigner_code}" \\
  --argjson certificateDigestCount "${certificate_digest_count}" \\
  --argjson certificateFormatValid "${apk_certificate_format_valid}" \\
  --argjson matchesRestrictedKey "${certificate_matches}" \\
  '{schema: "direkt.rc7.android-apk-certificate.v3", packageName: $packageName, expectedCertificateSha1: $expectedCertificateSha1, actualCertificateSha1: (if $actualCertificateSha1 == "" then null else $actualCertificateSha1 end), apksignerExitCode: $apksignerExitCode, certificateDigestCount: $certificateDigestCount, certificateFormatValid: $certificateFormatValid, matchesRestrictedKey: $matchesRestrictedKey, acceptedSignerLabelForms: ["numbered", "sdk_range"], cleanBuild: true, buildCacheEnabled: false, rawStdoutIncluded: false, rawStderrIncluded: false}' \\
  > "${RUNNER_TEMP}/rc7-android-apk-certificate.json"
receipt "android_apk_certificate_sha1=${apk_certificate_sha1:-unavailable}"
receipt "android_apk_certificate_digest_count=${certificate_digest_count}"
receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"
receipt "android_apk_certificate_matches_key=${certificate_matches}"
if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then
  cat "${RUNNER_TEMP}/rc7-android-apk-certificate.json" >&2
  exit 1
fi
rm -f "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"
'''
replace_once(managed, old, new)

contract = "scripts/rc7/verify-maps-contract.py"
replace_once(
    contract,
    '''        "certificateFormatValid",
        "rawStderrIncluded",
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',''',
    '''        "certificateDigestCount",
        "acceptedSignerLabelForms",
        "rawStdoutIncluded",
        "rawStderrIncluded",
        "Signer (?:#[0-9]+|\\\\([^)]*\\\\)) certificate SHA-1 digest",
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',''',
)
replace_once(
    contract,
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")''',
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")
    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")''',
)

context = "scripts/rc7/verify-managed-workflow-context.py"
replace_once(
    context,
    '''        "certificateFormatValid:",
        "rawStderrIncluded:",
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',''',
    '''        "certificateDigestCount:",
        "acceptedSignerLabelForms:",
        "rawStdoutIncluded:",
        "rawStderrIncluded:",
        "Signer (?:#[0-9]+|\\\\([^)]*\\\\)) certificate SHA-1 digest",
        'receipt "android_apk_certificate_digest_count=${certificate_digest_count}"',
        'receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"',
        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',''',
)
replace_once(
    context,
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")''',
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")
    prohibit(managed_script, r'cat "\\$\\{apksigner_stderr\\}"', "Raw apksigner stderr must not be printed.")''',
)
replace_once(
    context,
    '''    print("certificate_evidence_written_before_failure=true")''',
    '''    print("certificate_evidence_written_before_failure=true")
    print("numbered_and_sdk_range_signer_labels_supported=true")
    print("unique_certificate_digest_required=true")''',
)

replace_table_row(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** |",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Exact-main run `30230004924/1` passed backend OAuth, budget, quota, restricted key metadata, clean no-cache Android build and cleanup. Its certificate artifact proved `apksignerExitCode=0` but the parser recognized no digest because it accepted only the numbered signer label. The correction accepts Android's numbered and SDK-range signer labels, normalizes all SHA-1 records, and requires exactly one unique digest equal to the restricted key before API 36 Test Lab. |",
)
replace_table_row(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` |",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT remain prohibited. Run `30230004924/1` on `7c899295b176f767fd3da53f19b029b5582eae8a` passed WIF, fresh owner budget attestation, quota, key restriction, immutable backend OAuth canary, clean no-cache Android build and cleanup. Artifact `8639806488`, digest `sha256:6ee216fb0e416c3013c4d26ea9246afaeb9fd663a84de89816689489533111b4`, recorded `apksignerExitCode=0`, `certificateDigestCount=0`, and no Test Lab matrix. The correction supports numbered and SDK-range signer labels and requires one unique matching SHA-1 digest before Test Lab. |",
)

notes = Path("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md")
text = notes.read_text(encoding="utf-8")
text = text.replace(
    "**Corrective baseline:** `main@40faf2e8e708994f448a3877cc9475739a0957a4`",
    "**Corrective baseline:** `main@7c899295b176f767fd3da53f19b029b5582eae8a`",
    1,
)
anchor = "## Credential and authentication boundary\n"
section = '''## APK signer-label correction

Exact-main run `30230004924/1` on `7c899295b176f767fd3da53f19b029b5582eae8a` passed backend service-identity OAuth, the fresh one-JPY budget attestation, quota, restricted Android key metadata, clean no-build-cache APK creation and Cloud Run cleanup. Artifact `8639806488` has digest `sha256:6ee216fb0e416c3013c4d26ea9246afaeb9fd663a84de89816689489533111b4`. `apksigner` exited zero, but the v2 parser returned no digest because it matched only `Signer #1`; Test Lab correctly did not start.

Android's `apksigner` output can identify certificate records with a numbered signer label or an SDK-range signer label. The corrected parser accepts both forms, normalizes and deduplicates all SHA-1 records, and requires exactly one unique digest equal to the key restriction. Multiple different digests, malformed output, a signer-tool failure or a mismatch all fail closed after the sanitized v3 certificate artifact is written. Raw signer stdout and stderr are never printed or uploaded.

'''
if section not in text:
    if anchor not in text:
        raise SystemExit("missing implementation-notes anchor")
    text = text.replace(anchor, section + anchor, 1)
notes.write_text(text, encoding="utf-8")

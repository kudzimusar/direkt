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
    '''receipt "android_package=${ANDROID_PACKAGE}"
receipt "android_debug_certificate_sha1=${android_sha1^^}"
''',
    '''receipt "android_package=${ANDROID_PACKAGE}"
receipt "android_debug_certificate_sha1=${android_sha1^^}"
receipt "android_provisional_certificate_sha1=${android_sha1^^}"
''',
)
replace_once(
    managed,
    '''receipt "android_key_restricted=true"
receipt "android_key_persistent_synthetic_debug_only=true"
receipt "credential_propagation_wait_seconds=60"
''',
    '''receipt "android_key_restricted=true"
receipt "android_key_provisionally_restricted=true"
receipt "android_key_persistent_synthetic_debug_only=true"
receipt "credential_propagation_wait_seconds=60"
''',
)
old_cert = '''apk_certificate_format_valid=false
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
  '{schema: "direkt.rc7.android-apk-certificate.v3", packageName: $packageName, expectedCertificateSha1: $expectedCertificateSha1, actualCertificateSha1: (if $actualCertificateSha1 == "" then null else $actualCertificateSha1 end), apksignerExitCode: $apksignerExitCode, certificateDigestCount: $certificateDigestCount, certificateFormatValid: $certificateFormatValid, matchesRestrictedKey: $matchesRestrictedKey, digestFieldPattern: "certificate_sha1_digest", presentationPrefixIndependent: true, parsedStreams: ["stdout", "stderr"], cleanBuild: true, buildCacheEnabled: false, rawStdoutIncluded: false, rawStderrIncluded: false}' \\
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
new_cert = '''apk_certificate_format_valid=false
if [[ "${certificate_digest_count}" -eq 1 && "${apk_certificate_sha1}" =~ ^[0-9A-F]{40}$ ]]; then
  apk_certificate_format_valid=true
fi
prebuild_certificate_matches_apk=false
if ${apk_certificate_format_valid} && [[ "${apk_certificate_sha1}" = "${android_sha1^^}" ]]; then
  prebuild_certificate_matches_apk=true
fi
write_certificate_artifact() {
  local final_restriction_matches_apk="$1"
  jq -n \\
    --arg packageName "${ANDROID_PACKAGE}" \\
    --arg provisionalCertificateSha1 "${android_sha1^^}" \\
    --arg actualCertificateSha1 "${apk_certificate_sha1}" \\
    --arg finalRestrictionCertificateSha1 "${apk_certificate_sha1}" \\
    --argjson apksignerExitCode "${apksigner_code}" \\
    --argjson certificateDigestCount "${certificate_digest_count}" \\
    --argjson certificateFormatValid "${apk_certificate_format_valid}" \\
    --argjson prebuildCertificateMatchesApk "${prebuild_certificate_matches_apk}" \\
    --argjson matchesRestrictedKey "${final_restriction_matches_apk}" \\
    '{schema: "direkt.rc7.android-apk-certificate.v4", packageName: $packageName, provisionalCertificateSha1: $provisionalCertificateSha1, actualCertificateSha1: (if $actualCertificateSha1 == "" then null else $actualCertificateSha1 end), finalRestrictionCertificateSha1: (if $finalRestrictionCertificateSha1 == "" then null else $finalRestrictionCertificateSha1 end), apksignerExitCode: $apksignerExitCode, certificateDigestCount: $certificateDigestCount, certificateFormatValid: $certificateFormatValid, prebuildCertificateMatchesApk: $prebuildCertificateMatchesApk, matchesRestrictedKey: $matchesRestrictedKey, finalRestrictionMatchesApk: $matchesRestrictedKey, digestFieldPattern: "certificate_sha1_digest", presentationPrefixIndependent: true, parsedStreams: ["stdout", "stderr"], cleanBuild: true, buildCacheEnabled: false, rawStdoutIncluded: false, rawStderrIncluded: false}' \\
    > "${RUNNER_TEMP}/rc7-android-apk-certificate.json"
}
write_certificate_artifact false
receipt "android_apk_certificate_sha1=${apk_certificate_sha1:-unavailable}"
receipt "android_apk_certificate_digest_count=${certificate_digest_count}"
receipt "android_apk_certificate_format_valid=${apk_certificate_format_valid}"
receipt "android_prebuild_certificate_matches_apk=${prebuild_certificate_matches_apk}"
if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid}; then
  cat "${RUNNER_TEMP}/rc7-android-apk-certificate.json" >&2
  exit 1
fi

gcloud services api-keys update "${ANDROID_KEY_ID}" \\
  --project "${GCP_PROJECT_ID}" \\
  --location global \\
  --display-name 'DIREKT RC7 Android Maps synthetic' \\
  --allowed-application "sha1_fingerprint=${apk_certificate_sha1},package_name=${ANDROID_PACKAGE}" \\
  --api-target service=maps-android-backend.googleapis.com \\
  --quiet
gcloud services api-keys describe "${ANDROID_KEY_ID}" \\
  --project "${GCP_PROJECT_ID}" \\
  --location global \\
  --format=json > "${RUNNER_TEMP}/rc7-android-key-metadata.json"
jq -e --arg package "${ANDROID_PACKAGE}" --arg sha "${apk_certificate_sha1}" '
  .restrictions.androidKeyRestrictions.allowedApplications
  | length == 1 and any(.packageName == $package and (.sha1Fingerprint | ascii_upcase) == $sha)
' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
jq -e '
  (.restrictions.apiTargets | length) == 1 and
  .restrictions.apiTargets[0].service == "maps-android-backend.googleapis.com"
' "${RUNNER_TEMP}/rc7-android-key-metadata.json" >/dev/null
write_certificate_artifact true
receipt "android_apk_certificate_matches_key=true"
receipt "android_key_restricted_to_final_apk=true"
receipt "final_credential_propagation_wait_seconds=60"
rm -f "${apksigner_stdout}" "${apksigner_stderr}" "${apk_certificate_digests_file}"
sleep 60
'''
replace_once(managed, old_cert, new_cert)

contract = "scripts/rc7/verify-maps-contract.py"
replace_once(
    contract,
    '''        "certificateDigestCount",
        "digestFieldPattern",
        "presentationPrefixIndependent",''',
    '''        "certificateDigestCount",
        "provisionalCertificateSha1",
        "finalRestrictionCertificateSha1",
        "prebuildCertificateMatchesApk",
        "finalRestrictionMatchesApk",
        "digestFieldPattern",
        "presentationPrefixIndependent",''',
)
replace_once(
    contract,
    '''        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',
        "collect-testlab-failure.py",''',
    '''        'receipt "android_prebuild_certificate_matches_apk=${prebuild_certificate_matches_apk}"',
        'receipt "android_apk_certificate_matches_key=true"',
        'receipt "android_key_restricted_to_final_apk=true"',
        'receipt "final_credential_propagation_wait_seconds=60"',
        '--allowed-application "sha1_fingerprint=${apk_certificate_sha1},package_name=${ANDROID_PACKAGE}"',
        'write_certificate_artifact false',
        'write_certificate_artifact true',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid}; then',
        "collect-testlab-failure.py",''',
)
replace_once(
    contract,
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")''',
    '''    provisional_index = managed_script.find('sha1_fingerprint=${android_sha1}')
    final_index = managed_script.find('sha1_fingerprint=${apk_certificate_sha1}')
    testlab_index = managed_script.find('gcloud firebase test android run')
    if not (0 <= provisional_index < final_index < testlab_index):
        raise AssertionError("The Android Maps key must be re-restricted to the final APK before Test Lab.")
    prohibit(managed_script, r'! \\${prebuild_certificate_matches_apk}', "A provisional certificate mismatch must not block final restriction.")
    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")''',
)

context = "scripts/rc7/verify-managed-workflow-context.py"
replace_once(
    context,
    '''        "certificateDigestCount:",
        "digestFieldPattern:",''',
    '''        "certificateDigestCount:",
        "provisionalCertificateSha1:",
        "finalRestrictionCertificateSha1:",
        "prebuildCertificateMatchesApk:",
        "finalRestrictionMatchesApk:",
        "digestFieldPattern:",''',
)
replace_once(
    context,
    '''        'receipt "android_apk_certificate_matches_key=${certificate_matches}"',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then',
        "*/\\\\1/p'",''',
    '''        'receipt "android_prebuild_certificate_matches_apk=${prebuild_certificate_matches_apk}"',
        'receipt "android_apk_certificate_matches_key=true"',
        'receipt "android_key_restricted_to_final_apk=true"',
        'receipt "final_credential_propagation_wait_seconds=60"',
        '--allowed-application "sha1_fingerprint=${apk_certificate_sha1},package_name=${ANDROID_PACKAGE}"',
        'write_certificate_artifact false',
        'write_certificate_artifact true',
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid}; then',
        "*/\\\\1/p'",''',
)
replace_once(
    context,
    '''    certificate_failure_check = managed_script.find(
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid} || ! ${certificate_matches}; then'
    )''',
    '''    certificate_failure_check = managed_script.find(
        'if [[ "${apksigner_code}" -ne 0 ]] || [[ "${certificate_digest_count}" -ne 1 ]] || ! ${apk_certificate_format_valid}; then'
    )''',
)
replace_once(
    context,
    '''    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")''',
    '''    provisional_index = managed_script.find('sha1_fingerprint=${android_sha1}')
    final_index = managed_script.find('sha1_fingerprint=${apk_certificate_sha1}')
    testlab_index = managed_script.find('gcloud firebase test android run')
    if not (0 <= provisional_index < final_index < testlab_index):
        raise AssertionError("Final APK restriction must precede Test Lab.")
    prohibit(managed_script, r'! \\${prebuild_certificate_matches_apk}', "Provisional certificate mismatch cannot remain a blocker.")
    prohibit(managed_script, r'cat "\\$\\{apksigner_stdout\\}"', "Raw apksigner stdout must not be printed.")''',
)
replace_once(
    context,
    '''    print("signer_presentation_prefix_required=false")''',
    '''    print("signer_presentation_prefix_required=false")
    print("provisional_key_restriction_build_only=true")
    print("final_apk_key_restriction_verified_before_testlab=true")''',
)

replace_table_row(
    "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** |",
    "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Exact-main run `30231743285/1` passed backend OAuth, budget, quota, clean no-cache build and semantic certificate extraction, proving one valid final APK SHA-1. The final APK certificate differed from the provisional build-time restriction, so the run failed closed before Test Lab. The correction re-restricts the same key to the actual packaged APK package+certificate pair, verifies metadata/API target, waits for propagation, and only then starts API 36 Test Lab. |",
)
replace_table_row(
    "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` |",
    "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT remain prohibited. Run `30231743285/1` on `bcb30008c245a6a10ae3348b831259cef6dee441` passed WIF, fresh owner budget attestation, quota, immutable backend OAuth canary, clean no-cache build, semantic certificate parsing and cleanup. Artifact `8640363497`, digest `sha256:dfb312b7bebb8bbb2d6b45e2bd2d008fb04fa1475f6cfc73eaf4353f88bc9d83`, recorded one valid final APK SHA-1 (`73B272B19F9FAAF4EA02DEA0790B96B7675A6490`) that differed from the provisional restriction (`236674CF2789751759438E78E43A63A3584F44E0`); no Test Lab matrix was created. The correction verifies a final package+APK-certificate key restriction before Test Lab. |",
)

notes = Path("docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md")
text = notes.read_text(encoding="utf-8")
text = text.replace(
    "**Corrective baseline:** `main@e5c93419da91bc2276c0d02fa87568ac0e75b22f`",
    "**Corrective baseline:** `main@bcb30008c245a6a10ae3348b831259cef6dee441`",
    1,
)
anchor = "## Credential and authentication boundary\n"
section = '''## Final APK key-restriction correction

Exact-main run `30231743285/1` on `bcb30008c245a6a10ae3348b831259cef6dee441` passed backend OAuth, the fresh one-JPY budget attestation, quota, clean no-build-cache packaging and semantic certificate extraction. Artifact `8640363497` has digest `sha256:dfb312b7bebb8bbb2d6b45e2bd2d008fb04fa1475f6cfc73eaf4353f88bc9d83`. The final APK contained one valid SHA-1 certificate, but it differed from the provisional keystore fingerprint used to restrict the key before build; Test Lab correctly did not start and Cloud Run cleanup passed.

The corrected sequence retains a provisional package+certificate restriction only while the synthetic key value is retrieved and embedded. After the clean build, it extracts the actual APK certificate, updates the same key to exactly that package+certificate pair, verifies the API-key metadata and sole Maps SDK target, writes final sanitized evidence, waits 60 seconds for propagation, and only then starts Test Lab. A provisional mismatch is diagnostic rather than authoritative; the verified final APK restriction is the trust boundary. The key value never changes and is never uploaded.

'''
if section not in text:
    if anchor not in text:
        raise SystemExit("missing implementation-notes anchor")
    text = text.replace(anchor, section + anchor, 1)
notes.write_text(text, encoding="utf-8")

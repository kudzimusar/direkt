#!/usr/bin/env python3
"""Reject RC7 workflow, CLI, evidence and managed-canary contract drift."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github/workflows/rc7-maps-managed.yml"
MANAGED_SCRIPT = ROOT / "scripts/rc7/run-maps-managed.sh"
GEOCODING_PORT = ROOT / "backend/direkt-api/src/location/geocoding-provider.port.ts"
GEOCODING_ADAPTER = ROOT / "backend/direkt-api/src/location/google-maps-geocoding-provider.adapter.ts"
LOCATION_SERVICE = ROOT / "backend/direkt-api/src/location/location.service.ts"
GEOCODING_TEST = ROOT / "backend/direkt-api/test/unit/location/google-maps-geocoding-provider.adapter.spec.ts"
OAUTH_SCOPE = "https://www.googleapis.com/auth/maps-platform.geocode.address"


def require_once(content: str, value: str, message: str) -> int:
    count = content.count(value)
    if count != 1:
        raise AssertionError(f"{message} Expected exactly once, found {count}.")
    return content.find(value)


def require_present(content: str, value: str, message: str) -> None:
    if value not in content:
        raise AssertionError(f"{message} Missing {value!r}.")


def prohibit(content: str, pattern: str, message: str) -> None:
    if re.search(pattern, content, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"{message} Prohibited pattern {pattern!r}.")


def command_blocks(script: str, command: str) -> list[str]:
    lines = script.splitlines()
    blocks: list[str] = []
    for index, line in enumerate(lines):
        if command not in line:
            continue
        block = [line]
        cursor = index
        while block[-1].rstrip().endswith("\\"):
            cursor += 1
            if cursor >= len(lines):
                raise AssertionError(f"Unterminated shell command: {command}")
            block.append(lines[cursor])
        blocks.append("\n".join(block))
    return blocks


def main() -> int:
    workflow = WORKFLOW.read_text(encoding="utf-8")
    managed_script = MANAGED_SCRIPT.read_text(encoding="utf-8")
    geocoding_port = GEOCODING_PORT.read_text(encoding="utf-8")
    geocoding_adapter = GEOCODING_ADAPTER.read_text(encoding="utf-8")
    location_service = LOCATION_SERVICE.read_text(encoding="utf-8")
    geocoding_test = GEOCODING_TEST.read_text(encoding="utf-8")

    forbidden_job_env = re.compile(
        r"^\s{6}RC7_RECEIPT_PATH:\s*\$\{\{\s*runner\.temp\s*\}\}\s*$",
        flags=re.MULTILINE,
    )
    if forbidden_job_env.search(workflow):
        raise AssertionError(
            "RC7_RECEIPT_PATH cannot use runner.temp in job-level env; "
            "the runner context does not exist before job startup."
        )

    required_runtime_export = (
        'echo "RC7_RECEIPT_PATH=${RUNNER_TEMP}/rc7-maps-managed-receipt.txt" '
        '>> "${GITHUB_ENV}"'
    )
    export_step = require_once(
        workflow,
        required_runtime_export,
        "RC7 must initialize its receipt path from RUNNER_TEMP inside a running step.",
    )
    resolve_step = workflow.find("- name: Resolve exact-main execution inputs")
    checkout_step = workflow.find("- name: Check out exact reviewed source")
    if not (0 <= resolve_step < export_step < checkout_step):
        raise AssertionError(
            "RC7 receipt path must be initialized in the exact-main controls step before checkout."
        )

    require_once(workflow, 'CLOUDSDK_CORE_DISABLE_PROMPTS: "1"', "Cloud SDK prompts must be disabled.")
    require_once(workflow, 'DIREKT_GCLOUD_VERSION: "568.0.0"', "Cloud SDK must remain pinned.")
    require_once(
        workflow,
        "version: ${{ env.DIREKT_GCLOUD_VERSION }}",
        "setup-gcloud must consume the reviewed pin.",
    )
    setup_gcloud = require_once(workflow, "- name: Set up pinned Google Cloud CLI", "Missing gcloud setup.")
    alpha_step = require_once(
        workflow,
        "- name: Install matching gcloud alpha component noninteractively",
        "Missing alpha installation.",
    )
    alpha_command = require_once(
        workflow,
        "run: gcloud components install alpha --quiet",
        "Alpha installation must be noninteractive.",
    )
    managed_execution = workflow.find("- name: Execute bounded managed proof")
    if not (0 <= setup_gcloud < alpha_step <= alpha_command < managed_execution):
        raise AssertionError("Pinned gcloud and alpha setup must precede managed execution.")

    create_blocks = command_blocks(managed_script, "gcloud services api-keys create")
    if len(create_blocks) != 1:
        raise AssertionError(
            f"RC7 must create only the Android API key, found {len(create_blocks)} create commands."
        )
    create_block = create_blocks[0]
    if "--location" in create_block:
        raise AssertionError("Cloud SDK 568 API-key create must not receive --location.")
    for required in (
        "--project",
        "--key-id \"${ANDROID_KEY_ID}\"",
        "--allowed-application",
        "--api-target service=maps-android-backend.googleapis.com",
        "--quiet",
    ):
        if required not in create_block:
            raise AssertionError(f"Android API-key create command is missing {required}.")

    for label, command in {
        "describe": "gcloud services api-keys describe",
        "update": "gcloud services api-keys update",
        "get-key-string": "gcloud services api-keys get-key-string",
    }.items():
        blocks = command_blocks(managed_script, command)
        if not blocks:
            raise AssertionError(f"RC7 Android API-key {label} command is missing.")
        for block in blocks:
            if "--location global" not in block:
                raise AssertionError(
                    f"RC7 Android API-key {label} must retain the explicit global resource location."
                )

    for pattern, message in (
        (r"direkt-rc7-backend", "Backend API key must not return."),
        (r"--allowed-ips", "Backend IP restriction must not return."),
        (r"GOOGLE_MAPS_SERVER_API_KEY", "Backend API-key environment must not return."),
        (r"gcloud\s+compute\s+(addresses|routers)", "Cloud NAT infrastructure must not return."),
        (r"gcloud\s+secrets", "Backend Maps secret mutation must not return."),
        (r"--set-secrets", "Backend secret binding must not return."),
        (r"--vpc-egress", "Forced VPC egress must not return."),
        (r"gcloud\s+billing\s+budgets", "Managed CI must not require billing-account budget access."),
    ):
        prohibit(managed_script, pattern, message)

    for marker in (
        "direkt-rc7-budget-checked-at",
        "budget_attestation=project_labels",
        "RC7 owner budget attestation is missing or stale.",
    ):
        require_present(managed_script, marker, "Fresh owner budget attestation drifted.")

    failure_artifact = "${{ runner.temp }}/rc7-maps-canary-failure.json"
    require_once(workflow, failure_artifact, "RC7 must upload the sanitized canary failure artifact.")
    if "rc7-maps-canary-logs.json" in workflow or "rc7-maps-execution-details.json" in workflow:
        raise AssertionError("RC7 must never upload raw canary logs or raw execution details.")

    for marker in (
        'sanitized_failure="${RUNNER_TEMP}/rc7-maps-canary-failure.json"',
        "gcloud run jobs executions describe",
        'textPayload:\\"RC7_MAPS_CANARY|\\"',
        'payload.startswith("RC7_MAPS_CANARY|")',
        '"rawLogsIncluded": False',
        '"credentialIncluded": False',
        '"coordinateValuesIncluded": False',
        '"formattedAddressIncluded": False',
        '"authentication": "service_identity_oauth"',
        'receipt "backend_geocoding_canary=FAILED"',
        'receipt "backend_canary_failure_evidence_present=true"',
    ):
        require_once(managed_script, marker, f"Sanitized failure evidence is missing {marker!r}.")
    prohibit(managed_script, r'cat "\$\{raw_canary_logs\}"', "Raw canary logs must not be printed.")
    prohibit(managed_script, r'cat "\$\{execution_details\}"', "Raw execution details must not be printed.")

    for marker in (
        "metadata.google.internal",
        "Metadata-Flavor",
        "enforce_scopes",
        OAUTH_SCOPE,
        "Authorization: `Bearer ${accessToken}`",
        "https://geocode.googleapis.com/v4/geocode/address",
    ):
        require_present(geocoding_adapter, marker, "OAuth Geocoding v4 contract drifted.")

    for code in ("'quota_exceeded'", "'request_denied'"):
        require_present(geocoding_port, code, "Provider error contract drifted.")
        require_present(geocoding_adapter, code, "Adapter rejection contract drifted.")
        require_present(location_service, f"case {code}:", "Fallback mapping drifted.")
        require_present(geocoding_test, f"code: {code}", "Adapter regression coverage drifted.")

    for http_status, safe_message in (
        ("response.status === 429", "Google Maps Geocoding exceeded the bounded quota."),
        (
            "response.status === 401 || response.status === 403",
            "Google Maps Geocoding denied the bounded OAuth request.",
        ),
    ):
        require_present(geocoding_adapter, http_status, "Provider HTTP-status distinction drifted.")
        require_present(geocoding_adapter, safe_message, "Safe provider message drifted.")
        require_present(geocoding_test, safe_message, "Safe rejection coverage drifted.")

    if "error_message" in geocoding_adapter or "error.message" in geocoding_adapter:
        raise AssertionError("RC7 adapter must not read or expose Google's raw error payload.")

    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")
    print("job_level_runner_context=false")
    print("receipt_path_runtime_initialized=true")
    print("cloudsdk_prompts_disabled=true")
    print("gcloud_version_pinned=568.0.0")
    print("gcloud_alpha_noninteractive=true")
    print("android_api_key_only=true")
    print("backend_service_identity_oauth=true")
    print("backend_api_key=false")
    print("backend_cloud_nat=false")
    print("canary_failure_evidence_sanitized=true")
    print("raw_canary_logs_uploaded=false")
    print("provider_rejection_status_distinguished=true")
    print("provider_raw_error_exposed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

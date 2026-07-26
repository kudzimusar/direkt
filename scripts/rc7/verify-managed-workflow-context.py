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
GEOCODING_TEST = (
    ROOT / "backend/direkt-api/test/unit/location/google-maps-geocoding-provider.adapter.spec.ts"
)


def require_once(content: str, value: str, message: str) -> int:
    count = content.count(value)
    if count != 1:
        raise AssertionError(f"{message} Expected exactly once, found {count}.")
    return content.find(value)


def require_present(content: str, value: str, message: str) -> None:
    if value not in content:
        raise AssertionError(f"{message} Missing {value!r}.")


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
            "RC7 receipt path must be initialized in the exact-main controls step "
            "before checkout and managed execution."
        )

    require_once(
        workflow,
        'CLOUDSDK_CORE_DISABLE_PROMPTS: "1"',
        "RC7 must disable Cloud SDK prompts in the managed job.",
    )
    require_once(
        workflow,
        'DIREKT_GCLOUD_VERSION: "568.0.0"',
        "RC7 must pin the reviewed Cloud SDK version.",
    )
    require_once(
        workflow,
        "version: ${{ env.DIREKT_GCLOUD_VERSION }}",
        "RC7 setup-gcloud must consume the reviewed Cloud SDK pin.",
    )

    setup_gcloud = require_once(
        workflow,
        "- name: Set up pinned Google Cloud CLI",
        "RC7 must identify the pinned Cloud SDK setup step.",
    )
    alpha_step = require_once(
        workflow,
        "- name: Install matching gcloud alpha component noninteractively",
        "RC7 must explicitly install the alpha component before quota inspection.",
    )
    alpha_command = require_once(
        workflow,
        "run: gcloud components install alpha --quiet",
        "RC7 alpha component installation must be noninteractive.",
    )
    managed_execution = workflow.find("- name: Execute bounded managed proof")
    if not (0 <= setup_gcloud < alpha_step <= alpha_command < managed_execution):
        raise AssertionError(
            "RC7 must install the matching alpha component after pinned setup-gcloud "
            "and before the managed proof script executes."
        )

    create_blocks = command_blocks(managed_script, "gcloud services api-keys create")
    if len(create_blocks) != 2:
        raise AssertionError(
            f"RC7 must contain exactly two API-key create commands, found {len(create_blocks)}."
        )
    for block in create_blocks:
        if "--location" in block:
            raise AssertionError(
                "Cloud SDK 568 API-key create does not accept --location; resource location "
                "is selected by the create endpoint."
            )
        for required in ("--project", "--key-id", "--api-target", "--quiet"):
            if required not in block:
                raise AssertionError(f"RC7 API-key create command is missing {required}.")

    located_commands = {
        "describe": "gcloud services api-keys describe",
        "update": "gcloud services api-keys update",
        "delete": "gcloud services api-keys delete",
        "get-key-string": "gcloud services api-keys get-key-string",
    }
    for label, command in located_commands.items():
        blocks = command_blocks(managed_script, command)
        if not blocks:
            raise AssertionError(f"RC7 API-key {label} command is missing.")
        for block in blocks:
            if "--location global" not in block:
                raise AssertionError(
                    f"RC7 API-key {label} must retain the explicit global resource location."
                )

    failure_artifact = "${{ runner.temp }}/rc7-maps-canary-failure.json"
    require_once(
        workflow,
        failure_artifact,
        "RC7 must upload the sanitized canary failure artifact.",
    )
    if "rc7-maps-canary-logs.json" in workflow or "rc7-maps-execution-details.json" in workflow:
        raise AssertionError("RC7 must never upload raw canary logs or raw execution details.")

    failure_markers = (
        'sanitized_failure="${RUNNER_TEMP}/rc7-maps-canary-failure.json"',
        "gcloud run jobs executions describe",
        'textPayload:\\"RC7_MAPS_CANARY|\\"',
        'payload.startswith("RC7_MAPS_CANARY|")',
        '"rawLogsIncluded": False',
        '"credentialIncluded": False',
        '"coordinateValuesIncluded": False',
        '"formattedAddressIncluded": False',
        'receipt "backend_geocoding_canary=FAILED"',
        'receipt "backend_canary_failure_evidence_present=true"',
    )
    for marker in failure_markers:
        require_once(
            managed_script,
            marker,
            f"RC7 sanitized canary failure evidence is missing {marker!r}.",
        )

    if 'cat "${raw_canary_logs}"' in managed_script:
        raise AssertionError("RC7 must not print raw canary logs.")
    if 'cat "${execution_details}"' in managed_script:
        raise AssertionError("RC7 must not print raw execution details.")

    for code in ("'quota_exceeded'", "'request_denied'"):
        require_present(geocoding_port, code, "RC7 provider error contract drifted.")
        require_present(geocoding_adapter, code, "RC7 adapter rejection contract drifted.")
        require_present(location_service, f"case {code}:", "RC7 fallback mapping drifted.")
        require_present(geocoding_test, f"code: {code}", "RC7 adapter regression coverage drifted.")

    rejection_contract = (
        ("OVER_QUERY_LIMIT", "Google Maps Geocoding exceeded the bounded quota."),
        ("REQUEST_DENIED", "Google Maps Geocoding denied the bounded request."),
    )
    for provider_status, safe_message in rejection_contract:
        require_present(
            geocoding_adapter,
            f"payload.status === '{provider_status}'",
            "RC7 bounded provider-status distinction drifted.",
        )
        require_present(
            geocoding_adapter,
            safe_message,
            "RC7 safe provider rejection message drifted.",
        )
        require_present(
            geocoding_test,
            safe_message,
            "RC7 safe rejection regression coverage drifted.",
        )

    if "error_message" in geocoding_adapter:
        raise AssertionError("RC7 adapter must not read or expose Google's raw error_message.")

    print("RC7_MANAGED_WORKFLOW_CONTEXT|PASS")
    print("job_level_runner_context=false")
    print("receipt_path_runtime_initialized=true")
    print("cloudsdk_prompts_disabled=true")
    print("gcloud_version_pinned=568.0.0")
    print("gcloud_alpha_noninteractive=true")
    print("api_key_create_location_argument=false")
    print("api_key_resource_location_preserved=true")
    print("canary_failure_evidence_sanitized=true")
    print("raw_canary_logs_uploaded=false")
    print("provider_rejection_status_distinguished=true")
    print("provider_raw_error_exposed=false")
    print("gcp_authority_changed=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

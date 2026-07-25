#!/usr/bin/env python3
"""Permanent fail-closed verifier for the RC5 read-only Test Lab preflight."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise AssertionError(f"Missing required RC5 preflight file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def main() -> int:
    lock = read("WORKSTREAM_LOCK.md")
    workflow = read(".github/workflows/rc5-test-lab-preflight.yml")
    bridge = read(".github/workflows/rc5-test-lab-preflight-once.yml")
    inspector = read("scripts/rc5/run-test-lab-preflight.sh")
    contract = read(".github/workflows/rc5-test-lab-contract.yml")
    notes = read("docs/integrations/RC5_TEST_LAB_READONLY_PREFLIGHT.md")

    for needle in (
        "CLAIMED — RC5 Firebase Test Lab device-matrix closure",
        "RC5 implementation contract — ACTIVE",
        "RC5 Firebase Test Lab is the sole active implementation lane",
        "Draft PR #378 is stale and unmergeable",
        "RC7+ source work must not begin until RC5 releases",
        "Production-release authorization | BLOCKED",
    ):
        require(lock, needle, "active RC5 lock boundary")

    for needle in (
        "run-name: DIREKT RC5 preflight ${{ inputs.correlation_id }}",
        "workflow_dispatch:",
        "source_sha:",
        "correlation_id:",
        'SOURCE_SHA: ${{ inputs.source_sha }}',
        'RC5_PREFLIGHT_CORRELATION: ${{ inputs.correlation_id }}',
        'test "$(git rev-parse origin/main)" = "${SOURCE_SHA}"',
        "google-github-actions/auth@v3",
        "google-github-actions/setup-gcloud@v3",
        "bash scripts/rc5/run-test-lab-preflight.sh",
        "continue-on-error: true",
        "rc5-test-lab-preflight-${{ github.run_id }}",
        'grep -Fxq "CORRELATION|${RC5_PREFLIGHT_CORRELATION}"',
        "RESOURCE_MUTATION|false",
        "MATRIX_EXECUTED|false",
        "SECRET_VALUES_ACCESSED|false",
        "PRODUCTION_AUTHORIZATION|false",
        "RESULT|ready",
        "FAILURE_COUNT|0",
        "retention-days: 30",
    ):
        require(workflow, needle, "managed read-only preflight workflow control")

    for needle in (
        "CORRELATION|${correlation_id}",
        "MODE|metadata_iam_catalog_only",
        "RESOURCE_MUTATION|false",
        "MATRIX_EXECUTED|false",
        "SECRET_VALUES_ACCESSED|false",
        "PRODUCTION_AUTHORIZATION|false",
        "gcloud services list --enabled",
        "value(config.name)",
        "gcloud iam roles describe",
        "gcloud projects get-iam-policy",
        "verify-no-project-storage-roles.sh",
        "gcloud storage buckets describe",
        "gcloud storage buckets get-iam-policy",
        'length == 1 and .[0].action.type == "Delete" and .[0].condition.age == $age',
        "additional or earlier deletion rule",
        "actual_deployer_bucket_roles",
        "no additional deployer role",
        "gcloud firebase test android models list",
        "gcloud firebase test android versions list",
        "select-test-lab-matrix.py",
        "preflightOnly: true",
        "matrixExecuted: false",
        "RESULT|not_ready",
        "RESULT|ready",
    ):
        require(inspector, needle, "read-only metadata/IAM/catalog inspector")

    read_only_surface = workflow + "\n" + inspector
    for pattern, label in (
        (r"gcloud\s+services\s+enable", "API enablement"),
        (r"gcloud\s+iam\s+roles\s+(create|update|delete|undelete)", "custom-role mutation"),
        (r"gcloud\s+projects\s+(add|remove)-iam-policy-binding", "project IAM mutation"),
        (r"gcloud\s+storage\s+buckets\s+(create|update|delete|add-iam-policy-binding|remove-iam-policy-binding)", "bucket mutation"),
        (r"gcloud\s+storage\s+(cp|mv|rm)", "Storage object mutation"),
        (r"gcloud\s+firebase\s+test\s+android\s+run", "Test Lab matrix execution"),
        (r"gcloud\s+secrets\s+versions\s+access", "secret-value access"),
        (r"gcloud\s+iam\s+service-accounts\s+keys\s+create", "service-account key creation"),
        (r"credentials_json\s*:", "static Google credentials"),
        (r"--results-bucket", "Test Lab results write target"),
    ):
        prohibit(read_only_surface, pattern, label)

    for needle in (
        "branches:\n      - main",
        "- .github/workflows/rc5-test-lab-preflight-once.yml",
        "actions: write",
        "issues: write",
        'source_sha="${GITHUB_SHA}"',
        'correlation_id="rc5-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"',
        'expected_run_title="DIREKT RC5 preflight ${correlation_id}"',
        'test "${main_sha}" = "${source_sha}"',
        '"correlation_id":$correlation',
        "rc5-test-lab-preflight.yml/dispatches",
        "event=workflow_dispatch&branch=main",
        ".display_title == $title",
        'test "$(jq -r \' .display_title\' <<< "${run_json}")" = "${expected_run_title}"'.replace("' .display_title'", "'.display_title'"),
        'grep -Fxq "CORRELATION|${correlation_id}"',
        "available_and_schema_validated",
        "RC5 read-only preflight receipt",
        "repos/${repo}/issues/261/comments",
        "RESOURCE_MUTATION|false",
        "MATRIX_EXECUTED|false",
        "PRODUCTION_AUTHORIZATION|false",
        "stale_success",
        "RESULT|ready",
        "FAILURE_COUNT|0",
    ):
        require(bridge, needle, "one-shot preflight receipt bridge")

    for pattern, label in (
        (r"firebase-test-lab\.yml/dispatches", "managed Test Lab matrix dispatch"),
        (r"RUN-DIREKT-TEST-LAB", "matrix execution confirmation"),
        (r"google-github-actions/auth", "Google Cloud authentication in bridge"),
        (r"gcloud\b", "Google Cloud command in bridge"),
        (r"id-token:\s*write", "OIDC authority in bridge"),
        (r"secrets\s+versions\s+access", "secret-value access in bridge"),
    ):
        prohibit(bridge, pattern, label)

    for needle in (
        '".github/workflows/rc5-test-lab-preflight.yml"',
        '".github/workflows/rc5-test-lab-preflight-once.yml"',
        '"docs/integrations/RC5_TEST_LAB_READONLY_PREFLIGHT.md"',
        "bash -n scripts/rc5/run-test-lab-preflight.sh",
        "scripts/rc5/verify-test-lab-preflight.py",
        "python scripts/rc5/verify-test-lab-preflight.py",
    ):
        require(contract, needle, "permanent RC5 preflight path ownership")

    for needle in (
        "RC5 active/resumed; managed matrix not yet authorized",
        "metadata/IAM/bucket/catalog inspection only",
        "exactly one 30-day delete lifecycle rule",
        "no additional bucket role",
        "unique bridge correlation identifier",
        "CORRELATION|rc5-<bridge-run-id>-<attempt>",
        "RESOURCE_MUTATION|false",
        "MATRIX_EXECUTED|false",
        "SECRET_VALUES_ACCESSED|false",
        "PRODUCTION_AUTHORIZATION|false",
        "RESULT|ready",
        "FAILURE_COUNT|0",
        "draft PR #378 must remain unmerged",
        "RC7+ and production authorization remain blocked",
    ):
        require(notes, needle, "permanent RC5 preflight documentation")

    print("RC5 read-only Test Lab preflight verification passed.")
    print("source=exact_current_main")
    print("identity=github_oidc_no_static_credentials")
    print("inspection=services_custom_roles_project_iam_bucket_iam_lifecycle_live_catalog")
    print("resource_mutation=false")
    print("matrix_executed=false")
    print("secret_value_access=false")
    print("receipt=uniquely_correlated_schema_validated_dedicated_issue")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

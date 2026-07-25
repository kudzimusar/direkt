#!/usr/bin/env python3
"""Fail-closed source verifier for the temporary RC5 managed-proof bridge."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise AssertionError(f"Missing required RC5 managed-proof file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def main() -> int:
    bridge = read(".github/workflows/rc5-test-lab-managed-proof-once.yml")
    managed = read(".github/workflows/firebase-test-lab.yml")

    for needle in (
        "branches:\n      - main",
        "- .github/workflows/rc5-test-lab-managed-proof-once.yml",
        "actions: write",
        "issues: write",
        'source_sha="${GITHUB_SHA}"',
        'test "${main_sha}" = "${source_sha}"',
        'workflow="firebase-test-lab.yml"',
        "before_ids=",
        'confirmation:"RUN-DIREKT-TEST-LAB"',
        'source_sha:$sha',
        "candidate_count",
        "Ambiguous RC5 managed run",
        'test "$(jq -r \'.head_sha\' <<< "${run_json}")" = "${source_sha}"',
        'test "$(jq -r \'.event\' <<< "${run_json}")" = "workflow_dispatch"',
        'artifact_name="rc5-firebase-test-lab-${run_id}-${run_attempt}"',
        'schema == "direkt.rc5.test-lab-receipt.v1"',
        '.sourceSha == $sha',
        '.githubRunId == $run',
        '.githubRunAttempt == $attempt',
        '.result == "passed"',
        '.dataMode == "synthetic-public-safe-only"',
        '.productionAuthorization == false',
        'select(.version == "33")',
        'select(. >= 35 and . <= 36)',
        "receipt-matrix.json",
        "standalone-matrix.json",
        "RC5 managed Test Lab receipt",
        "repos/${repo}/issues/261/comments",
        "stale_success",
        "available_and_schema_validated",
        "Participant/production authorization: false",
    ):
        require(bridge, needle, "managed-proof bridge control")

    for pattern, label in (
        (r"google-github-actions/auth", "direct Google authentication"),
        (r"id-token:\s*write", "OIDC authority"),
        (r"\bgcloud\b", "direct Google Cloud command"),
        (r"secrets\s+versions\s+access", "secret-value access"),
        (r"credentials_json\s*:", "static Google credentials"),
        (r"firebase\s+test\s+android\s+run", "direct Test Lab execution"),
        (r"projects\s+(add|remove)-iam-policy-binding", "project IAM mutation"),
        (r"storage\s+buckets\s+(create|update|delete)", "bucket mutation"),
    ):
        prohibit(bridge, pattern, label)

    for needle in (
        "workflow_dispatch:",
        'test "${DIREKT_CONFIRMATION}" = "RUN-DIREKT-TEST-LAB"',
        'test "$(git rev-parse origin/main)" = "${SOURCE_SHA}"',
        "google-github-actions/auth@v3",
        "gcloud firebase test android run",
        "--num-flaky-test-attempts 0",
        "--no-auto-google-login",
        'schema: "direkt.rc5.test-lab-receipt.v1"',
        'result: "passed"',
        'productionAuthorization: false',
        "rc5-firebase-test-lab-${{ github.run_id }}-${{ github.run_attempt }}",
    ):
        require(managed, needle, "managed Test Lab authority")

    print("RC5 managed-proof bridge verification passed.")
    print("source=exact_current_main")
    print("dispatch=unique_new_exact_source_run")
    print("execution=managed_workflow_only")
    print("evidence=schema_validated_receipt_and_matrix")
    print("failure=preserved_dedicated_receipt")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

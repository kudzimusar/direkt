#!/usr/bin/env python3
"""Verify the RC6 GCP preflight is metadata-only and fail-closed."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = (ROOT / ".github/workflows/rc6-whatsapp-infra-preflight.yml").read_text(
    encoding="utf-8"
)
BRIDGE_PATH = ROOT / ".github/workflows/rc6-whatsapp-infra-preflight-once.yml"
BRIDGE = BRIDGE_PATH.read_text(encoding="utf-8") if BRIDGE_PATH.is_file() else ""


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: {pattern}")


def main() -> int:
    for needle in (
        "workflow_dispatch:",
        "source_sha:",
        'test "$(git rev-parse origin/main)" = "${SOURCE_INPUT}"',
        "google-github-actions/auth@v3",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-whatsapp-webhook@direkt-dev-502701.iam.gserviceaccount.com",
        "gcloud secrets describe",
        "gcloud secrets versions describe latest",
        "gcloud secrets get-iam-policy",
        "gcloud projects get-iam-policy",
        "gcloud iam service-accounts get-iam-policy",
        "roles/iam.serviceAccountUser",
        "roles/iam.serviceAccountViewer",
        "roles/secretmanager.viewer",
        "exact deployer-only serviceAccountUser binding",
        "exact deployer-only serviceAccountViewer binding",
        "preflight deployer cannot inspect webhook service-account IAM policy",
        "preflight deployer cannot inspect secret container",
        "preflight deployer cannot inspect secret IAM policy",
        "zero project-level IAM roles",
        "exact deployer-only secretVersionManager allowlist",
        "exact deployer-only secretManagerViewer allowlist",
        "exact secretAccessor allowlist",
        "unexpected secretVersionManager member set",
        "unexpected secretManagerViewer member set",
        "unexpected secretAccessor member set",
        "metadata/IAM only; secret values are never accessed",
        "RC6_PREFLIGHT_RECEIPT",
        "FAIL|%s",
        "RESULT|not_ready",
        "RESULT|ready",
        "actions/upload-artifact@v4",
        "rc6-whatsapp-infra-preflight-${{ github.run_id }}",
        "retention-days: 30",
    ):
        require(WORKFLOW, needle, "read-only RC6 infrastructure preflight control")

    for pattern, label in (
        (r"gcloud\s+secrets\s+create", "secret container creation"),
        (r"gcloud\s+secrets\s+add-iam-policy-binding", "secret IAM mutation"),
        (r"gcloud\s+secrets\s+versions\s+add", "secret value creation"),
        (r"gcloud\s+secrets\s+versions\s+access", "secret value read"),
        (r"gcloud\s+secrets\s+versions\s+(disable|destroy)", "secret version mutation"),
        (r"gcloud\s+iam\s+service-accounts\s+create", "service-account creation"),
        (
            r"gcloud\s+iam\s+service-accounts\s+add-iam-policy-binding",
            "service-account IAM mutation",
        ),
        (r"gcloud\s+projects\s+add-iam-policy-binding", "project IAM mutation"),
        (
            r"WHATSAPP_(ACCESS_TOKEN|APP_SECRET|WEBHOOK_VERIFY_TOKEN|SYNTHETIC_RECIPIENT).*inputs\.",
            "secret workflow input",
        ),
    ):
        prohibit(WORKFLOW, pattern, label)

    if BRIDGE:
        for needle in (
            "push:",
            "rc6-whatsapp-infra-preflight-once.yml",
            "actions: write",
            "issues: write",
            "rc6-whatsapp-infra-preflight.yml/dispatches",
            '"inputs":{"source_sha":$sha}',
            'gh run download "${run_id}"',
            'artifact_name="rc6-whatsapp-infra-preflight-${run_id}"',
            'findings_file="${receipt_dir}/findings.txt"',
            "SOURCE\\|[0-9a-f]{40}",
            "SECRET_VALUES_ACCESSED\\|false",
            "PRODUCTION_AUTHORIZATION\\|false",
            "Sanitized findings",
            'gh api --method POST "repos/${repo}/issues"',
            'gh api --method POST "repos/${repo}/issues/261/comments"',
            "secret values were not accessed",
        ):
            require(BRIDGE, needle, "one-shot RC6 preflight bridge control")
        for pattern, label in (
            (r"gcloud\s+", "Google Cloud mutation/read in one-shot dispatcher"),
            (r"secrets\s+versions\s+access", "secret value read in dispatcher"),
            (
                r"WHATSAPP_(ACCESS_TOKEN|APP_SECRET|WEBHOOK_VERIFY_TOKEN|SYNTHETIC_RECIPIENT)",
                "provider secret material in dispatcher",
            ),
            (r"cat\s+[^\n]*google.*credentials", "credential file publication"),
        ):
            prohibit(BRIDGE, pattern, label)

    print("RC6 WhatsApp infrastructure preflight contract verification passed.")
    print("mode=read_only_metadata_and_iam")
    print("secret_values_accessed=false")
    print("iam_membership=exact_allowlists_required")
    print("webhook_actas=deployer_only_required")
    print("webhook_policy_read=service_account_scoped")
    print("secret_policy_read=secret_scoped_viewer_only")
    print("sanitized_receipt=artifact_30_day_retention_and_schema_validated_issue")
    print(f"one_shot_bridge={'present' if BRIDGE else 'absent'}")
    print("tracker=issue_261_concrete_endpoint_required")
    print("iam_mutation=false")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

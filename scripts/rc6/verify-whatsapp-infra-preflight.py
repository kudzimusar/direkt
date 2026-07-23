#!/usr/bin/env python3
"""Verify the RC6 GCP preflight is metadata-only and fail-closed."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = (ROOT / ".github/workflows/rc6-whatsapp-infra-preflight.yml").read_text(
    encoding="utf-8"
)


def require(needle: str, label: str) -> None:
    if needle not in WORKFLOW:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(pattern: str, label: str) -> None:
    if re.search(pattern, WORKFLOW, flags=re.IGNORECASE | re.MULTILINE):
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
        "zero project-level IAM roles",
        "webhook identity correctly has no accessor",
        "metadata/IAM only; secret values are never accessed",
    ):
        require(needle, "read-only RC6 infrastructure preflight control")

    for pattern, label in (
        (r"gcloud\s+secrets\s+create", "secret container creation"),
        (r"gcloud\s+secrets\s+add-iam-policy-binding", "secret IAM mutation"),
        (r"gcloud\s+secrets\s+versions\s+add", "secret value creation"),
        (r"gcloud\s+secrets\s+versions\s+access", "secret value read"),
        (r"gcloud\s+secrets\s+versions\s+(disable|destroy)", "secret version mutation"),
        (r"gcloud\s+iam\s+service-accounts\s+create", "service-account creation"),
        (r"gcloud\s+iam\s+service-accounts\s+add-iam-policy-binding", "service-account IAM mutation"),
        (r"gcloud\s+projects\s+add-iam-policy-binding", "project IAM mutation"),
        (r"WHATSAPP_(ACCESS_TOKEN|APP_SECRET|WEBHOOK_VERIFY_TOKEN|SYNTHETIC_RECIPIENT).*inputs\.", "secret workflow input"),
    ):
        prohibit(pattern, label)

    print("RC6 WhatsApp infrastructure preflight contract verification passed.")
    print("mode=read_only_metadata_and_iam")
    print("secret_values_accessed=false")
    print("iam_mutation=false")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

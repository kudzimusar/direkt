#!/usr/bin/env python3
"""Fail closed on the RC4 FCM canary Secret Manager lifecycle."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = ROOT / ".github" / "workflows" / "firebase-fcm-canary.yml"


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        fail(f"missing {label}: {needle}")


def prohibit(text: str, needle: str, label: str) -> None:
    if needle in text:
        fail(f"prohibited {label}: {needle}")


def main() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    for needle, label in (
        ("GCP_FCM_TOKEN_SECRET: direkt-fcm-canary-token", "stable canary secret container"),
        ('gcloud secrets versions add "${GCP_FCM_TOKEN_SECRET}"', "numeric version creation"),
        ('FCM_TOKEN_SECRET_VERSION=${version}', "version export"),
        (
            "FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}",
            "pinned Cloud Run secret binding",
        ),
        ('grep -Eq "key: [\'\\\"]?${FCM_TOKEN_SECRET_VERSION}', "deployed numeric-version assertion"),
        ('gcloud secrets versions destroy "${FCM_TOKEN_SECRET_VERSION}"', "version destruction"),
        ("gcloud run jobs delete", "job cleanup before version destruction"),
    ):
        require(text, needle, label)

    for needle, label in (
        ("gcloud secrets create", "workflow secret creation"),
        ("gcloud secrets add-iam-policy-binding", "workflow secret IAM mutation"),
        ("gcloud secrets delete", "whole-secret deletion"),
        ("FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:latest", "latest secret binding"),
        ("FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:1", "hard-coded secret version"),
        ("roles/secretmanager.admin", "broad Secret Manager administrator role"),
    ):
        prohibit(text, needle, label)

    delete_index = text.index("gcloud run jobs delete")
    destroy_index = text.index('gcloud secrets versions destroy "${FCM_TOKEN_SECRET_VERSION}"')
    if delete_index >= destroy_index:
        fail("Cloud Run job must be deleted before the temporary secret version is destroyed")

    print("RC4 FCM canary secret lifecycle verified: pre-provisioned container, pinned numeric version, version-only cleanup.")


if __name__ == "__main__":
    main()

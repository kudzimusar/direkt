#!/usr/bin/env python3
"""Fail closed if the RC4 managed FCM canary widens its Secret Manager boundary."""

from __future__ import annotations

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "firebase-fcm-canary.yml"


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise SystemExit(f"ERROR: missing RC4 FCM secret-boundary invariant: {label}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.MULTILINE):
        raise SystemExit(f"ERROR: prohibited RC4 FCM secret-boundary behavior: {label}")


def main() -> None:
    text = WORKFLOW.read_text(encoding="utf-8")

    for needle, label in (
        ("GCP_FCM_CANARY_SECRET: direkt-fcm-canary-token", "fixed canary secret container"),
        ('test "${GCP_FCM_CANARY_SECRET}" = "direkt-fcm-canary-token"', "exact secret identity assertion"),
        ('gcloud secrets versions add "${secret_name}"', "one-run secret version creation"),
        ('echo "FCM_TOKEN_SECRET_VERSION=${version}"', "numeric version propagation"),
        ('FCM_SYNTHETIC_DEVICE_TOKEN=${FCM_TOKEN_SECRET}:${FCM_TOKEN_SECRET_VERSION}', "pinned Cloud Run secret version"),
        ('gcloud secrets versions destroy "${FCM_TOKEN_SECRET_VERSION}"', "one-run secret version destruction"),
    ):
        require(text, needle, label)

    for pattern, label in (
        (r"gcloud\s+secrets\s+create\b", "runtime secret creation"),
        (r"gcloud\s+secrets\s+delete\b", "runtime secret container deletion"),
        (r"gcloud\s+secrets\s+add-iam-policy-binding\b", "runtime Secret Manager IAM mutation"),
        (r"FCM_SYNTHETIC_DEVICE_TOKEN=.*:latest\b", "unpinned latest canary secret version"),
    ):
        prohibit(text, pattern, label)

    print("RC4 FCM secret boundary verified: preprovisioned container, pinned one-run version, no runtime IAM mutation.")


if __name__ == "__main__":
    main()

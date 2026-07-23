#!/usr/bin/env python3
"""Fail-closed verifier for the RC6 one-shot WhatsApp webhook PREPARE bridge."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRIDGE = (ROOT / ".github/workflows/rc6-whatsapp-prepare-once.yml").read_text(encoding="utf-8")
MANAGED = (ROOT / ".github/workflows/cloud-run-whatsapp-canary.yml").read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def main() -> int:
    for needle in (
        "branches:\n      - main",
        "- .github/workflows/rc6-whatsapp-prepare-once.yml",
        "contents: read",
        "actions: write",
        "issues: write",
        "id-token: write",
        'source_sha="${GITHUB_SHA}"',
        'test "${main_sha}" = "${source_sha}"',
        "PREPARE-DIREKT-WHATSAPP-WEBHOOK",
        '"1146158541925026"',
        '"904315252104562"',
        '"v25.0"',
        '"hello_world"',
        '"en_US"',
        "cloud-run-whatsapp-canary.yml/dispatches",
        "event=workflow_dispatch&branch=main",
        "google-github-actions/auth@v3",
        "google-github-actions/setup-gcloud@v3",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-whatsapp-webhook@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com",
        "WHATSAPP_PROVIDER_MODE",
        "disabled",
        "direkt-whatsapp-access-token",
        "direkt-whatsapp-synthetic-recipient",
        "issues/261/comments",
        "Production authorization: false",
        "Participant/production WhatsApp delivery: disabled",
        "No later RC6 canary step is authorized from this failed PREPARE receipt.",
        "Only after that provider callback registration is proven may the bounded synthetic",
    ):
        require(BRIDGE, needle, "one-shot PREPARE control")

    for needle in (
        "workflow_dispatch:",
        "PREPARE-DIREKT-WHATSAPP-WEBHOOK",
        "RUN-DIREKT-WHATSAPP-CANARY",
        "WHATSAPP_PROVIDER_MODE: \"disabled\"",
        "Participant/production delivery: disabled",
        "Production authorization: false",
    ):
        require(MANAGED, needle, "managed canary boundary")

    for pattern, label in (
        (r'"confirmation":"RUN-DIREKT-WHATSAPP-CANARY"', "send-canary dispatch authority in PREPARE bridge"),
        (r"graph\.facebook\.com", "direct Meta Graph API call"),
        (r"gcloud\s+secrets", "Secret Manager command"),
        (r"secrets\s+versions\s+access", "secret-value read"),
        (r"add-iam-policy-binding", "IAM mutation"),
        (r"set-iam-policy", "IAM policy mutation"),
        (r"gcloud\s+run\s+deploy", "Cloud Run deployment from bridge"),
        (r"gcloud\s+run\s+jobs\s+(deploy|execute)", "Cloud Run job mutation/execution from bridge"),
        (r"curl\s+.*graph\.facebook", "provider call from bridge"),
    ):
        prohibit(BRIDGE, pattern, label)

    # The bridge may only read the prepared Cloud Run service after the managed workflow succeeds.
    describe_count = len(re.findall(r"gcloud\s+run\s+services\s+describe", BRIDGE))
    if describe_count != 2:
        raise AssertionError(
            f"Expected exactly two read-only Cloud Run service describe calls, found {describe_count}."
        )

    if "--allow-unauthenticated" in BRIDGE or "--set-secrets" in BRIDGE:
        raise AssertionError("PREPARE bridge must not deploy or reconfigure the public webhook service.")

    print("RC6 one-shot WhatsApp webhook PREPARE bridge verification passed.")
    print("dispatch_mode=prepare_only")
    print("source=exact_current_main")
    print("provider_call=false")
    print("secret_value_access=false")
    print("iam_mutation=false")
    print("cloud_run_mutation=false")
    print("participant_production_delivery=disabled")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

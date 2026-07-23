#!/usr/bin/env python3
"""Fail-closed verifier for the RC6 one-shot signed-receipt synthetic canary bridge."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRIDGE = (ROOT / ".github/workflows/rc6-whatsapp-run-once.yml").read_text(encoding="utf-8")
MANAGED = (ROOT / ".github/workflows/cloud-run-whatsapp-canary.yml").read_text(encoding="utf-8")
CANARY = (
    ROOT / "backend/direkt-api/src/communications/whatsapp-canary.ts"
).read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def main() -> int:
    for needle in (
        "DO NOT MERGE until the exact RC6 callback URL has been registered",
        "owner-known verify token has passed Meta verification",
        "WABA is subscribed to",
        "synthetic/test-only managed canary",
        "branches:\n      - main",
        "- .github/workflows/rc6-whatsapp-run-once.yml",
        "contents: read",
        "actions: write",
        "issues: write",
        'source_sha="${GITHUB_SHA}"',
        'test "${main_sha}" = "${source_sha}"',
        '"confirmation":"RUN-DIREKT-WHATSAPP-CANARY"',
        '"1146158541925026"',
        '"904315252104562"',
        '"v25.0"',
        '"hello_world"',
        '"en_US"',
        "cloud-run-whatsapp-canary.yml/dispatches",
        "event=workflow_dispatch&branch=main",
        "current_main=",
        "RC6 remains open",
        "must not be rewritten as a pass",
        "transactional outbox → Meta acceptance → authentic signed webhook receipt",
        "one owner-controlled verified test recipient from Secret Manager",
        "Participant/production WhatsApp delivery: disabled",
        "Production authorization: false",
        "issues/261/comments",
    ):
        require(BRIDGE, needle, "one-shot RUN control")

    # The managed workflow remains the only runtime authority. It must retain the exact-source,
    # pinned-secret, synthetic approval, isolated identities and terminal-proof receipt.
    for needle in (
        "workflow_dispatch:",
        "RUN-DIREKT-WHATSAPP-CANARY",
        'test "$(git rev-parse origin/main)" = "${SOURCE_SHA}"',
        "WHATSAPP_SYNTHETIC_SEND_APPROVED: \"true\"",
        "WHATSAPP_SYNTHETIC_RECIPIENT_SECRET_VERSION",
        "--max-retries 0",
        "whatsapp-canary.js",
        "Outbox → Meta acceptance → signed webhook receipt: passed",
        "Participant/production delivery: disabled",
        "Production authorization: false",
    ):
        require(MANAGED, needle, "managed signed-receipt boundary")

    for needle in (
        "waitForSignedReceipt",
        "whatsapp_delivery_receipts",
        "signedWebhookReceipt: true",
        "timed out waiting for a signed provider receipt",
        "productionAuthorization: false",
    ):
        require(CANARY, needle, "terminal signed-receipt canary implementation")

    for pattern, label in (
        (r'"confirmation":"PREPARE-DIREKT-WHATSAPP-WEBHOOK"', "PREPARE dispatch in RUN-only bridge"),
        (r"graph\.facebook\.com", "direct Meta Graph API call"),
        (r"gcloud\b", "direct Google Cloud command"),
        (r"secrets\s+versions\s+access", "secret-value read"),
        (r"add-iam-policy-binding|set-iam-policy", "IAM mutation"),
        (r"WHATSAPP_ACCESS_TOKEN\s*[:=]", "WhatsApp access token binding/input"),
        (r"WHATSAPP_APP_SECRET\s*[:=]", "Meta app secret binding/input"),
        (r"WHATSAPP_WEBHOOK_VERIFY_TOKEN\s*[:=]", "webhook verify token binding/input"),
        (r"WHATSAPP_SYNTHETIC_RECIPIENT\s*[:=]", "synthetic recipient binding/input"),
        (r"curl\s+", "direct network/provider execution"),
    ):
        prohibit(BRIDGE, pattern, label)

    # This bridge is intentionally orchestration-only: no OIDC/cloud/runtime permissions are needed.
    if "id-token: write" in BRIDGE:
        raise AssertionError("RUN bridge must not request OIDC because managed workflow owns runtime access.")
    if "--set-secrets" in BRIDGE or "--allow-unauthenticated" in BRIDGE:
        raise AssertionError("RUN bridge must not mutate Cloud Run or secret bindings.")

    print("RC6 one-shot WhatsApp signed-receipt canary bridge verification passed.")
    print("dispatch_mode=run_only_after_meta_callback_registration")
    print("source=exact_current_main")
    print("runtime_authority=managed_workflow_only")
    print("secret_value_access=false")
    print("direct_provider_call=false")
    print("direct_cloud_mutation=false")
    print("terminal_proof=signed_webhook_receipt_required")
    print("participant_production_delivery=disabled")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

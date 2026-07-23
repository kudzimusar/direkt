#!/usr/bin/env python3
"""Permanent fail-closed verifier for DIREKT RC6 WhatsApp Cloud API."""

from __future__ import annotations

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise AssertionError(f"Missing required RC6 file: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def scan_clients(patterns: dict[str, re.Pattern[str]]) -> None:
    ignored = {"node_modules", "build", ".next", "coverage", "dist", "test", "tests", "scripts"}
    findings: list[str] = []
    for root_name in ("android", "web", "admin"):
        root = ROOT / root_name
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file() or any(part in ignored for part in path.parts):
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            for label, pattern in patterns.items():
                if pattern.search(text):
                    findings.append(f"{label}:{path.relative_to(ROOT)}")
    if findings:
        raise AssertionError(
            "Privileged WhatsApp material/reference entered a deployable client tree: "
            + ", ".join(findings)
        )


def main() -> int:
    lock = read("WORKSTREAM_LOCK.md")
    environment = read("backend/direkt-api/src/config/environment.ts")
    env_example = read("backend/direkt-api/.env.example")
    main_source = read("backend/direkt-api/src/main.ts")
    module = read("backend/direkt-api/src/communications/communications.module.ts")
    provider = read("backend/direkt-api/src/communications/meta-whatsapp-provider.adapter.ts")
    provider_port = read("backend/direkt-api/src/communications/whatsapp-provider.port.ts")
    outbox = read("backend/direkt-api/src/communications/whatsapp-outbox.service.ts")
    webhook = read("backend/direkt-api/src/communications/whatsapp-webhook.service.ts")
    webhook_controller = read(
        "backend/direkt-api/src/communications/whatsapp-webhook.controller.ts"
    )
    opt_out = read("backend/direkt-api/src/communications/whatsapp-opt-out.service.ts")
    handoff = read("backend/direkt-api/src/interaction/interaction-handoff.repository.ts")
    handoff_types = read("backend/direkt-api/src/interaction/interaction-handoff.types.ts")
    migration = read("database/migrations/202607230230_rc6_whatsapp_runtime.sql")

    for needle in (
        "CLAIMED — RC6 WhatsApp Cloud API",
        "RC6 implementation contract — ACTIVE OWNER-AUTHORIZED CHECKPOINT",
        "RC6 under Issue #261 is the sole active implementation lane",
        "RC5 remains parked/not closed",
        "Production/participant WhatsApp delivery remains disabled",
    ):
        require(lock, needle, "RC6 lock boundary")

    for needle in (
        "WHATSAPP_PROVIDER_MODE",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_BUSINESS_ACCOUNT_ID",
        "WHATSAPP_APP_SECRET",
        "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
        "WHATSAPP_GRAPH_API_VERSION",
        "WHATSAPP_SYNTHETIC_SEND_APPROVED",
        "Production WhatsApp provider mode must remain disabled",
        "Controlled-pilot data mode requires WhatsApp delivery to remain disabled",
        "WhatsApp provider activation currently permits synthetic-only data mode",
    ):
        require(environment, needle, "fail-closed WhatsApp environment control")
    require(env_example, "WHATSAPP_PROVIDER_MODE=disabled", "default-disabled WhatsApp env")
    require(env_example, "no source default", "explicit Graph version documentation")

    for needle in (
        "rawBody: true",
        "WhatsAppWebhookController",
        "WhatsAppOptOutController",
        "WHATSAPP_PROVIDER",
        "DisabledWhatsAppProviderAdapter",
        "MetaWhatsAppProviderAdapter",
        "synthetic-only non-production use",
    ):
        require(main_source + module, needle, "server-only WhatsApp wiring")

    for needle in (
        "https://graph.facebook.com/",
        "/messages",
        "Authorization: `Bearer ${this.accessToken}`",
        "messaging_product: 'whatsapp'",
        "type: 'template'",
        "templateName",
        "languageCode",
    ):
        require(provider, needle, "Meta Cloud API template adapter")
    for pattern, label in (
        (r"type:\s*['\"]text['\"]", "arbitrary free-form WhatsApp text"),
        (r"type:\s*['\"]document['\"]", "WhatsApp evidence/document delivery"),
        (r"type:\s*['\"]image['\"]", "WhatsApp image/evidence delivery"),
        (r"WHATSAPP_ACCESS_TOKEN\s*=\s*['\"][^'\"]+", "hard-coded WhatsApp access token"),
    ):
        prohibit(provider, pattern, label)
    require(provider_port, "WhatsAppProviderPort", "provider-neutral WhatsApp port")

    for needle in (
        "communications.whatsapp.send.v1",
        "recipientHash",
        "rawContactIncluded: false",
        "WHATSAPP_SYNTHETIC_SEND_APPROVED",
        "communication_channel_opt_outs",
        "opted out at send time",
        "WHATSAPP_SYNTHETIC_TEMPLATE_NAME",
        "WHATSAPP_SYNTHETIC_TEMPLATE_LANGUAGE",
        "provider_message_id",
        "WHATSAPP_MAX_ATTEMPTS",
        "WHATSAPP_OUTBOX_LOCK_TIMEOUT_MS",
    ):
        require(outbox, needle, "transactional WhatsApp outbox boundary")
    prohibit(outbox, r"payload[^\n]*recipient\s*:", "raw recipient in WhatsApp outbox payload")

    for needle in (
        "createHmac('sha256'",
        "timingSafeEqual",
        "x-hub-signature-256",
        "whatsapp_business_account",
        "phone_number_id",
        "whatsapp_delivery_receipts",
        "provider_status_at",
        "status_rank",
        "provider_timestamp",
    ):
        require(webhook + webhook_controller, needle, "signed durable webhook receipt boundary")
    prohibit(webhook, r"console\.(log|error|warn)", "raw WhatsApp webhook logging")

    for needle in (
        "authenticated_account_opt_out",
        "value_hash",
        "rawContactIncluded: false",
        "verified_at IS NOT NULL",
    ):
        require(opt_out, needle, "authenticated hashed opt-out boundary")

    for needle in (
        "now() + interval '24 hours'",
        "revoke_contact_handoff",
        "channel: dto.channel",
        "externalDeliveryAttempted: false",
    ):
        require(handoff, needle, "existing Phase 8 consent/revocation boundary")
    require(handoff_types, "'call' | 'whatsapp'", "WhatsApp handoff channel")
    require(handoff_types, "deliveryState: 'disabled'", "participant delivery remains disabled")

    for needle in (
        "communication_channel_opt_outs",
        "whatsapp_message_deliveries",
        "whatsapp_delivery_receipts",
        "UNIQUE (provider_message_id, status, provider_timestamp)",
        "recipient_hash character(64)",
    ):
        require(migration, needle, "durable RC6 database state")

    scan_clients(
        {
            "WhatsApp access token env": re.compile(r"WHATSAPP_ACCESS_TOKEN"),
            "WhatsApp app secret env": re.compile(r"WHATSAPP_APP_SECRET"),
            "Meta Graph send endpoint": re.compile(r"graph\.facebook\.com/.*/messages"),
        }
    )

    print("RC6 WhatsApp Cloud API contract verification passed.")
    print("authority=backend_transactional_outbox_only")
    print("participant_delivery=disabled")
    print("data_mode=synthetic_only_when_provider_enabled")
    print("consent=send_time_opt_out_rechecked")
    print("payload=template_only_no_identity_or_evidence_documents")
    print("webhook=hmac_sha256_raw_body_verified")
    print("receipts=durable_idempotent_out_of_order_guarded")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

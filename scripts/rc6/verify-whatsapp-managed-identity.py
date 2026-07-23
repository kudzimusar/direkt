#!/usr/bin/env python3
"""Verify RC6 managed WhatsApp webhook/send identity separation."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOW = (ROOT / ".github/workflows/cloud-run-whatsapp-canary.yml").read_text(encoding="utf-8")
BOOTSTRAP = (ROOT / "scripts/rc6/bootstrap-whatsapp-secrets.sh").read_text(encoding="utf-8")

WEBHOOK_SA = "direkt-whatsapp-webhook@direkt-dev-502701.iam.gserviceaccount.com"
SEND_SA = "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com"
ACCESS_SECRET = "direkt-whatsapp-access-token"
RECIPIENT_SECRET = "direkt-whatsapp-synthetic-recipient"


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def main() -> int:
    for needle in (
        f"GCP_WEBHOOK_SERVICE_ACCOUNT: {WEBHOOK_SA}",
        f"GCP_RUNTIME_SERVICE_ACCOUNT: {SEND_SA}",
        '--service-account "${GCP_WEBHOOK_SERVICE_ACCOUNT}"',
        '--service-account "${GCP_RUNTIME_SERVICE_ACCOUNT}"',
        "Webhook send-secret exposure",
        "Webhook identity overlap",
        "Send identity overlap",
    ):
        require(WORKFLOW, needle, "managed identity boundary")

    webhook_section = WORKFLOW.split(
        "- name: Deploy isolated signed-webhook canary service", 1
    )[1].split("- name: Publish webhook preparation receipt", 1)[0]
    if '--service-account "${GCP_RUNTIME_SERVICE_ACCOUNT}"' in webhook_section:
        raise AssertionError("Public webhook deployment uses the private send runtime identity.")
    if ACCESS_SECRET in webhook_section or RECIPIENT_SECRET in webhook_section:
        raise AssertionError("Public webhook deployment references a send-only secret.")

    send_section = WORKFLOW.split("- name: Deploy private synthetic send job", 1)[1]
    if '--service-account "${GCP_WEBHOOK_SERVICE_ACCOUNT}"' in send_section:
        raise AssertionError("Private send job uses the public webhook identity.")

    for needle in (
        f'webhook_runtime_sa="${{GCP_WHATSAPP_WEBHOOK_SERVICE_ACCOUNT:-{WEBHOOK_SA}}}"',
        "gcloud iam service-accounts create",
        "roles/iam.serviceAccountUser",
        "gcloud projects get-iam-policy",
        "Public webhook identity must not hold any project-level IAM role.",
        'for secret_name in "${database_secret}" "${app_secret}" "${verify_token_secret}"',
        'for secret_name in "${access_token_secret}" "${recipient_secret}"',
        "Public webhook identity must not access send-only secret",
        "zero project-level roles",
        "no access-token or recipient-secret access",
    ):
        require(BOOTSTRAP, needle, "owner bootstrap identity boundary")

    if 'serviceAccount:${webhook_runtime_sa}" \\\n    --role roles/secretmanager.secretAccessor' not in BOOTSTRAP:
        raise AssertionError("Webhook identity lacks explicit secret-level accessor grant pattern.")

    print("RC6 managed WhatsApp identity separation verification passed.")
    print(f"webhook_identity={WEBHOOK_SA}")
    print(f"send_identity={SEND_SA}")
    print("webhook_project_roles=none")
    print("webhook_send_secret_access=false")
    print("public_surface=webhook_only")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

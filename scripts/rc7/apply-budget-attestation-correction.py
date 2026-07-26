#!/usr/bin/env python3
"""Apply the one-time RC7 owner-budget attestation correction."""

from pathlib import Path


def replace(path: str, old: str, new: str, *, count: int = 1) -> None:
    target = Path(path)
    text = target.read_text(encoding="utf-8")
    actual = text.count(old)
    if actual != count:
        raise SystemExit(f"{path}: expected {count} occurrence(s), found {actual}: {old!r}")
    target.write_text(text.replace(old, new), encoding="utf-8")


def main() -> None:
    replace(
        "scripts/rc7/bootstrap-maps-managed.sh",
        """  cloudbilling.googleapis.com \\
  geocoding-backend.googleapis.com \\
""",
        """  cloudbilling.googleapis.com \\
  cloudresourcemanager.googleapis.com \\
  geocoding-backend.googleapis.com \\
""",
    )
    replace(
        "scripts/rc7/bootstrap-maps-managed.sh",
        """actual_budget_currency="$(gcloud billing budgets describe "${budget_name##*/}" \\
  --billing-account "${billing_account}" \\
  --format='value(amount.specifiedAmount.currencyCode)')"
test "${actual_budget_currency}" = "${billing_currency}"

gcloud alpha services quota list \\
""",
        """actual_budget_currency="$(gcloud billing budgets describe "${budget_name##*/}" \\
  --billing-account "${billing_account}" \\
  --format='value(amount.specifiedAmount.currencyCode)')"
test "${actual_budget_currency}" = "${billing_currency}"
budget_checked_at="$(date -u '+%Y%m%dt%H%M%Sz')"
budget_currency_label="$(tr '[:upper:]' '[:lower:]' <<< "${billing_currency}")"
[[ "${budget_currency_label}" =~ ^[a-z]{3}$ ]]
gcloud projects update "${PROJECT_ID}" \\
  --update-labels "direkt-rc7-budget-checked-at=${budget_checked_at},direkt-rc7-budget-amount=1,direkt-rc7-budget-currency=${budget_currency_label}" \\
  --quiet >/dev/null

gcloud alpha services quota list \\
""",
    )
    replace(
        "scripts/rc7/bootstrap-maps-managed.sh",
        """printf 'budget_currency=%s\\n' "${billing_currency}"
printf 'geocoding_quota_per_minute=60\\n'
""",
        """printf 'budget_currency=%s\\n' "${billing_currency}"
printf 'budget_attestation=project_labels\\n'
printf 'budget_checked_at=%s\\n' "${budget_checked_at}"
printf 'geocoding_quota_per_minute=60\\n'
""",
    )

    replace(
        "scripts/rc7/run-maps-managed.sh",
        """  cloudbilling.googleapis.com
  geocoding-backend.googleapis.com
""",
        """  cloudbilling.googleapis.com
  cloudresourcemanager.googleapis.com
  geocoding-backend.googleapis.com
""",
    )
    replace(
        "scripts/rc7/run-maps-managed.sh",
        """billing_account="$(gcloud billing projects describe "${GCP_PROJECT_ID}" \\
  --format='value(billingAccountName)' | sed 's#billingAccounts/##')"
test -n "${billing_account}"
budget_json="${RUNNER_TEMP}/rc7-maps-budget.json"
gcloud billing budgets list \\
  --billing-account "${billing_account}" \\
  --filter='displayName="DIREKT RC7 Maps synthetic"' \\
  --limit 1 \\
  --format=json > "${budget_json}"
jq -e '
  length == 1 and
  .[0].displayName == "DIREKT RC7 Maps synthetic" and
  .[0].amount.specifiedAmount.units == "1"
' "${budget_json}" >/dev/null
budget_currency="$(jq -r '.[0].amount.specifiedAmount.currencyCode' "${budget_json}")"
test -n "${budget_currency}"
receipt "owner_bootstrap_verified=true"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount=1"
receipt "budget_currency=${budget_currency}"
""",
        """budget_json="${RUNNER_TEMP}/rc7-maps-budget.json"
project_json="$(gcloud projects describe "${GCP_PROJECT_ID}" --format=json)"
budget_checked_at="$(jq -r '.labels["direkt-rc7-budget-checked-at"] // empty' <<< "${project_json}")"
budget_amount="$(jq -r '.labels["direkt-rc7-budget-amount"] // empty' <<< "${project_json}")"
budget_currency_label="$(jq -r '.labels["direkt-rc7-budget-currency"] // empty' <<< "${project_json}")"
[[ "${budget_checked_at}" =~ ^[0-9]{8}t[0-9]{6}z$ ]]
test "${budget_amount}" = "1"
[[ "${budget_currency_label}" =~ ^[a-z]{3}$ ]]
python3 - "${budget_checked_at}" <<'PYBUDGET'
from datetime import datetime, timezone
import sys

checked_at = datetime.strptime(sys.argv[1], "%Y%m%dt%H%M%Sz").replace(tzinfo=timezone.utc)
age_seconds = (datetime.now(timezone.utc) - checked_at).total_seconds()
if age_seconds < -300 or age_seconds > 8 * 60 * 60:
    raise SystemExit("RC7 owner budget attestation is missing or stale.")
PYBUDGET
budget_currency="${budget_currency_label^^}"
jq -n \\
  --arg checkedAt "${budget_checked_at}" \\
  --arg amount "${budget_amount}" \\
  --arg currency "${budget_currency}" \\
  '{attestation: "project_labels", checkedAt: $checkedAt, amount: $amount, currency: $currency}' \\
  > "${budget_json}"
receipt "owner_bootstrap_verified=true"
receipt "budget_attestation=project_labels"
receipt "budget_checked_at=${budget_checked_at}"
receipt "budget_alert_present=true"
receipt "budget_display_name=DIREKT RC7 Maps synthetic"
receipt "budget_amount=${budget_amount}"
receipt "budget_currency=${budget_currency}"
""",
    )

    replace(
        ".github/workflows/rc7-maps-managed.yml",
        "owner_bootstrap_verified|backend_authentication|backend_oauth_scope|backend_api_key_present|backend_secret_value_present|backend_cloud_nat_used|backend_geocoding_canary|backend_service_identity_oauth_proven|android_test_lab_map_ready|budget_alert_present|geocoding_quota_per_minute|cleanup\\.|cleanup_failed|managed_result",
        "owner_bootstrap_verified|budget_attestation|budget_checked_at|backend_authentication|backend_oauth_scope|backend_api_key_present|backend_secret_value_present|backend_cloud_nat_used|backend_geocoding_canary|backend_service_identity_oauth_proven|android_test_lab_map_ready|budget_alert_present|geocoding_quota_per_minute|cleanup\\.|cleanup_failed|managed_result",
    )

    replace(
        "WORKSTREAM_LOCK.md",
        "2. Android and backend use separate credentials. The Android key is restricted to DIREKT package/signing-certificate pairs and Maps SDK for Android; the backend key is server-only and restricted to Geocoding plus the approved runtime network boundary when static egress is available.",
        "2. Android and backend authentication remain separate. The Android key is restricted to DIREKT package/signing-certificate pairs and Maps SDK for Android; backend Geocoding uses the assigned Cloud Run service identity with a downscoped address-only OAuth token and no backend API key, secret value, static egress IP or Cloud NAT dependency.",
    )

    replace(
        "scripts/rc7/verify-maps-contract.py",
        """        "DIREKT RC7 Maps synthetic",
        "geocoding_quota_per_minute=60",
""",
        """        "DIREKT RC7 Maps synthetic",
        "budget_attestation=project_labels",
        "direkt-rc7-budget-checked-at",
        "RC7 owner budget attestation is missing or stale.",
        "geocoding_quota_per_minute=60",
""",
    )
    replace(
        "scripts/rc7/verify-maps-contract.py",
        """        (r"services\\s+quota\\s+(create|update)", "runtime quota mutation"),
""",
        """        (r"services\\s+quota\\s+(create|update)", "runtime quota mutation"),
        (r"gcloud\\s+billing\\s+budgets", "managed billing-account budget access"),
""",
    )
    replace(
        "scripts/rc7/verify-maps-contract.py",
        """        "budget_amount=1",
        "budget_currency",
""",
        """        "budget_amount=1",
        "budget_currency",
        "budget_attestation=project_labels",
        "budget_checked_at",
        "gcloud projects update",
        "direkt-rc7-budget-checked-at",
""",
    )
    replace(
        "scripts/rc7/verify-maps-contract.py",
        """        (r"api-keys\\s+get-key-string", "owner bootstrap API key value read"),
""",
        """        (r"api-keys\\s+get-key-string", "owner bootstrap API key value read"),
        (r"roles/billing\\.(viewer|admin|costsManager)", "billing-account role grant"),
""",
    )

    replace(
        "scripts/rc7/verify-managed-workflow-context.py",
        """        (r"--vpc-egress", "Forced VPC egress must not return."),
""",
        """        (r"--vpc-egress", "Forced VPC egress must not return."),
        (r"gcloud\\s+billing\\s+budgets", "Managed CI must not require billing-account budget access."),
""",
    )
    replace(
        "scripts/rc7/verify-managed-workflow-context.py",
        """    failure_artifact = "${{ runner.temp }}/rc7-maps-canary-failure.json"
""",
        """    for marker in (
        "direkt-rc7-budget-checked-at",
        "budget_attestation=project_labels",
        "RC7 owner budget attestation is missing or stale.",
    ):
        require_present(managed_script, marker, "Fresh owner budget attestation drifted.")

    failure_artifact = "${{ runner.temp }}/rc7-maps-canary-failure.json"
""",
    )

    replace(
        "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md",
        "- creates or lowers/verifies a monthly RC7 budget of 1 unit in the billing account's fixed currency with 50%, 80% and 100% thresholds;",
        "- creates or lowers/verifies a monthly RC7 budget of 1 unit in the billing account's fixed currency with 50%, 80% and 100% thresholds; then writes fresh non-secret project labels containing the verified amount, currency and UTC check time for the exact-main proof;",
    )
    replace(
        "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md",
        "The temporary IAM condition expires automatically, by default eight hours after execution. The bootstrap never creates, reads or prints any credential value.",
        "The temporary project IAM condition expires automatically, by default eight hours after execution. The GitHub deployer receives no billing-account role. Instead, the owner bootstrap writes a fresh project-label attestation only after directly verifying the real billing-account budget; the managed workflow rejects an attestation older than eight hours. The bootstrap never creates, reads or prints any credential value.",
    )
    replace(
        "docs/integrations/RC7_MAPS_OWNER_BOOTSTRAP.md",
        """backend_cloud_nat_created=false
production_authorization=false
""",
        """backend_cloud_nat_created=false
budget_attestation=project_labels
budget_checked_at=<fresh UTC timestamp>
production_authorization=false
""",
    )

    replace(
        "docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md",
        """- no IP-based backend credential restriction.

## Credential and authentication boundary
""",
        """- no IP-based backend credential restriction.

## Owner-budget attestation correction

The first exact-main service-identity run, `30210742617/1` on `1c6acd7972caca838f27b4e5c4a521c92cbfc7c4`, failed before Android key mutation, image build, Cloud Run Job creation or Firebase Test Lab. The GitHub deployer correctly lacked `billing.budgets.list` on the owner billing account.

RC7 does not broaden CI to billing-account viewer. The owner bootstrap directly verifies the real one-unit budget and then writes non-secret project labels for verified amount, currency and UTC check time. The exact-main proof reads only those project labels, rejects an attestation older than eight hours, and permanently prohibits managed `gcloud billing budgets` access.

## Credential and authentication boundary
""",
    )

    replace(
        "docs/integrations/CURRENT_INTEGRATION_STATUS.md",
        "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering, but the backend is now Geocoding API v4 through the assigned Cloud Run service identity with a downscoped address-geocoding OAuth token. The incompatible backend API-key/Public-NAT path is prohibited. Budget/quota controls, exact-main managed proof and terminal cleanup evidence remain required before `ACTIVE`. |",
        "| Google Maps Platform | **IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS** | RC7 preserves the restricted Android key and privacy-safe native rendering; backend Geocoding uses v4 through the assigned Cloud Run service identity with a downscoped address-only OAuth token. Run `30210742617/1` failed before runtime mutation because CI correctly lacked billing-account budget-list permission. The correction keeps CI out of billing-account IAM and verifies a fresh owner-created project-label budget attestation before quota, backend and Android proof. |",
    )
    replace(
        "docs/integrations/LIVE_INTEGRATION_LEDGER.md",
        "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the package/signing/API-restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding now uses v4 with the assigned Cloud Run service identity and a downscoped address-only OAuth token; backend API keys, Maps secret values, Direct VPC egress and Cloud NAT are prohibited. Budget/quota controls and exact-main managed proof remain pending. |",
        "| Google Maps Platform | `IMPLEMENTED_GATED / CORRECTIVE MANAGED PROOF IN PROGRESS` | RC7 keeps the restricted Android key, Maps Compose latch, bounded Zambia normalization, privacy-safe rendering and manual/list fallback. Backend Geocoding uses v4 service-identity OAuth; backend keys, Maps secrets, Direct VPC egress and Cloud NAT are prohibited. Exact-main run `30210742617/1` failed before runtime mutation because the deployer lacked billing-account budget-list permission. The pending correction uses a fresh owner-verified project-label budget attestation without granting CI a billing-account role. |",
    )

    Path(".github/workflows/rc7-maps-contract.yml").write_text(
        """name: DIREKT RC7 Google Maps contract

on:
  pull_request:
    paths:
      - "android/direkt-app/**"
      - "backend/direkt-api/**"
      - "scripts/rc7/**"
      - "docs/integrations/**"
      - "WORKSTREAM_LOCK.md"
      - ".github/workflows/rc7-maps-contract.yml"
      - ".github/workflows/rc7-maps-managed.yml"
  push:
    branches:
      - main
    paths:
      - "android/direkt-app/**"
      - "backend/direkt-api/**"
      - "scripts/rc7/**"
      - "docs/integrations/**"
      - "WORKSTREAM_LOCK.md"
      - ".github/workflows/rc7-maps-contract.yml"
      - ".github/workflows/rc7-maps-managed.yml"

permissions:
  contents: read

jobs:
  verify:
    name: Verify RC7 Maps source, privacy and managed-proof contract
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: actions/setup-python@v6
        with:
          python-version: "3.13"

      - name: Verify permanent RC7 contract
        shell: bash
        run: |
          set -euo pipefail
          python3 scripts/rc7/verify-maps-contract.py
          python3 scripts/rc7/verify-managed-workflow-context.py
          bash -n scripts/rc7/bootstrap-maps-managed.sh
          bash -n scripts/rc7/run-maps-managed.sh
""",
        encoding="utf-8",
    )
    Path(".github/workflows/rc7-budget-attestation-patcher.yml").unlink(missing_ok=True)
    Path("scripts/rc7/apply-budget-attestation-correction.py").unlink()


if __name__ == "__main__":
    main()

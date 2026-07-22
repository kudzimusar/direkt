#!/usr/bin/env python3
"""Permanent fail-closed source verifier for DIREKT RC5 Firebase Test Lab."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    full = ROOT / path
    if not full.is_file():
        raise AssertionError(f"Missing required RC5 file: {path}")
    return full.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE):
        raise AssertionError(f"Prohibited {label}: pattern {pattern}")


def heredoc(text: str, name: str) -> set[str]:
    match = re.search(
        rf'cat > "\$\{{workdir\}}/{re.escape(name)}" <<\'EOF\'\n(.*?)\nEOF',
        text,
        flags=re.DOTALL,
    )
    if match is None:
        raise AssertionError(f"Missing exact bootstrap heredoc: {name}")
    return {line for line in match.group(1).splitlines() if line}


def main() -> int:
    lock = read("WORKSTREAM_LOCK.md")
    smoke = read("android/direkt-app/app/src/androidTest/java/com/kudzimusar/direkt/DirektAppSmokeTest.kt")
    android_ci = read(".github/workflows/android-ci.yml")
    workflow = read(".github/workflows/firebase-test-lab.yml")
    bootstrap = read("scripts/rc5/bootstrap-test-lab.sh")
    selector = read("scripts/rc5/select-test-lab-matrix.py")
    storage_boundary = read("scripts/rc5/verify-no-project-storage-roles.sh")
    notes = read("docs/integrations/RC5_FIREBASE_TEST_LAB_IMPLEMENTATION_NOTES.md")

    for needle in (
        "CLAIMED — RC5 Firebase Test Lab device-matrix closure",
        "RC5 implementation contract — ACTIVE",
        "RC5 Firebase Test Lab is the sole active implementation lane",
    ):
        require(lock, needle, "RC5 lock contract")

    for needle in (
        'onNodeWithTag("foundation-root")',
        'onNodeWithText("Find the right local service")',
        'onNodeWithTag("pilot-auth-card")',
        ".performScrollTo()",
        '"Real participant sign-in is disabled."',
        '"No production credential or participant endpoint is embedded in this build."',
    ):
        require(smoke, needle, "current instrumentation assertion")
    for obsolete in (
        "Phase 11 — controlled pilot entry",
        "Find a provider",
        "Search area",
        "Background location: Off",
    ):
        if obsolete in smoke:
            raise AssertionError(f"Stale pre-VC instrumentation assertion remains: {obsolete}")

    for needle in (
        "assembleDebugAndroidTest",
        "shell am instrument -w -r",
        "com.kudzimusar.direkt.DirektAppSmokeTest",
        "com.kudzimusar.direkt.debug.test/androidx.test.runner.AndroidJUnitRunner",
        "OK (1 test)",
        "direkt-android-instrumentation-",
    ):
        require(android_ci, needle, "local instrumentation execution control")

    for needle in (
        "workflow_dispatch:",
        'DIREKT_CONFIRMATION: ${{ inputs.confirmation }}',
        'test "${DIREKT_CONFIRMATION}" = "RUN-DIREKT-TEST-LAB"',
        'test "$(git rev-parse origin/main)" = "${SOURCE_SHA}"',
        "google-github-actions/auth@v3",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main",
        'bash scripts/rc5/verify-no-project-storage-roles.sh "${GCP_PROJECT_ID}" "${member}"',
        "storage.buckets.getIamPolicy",
        "storage.objects.create",
        "expected_results_permissions=$'storage.buckets.get\\nstorage.buckets.getIamPolicy\\nstorage.objects.create'",
        'results_dir="rc5/${SOURCE_SHA}/${GITHUB_RUN_ID}/attempt-${GITHUB_RUN_ATTEMPT}"',
        "gcloud firebase test android models list",
        "--filter=virtual",
        "--type instrumentation",
        "--num-flaky-test-attempts 0",
        "--no-use-orchestrator",
        "--no-record-video",
        "--no-performance-metrics",
        "--no-auto-google-login",
        "--results-bucket \"${GCP_TEST_LAB_RESULTS_BUCKET}\"",
        'productionAuthorization: false',
        'dataMode: "synthetic-public-safe-only"',
        "retention-days: 30",
    ):
        require(workflow, needle, "managed Test Lab control")

    for pattern, label in (
        (r"git\s+merge-base\s+--is-ancestor", "stale ancestor-only source acceptance"),
        (r'test\s+"\$\{\{\s*inputs\.confirmation\s*\}\}"', "raw workflow input interpolation"),
        (r"credentials_json\s*:", "static Google credentials"),
        (r"gcloud\s+services\s+enable", "runtime API enablement"),
        (r"gcloud\s+iam\s+roles\s+(create|update)", "runtime IAM mutation"),
        (r"gcloud\s+storage\s+buckets\s+(create|update)", "runtime bucket mutation"),
        (r"gcloud\s+storage\s+rm", "runtime evidence deletion"),
        (r"--num-flaky-test-attempts\s+[1-9]", "automatic flaky reruns"),
        (r"--use-orchestrator(?:\s|$)", "unvalidated Test Orchestrator"),
    ):
        prohibit(workflow, pattern, label)

    for line in workflow.splitlines():
        if "--device=model=" in line and r"\(.model)" not in line:
            raise AssertionError(f"Hard-coded Test Lab device flag is prohibited: {line.strip()}")

    expected_runner = {
        "cloudnotifications.activities.list",
        "cloudtestservice.environmentcatalog.get",
        "cloudtestservice.matrices.create",
        "cloudtestservice.matrices.get",
        "cloudtestservice.matrices.update",
        "cloudtoolresults.executions.create",
        "cloudtoolresults.executions.get",
        "cloudtoolresults.executions.list",
        "cloudtoolresults.executions.update",
        "cloudtoolresults.histories.create",
        "cloudtoolresults.histories.get",
        "cloudtoolresults.histories.list",
        "cloudtoolresults.settings.create",
        "cloudtoolresults.settings.get",
        "cloudtoolresults.settings.update",
        "cloudtoolresults.steps.create",
        "cloudtoolresults.steps.get",
        "cloudtoolresults.steps.list",
        "cloudtoolresults.steps.update",
        "firebase.billingPlans.get",
        "firebase.clients.get",
        "firebase.clients.list",
        "firebase.links.list",
        "firebase.playLinks.get",
        "firebase.playLinks.list",
        "firebase.projects.get",
        "firebaseanalytics.resources.googleAnalyticsReadAndAnalyze",
        "firebaseextensions.configs.list",
        "iam.roles.get",
        "resourcemanager.projects.get",
        "resourcemanager.projects.getIamPolicy",
        "resourcemanager.projects.list",
        "serviceusage.services.get",
    }
    expected_results = {
        "storage.buckets.get",
        "storage.buckets.getIamPolicy",
        "storage.objects.create",
    }
    if heredoc(bootstrap, "test-lab-runner-permissions.txt") != expected_runner:
        raise AssertionError("RC5 Test Lab runner role permission set drifted.")
    if heredoc(bootstrap, "test-lab-results-permissions.txt") != expected_results:
        raise AssertionError("RC5 append-only results role permission set drifted.")

    for needle in (
        'bash scripts/rc5/verify-no-project-storage-roles.sh "${project_id}" "${deployer_member}"',
        "gcloud storage buckets update",
        "30-day delete lifecycle",
        "no lifecycle mutation, object read, overwrite or delete",
    ):
        require(bootstrap, needle, "owner bootstrap boundary")
    for pattern, label in (
        (r"gcloud\s+iam\s+service-accounts\s+keys\s+create", "service-account key creation"),
        (r"gcloud\s+secrets\s+(create|versions\s+add)", "secret creation"),
        (r"--role\s+roles/(owner|editor)(?:\s|$)", "broad owner/editor grant"),
    ):
        prohibit(bootstrap, pattern, label)

    for needle in (
        "gcloud projects get-iam-policy",
        "gcloud iam roles describe",
        "organizations/*/roles/*",
        "Project-scoped role ${role}",
        "contains prohibited Cloud Storage permissions",
        "grep -Eq '^storage\\.'",
    ):
        require(storage_boundary, needle, "project-scoped Storage-role verifier")

    for needle in (
        "MIN_SDK = 23",
        "NOTIFICATION_API = 33",
        "MIN_CURRENT_API = 35",
        "MAX_CURRENT_API = 36",
        "MAX_DEVICES = 3",
        '"live-virtual-only"',
    ):
        require(selector, needle, "matrix selector policy")

    for needle in (
        "IMPLEMENTED_GATED / MANAGED MATRIX PENDING",
        "exact current main",
        "no Cloud Storage permissions",
        "append-only",
        "30-day",
        "live virtual Android catalog",
        "production release",
    ):
        require(notes, needle, "RC5 source-phase documentation")

    subprocess.run(
        [sys.executable, str(ROOT / "scripts/rc5/select-test-lab-matrix.py"), "--self-test"],
        cwd=ROOT,
        check=True,
    )

    print("RC5 Firebase Test Lab contract verification passed.")
    print("instrumentation=current_post_vc_semantics_local_execution_required")
    print("source=exact_current_main_required")
    print("identity=github_oidc_no_service_account_keys")
    print("iam=no_project_scoped_storage_permissions")
    print("storage=dedicated_bucket_append_only_owner_retention")
    print("matrix=live_virtual_2_to_3_devices_api33_current_required")
    print("evidence=attempt_isolated_no_runtime_delete")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Permanent fail-closed source verifier for DIREKT RC5 Firebase Test Lab."""

from __future__ import annotations

from pathlib import Path
import re
import subprocess
import sys

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


def heredoc(text: str, name: str) -> str:
    match = re.search(
        rf'cat > "\$\{{workdir\}}/{re.escape(name)}" <<\'EOF\'\n(.*?)\nEOF',
        text,
        flags=re.DOTALL,
    )
    if match is None:
        raise AssertionError(f"Missing exact bootstrap heredoc: {name}")
    return match.group(1)


def main() -> int:
    lock = read("WORKSTREAM_LOCK.md")
    smoke = read("android/direkt-app/app/src/androidTest/java/com/kudzimusar/direkt/DirektAppSmokeTest.kt")
    android_ci = read(".github/workflows/android-ci.yml")
    workflow = read(".github/workflows/firebase-test-lab.yml")
    bootstrap = read("scripts/rc5/bootstrap-test-lab.sh")
    selector = read("scripts/rc5/select-test-lab-matrix.py")
    notes = read("docs/integrations/RC5_FIREBASE_TEST_LAB_IMPLEMENTATION_NOTES.md")

    require(lock, "CLAIMED — RC5 Firebase Test Lab device-matrix closure", "active RC5 lock")
    require(lock, "RC5 implementation contract — ACTIVE", "RC5 implementation contract")
    require(lock, "RC5 Firebase Test Lab is the sole active implementation lane", "single-writer conflict rule")

    for needle in (
        'onNodeWithTag("foundation-root")',
        'onNodeWithText("Find the right local service")',
        'onNodeWithTag("pilot-auth-card")',
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
        "adb_bin",
        "shell am instrument -w -r",
        "com.kudzimusar.direkt.DirektAppSmokeTest",
        "com.kudzimusar.direkt.debug.test/androidx.test.runner.AndroidJUnitRunner",
        "OK (1 test)",
        "direkt-android-instrumentation-",
    ):
        require(android_ci, needle, "local instrumentation execution control")

    for needle in (
        "workflow_dispatch:",
        "source_sha:",
        "RUN-DIREKT-TEST-LAB",
        "git merge-base --is-ancestor",
        "google-github-actions/auth@v3",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main",
        "testing.googleapis.com",
        "toolresults.googleapis.com",
        "gs://direkt-test-lab-results-264358173369",
        "gcloud firebase test android models list",
        "--filter=virtual",
        "select-test-lab-matrix.py",
        "--type instrumentation",
        "--test-targets \"class ${DIREKT_TEST_CLASS}\"",
        "--num-flaky-test-attempts 0",
        "--no-use-orchestrator",
        "--no-record-video",
        "--no-performance-metrics",
        "--no-auto-google-login",
        "--results-bucket \"${GCP_TEST_LAB_RESULTS_BUCKET}\"",
        "--results-dir \"${results_dir}\"",
        "--timeout 5m",
        "retention-days: 30",
        'productionAuthorization: false',
        'dataMode: "synthetic-public-safe-only"',
    ):
        require(workflow, needle, "managed Test Lab control")

    prohibit(workflow, r"credentials_json\s*:", "static Google service-account credentials")
    prohibit(workflow, r"service[-_ ]?account[-_ ]?key", "service-account key workflow path")
    prohibit(workflow, r"gcloud\s+services\s+enable", "runtime API enablement")
    prohibit(workflow, r"gcloud\s+iam\s+roles\s+(create|update)", "runtime IAM role mutation")
    prohibit(workflow, r"gcloud\s+storage\s+buckets\s+create", "runtime results-bucket creation")
    prohibit(workflow, r"--num-flaky-test-attempts\s+[1-9]", "automatic flaky reruns")
    prohibit(workflow, r"--use-orchestrator(?:\s|$)", "unvalidated Test Orchestrator enablement")
    for line in workflow.splitlines():
        if "--device=model=" in line and r"\(.model)" not in line:
            raise AssertionError(f"Hard-coded Test Lab device flag is prohibited: {line.strip()}")

    for needle in (
        "testing.googleapis.com",
        "toolresults.googleapis.com",
        "direktTestLabRunner",
        "direktTestLabResultsWriter",
        "direkt-test-lab-results-${project_number}",
        "--uniform-bucket-level-access",
        'retention_days="${GCP_TEST_LAB_RESULTS_RETENTION_DAYS:-30}"',
        "cloudtestservice.environmentcatalog.get",
        "cloudtestservice.matrices.create",
        "cloudtoolresults.executions.create",
        "firebaseanalytics.resources.googleAnalyticsReadAndAnalyze",
        "storage.buckets.get",
        "storage.buckets.update",
        "storage.objects.create",
        "gcloud projects add-iam-policy-binding",
        "gcloud storage buckets add-iam-policy-binding",
        "roles/cloudtestservice.testAdmin",
        "roles/storage.admin",
        "roles/storage.objectAdmin",
    ):
        require(bootstrap, needle, "owner bootstrap boundary")

    runner_block = heredoc(bootstrap, "test-lab-runner-permissions.txt")
    results_block = heredoc(bootstrap, "test-lab-results-permissions.txt")
    if "storage." in runner_block:
        raise AssertionError("RC5 Test Lab runner custom role must not contain Cloud Storage permissions.")
    expected_results_permissions = {
        "storage.buckets.get",
        "storage.buckets.update",
        "storage.objects.create",
        "storage.objects.delete",
        "storage.objects.get",
        "storage.objects.list",
    }
    if set(results_block.splitlines()) != expected_results_permissions:
        raise AssertionError("RC5 bucket-scoped results role permission set drifted from the reviewed contract.")
    prohibit(bootstrap, r"gcloud\s+iam\s+service-accounts\s+keys\s+create", "service-account key creation")
    prohibit(bootstrap, r"gcloud\s+secrets\s+(create|versions\s+add)", "secret creation")
    prohibit(bootstrap, r"--role\s+roles/(owner|editor)(?:\s|$)", "broad owner/editor grant")

    for needle in (
        "MIN_SDK = 23",
        "NOTIFICATION_API = 33",
        "MAX_CURRENT_API = 36",
        "MIN_CURRENT_API = 35",
        "MAX_DEVICES = 3",
        '"live-virtual-only"',
        '"android-13-notification"',
        '"current-platform"',
    ):
        require(selector, needle, "matrix selector policy")

    for needle in (
        "IMPLEMENTED_GATED / MANAGED MATRIX PENDING",
        "no Cloud Storage permissions",
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
    print("test_lab=implemented_gated_managed_matrix_pending")
    print("identity=github_oidc_no_service_account_keys")
    print("storage=dedicated_bucket_scope_30_day_lifecycle")
    print("matrix=live_virtual_2_to_3_devices_api33_current_required")
    print("auto_google_login=false")
    print("production_authorization=false")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

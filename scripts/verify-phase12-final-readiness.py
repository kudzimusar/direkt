#!/usr/bin/env python3
"""Validate the truth boundary for all currently clearable Phase 12 work.

This gate is intentionally incapable of authorizing production. It fails when repository
metadata overclaims external, legal, staffing, Play, signing or live-production evidence.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
RELEASE_DIR = ROOT / "docs" / "phase12" / "release"
PLAY_DIR = ROOT / "docs" / "phase12" / "play"
ENVIRONMENT_TS = ROOT / "backend" / "direkt-api" / "src" / "config" / "environment.ts"
VERSION_FILE = ROOT / "android" / "direkt-app" / "release" / "version.properties"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load(path: pathlib.Path) -> dict:
    if not path.is_file():
        fail(f"missing readiness source: {path.relative_to(ROOT)}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path.relative_to(ROOT)}: {exc}")


def properties(path: pathlib.Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, sep, value = line.partition("=")
        if not sep:
            fail(f"invalid property line in {path.relative_to(ROOT)}: {line}")
        result[key.strip()] = value.strip()
    return result


def require_false(mapping: dict, key: str, source: str) -> None:
    if mapping.get(key) is not False:
        fail(f"{source} must not claim {key}=true before external evidence exists")


def main() -> None:
    runtime = load(RELEASE_DIR / "production_runtime_readiness.json")
    staffing = load(RELEASE_DIR / "support_verification_staffing.json")
    rollout = load(RELEASE_DIR / "monitoring_rollback_rollout.json")
    package = load(RELEASE_DIR / "release_package_contract.json")
    data_safety = load(PLAY_DIR / "data_safety_inventory.json")
    permissions = load(PLAY_DIR / "permissions_inventory.json")

    claims = runtime.get("claims", {})
    for key in (
        "production_backend_ready_to_accept_public_traffic",
        "production_environment_deployed",
        "production_backup_restore_proven",
        "formal_phase12_authorized",
    ):
        require_false(claims, key, "production_runtime_readiness.json")

    if claims.get("staging_restore_and_rollback_patterns_proven") is not True:
        fail("managed Phase 10 restore/rollback evidence must remain recorded as proven")

    if staffing.get("production_staffing_claim") is not False:
        fail("staffing contract must not claim operational production staffing")
    if not staffing.get("required_roles"):
        fail("staffing contract must define required roles")
    if any(role.get("status") == "operational" for role in staffing["required_roles"]):
        fail("no production role may be marked operational without external staffing evidence")

    if rollout.get("status") != "plan-defined-production-activation-blocked":
        fail("monitoring/rollout plan must remain explicitly production-blocked")
    if not rollout.get("immediate_stop_conditions"):
        fail("rollout plan must define immediate stop conditions")
    if not rollout.get("rollback_order"):
        fail("rollout plan must define rollback order")
    if not rollout.get("production_evidence_missing"):
        fail("rollout plan must enumerate missing production evidence")

    current = package.get("current_state", {})
    for key in (
        "tag_created",
        "release_notes_published",
        "signed_aab_created",
        "play_track_created",
        "formal_release_candidate_eligible",
    ):
        require_false(current, key, "release_package_contract.json")

    entry = package.get("release_candidate_entry_gate", {})
    if entry.get("phase11_exit_decision") != "PROCEED required":
        fail("release package must require an evidence-backed Phase 11 PROCEED decision")
    if entry.get("synthetic_preview_release_blocker") is not False:
        fail("release candidate contract must require synthetic preview blocker cleared")
    if entry.get("account_deletion_end_to_end") is not True:
        fail("release candidate contract must require end-to-end account deletion")
    if entry.get("production_staffing_operational") is not True:
        fail("release candidate contract must require operational production staffing")
    if entry.get("production_monitoring_active") is not True:
        fail("release candidate contract must require active production monitoring")
    if entry.get("production_backup_restore_proven") is not True:
        fail("release candidate contract must require production backup restore evidence")

    if data_safety.get("security_answers_candidate", {}).get(
        "request_account_deletion_supported_end_to_end"
    ) is not False:
        fail("Data Safety inventory must not overclaim account deletion")

    declared = [item.get("name") for item in permissions.get("declared_permissions", [])]
    if declared != ["android.permission.INTERNET"]:
        fail("final readiness baseline expects the current exact permission inventory: INTERNET only")

    release = properties(VERSION_FILE)
    if release.get("DIREKT_RELEASE_CHANNEL") != "preauthorization":
        fail("clearable Phase 12 checkpoint must remain on preauthorization channel")
    if "preauth" not in release.get("DIREKT_RELEASE_VERSION_NAME", ""):
        fail("preauthorization version name must remain explicitly labelled")

    environment = ENVIRONMENT_TS.read_text(encoding="utf-8")
    required_environment_guards = [
        "Production traffic must remain disabled until the Phase 12 release gate.",
        "Production payment provider mode must remain disabled until a later approval gate.",
        "value.DIREKT_DATA_MODE === 'production' && value.DIREKT_TRAFFIC_MODE !== 'disabled'",
    ]
    for guard in required_environment_guards:
        if guard not in environment:
            fail(f"production fail-closed environment guard missing: {guard}")

    synthetic_paths = [
        ROOT / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/DiscoveryExperience.kt",
        ROOT / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/interaction/Phase8InteractionExperience.kt",
        ROOT / "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/DirektApp.kt",
    ]
    synthetic_markers = []
    for path in synthetic_paths:
        if path.is_file() and re.search(r"synthetic|fictional|preview context", path.read_text(encoding="utf-8"), re.I):
            synthetic_markers.append(str(path.relative_to(ROOT)))
    if not synthetic_markers:
        fail(
            "synthetic preview marker unexpectedly disappeared; remove this assertion only with an explicit "
            "evidence-led production client cutover decision and release-candidate review"
        )

    blockers = [
        "PHASE11_PRIMARY_PILOT_AND_11J_PROCEED",
        "ZAMBIA_LEGAL_DPC_AND_FINAL_PRIVACY_APPROVAL",
        "ACCOUNT_DELETION_END_TO_END",
        "SYNTHETIC_PREVIEW_PRODUCTION_CUTOVER",
        "PRODUCTION_ENVIRONMENT_AND_BACKUP_RESTORE",
        "PRODUCTION_STAFFING_OPERATIONAL",
        "PRODUCTION_MONITORING_AND_ESCALATION_ACTIVE_TESTED",
        "SIGNED_REPRODUCIBLE_AAB_AND_PLAY_INTERNAL_CLOSED_TESTING",
        "FINAL_PLAY_FORMS_IARC_ASSETS_AND_RELEASE_DATE_POLICY_RECHECK",
    ]

    print("phase12_clearable_readiness=PASS")
    print("formal_phase12_authorized=false")
    print("production_release_candidate_eligible=false")
    print("preauthorization_channel=true")
    print("production_traffic_fail_closed=true")
    print("production_payments_disabled=true")
    print("production_staffing_operational=false")
    print("production_monitoring_active=false")
    print("production_backup_restore_proven=false")
    print("account_deletion_end_to_end=false")
    print("synthetic_preview_release_blocker=true")
    for marker in synthetic_markers:
        print(f"synthetic_preview_source={marker}")
    for blocker in blockers:
        print(f"remaining_blocker={blocker}")


if __name__ == "__main__":
    main()

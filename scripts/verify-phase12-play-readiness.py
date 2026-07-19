#!/usr/bin/env python3
"""Fail-closed repository checks for Phase 12B Google Play preparation.

This validator does not contact Play Console and cannot authorize release. It proves that
repository-controlled listing, permissions and Data Safety inventories remain internally
consistent with the current Android source.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
PLAY = ROOT / "docs" / "phase12" / "play"
MANIFEST = ROOT / "android" / "direkt-app" / "app" / "src" / "main" / "AndroidManifest.xml"
BUILD_GRADLE = ROOT / "android" / "direkt-app" / "app" / "build.gradle.kts"
VERSION_FILE = ROOT / "android" / "direkt-app" / "release" / "version.properties"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_json(name: str) -> dict:
    path = PLAY / name
    if not path.is_file():
        fail(f"missing required Play readiness source: {path.relative_to(ROOT)}")
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON in {path.relative_to(ROOT)}: {exc}")


def release_properties() -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in VERSION_FILE.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            fail(f"invalid release property line: {raw_line!r}")
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def main() -> None:
    store = load_json("store_listing.json")
    permissions = load_json("permissions_inventory.json")
    data_safety = load_json("data_safety_inventory.json")
    content = load_json("content_distribution_inventory.json")

    if store.get("application_id") != "com.kudzimusar.direkt":
        fail("store listing application_id must remain com.kudzimusar.direkt")
    if len(store.get("app_name", "")) > 30:
        fail("Play app name exceeds 30 characters")
    if len(store.get("short_description", "")) > 80:
        fail("Play short description exceeds 80 characters")
    if len(store.get("full_description", "")) > 4000:
        fail("Play full description exceeds 4000 characters")
    if store.get("contains_ads") is not False:
        fail("current repository source must not claim ads")

    manifest_root = ET.parse(MANIFEST).getroot()
    manifest_permissions = sorted(
        node.attrib.get(f"{ANDROID_NS}name", "")
        for node in manifest_root.findall("uses-permission")
        if node.attrib.get(f"{ANDROID_NS}name")
    )
    inventory_permissions = sorted(
        item["name"] for item in permissions.get("declared_permissions", [])
    )
    if manifest_permissions != inventory_permissions:
        fail(
            "permissions inventory does not match AndroidManifest.xml: "
            f"manifest={manifest_permissions}, inventory={inventory_permissions}"
        )
    if manifest_permissions != ["android.permission.INTERNET"]:
        fail(
            "Phase 12B baseline expects only INTERNET. Any permission change requires an explicit "
            "inventory/policy decision before this gate may be updated."
        )

    gradle = BUILD_GRADLE.read_text(encoding="utf-8")
    for required in (
        'applicationId = "com.kudzimusar.direkt"',
        "compileSdk = 36",
        "targetSdk = 36",
        "implementation(libs.firebase.auth)",
    ):
        if required not in gradle:
            fail(f"Android release source missing required invariant: {required}")

    release = release_properties()
    if data_safety.get("artifact_scope", {}).get("application_id") != store["application_id"]:
        fail("Data Safety application_id differs from store listing")
    if data_safety.get("artifact_scope", {}).get("version_name") != release.get(
        "DIREKT_RELEASE_VERSION_NAME"
    ):
        fail("Data Safety inventory version_name differs from release/version.properties")
    if data_safety.get("artifact_scope", {}).get("release_channel") != release.get(
        "DIREKT_RELEASE_CHANNEL"
    ):
        fail("Data Safety inventory release_channel differs from release/version.properties")

    sdk_names = {item.get("sdk") for item in data_safety.get("sdk_inventory", [])}
    if "Firebase Authentication" not in sdk_names:
        fail("Firebase Authentication dependency exists but is absent from Data Safety SDK inventory")

    data_entries = data_safety.get("play_data_types", [])
    if not any("Phone number" in item.get("play_category", "") for item in data_entries):
        fail("Firebase phone authentication is implemented but Phone number is absent from Data Safety inventory")
    if data_safety.get("security_answers_candidate", {}).get(
        "request_account_deletion_supported_end_to_end"
    ) is not False:
        fail("Repository must not claim end-to-end account deletion support before evidence exists")

    if content.get("application_id") != store["application_id"]:
        fail("content/distribution application_id differs from store listing")
    if content.get("devices", {}).get("target_sdk") != 36:
        fail("content/distribution inventory target SDK must be 36")
    if content.get("content_rating", {}).get("rating_claim") != "none-until-IARC-generates-the-rating":
        fail("repository must not fabricate an IARC content rating")

    prohibited = list(ROOT.rglob("google-services.json"))
    prohibited += [
        path
        for pattern in ("*.jks", "*.keystore", "*.p12", "*.pfx")
        for path in ROOT.rglob(pattern)
    ]
    if prohibited:
        fail("production/signing material must not be committed: " + ", ".join(str(p) for p in prohibited))

    synthetic_release_sources = [
        ROOT / "android" / "direkt-app" / "app" / "src" / "main" / "java" / "com" / "kudzimusar" / "direkt" / "ui" / "discovery" / "DiscoveryExperience.kt",
        ROOT / "android" / "direkt-app" / "app" / "src" / "main" / "java" / "com" / "kudzimusar" / "direkt" / "ui" / "interaction" / "Phase8InteractionExperience.kt",
    ]
    synthetic_markers = []
    for path in synthetic_release_sources:
        if path.is_file() and re.search(r"\bSynthetic|fictional|preview context", path.read_text(encoding="utf-8"), re.I):
            synthetic_markers.append(str(path.relative_to(ROOT)))

    print("phase12b_play_readiness=PASS")
    print(f"application_id={store['application_id']}")
    print(f"release_channel={release.get('DIREKT_RELEASE_CHANNEL')}")
    print(f"manifest_permissions={','.join(manifest_permissions)}")
    print("play_sensitive_permission_form_expected=false")
    print("data_safety_inventory_present=true")
    print("account_deletion_end_to_end=false")
    print("synthetic_preview_release_blocker=" + ("true" if synthetic_markers else "false"))
    for marker in synthetic_markers:
        print(f"synthetic_preview_source={marker}")


if __name__ == "__main__":
    main()

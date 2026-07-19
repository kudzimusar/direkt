#!/usr/bin/env python3
"""Fail-closed repository checks for Phase 12B Google Play preparation.

This validator does not contact Play Console and cannot authorize release. It proves that
repository-controlled listing, merged release permissions, release runtime dependencies
and Data Safety inventories remain internally consistent with the current Android source.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
PLAY = ROOT / "docs" / "phase12" / "play"
SOURCE_MANIFEST = ROOT / "android" / "direkt-app" / "app" / "src" / "main" / "AndroidManifest.xml"
BUILD_GRADLE = ROOT / "android" / "direkt-app" / "app" / "build.gradle.kts"
VERSION_FILE = ROOT / "android" / "direkt-app" / "release" / "version.properties"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"

ALLOWED_RELEASE_DIRECT_MODULES = {
    "androidx.activity:activity-compose",
    "androidx.compose:compose-bom",
    "androidx.compose.material3:material3",
    "androidx.compose.ui:ui",
    "androidx.compose.ui:ui-graphics",
    "androidx.compose.ui:ui-tooling-preview",
    "androidx.core:core-ktx",
    "androidx.lifecycle:lifecycle-runtime-ktx",
    "androidx.lifecycle:lifecycle-viewmodel-compose",
    "androidx.navigation:navigation-compose",
    "com.google.firebase:firebase-auth",
    "com.google.firebase:firebase-bom",
}

PROHIBITED_STORE_CLAIMS = {
    "100% verified": re.compile(r"\b100\s*%\s*verified\b", re.I),
    "fully verified": re.compile(r"\bfully\s+verified\b", re.I),
    "guaranteed": re.compile(r"\bguaranteed\b", re.I),
    "safe": re.compile(r"\bsafe\b", re.I),
    "government approved": re.compile(r"\bgovernment[-\s]+approved\b", re.I),
    "Play approved": re.compile(r"\b(?:google\s+)?play[-\s]+approved\b", re.I),
    "legally approved": re.compile(r"\blegally?[-\s]+approved\b", re.I),
    "DPC approved": re.compile(r"\bDPC[-\s]+approved\b", re.I),
}


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


def manifest_path() -> pathlib.Path:
    merged = os.environ.get("DIREKT_MERGED_MANIFEST_PATH", "").strip()
    require_merged = os.environ.get("DIREKT_REQUIRE_MERGED_MANIFEST", "false") == "true"
    if merged:
        path = pathlib.Path(merged)
        if not path.is_absolute():
            path = ROOT / path
        path = path.resolve()
        if not path.is_file():
            fail(f"configured merged manifest does not exist: {path}")
        return path
    if require_merged:
        fail("CI requires DIREKT_MERGED_MANIFEST_PATH from the release manifest-merge task")
    return SOURCE_MANIFEST


def merged_manifest_permissions(path: pathlib.Path) -> list[str]:
    root = ET.parse(path).getroot()
    names: set[str] = set()
    for tag in ("uses-permission", "uses-permission-sdk-23"):
        for node in root.findall(tag):
            name = node.attrib.get(f"{ANDROID_NS}name", "").strip()
            if name:
                names.add(name)
    return sorted(names)


def direct_release_modules_from_report(path: pathlib.Path) -> set[str]:
    modules: set[str] = set()
    root_dependency = re.compile(r"^(?:\+---|\\---)\s+([^\s]+)")
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = root_dependency.match(raw)
        if not match:
            continue
        token = match.group(1)
        if token.startswith("project"):
            fail(f"unexpected project dependency on releaseRuntimeClasspath: {raw}")
        parts = token.split(":")
        if len(parts) < 2:
            fail(f"could not parse direct release dependency: {raw}")
        modules.add(f"{parts[0]}:{parts[1]}")
    if not modules:
        fail(f"no direct modules parsed from release runtime dependency report: {path}")
    return modules


def fallback_declared_modules(gradle: str) -> set[str]:
    """Local fallback only; CI must supply the resolved release runtime report."""
    alias_to_module = {
        "libs.androidx.core.ktx": "androidx.core:core-ktx",
        "libs.androidx.lifecycle.runtime.ktx": "androidx.lifecycle:lifecycle-runtime-ktx",
        "libs.androidx.lifecycle.viewmodel.compose": "androidx.lifecycle:lifecycle-viewmodel-compose",
        "libs.androidx.activity.compose": "androidx.activity:activity-compose",
        "libs.androidx.navigation.compose": "androidx.navigation:navigation-compose",
        "platform(libs.androidx.compose.bom)": "androidx.compose:compose-bom",
        "libs.androidx.compose.ui": "androidx.compose.ui:ui",
        "libs.androidx.compose.ui.graphics": "androidx.compose.ui:ui-graphics",
        "libs.androidx.compose.ui.tooling.preview": "androidx.compose.ui:ui-tooling-preview",
        "libs.androidx.compose.material3": "androidx.compose.material3:material3",
        "platform(libs.firebase.bom)": "com.google.firebase:firebase-bom",
        "libs.firebase.auth": "com.google.firebase:firebase-auth",
    }
    modules: set[str] = set()
    dependency_call = re.compile(r"^([A-Za-z][A-Za-z0-9]*)Implementation\((.+)\)$|^implementation\((.+)\)$")
    for raw_line in gradle.splitlines():
        line = raw_line.strip()
        match = dependency_call.fullmatch(line)
        if not match:
            continue
        configuration = match.group(1)
        expression = (match.group(2) or match.group(3)).strip()
        if configuration and configuration.lower().startswith(("debug", "test", "androidtest")):
            continue
        module = alias_to_module.get(expression)
        if module is None:
            fail(f"unreviewed release-capable dependency declaration: {line}")
        modules.add(module)
    return modules


def release_runtime_modules(gradle: str) -> set[str]:
    report = os.environ.get("DIREKT_RELEASE_RUNTIME_DEPENDENCIES_PATH", "").strip()
    require_report = os.environ.get("DIREKT_REQUIRE_RELEASE_RUNTIME_DEPENDENCIES", "false") == "true"
    if report:
        path = pathlib.Path(report)
        if not path.is_absolute():
            path = ROOT / path
        path = path.resolve()
        if not path.is_file():
            fail(f"configured release runtime dependency report does not exist: {path}")
        return direct_release_modules_from_report(path)
    if require_report:
        fail("CI requires DIREKT_RELEASE_RUNTIME_DEPENDENCIES_PATH from Gradle releaseRuntimeClasspath")
    return fallback_declared_modules(gradle)


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

    listing_text = "\n".join(
        str(store.get(key, "")) for key in ("app_name", "short_description", "full_description")
    )
    for label, pattern in PROHIBITED_STORE_CLAIMS.items():
        if pattern.search(listing_text):
            fail(f"Play listing contains prohibited trust/approval overclaim: {label}")

    inspected_manifest = manifest_path()
    manifest_permissions = merged_manifest_permissions(inspected_manifest)
    inventory_permissions = sorted(
        item["name"] for item in permissions.get("declared_permissions", [])
    )
    if manifest_permissions != inventory_permissions:
        fail(
            "permissions inventory does not match inspected release manifest including sdk-23 permissions: "
            f"manifest={manifest_permissions}, inventory={inventory_permissions}, path={inspected_manifest}"
        )
    if manifest_permissions != ["android.permission.INTERNET"]:
        fail(
            "Phase 12B baseline expects only INTERNET in the merged release manifest. Any permission "
            "change requires an explicit inventory/Data Safety/policy update before this gate may pass."
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

    release_modules = release_runtime_modules(gradle)
    unexpected = sorted(release_modules - ALLOWED_RELEASE_DIRECT_MODULES)
    missing = sorted(ALLOWED_RELEASE_DIRECT_MODULES - release_modules)
    if unexpected or missing:
        fail(
            "releaseRuntimeClasspath direct dependency surface changed without a reviewed Play/Data Safety update: "
            f"unexpected={unexpected}, missing={missing}"
        )

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
    print(f"manifest_source={inspected_manifest}")
    print(f"manifest_permissions={','.join(manifest_permissions)}")
    print("release_direct_modules=" + ",".join(sorted(release_modules)))
    print("play_sensitive_permission_form_expected=false")
    print("data_safety_inventory_present=true")
    print("account_deletion_end_to_end=false")
    print("synthetic_preview_release_blocker=" + ("true" if synthetic_markers else "false"))
    for marker in synthetic_markers:
        print(f"synthetic_preview_source={marker}")


if __name__ == "__main__":
    main()

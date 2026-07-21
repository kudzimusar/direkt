#!/usr/bin/env python3
"""Fail-closed repository checks for Phase 12B Google Play preparation.

This validator does not contact Play Console and cannot authorize release. It proves that
repository-controlled listing, merged release permissions, selected release runtime
dependencies and Data Safety inventories remain internally consistent with the current
Android source.
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
    "com.google.firebase:firebase-crashlytics",
    "org.jetbrains.kotlin:kotlin-stdlib",
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


def _module_from_token(token: str, raw: str) -> str:
    token = token.strip()
    if token.startswith("project"):
        fail(f"unexpected project dependency on releaseRuntimeClasspath: {raw}")
    parts = token.split(":")
    if len(parts) < 2:
        fail(f"could not parse direct release dependency: {raw}")
    return f"{parts[0]}:{parts[1]}"


def selected_direct_module(raw: str) -> str | None:
    """Return the selected group:name for one root dependency-report line."""
    match = re.match(r"^(?:\+---|\\---)\s+(.+)$", raw)
    if not match:
        return None

    body = match.group(1).strip()
    requested_text, separator, selected_text = body.partition(" -> ")
    requested_token = requested_text.split()[0]

    if not separator:
        return _module_from_token(requested_token, raw)

    selected_text = selected_text.strip()
    if selected_text.startswith("project ") or selected_text == "project":
        fail(f"unexpected selected project dependency on releaseRuntimeClasspath: {raw}")

    selected_token = selected_text.split()[0]
    if ":" in selected_token:
        return _module_from_token(selected_token, raw)
    return _module_from_token(requested_token, raw)


def direct_release_modules_from_report(path: pathlib.Path) -> set[str]:
    modules: set[str] = set()
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        module = selected_direct_module(raw)
        if module is not None:
            modules.add(module)
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
        "libs.firebase.crashlytics": "com.google.firebase:firebase-crashlytics",
    }
    modules: set[str] = set()
    dependency_call = re.compile(
        r"^([A-Za-z][A-Za-z0-9]*)Implementation\((.+)\)$|^implementation\((.+)\)$"
    )
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

    if any(item.get("runtime_prompt") is not False for item in permissions.get("declared_permissions", [])):
        fail("current preauthorization permission inventory must not contain a runtime-prompt permission")
    if permissions.get("current_play_declaration_assessment", {}).get(
        "sensitive_or_high_risk_permission_form_expected"
    ) is not False:
        fail("current permission inventory unexpectedly requires a sensitive/high-risk permission form")

    gradle = BUILD_GRADLE.read_text(encoding="utf-8")
    for required in (
        'applicationId = "com.kudzimusar.direkt"',
        "compileSdk = 36",
        "targetSdk = 36",
        "implementation(libs.firebase.auth)",
        "implementation(libs.firebase.crashlytics)",
    ):
        if required not in gradle:
            fail(f"Android release source missing required invariant: {required}")

    release_modules = release_runtime_modules(gradle)
    unexpected = sorted(release_modules - ALLOWED_RELEASE_DIRECT_MODULES)
    missing = sorted(ALLOWED_RELEASE_DIRECT_MODULES - release_modules)
    if unexpected or missing:
        fail(
            "selected releaseRuntimeClasspath direct dependency surface changed without a reviewed Play/Data Safety update: "
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
    if "Firebase Crashlytics" not in sdk_names:
        fail("Firebase Crashlytics dependency exists but is absent from Data Safety SDK inventory")

    if content.get("target_audience", {}).get("children_targeted") is not False:
        fail("current content inventory must explicitly state that children are not targeted")
    if content.get("contains_ads") is not False:
        fail("current content inventory must remain ad-free")
    if content.get("restricted_evidence_public") is not False:
        fail("restricted evidence must not be represented as public content")

    print("phase12_play_readiness=PASS")
    print(f"manifest_source={inspected_manifest}")
    print(f"merged_permission_count={len(manifest_permissions)}")
    print(f"release_direct_dependency_count={len(release_modules)}")
    print(f"release_channel={release.get('DIREKT_RELEASE_CHANNEL')}")
    print("production_submission_authorized=false")


if __name__ == "__main__":
    main()

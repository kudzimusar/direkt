#!/usr/bin/env python3
"""One-shot RC7 patch for Play SDK/Data Safety inventory consistency."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VERIFIER = ROOT / "scripts" / "verify-phase12-play-readiness.py"
INVENTORY = ROOT / "docs" / "phase12" / "play" / "data_safety_inventory.json"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


def patch_verifier() -> None:
    text = VERIFIER.read_text(encoding="utf-8")
    text = replace_once(
        text,
        '    "com.google.firebase:firebase-messaging",\n    "org.jetbrains.kotlin:kotlin-stdlib",',
        '    "com.google.firebase:firebase-messaging",\n    "com.google.maps.android:maps-compose",\n    "org.jetbrains.kotlin:kotlin-stdlib",',
        "allowed Maps Compose module",
    )
    text = replace_once(
        text,
        '        "libs.firebase.messaging": "com.google.firebase:firebase-messaging",\n    }',
        '        "libs.firebase.messaging": "com.google.firebase:firebase-messaging",\n'
        '        "libs.google.maps.compose": "com.google.maps.android:maps-compose",\n    }',
        "fallback Maps Compose alias",
    )
    text = replace_once(
        text,
        '        "implementation(libs.firebase.messaging)",\n        "DIREKT_CRASHLYTICS_CANARY_ENABLED",',
        '        "implementation(libs.firebase.messaging)",\n'
        '        "implementation(libs.google.maps.compose)",\n'
        '        "DIREKT_CRASHLYTICS_CANARY_ENABLED",\n'
        '        "DIREKT_MAPS_BUILD_ENABLED",',
        "Maps release invariants",
    )
    text = replace_once(
        text,
        '    if "Firebase Cloud Messaging" not in sdk_names:\n'
        '        fail("Firebase Messaging dependency exists but is absent from Data Safety SDK inventory")\n',
        '    if "Firebase Cloud Messaging" not in sdk_names:\n'
        '        fail("Firebase Messaging dependency exists but is absent from Data Safety SDK inventory")\n'
        '    if "Google Maps SDK for Android" not in sdk_names:\n'
        '        fail("Maps Compose dependency exists but Maps SDK is absent from Data Safety SDK inventory")\n',
        "Maps SDK inventory requirement",
    )
    text = replace_once(
        text,
        '    if messaging_inventory.get("production_push_authorized") is not False:\n'
        '        fail("FCM Data Safety inventory must not authorize production push")\n\n'
        '    data_entries = data_safety.get("play_data_types", [])\n',
        '    if messaging_inventory.get("production_push_authorized") is not False:\n'
        '        fail("FCM Data Safety inventory must not authorize production push")\n\n'
        '    maps_inventory = next(\n'
        '        (item for item in data_safety.get("sdk_inventory", []) if item.get("sdk") == "Google Maps SDK for Android"),\n'
        '        None,\n'
        '    )\n'
        '    if not isinstance(maps_inventory, dict):\n'
        '        fail("Google Maps SDK inventory entry is invalid")\n'
        '    if maps_inventory.get("device_location_permission_requested") is not False:\n'
        '        fail("RC7 Maps must not request Android device-location permission")\n'
        '    if maps_inventory.get("my_location_layer_enabled") is not False:\n'
        '        fail("RC7 Maps must keep the Google Maps my-location layer disabled")\n'
        '    if maps_inventory.get("participant_or_production_maps_authorized") is not False:\n'
        '        fail("RC7 Maps inventory must not authorize participant or production Maps use")\n'
        '    if maps_inventory.get("exact_private_provider_coordinates_transmitted") is not False:\n'
        '        fail("RC7 Maps must not transmit exact private provider coordinates")\n\n'
        '    data_entries = data_safety.get("play_data_types", [])\n',
        "Maps fail-closed inventory assertions",
    )
    text = replace_once(
        text,
        '    print("fcm_production_push_authorized=false")\n'
        '    print("account_deletion_end_to_end=false")\n',
        '    print("fcm_production_push_authorized=false")\n'
        '    print("maps_sdk_present=true")\n'
        '    print("maps_device_location_permission_requested=false")\n'
        '    print("maps_exact_private_provider_coordinates_transmitted=false")\n'
        '    print("maps_participant_or_production_authorized=false")\n'
        '    print("account_deletion_end_to_end=false")\n',
        "Maps verification receipt",
    )
    VERIFIER.write_text(text, encoding="utf-8")


def patch_inventory() -> None:
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    data["schema_version"] = 3
    data["artifact_scope"]["note"] = (
        "This inventory describes the current Android Firebase Authentication, RC3 Crashlytics, "
        "RC4 Firebase Cloud Messaging and RC7 Google Maps SDK source integrations. Crashlytics "
        "collection, FCM auto-init and Maps runtime activation are disabled by default. RC7 requests "
        "no Android device-location permission, keeps the Maps my-location layer disabled, renders "
        "only consented public premises and public service-area geometry, and does not transmit exact "
        "private provider coordinates. Only exact-source synthetic managed canaries may explicitly "
        "activate these integrations before later participant and production authorization."
    )

    sdk_inventory = data["sdk_inventory"]
    if any(item.get("sdk") == "Google Maps SDK for Android" for item in sdk_inventory):
        raise AssertionError("Google Maps SDK inventory entry already exists")
    sdk_inventory.append(
        {
            "sdk": "Google Maps SDK for Android",
            "dependency": "com.google.maps.android:maps-compose",
            "active_use": "RC7 source-integrated behind DIREKT_MAPS_BUILD_ENABLED=false by default; synthetic managed map-load proof only until later participant and production authorization.",
            "automatic_collection": [
                "request metadata including device/OS/model/form-factor and Maps SDK version information",
                "stack traces and crash metrics generated inside the Maps SDK",
                "IP address",
                "Maps SDK-specific pseudonymous identifier"
            ],
            "usage_dependent_processing": [
                "map interaction events such as panning and zooming when the map camera is used",
                "public service-area circle centers and consented public-premises marker coordinates required to render the approved synthetic map"
            ],
            "device_location_permission_requested": False,
            "my_location_layer_enabled": False,
            "exact_private_provider_coordinates_transmitted": False,
            "participant_or_production_maps_authorized": False,
            "places_sdk_included": False,
            "routes_sdk_included": False,
            "sharing_assessment": "Google Maps Platform service processing only; final Play Data Safety answers must be revalidated against the exact shipped Maps SDK, app configuration, Google disclosures, approved privacy policy and release authorization."
        }
    )

    data_entries = data["play_data_types"]
    data_entries.append(
        {
            "play_category": "Device or other IDs / Maps SDK pseudonymous identifier and request metadata",
            "collected": True,
            "shared": False,
            "collection_condition": "Only when the RC7 Maps build/runtime switch is explicitly enabled. The Maps SDK automatically processes device/request metadata, IP address, SDK crash metrics and a Maps SDK-specific pseudonymous identifier.",
            "required_or_optional": "optional because manual area and list discovery remain fully functional when Maps is disabled or unavailable",
            "purposes": [
                "app functionality",
                "analytics",
                "fraud prevention, security and compliance"
            ],
            "retention_and_deletion": "Google-controlled service retention applies. DIREKT does not persist the Maps SDK identifier or raw provider telemetry. Final Play categorization and retention wording require exact-release revalidation."
        }
    )
    data_entries.append(
        {
            "play_category": "App activity / Map interaction events",
            "collected": True,
            "shared": False,
            "collection_condition": "Only when the optional RC7 Google Map is enabled and the user pans or zooms the map. Google documents that Maps SDK camera interactions may be collected to improve Google services.",
            "required_or_optional": "optional; users can use manual area entry and list discovery without the map",
            "purposes": [
                "app functionality",
                "analytics"
            ],
            "retention_and_deletion": "Google-controlled service retention applies. DIREKT does not ingest or persist raw map-interaction telemetry."
        }
    )

    not_collected = data["not_collected_by_current_android_release_path"]
    try:
        index = not_collected.index("precise or approximate device location")
    except ValueError as exc:
        raise AssertionError("expected prior device-location inventory statement") from exc
    not_collected[index:index + 1] = [
        "precise GPS/device-sensor location and Android fine/coarse/background location permission data",
        "exact private provider base coordinates through Google Maps or any client-visible map payload"
    ]
    not_collected.append(
        "participant or production Google Maps traffic while DIREKT_MAPS_BUILD_ENABLED remains default-off and RC7 authorization remains synthetic-only"
    )

    data["future_or_blocked_product_data"].append(
        {
            "data": "participant/production Google Maps request metadata, IP address, Maps SDK identifier and map interaction events",
            "status": "Maps SDK is source-integrated behind a default-off build/runtime switch. RC7 synthetic managed proof does not authorize participant or production Maps processing. The final exact release candidate, privacy notice and Play Data Safety form must be revalidated before activation.",
            "source_register": "docs/integrations/RC7_GOOGLE_MAPS_IMPLEMENTATION_NOTES.md"
        }
    )
    data["submission_boundary"] = (
        "The Play developer is responsible for the final declaration. Revalidate this inventory "
        "against the exact release candidate, merged manifest, SDK versions, backend behavior, "
        "approved privacy policy, telemetry/messaging/Maps configuration and live account-deletion "
        "flow before submitting any closed/open/production release."
    )
    INVENTORY.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    patch_verifier()
    patch_inventory()
    print("RC7 Play SDK/Data Safety reconciliation applied")

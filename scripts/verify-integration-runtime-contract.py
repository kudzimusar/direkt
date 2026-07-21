#!/usr/bin/env python3
"""Verify DIREKT integration claims against the repository's actual runtime wiring.

This is intentionally a source/runtime contract, not a provider availability check. It
prevents an integration from being documented as active when the required application
binding is absent, and prevents gated/planned providers from silently becoming active.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def read(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        fail(f"required integration contract file is missing: {path}")
    return target.read_text(encoding="utf-8")


def require(text: str, needle: str, label: str) -> None:
    if needle not in text:
        fail(f"missing {label}: {needle}")


def prohibit(text: str, pattern: str, label: str) -> None:
    if re.search(pattern, text, re.I | re.M):
        fail(f"prohibited {label} detected: {pattern}")


def dependencies(path: str) -> set[str]:
    package = json.loads(read(path))
    result: set[str] = set()
    for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        result.update((package.get(key) or {}).keys())
    return result


def scan_tree(relative: str, patterns: dict[str, re.Pattern[str]]) -> list[str]:
    """Scan deployable client source while excluding tests, fixtures and build tooling.

    Negative security assertions in tests and verifier/build scripts intentionally contain
    strings such as ``service_role``. Those files are not deployed into the Android, Next.js
    or static PWA runtime. Runtime/deployable source remains scanned so an actual privileged
    reference still fails closed.
    """
    matches: list[str] = []
    root = ROOT / relative
    if not root.exists():
        return matches
    ignored_suffixes = {".png", ".jpg", ".jpeg", ".webp", ".ico", ".jar", ".aab", ".apk", ".zip"}
    ignored_parts = {
        "node_modules",
        "build",
        ".next",
        "coverage",
        "dist",
        "test",
        "tests",
        "__tests__",
        "fixtures",
        "__fixtures__",
        "snapshots",
        "__snapshots__",
        "scripts",
    }
    for path in root.rglob("*"):
        if not path.is_file() or path.suffix.lower() in ignored_suffixes:
            continue
        if any(part in ignored_parts for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in patterns.items():
            if pattern.search(text):
                matches.append(f"{label}:{path.relative_to(ROOT)}")
    return matches


def main() -> None:
    status = read("docs/integrations/CURRENT_INTEGRATION_STATUS.md")
    reconciliation = read("docs/REPOSITORY_RECONCILIATION_2026-07-19.md")
    backend_env = read("backend/direkt-api/src/config/environment.ts")
    backend_pkg = dependencies("backend/direkt-api/package.json")
    portal_pkg = dependencies("admin/direkt-operations-portal/package.json")
    android_gradle = read("android/direkt-app/app/build.gradle.kts")
    android_catalog = read("android/direkt-app/gradle/libs.versions.toml")
    android_manifest = read("android/direkt-app/app/src/main/AndroidManifest.xml")
    storage_module = read(
        "backend/direkt-api/src/verification-evidence/verification-evidence.module.ts"
    )
    storage_adapter = read(
        "backend/direkt-api/src/verification-evidence/supabase-private-storage.adapter.ts"
    )
    cloud_run = read(".github/workflows/cloud-run-staging-deploy-v2.yml")
    resend_canary = read(".github/workflows/cloud-run-resend-canary.yml")
    firebase_distribution = read(".github/workflows/firebase-internal-distribution.yml")
    openapi_generate = read("backend/direkt-api/scripts/generate-openapi.ts")
    openapi_check = read("backend/direkt-api/scripts/check-openapi.ts")
    platform_migration = read("database/migrations/202607141430_platform_foundation.sql")
    communications_module = read("backend/direkt-api/src/communications/communications.module.ts")
    resend_adapter = read("backend/direkt-api/src/communications/resend-email-provider.adapter.ts")
    email_outbox = read("backend/direkt-api/src/communications/email-outbox.service.ts")
    resend_canary_entrypoint = read("backend/direkt-api/src/communications/resend-canary.ts")
    pwa = read("web/direkt-pwa/app.js")
    service_worker = read("web/direkt-pwa/sw.js")

    # Supabase: active server-side data/storage foundation only.
    for needle in (
        "aeeuscifrxcjmnswqwnq",
        "ACTIVE",
        "Supabase PostgreSQL",
        "Supabase Storage",
    ):
        require(status, needle, "Supabase status evidence")
    require(storage_module, "new SupabasePrivateStorageAdapter", "Supabase storage binding")
    require(storage_adapter, "/storage/v1/object/upload/sign/", "signed private upload path")
    require(storage_adapter, "createSignedReadUrl", "short-lived private read grants")
    require(backend_env, "EVIDENCE_STORAGE_PROVIDER", "Supabase storage mode")
    require(cloud_run, 'EVIDENCE_STORAGE_PROVIDER: "supabase"', "managed staging storage mode")
    require(cloud_run, "SUPABASE_SECRET_KEY=direkt-supabase-secret-key:", "Secret Manager binding")

    privileged_client_patterns = {
        "server Supabase secret": re.compile(r"SUPABASE_(?:SECRET_KEY|SERVICE_ROLE_KEY)"),
        "Supabase secret token": re.compile(r"\bsb_secret_[A-Za-z0-9_-]+"),
        "service-role credential": re.compile(r"\bservice_role\b", re.I),
    }
    leaked = []
    for client_root in ("android", "web", "admin"):
        leaked.extend(scan_tree(client_root, privileged_client_patterns))
    if leaked:
        fail("privileged Supabase material/reference entered a deployable client tree: " + ", ".join(leaked))

    # Google Cloud: immutable images, WIF, Secret Manager and private Cloud Run.
    for needle in (
        "direkt-dev-502701",
        "direkt-containers",
        "direkt-github-deployer@direkt-dev-502701.iam.gserviceaccount.com",
        "projects/264358173369/locations/global/workloadIdentityPools/direkt-github/providers/direkt-main",
        "--no-allow-unauthenticated",
        'DIREKT_TRAFFIC_MODE: "internal"',
        'DIREKT_DATA_MODE: "synthetic-only"',
        'PAYMENT_PROVIDER_MODE: "disabled"',
    ):
        require(cloud_run, needle, "Cloud Run staging invariant")
    if cloud_run.count("--no-allow-unauthenticated") < 2:
        fail("both API and operations portal Cloud Run services must remain private")
    prohibit(cloud_run, r"--allow-unauthenticated", "public Cloud Run invocation")

    # Firebase: Auth is implemented-gated; App Distribution is active; other SDKs remain absent.
    require(android_gradle, "implementation(libs.firebase.auth)", "Firebase Auth Android binding")
    require(firebase_distribution, "com.kudzimusar.direkt.debug", "Firebase debug app package")
    require(firebase_distribution, "direkt-internal-testers", "internal tester group")
    require(firebase_distribution, "workloadIdentityPools/direkt-github/providers/direkt-main", "WIF distribution auth")
    require(backend_env, "FIREBASE_AUTH_MODE", "backend Firebase auth gate")
    require(backend_env, "PILOT_ENTRY_APPROVED", "pilot entry gate")
    require(android_manifest, 'android:usesCleartextTraffic="false"', "Android HTTPS-only network policy")

    prohibited_android_integrations = (
        "firebase-crashlytics",
        "firebase-messaging",
        "play-services-maps",
        "places",
        "sentry",
    )
    catalog_lower = android_catalog.lower()
    gradle_lower = android_gradle.lower()
    for integration in prohibited_android_integrations:
        if integration in catalog_lower or integration in gradle_lower:
            fail(f"{integration} became Android-runtime active without integration-status promotion")

    # Sentry/Maps remain externally provisioned or planned, not silently active.
    # RC1 intentionally keeps Resend behind a provider-neutral native-fetch adapter rather than
    # adding a vendor SDK dependency.
    for dependency in backend_pkg | portal_pkg:
        lowered = dependency.lower()
        if "sentry" in lowered:
            fail("Sentry SDK became runtime-active without reviewed privacy/runtime promotion")
        if lowered == "resend" or lowered.startswith("@resend/"):
            fail("Resend vendor SDK dependency entered runtime; RC1 requires the reviewed provider-neutral HTTP adapter")
        if "googlemaps" in lowered or "google-maps" in lowered:
            fail("Google Maps server SDK became runtime-active without reviewed location promotion")
        if "twilio" in lowered:
            fail("superseded Twilio integration became runtime-active")

    require(reconciliation, "externally provisioned/runtime-unproven", "Maps/Sentry runtime truth")
    require(status, "EXTERNALLY_PROVISIONED", "externally provisioned status vocabulary")

    # RC1 Resend: provider-neutral server adapter, synthetic-only runtime job and outbox semantics.
    require(backend_env, "EMAIL_PROVIDER_MODE", "email provider kill switch")
    require(backend_env, "EMAIL_RESEND_API_KEY", "server-only Resend credential contract")
    require(backend_env, "Email provider activation currently permits synthetic-only data mode", "email data-mode gate")
    require(backend_env, "notify\\.direkt\\.forum", "verified Resend sender-domain gate")
    require(communications_module, "ResendEmailProviderAdapter", "Resend provider adapter binding")
    require(resend_adapter, "https://api.resend.com/emails", "Resend send endpoint")
    require(resend_adapter, "'idempotency-key'", "Resend provider idempotency header")
    require(email_outbox, "communications.email.send.v1", "email outbox event contract")
    require(email_outbox, "FOR UPDATE SKIP LOCKED", "concurrent outbox claim protection")
    require(email_outbox, "provider_unavailable", "sanitized retry failure code")
    require(email_outbox, "delivered@resend.dev", "synthetic-only Resend test sink")
    require(resend_canary_entrypoint, "runSyntheticCanary", "managed canary entrypoint")
    for needle in (
        "RUN-DIREKT-RESEND-CANARY",
        "direkt-resend-canary",
        "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com",
        'DIREKT_DATA_MODE: "synthetic-only"',
        'EMAIL_PROVIDER_MODE: "resend"',
        'EMAIL_FROM_ADDRESS: "DIREKT <canary@notify.direkt.forum>"',
        "EMAIL_RESEND_API_KEY=direkt-resend-api-key:${DIREKT_RESEND_API_KEY_SECRET_VERSION}",
        "DATABASE_URL=direkt-database-url:${DIREKT_DATABASE_URL_SECRET_VERSION}",
        "--max-retries 0",
        "--command node",
        "--args dist/communications/resend-canary.js",
        "--wait",
        "Continuous external delivery scheduling: disabled",
    ):
        require(resend_canary, needle, "managed Resend canary invariant")
    require(status, "ACTIVE — SYNTHETIC-ONLY MANAGED CANARY", "RC1 managed-canary status")
    require(
        status,
        "Continuous, controlled-pilot participant and production external email remain disabled.",
        "RC1 real-participant/production email stop gate",
    )

    # Operations portal: server API only; never direct database/storage client.
    forbidden_portal_dependencies = {
        "@supabase/supabase-js",
        "pg",
        "postgres",
        "@google-cloud/storage",
    }
    direct_portal = forbidden_portal_dependencies & portal_pkg
    if direct_portal:
        fail(f"operations portal acquired a privileged direct data dependency: {sorted(direct_portal)}")
    require(cloud_run, "DIREKT_API_BASE_URL=${API_URL}", "portal-to-API runtime binding")
    require(cloud_run, "roles/run.invoker", "portal-to-API IAM invocation boundary")

    # OpenAPI is canonical; generated client implementation is not falsely claimed.
    require(openapi_generate, "configureApplication(app)", "canonical OpenAPI generation")
    require(openapi_check, "Missing required", "OpenAPI contract drift gate")
    require(status, "OpenAPI", "OpenAPI integration status")

    # Communications: transactional outbox foundation exists; RC1 external email is proven only
    # for the managed synthetic canary while continuous/participant/production delivery stays off.
    require(platform_migration, "CREATE TABLE platform.outbox_events", "transactional outbox")
    require(status, "Transactional outbox", "outbox status")
    require(status, "WhatsApp", "WhatsApp status")
    require(status, "FCM", "FCM status")

    # Payments/registries: domain foundation only, no real provider path.
    require(backend_env, "Production payment provider mode must remain disabled", "payment production gate")
    require(openapi_check, "Unapproved payment-provider paths were exposed", "real payment route guard")
    for real_provider in ("mtn momo", "airtel money"):
        require(status.lower(), real_provider, "payment candidate status")
    require(status, "PACRA", "registry status")
    require(status, "NCC", "registry status")
    require(status, "TEVETA", "registry status")

    # Public PWA: static synthetic UI only; no privileged/public API binding.
    for pattern, label in (
        (r"\bfetch\s*\(", "network fetch"),
        (r"\bXMLHttpRequest\b", "XMLHttpRequest"),
        (r"\bWebSocket\b", "WebSocket"),
        (r"\bEventSource\b", "EventSource"),
        (r"supabase\.co", "direct Supabase endpoint"),
        (r"run\.app", "direct Cloud Run endpoint"),
        (r"Verified local services", "blanket verified-services claim"),
    ):
        prohibit(pwa, pattern, f"public PWA {label}")
    require(pwa, "Synthetic preview data", "synthetic PWA marker")
    require(pwa, "No data is submitted", "PWA submission boundary")

    # Service-worker privacy is behavior-based: only an explicit allowlist may enter Cache Storage.
    require(service_worker, "const CORE =", "explicit PWA shell asset list")
    require(service_worker, "const CORE_URLS = new Set", "resolved PWA shell URL allowlist")
    require(service_worker, "cache.addAll(CORE)", "install-time bounded shell caching")
    require(service_worker, "if (!CORE_URLS.has(url.href))", "non-shell cache bypass")
    require(
        service_worker,
        "Do not cache arbitrary same-origin GETs",
        "documented arbitrary-response cache prohibition",
    )
    prohibit(
        service_worker,
        r"cache\.put\s*\(\s*event\.request\s*,\s*response\s*\)",
        "unbounded direct runtime response caching",
    )

    print("integration_runtime_contract=PASS")
    print("supabase=active_server_side_only")
    print("google_cloud=active_private_staging")
    print("firebase_auth=implemented_gated")
    print("firebase_app_distribution=active_internal")
    print("maps=external_runtime_unproven_manual_fallback_active")
    print("sentry=external_runtime_unproven_cloud_monitoring_active")
    print("resend=active_synthetic_only_managed_canary_real_participant_disabled")
    print("fcm=planned")
    print("whatsapp=planned_domain_handoff_only")
    print("payments=domain_foundation_real_provider_disabled")
    print("registries=manual_evidence_only")
    print("pwa=synthetic_static_no_private_api")


if __name__ == "__main__":
    main()

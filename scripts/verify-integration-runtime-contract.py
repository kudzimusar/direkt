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
    for key in (
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
    ):
        result.update((package.get(key) or {}).keys())
    return result


def scan_tree(relative: str, patterns: dict[str, re.Pattern[str]]) -> list[str]:
    """Scan deployable client source while excluding tests, fixtures and build tooling."""
    matches: list[str] = []
    root = ROOT / relative
    if not root.exists():
        return matches
    ignored_suffixes = {
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".ico",
        ".jar",
        ".aab",
        ".apk",
        ".zip",
    }
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
    android_root_gradle = read("android/direkt-app/build.gradle.kts")
    android_gradle = read("android/direkt-app/app/build.gradle.kts")
    android_catalog = read("android/direkt-app/gradle/libs.versions.toml")
    android_manifest = read("android/direkt-app/app/src/main/AndroidManifest.xml")
    android_main_activity = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/MainActivity.kt"
    )
    android_crashlytics = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/observability/CrashlyticsCanary.kt"
    )
    android_fcm_canary = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/notifications/FcmCanary.kt"
    )
    android_fcm_service = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/notifications/DirektFirebaseMessagingService.kt"
    )
    android_push_registration = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/notifications/PushRegistrationCoordinator.kt"
    )
    android_notification_permission = read(
        "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/notifications/NotificationPermissionController.kt"
    )
    storage_module = read(
        "backend/direkt-api/src/verification-evidence/verification-evidence.module.ts"
    )
    storage_adapter = read(
        "backend/direkt-api/src/verification-evidence/supabase-private-storage.adapter.ts"
    )
    cloud_run = read(".github/workflows/cloud-run-staging-deploy-v2.yml")
    resend_canary = read(".github/workflows/cloud-run-resend-canary.yml")
    sentry_canary = read(".github/workflows/cloud-run-sentry-canary.yml")
    firebase_distribution = read(".github/workflows/firebase-internal-distribution.yml")
    crashlytics_canary = read(".github/workflows/firebase-crashlytics-canary.yml")
    fcm_canary = read(".github/workflows/firebase-fcm-canary.yml")
    openapi_generate = read("backend/direkt-api/scripts/generate-openapi.ts")
    openapi_check = read("backend/direkt-api/scripts/check-openapi.ts")
    platform_migration = read("database/migrations/202607141430_platform_foundation.sql")
    fcm_migration = read("database/migrations/202607221130_rc4_fcm_push.sql")
    communications_module = read(
        "backend/direkt-api/src/communications/communications.module.ts"
    )
    resend_adapter = read(
        "backend/direkt-api/src/communications/resend-email-provider.adapter.ts"
    )
    email_outbox = read("backend/direkt-api/src/communications/email-outbox.service.ts")
    resend_canary_entrypoint = read(
        "backend/direkt-api/src/communications/resend-canary.ts"
    )
    fcm_adapter = read(
        "backend/direkt-api/src/communications/fcm-push-provider.adapter.ts"
    )
    push_outbox = read("backend/direkt-api/src/communications/push-outbox.service.ts")
    push_token_service = read(
        "backend/direkt-api/src/communications/push-device-token.service.ts"
    )
    push_canary_entrypoint = read(
        "backend/direkt-api/src/communications/push-canary.ts"
    )
    backend_sentry = read("backend/direkt-api/src/instrument.ts")
    backend_sentry_runtime = read(
        "backend/direkt-api/src/platform/observability/sentry-runtime.ts"
    )
    backend_sentry_privacy = read(
        "backend/direkt-api/src/platform/observability/sentry-privacy.ts"
    )
    backend_sentry_canary = read(
        "backend/direkt-api/src/platform/observability/sentry-canary.ts"
    )
    portal_instrumentation = read(
        "admin/direkt-operations-portal/src/instrumentation.ts"
    )
    portal_sentry = read(
        "admin/direkt-operations-portal/src/sentry.server.config.ts"
    )
    portal_sentry_runtime = read(
        "admin/direkt-operations-portal/src/lib/observability/sentry-runtime.ts"
    )
    portal_sentry_privacy = read(
        "admin/direkt-operations-portal/src/lib/observability/sentry-privacy.ts"
    )
    portal_sentry_canary = read(
        "admin/direkt-operations-portal/src/app/api/observability/sentry-canary/route.ts"
    )
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
    require(
        storage_adapter,
        "/storage/v1/object/upload/sign/",
        "signed private upload path",
    )
    require(storage_adapter, "createSignedReadUrl", "short-lived private read grants")
    require(backend_env, "EVIDENCE_STORAGE_PROVIDER", "Supabase storage mode")
    require(
        cloud_run,
        'EVIDENCE_STORAGE_PROVIDER: "supabase"',
        "managed staging storage mode",
    )
    require(
        cloud_run,
        "SUPABASE_SECRET_KEY=direkt-supabase-secret-key:",
        "Secret Manager binding",
    )

    privileged_client_patterns = {
        "server Supabase secret": re.compile(r"SUPABASE_(?:SECRET_KEY|SERVICE_ROLE_KEY)"),
        "Supabase secret token": re.compile(r"\bsb_secret_[A-Za-z0-9_-]+"),
        "service-role credential": re.compile(r"\bservice_role\b", re.I),
    }
    leaked = []
    for client_root in ("android", "web", "admin"):
        leaked.extend(scan_tree(client_root, privileged_client_patterns))
    if leaked:
        fail(
            "privileged Supabase material/reference entered a deployable client tree: "
            + ", ".join(leaked)
        )

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

    # Firebase Auth/App Distribution remain intact and RC3 Crashlytics stays closed/proven.
    require(android_gradle, "implementation(libs.firebase.auth)", "Firebase Auth Android binding")
    require(
        android_gradle,
        "implementation(libs.firebase.crashlytics)",
        "Crashlytics Android SDK binding",
    )
    require(
        android_catalog,
        'firebase-crashlytics = { module = "com.google.firebase:firebase-crashlytics" }',
        "Crashlytics version-catalog binding",
    )
    require(
        android_catalog,
        'googleServicesPlugin = "4.5.0"',
        "Google Services plugin reviewed version",
    )
    require(
        android_catalog,
        'crashlyticsPlugin = "3.0.7"',
        "Crashlytics Gradle plugin reviewed version",
    )
    require(
        android_root_gradle,
        "alias(libs.plugins.google.services) apply false",
        "conditional Google Services plugin classpath",
    )
    require(
        android_root_gradle,
        "alias(libs.plugins.crashlytics) apply false",
        "conditional Crashlytics plugin classpath",
    )
    require(
        android_gradle,
        'pluginManager.apply("com.google.gms.google-services")',
        "managed-canary Google Services plugin application",
    )
    require(
        android_gradle,
        'pluginManager.apply("com.google.firebase.crashlytics")',
        "managed-canary Crashlytics plugin application",
    )
    require(android_gradle, "DIREKT_CRASHLYTICS_BUILD_ENABLED", "Crashlytics build kill switch")
    require(
        android_gradle,
        "DIREKT_CRASHLYTICS_CANARY_ENABLED",
        "Crashlytics canary kill switch",
    )
    require(
        android_gradle,
        'crashlyticsDataMode == "synthetic-only"',
        "Crashlytics synthetic-only build gate",
    )
    require(
        android_gradle,
        'Regex("^[0-9a-f]{40}$")',
        "Crashlytics exact-source build gate",
    )
    require(
        android_manifest,
        'android:name="firebase_crashlytics_collection_enabled"',
        "Crashlytics manifest collection control",
    )
    require(
        android_manifest,
        'android:value="false"',
        "Crashlytics default collection disabled",
    )
    require(
        android_main_activity,
        "CrashlyticsCanary.handleLaunch(this, intent)",
        "guarded Crashlytics canary launch",
    )
    for needle in (
        'const val EXTRA_MODE = "direkt_rc3_crashlytics_canary"',
        'dataMode == "synthetic-only"',
        'sourceShaPattern = Regex("^[0-9a-f]{40}$")',
        'setCrashlyticsCollectionEnabled(true)',
        'setCrashlyticsCollectionEnabled(false)',
        'deleteUnsentReports()',
        'sendUnsentReports()',
        'DIREKT_RC3_SYNTHETIC_CRASH',
        'Thread.sleep(20_000L)',
        'setCustomKey("direkt_data_mode", "synthetic-only")',
        'setCustomKey("direkt_source_sha"',
    ):
        require(android_crashlytics, needle, "Crashlytics synthetic canary invariant")
    prohibit(android_crashlytics, r"setUserId\s*\(", "Crashlytics stable user identifier")
    prohibit(
        android_crashlytics,
        r"recordException\s*\(",
        "unbounded application exception telemetry outside canary proof",
    )

    for needle in (
        "RUN-DIREKT-CRASHLYTICS-CANARY",
        "com.kudzimusar.direkt.debug",
        'DIREKT_CRASHLYTICS_BUILD_ENABLED: "true"',
        'DIREKT_CRASHLYTICS_CANARY_ENABLED: "true"',
        "DIREKT_CRASHLYTICS_DATA_MODE: synthetic-only",
        "DIREKT_SOURCE_SHA: ${{ inputs.source_sha }}",
        "firebase.googleapis.com/v1beta1/projects/${GCP_PROJECT_ID}/androidApps",
        "app/google-services.json",
        "rm -f app/google-services.json",
        "Crashlytics report upload complete",
        "ANR in ${FIREBASE_PACKAGE_NAME}",
        "Real participant telemetry: `disabled`",
    ):
        require(crashlytics_canary, needle, "managed Crashlytics canary invariant")
    require(
        crashlytics_canary,
        "workloadIdentityPools/direkt-github/providers/direkt-main",
        "Crashlytics canary WIF auth",
    )
    require(firebase_distribution, "com.kudzimusar.direkt.debug", "Firebase debug app package")
    require(firebase_distribution, "direkt-internal-testers", "internal tester group")
    require(
        firebase_distribution,
        "workloadIdentityPools/direkt-github/providers/direkt-main",
        "WIF distribution auth",
    )
    require(backend_env, "FIREBASE_AUTH_MODE", "backend Firebase auth gate")
    require(backend_env, "PILOT_ENTRY_APPROVED", "pilot entry gate")
    require(
        android_manifest,
        'android:usesCleartextTraffic="false"',
        "Android HTTPS-only network policy",
    )
    require(
        status,
        "Firebase Crashlytics | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY**",
        "RC3 closed synthetic-only managed status",
    )

    # RC4 FCM: backend-owned, outbox-backed, identity-bound and participant-fail-closed.
    require(
        android_catalog,
        'firebase-messaging = { module = "com.google.firebase:firebase-messaging" }',
        "FCM version-catalog binding",
    )
    require(
        android_gradle,
        "implementation(libs.firebase.messaging)",
        "FCM Android SDK binding",
    )
    require(
        android_manifest,
        'android.permission.POST_NOTIFICATIONS',
        "Android notification permission declaration",
    )
    require(
        android_manifest,
        '.notifications.DirektFirebaseMessagingService',
        "FCM Android service declaration",
    )
    require(
        android_manifest,
        'android:name="com.google.firebase.MESSAGING_EVENT"',
        "FCM messaging service intent",
    )
    require(
        android_manifest,
        'android:name="firebase_messaging_installation_id_enabled"',
        "FCM FID registration callback enablement",
    )
    require(
        android_manifest,
        'android:name="firebase_messaging_auto_init_enabled"',
        "FCM auto-init manifest control",
    )
    require(
        android_manifest,
        'android:exported="false"',
        "non-exported Android messaging service",
    )
    require(
        android_main_activity,
        "FcmCanary.handleLaunch(this, intent)",
        "guarded FCM token canary launch",
    )
    require(
        android_main_activity,
        "NotificationPermissionController.requestIfRequired(this)",
        "notification permission hook",
    )
    for needle in (
        'const val EXTRA_MODE = "direkt_rc4_fcm_canary"',
        'BuildConfig.DIREKT_CRASHLYTICS_DATA_MODE == "synthetic-only"',
        'sourceShaPattern = Regex("^[0-9a-f]{40}$")',
        "FirebaseMessaging.getInstance().register()",
        'File(context.filesDir, TOKEN_FILE)',
    ):
        require(android_fcm_canary, needle, "FCM synthetic token canary invariant")
    prohibit(
        android_fcm_canary,
        r"FirebaseMessaging\.getInstance\(\)\.token",
        "deprecated FCM token retrieval in RC4 canary",
    )
    for needle in (
        "FirebaseMessagingService",
        'data["direkt_kind"] != "rc4_synthetic_canary"',
        'data["direkt_source_sha"]',
        'data["direkt_delivery_id"]',
        'data["direkt_phase"]',
        "markDeliveryOnce",
        "rc4-fcm-receipt-$phase.json",
        "POST_NOTIFICATIONS",
        "override fun onRegistered(installationId: String)",
        "FcmCanary.recordRegisteredInstallation(applicationContext, installationId)",
        "registerRegisteredInstallation(installationId)",
    ):
        require(android_fcm_service, needle, "FCM Android receipt invariant")
    prohibit(android_fcm_service, r"Log\.", "FCM payload/token logging")
    require(
        android_push_registration,
        "const val PARTICIPANT_REGISTRATION_ENABLED = false",
        "participant push registration kill switch",
    )
    require(
        android_push_registration,
        "/api/v1/notifications/push/devices",
        "authenticated push registration API boundary",
    )
    require(
        android_push_registration,
        'setRequestProperty("Authorization", "Bearer ${session.accessToken}")',
        "DIREKT session-bound push registration",
    )
    require(
        android_notification_permission,
        "PushRuntimePolicy.PARTICIPANT_REGISTRATION_ENABLED",
        "permission request participant gate",
    )

    require(
        communications_module,
        "new DisabledPushProviderAdapter()",
        "default-disabled push provider",
    )
    require(
        communications_module,
        "new FcmPushProviderAdapter",
        "FCM provider adapter binding",
    )
    require(
        communications_module,
        "FCM provider activation currently permits synthetic-only non-production use.",
        "FCM synthetic-only runtime gate",
    )
    require(
        fcm_adapter,
        "https://fcm.googleapis.com/v1/projects/",
        "FCM HTTP v1 endpoint",
    )
    require(fcm_adapter, "fid: request.token", "FCM FID target")
    require(
        fcm_adapter,
        "metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
        "managed identity credential path",
    )
    require(fcm_adapter, "Authorization: `Bearer ${accessToken}`", "FCM OAuth bearer auth")
    require(fcm_adapter, "UNREGISTERED", "FCM invalid-token recognition")
    for needle in (
        "communications.push.send.v1",
        "FOR UPDATE SKIP LOCKED",
        "provider_token_invalid",
        "provider_unavailable",
        "dataClassification: 'synthetic'",
        "deliveryId: claimed.id",
        "invalidateToken",
    ):
        require(push_outbox, needle, "FCM durable outbox invariant")
    require(
        push_token_service,
        "PUSH_REGISTRATION_MODE",
        "push registration runtime kill switch",
    )
    require(
        push_token_service,
        "dataMode !== 'controlled-pilot'",
        "controlled-pilot data-mode gate",
    )
    require(
        push_token_service,
        "tokenLogged: false",
        "push token audit minimization",
    )
    prohibit(
        push_token_service,
        r"JSON\.stringify\([^\n]*token",
        "raw push token audit serialization",
    )
    for needle in (
        "CREATE TABLE platform.push_device_tokens",
        "push_token_identity_boundary",
        "data_classification IN ('synthetic', 'controlled-pilot')",
        "UNIQUE (token_hash)",
        "protect_push_token_classification",
        "controlled-pilot push token cannot be reclassified as synthetic",
    ):
        require(fcm_migration, needle, "FCM server-only token persistence invariant")
    require(push_canary_entrypoint, "runSyntheticCanary", "FCM managed canary entrypoint")
    prohibit(push_canary_entrypoint, r"deviceToken\s*[,}]", "raw FCM token receipt output")
    for needle in (
        "RUN-DIREKT-FCM-CANARY",
        "com.kudzimusar.direkt.debug",
        "fcm.googleapis.com",
        "cloudmessaging.messages.create",
        "direktFcmSender",
        "DIREKT_CRASHLYTICS_BUILD_ENABLED: \"true\"",
        "DIREKT_CRASHLYTICS_CANARY_ENABLED: \"true\"",
        "DIREKT_CRASHLYTICS_DATA_MODE: synthetic-only",
        "direkt_rc4_fcm_canary",
        "rc4-fcm-token",
        "GCP_FCM_TOKEN_SECRET: direkt-fcm-canary-token",
        "gcloud secrets versions add",
        "gcloud secrets versions destroy",
        "PUSH_PROVIDER_MODE=fcm",
        "PUSH_REGISTRATION_MODE=disabled",
        "FCM_CANARY_PHASE=foreground",
        "FCM_CANARY_PHASE=background",
        "rc4-fcm-receipt-foreground.json",
        "rc4-fcm-receipt-background.json",
        "Participant push registration: disabled",
    ):
        require(fcm_canary, needle, "managed FCM canary invariant")
    prohibit(
        fcm_canary,
        r"roles/firebasecloudmessaging\.admin",
        "broad predefined FCM admin role",
    )
    prohibit(
        fcm_canary,
        r"direkt-fcm-canary-token-\$\{GITHUB_RUN_ID\}",
        "dynamic per-run FCM secret container",
    )
    require(
        status,
        "29916381754",
        "RC4 managed proof receipt",
    )
    prohibit(
        fcm_canary,
        r"echo\s+.*FCM_DEVICE_TOKEN",
        "raw FCM token logging",
    )
    require(
        status,
        "FCM | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY**",
        "RC4 closed synthetic-only managed status",
    )
    require(
        status,
        "Participant/production push remains disabled",
        "RC4 post-closure participant/production push stop gate",
    )

    prohibited_android_integrations = (
        "play-services-maps",
        "places",
        "sentry",
        "firebase-analytics",
    )
    catalog_lower = android_catalog.lower()
    gradle_lower = android_gradle.lower()
    for integration in prohibited_android_integrations:
        if integration in catalog_lower or integration in gradle_lower:
            fail(
                f"{integration} became Android-runtime active without integration-status promotion"
            )

    if any("firebase" in dependency.lower() for dependency in backend_pkg):
        fail("Firebase server SDK dependency entered backend; RC4 uses reviewed HTTP v1 + managed identity")

    # RC2 Sentry remains active only for the proven synthetic-only API/private portal boundary.
    backend_sentry_dependencies = {
        dependency for dependency in backend_pkg if "sentry" in dependency.lower()
    }
    portal_sentry_dependencies = {
        dependency for dependency in portal_pkg if "sentry" in dependency.lower()
    }
    if backend_sentry_dependencies != {"@sentry/nestjs"}:
        fail(f"unexpected backend Sentry dependency set: {sorted(backend_sentry_dependencies)}")
    if portal_sentry_dependencies != {"@sentry/nextjs"}:
        fail(f"unexpected portal Sentry dependency set: {sorted(portal_sentry_dependencies)}")

    for dependency in backend_pkg | portal_pkg:
        lowered = dependency.lower()
        if lowered == "resend" or lowered.startswith("@resend/"):
            fail(
                "Resend vendor SDK dependency entered runtime; RC1 requires the reviewed provider-neutral HTTP adapter"
            )
        if "googlemaps" in lowered or "google-maps" in lowered:
            fail("Google Maps server SDK became runtime-active without reviewed location promotion")
        if "twilio" in lowered:
            fail("superseded Twilio integration became runtime-active")

    require(backend_sentry, "sendDefaultPii: false", "API Sentry PII default-off control")
    require(backend_sentry, "tracesSampleRate: 0", "API Sentry tracing kill switch")
    require(backend_sentry, "enableLogs: false", "API Sentry logs disabled control")
    require(backend_sentry, "maxBreadcrumbs: 0", "API Sentry breadcrumb minimization")
    require(
        backend_sentry,
        "includeLocalVariables: false",
        "API local-variable capture disabled",
    )
    require(backend_sentry, "delete event.user", "API Sentry user scrubbing")
    require(backend_sentry, "delete event.extra", "API Sentry extra-data scrubbing")
    require(
        backend_sentry_runtime,
        "DIREKT_DATA_MODE !== 'synthetic-only'",
        "API synthetic-only Sentry gate",
    )
    require(backend_sentry_runtime, "SENTRY_RELEASE", "API exact release binding")
    require(
        backend_sentry_privacy,
        "[redacted-coordinates]",
        "API private-coordinate redaction",
    )
    require(backend_sentry_privacy, "[redacted-token]", "API credential redaction")
    require(backend_sentry_canary, "DIREKT_SENTRY_API_OK", "API managed canary receipt")
    require(backend_sentry_canary, "Sentry.flush(10_000)", "API managed canary flush")

    require(
        portal_instrumentation,
        "captureRequestError",
        "portal server request-error instrumentation",
    )
    require(portal_sentry, "sendDefaultPii: false", "portal Sentry PII default-off control")
    require(portal_sentry, "tracesSampleRate: 0", "portal Sentry tracing kill switch")
    require(portal_sentry, "enableLogs: false", "portal Sentry logs disabled control")
    require(portal_sentry, "maxBreadcrumbs: 0", "portal Sentry breadcrumb minimization")
    require(
        portal_sentry,
        "includeLocalVariables: false",
        "portal local-variable capture disabled",
    )
    require(portal_sentry, "delete event.user", "portal Sentry user scrubbing")
    require(portal_sentry, "delete event.extra", "portal Sentry extra-data scrubbing")
    require(
        portal_sentry_runtime,
        "DIREKT_DATA_MODE !== 'synthetic-only'",
        "portal synthetic-only Sentry gate",
    )
    require(portal_sentry_runtime, "SENTRY_RELEASE", "portal exact release binding")
    require(
        portal_sentry_privacy,
        "[redacted-coordinates]",
        "portal private-coordinate redaction",
    )
    require(portal_sentry_privacy, "[redacted-token]", "portal credential redaction")
    require(portal_sentry_canary, "SENTRY_CANARY_ENABLED", "portal canary kill switch")
    require(portal_sentry_canary, "DIREKT_SENTRY_PORTAL_OK", "portal managed canary receipt")
    require(portal_sentry_canary, "Sentry.flush(10_000)", "portal managed canary flush")

    for needle in (
        "RUN-DIREKT-SENTRY-CANARY",
        "direkt-sentry-api-canary",
        "direkt-sentry-portal-canary",
        "direkt-api-runtime@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-portal-runtime@direkt-dev-502701.iam.gserviceaccount.com",
        "direkt-sentry-api-dsn",
        "direkt-sentry-portal-dsn",
        "DIREKT_DATA_MODE=synthetic-only",
        "SENTRY_MODE=enabled",
        "SENTRY_RELEASE=${SOURCE_SHA}",
        "--max-retries 0",
        "--no-allow-unauthenticated",
        "direkt-sentry-auth-token",
        "Sentry auth token must never bind",
    ):
        require(sentry_canary, needle, "managed Sentry canary invariant")
    prohibit(
        sentry_canary,
        r"SENTRY_AUTH_TOKEN\s*=",
        "Sentry auth token runtime environment binding",
    )
    require(
        status,
        "Sentry API/portal | **ACTIVE — SYNTHETIC-ONLY MANAGED CANARY**",
        "RC2 managed-canary status",
    )
    require(
        status,
        "Participant/production Sentry telemetry remains disabled.",
        "RC2 participant/production telemetry stop gate",
    )
    require(
        reconciliation,
        "externally provisioned/runtime-unproven",
        "historical Maps/Sentry reconciliation truth",
    )

    # RC1 Resend remains provider-neutral and synthetic-only.
    require(backend_env, "EMAIL_PROVIDER_MODE", "email provider kill switch")
    require(
        backend_env,
        "EMAIL_RESEND_API_KEY",
        "server-only Resend credential contract",
    )
    require(
        backend_env,
        "Email provider activation currently permits synthetic-only data mode",
        "email data-mode gate",
    )
    require(backend_env, "notify\\.direkt\\.forum", "verified Resend sender-domain gate")
    require(
        communications_module,
        "ResendEmailProviderAdapter",
        "Resend provider adapter binding",
    )
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
        fail(
            f"operations portal acquired a privileged direct data dependency: {sorted(direct_portal)}"
        )
    require(cloud_run, "DIREKT_API_BASE_URL=${API_URL}", "portal-to-API runtime binding")
    require(cloud_run, "roles/run.invoker", "portal-to-API IAM invocation boundary")

    # OpenAPI is canonical; generated client implementation is not falsely claimed.
    require(openapi_generate, "configureApplication(app)", "canonical OpenAPI generation")
    require(openapi_check, "Missing required", "OpenAPI contract drift gate")
    require(status, "OpenAPI", "OpenAPI integration status")

    # Communications: transactional outbox exists; provider runtime claims remain explicit.
    require(platform_migration, "CREATE TABLE platform.outbox_events", "transactional outbox")
    require(status, "Transactional outbox", "outbox status")
    require(status, "WhatsApp", "WhatsApp status")
    require(status, "FCM", "FCM status")

    # Payments/registries: domain/sandbox foundation only, no real provider path.
    require(
        backend_env,
        "Production payment provider mode must remain disabled",
        "payment production gate",
    )
    require(
        openapi_check,
        "Unapproved payment-provider paths were exposed",
        "real payment route guard",
    )
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
    print(
        "firebase_crashlytics=active_synthetic_only_managed_canary_collection_default_off_participant_disabled"
    )
    print("fcm=active_synthetic_only_managed_canary_participant_disabled")
    print("maps=external_runtime_unproven_manual_fallback_active")
    print(
        "sentry=active_synthetic_only_managed_canary_cloud_logging_authoritative_participant_disabled"
    )
    print("resend=active_synthetic_only_managed_canary_real_participant_disabled")
    print("whatsapp=planned_domain_handoff_only")
    print("payments=domain_foundation_real_provider_disabled")
    print("registries=manual_evidence_only")
    print("pwa=synthetic_static_no_private_api")


if __name__ == "__main__":
    main()

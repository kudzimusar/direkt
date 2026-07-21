package com.kudzimusar.direkt.observability

import android.app.Activity
import android.content.Intent
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.kudzimusar.direkt.BuildConfig

internal object CrashlyticsCanaryPolicy {
    private val sourceShaPattern = Regex("^[0-9a-f]{40}$")
    private val allowedModes = setOf("crash", "anr", "flush", "disable")

    fun canRun(
        debugBuild: Boolean,
        canaryEnabled: Boolean,
        dataMode: String,
        sourceSha: String,
    ): Boolean =
        debugBuild &&
            canaryEnabled &&
            dataMode == "synthetic-only" &&
            sourceShaPattern.matches(sourceSha)

    fun normalizeMode(raw: String?): String? =
        raw?.trim()?.lowercase()?.takeIf(allowedModes::contains)
}

internal object CrashlyticsCanary {
    const val EXTRA_MODE = "direkt_rc3_crashlytics_canary"

    fun handleLaunch(activity: Activity, intent: Intent) {
        val policyAllowsCanary =
            CrashlyticsCanaryPolicy.canRun(
                debugBuild = BuildConfig.DEBUG,
                canaryEnabled = BuildConfig.DIREKT_CRASHLYTICS_CANARY_ENABLED,
                dataMode = BuildConfig.DIREKT_CRASHLYTICS_DATA_MODE,
                sourceSha = BuildConfig.DIREKT_CRASHLYTICS_SOURCE_SHA,
            )
        if (!policyAllowsCanary) return

        val mode = CrashlyticsCanaryPolicy.normalizeMode(intent.getStringExtra(EXTRA_MODE)) ?: return
        val crashlytics = configuredCrashlytics(activity)

        when (mode) {
            "disable" -> {
                crashlytics.setCrashlyticsCollectionEnabled(false)
                crashlytics.deleteUnsentReports()
            }
            "flush" -> {
                enableSyntheticCollection(crashlytics, "flush")
                crashlytics.sendUnsentReports()
            }
            "crash" -> {
                enableSyntheticCollection(crashlytics, "crash")
                throw RuntimeException("DIREKT_RC3_SYNTHETIC_CRASH")
            }
            "anr" -> {
                enableSyntheticCollection(crashlytics, "anr")
                // Debug/canary builds only. The managed RC3 workflow launches this explicit mode,
                // confirms the OS ANR signal, then restarts the app to upload the stored report.
                Thread.sleep(20_000L)
            }
        }
    }

    private fun configuredCrashlytics(activity: Activity): FirebaseCrashlytics {
        val existing = FirebaseApp.getApps(activity).firstOrNull { it.name == FirebaseApp.DEFAULT_APP_NAME }
        if (existing == null) {
            FirebaseApp.initializeApp(
                activity,
                FirebaseOptions.Builder()
                    .setApiKey(BuildConfig.DIREKT_FIREBASE_API_KEY)
                    .setApplicationId(BuildConfig.DIREKT_FIREBASE_APP_ID)
                    .setProjectId(BuildConfig.DIREKT_FIREBASE_PROJECT_ID)
                    .build(),
            ) ?: error("Firebase default app could not be initialized for the RC3 synthetic canary")
        }
        return FirebaseCrashlytics.getInstance()
    }

    private fun enableSyntheticCollection(
        crashlytics: FirebaseCrashlytics,
        canaryKind: String,
    ) {
        crashlytics.setCrashlyticsCollectionEnabled(true)
        crashlytics.setCustomKey("direkt_data_mode", "synthetic-only")
        crashlytics.setCustomKey("direkt_source_sha", BuildConfig.DIREKT_CRASHLYTICS_SOURCE_SHA)
        crashlytics.setCustomKey("direkt_release_channel", BuildConfig.DIREKT_RELEASE_CHANNEL)
        crashlytics.setCustomKey("direkt_canary_kind", canaryKind)
    }
}

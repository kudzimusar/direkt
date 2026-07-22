package com.kudzimusar.direkt.observability

import android.app.Activity
import android.app.ActivityManager
import android.app.ApplicationExitInfo
import android.content.Intent
import android.os.Build
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.crashlytics.FirebaseCrashlytics
import com.kudzimusar.direkt.BuildConfig

internal object CrashlyticsCanaryPolicy {
    private val sourceShaPattern = Regex("^[0-9a-f]{40}$")
    private val allowedModes = setOf("crash", "anr", "anr-flush", "flush", "disable")

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
    private const val LOG_TAG = "DirektCrashlyticsCanary"
    private const val ANR_BLOCK_MARKER = "DIREKT_RC3_ANR_BLOCK_BEGIN"
    private const val ANR_EXIT_REASON_MARKER = "DIREKT_RC3_ANR_EXIT_REASON"
    private const val FOCUS_POLL_DELAY_MS = 250L
    private const val POST_FOCUS_SETTLE_DELAY_MS = 500L

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

        // Android 11+ Crashlytics ANRs are reconstructed from historical process-exit reasons on
        // the next app start. Do not initialize/flush Crashlytics for the managed ANR proof unless
        // Android itself recorded the immediately preceding process death as REASON_ANR.
        if (mode == "anr-flush") {
            val exitReason = latestHistoricalExitReason(activity)
            Log.i(LOG_TAG, "$ANR_EXIT_REASON_MARKER=${exitReason ?: -1}")
            if (exitReason != ApplicationExitInfo.REASON_ANR) return

            val crashlytics = configuredCrashlytics(activity)
            enableSyntheticCollection(crashlytics, "anr-flush")
            crashlytics.sendUnsentReports()
            return
        }

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
                // Let onCreate complete and give Crashlytics time to finish installing its
                // uncaught-exception handler before producing the synthetic fatal exception.
                // The managed RC3 workflow verifies both the exact fatal marker and process death.
                activity.window.decorView.postDelayed(
                    {
                        throw RuntimeException("DIREKT_RC3_SYNTHETIC_CRASH")
                    },
                    1_500L,
                )
            }
            "anr" -> {
                enableSyntheticCollection(crashlytics, "anr")
                scheduleFocusedInputDispatchAnr(activity)
            }
        }
    }

    private fun scheduleFocusedInputDispatchAnr(activity: Activity) {
        val decorView = activity.window.decorView
        lateinit var waitForFocus: Runnable
        waitForFocus =
            Runnable {
                if (activity.isFinishing || activity.isDestroyed) return@Runnable
                if (!activity.hasWindowFocus()) {
                    decorView.postDelayed(waitForFocus, FOCUS_POLL_DELAY_MS)
                    return@Runnable
                }

                // The managed proof injects input only after the Activity has a real focused window.
                // Keep the main looper blocked for up to 120 seconds so Android's ANR dialog can
                // terminate the unresponsive process; a self-recovering 20-second hang cannot pass.
                decorView.postDelayed(
                    {
                        if (!activity.hasWindowFocus()) {
                            decorView.post(waitForFocus)
                            return@postDelayed
                        }
                        Log.i(LOG_TAG, ANR_BLOCK_MARKER)
                        repeat(6) {
                            Thread.sleep(20_000L)
                        }
                    },
                    POST_FOCUS_SETTLE_DELAY_MS,
                )
            }
        decorView.post(waitForFocus)
    }

    private fun latestHistoricalExitReason(activity: Activity): Int? {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null
        val activityManager = activity.getSystemService(ActivityManager::class.java)
        return activityManager
            .getHistoricalProcessExitReasons(activity.packageName, 0, 10)
            .firstOrNull()
            ?.reason
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

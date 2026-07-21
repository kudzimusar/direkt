package com.kudzimusar.direkt.observability

import android.app.Activity
import android.os.Bundle
import android.util.Log
import com.google.firebase.crashlytics.FirebaseCrashlytics

class CrashlyticsCanaryActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val configuration = CrashlyticsConfiguration.fromBuildConfig()
        if (!configuration.syntheticCanaryEnabled) {
            finish()
            return
        }
        configuration.requireValidSyntheticCanary()

        val kind = intent.getStringExtra(EXTRA_KIND)
        val crashlytics = FirebaseCrashlytics.getInstance()
        when (kind) {
            KIND_NON_FATAL -> {
                crashlytics.setCustomKey("direkt_canary_kind", KIND_NON_FATAL)
                crashlytics.recordException(
                    IllegalStateException("$NON_FATAL_MARKER${configuration.release}"),
                )
                crashlytics.sendUnsentReports()
                Log.i(LOG_TAG, "nonfatal-recorded:${configuration.release}")
                finish()
            }

            KIND_FATAL -> {
                crashlytics.setCustomKey("direkt_canary_kind", KIND_FATAL)
                Log.i(LOG_TAG, "fatal-triggered:${configuration.release}")
                throw RuntimeException("$FATAL_MARKER${configuration.release}")
            }

            else -> finish()
        }
    }

    companion object {
        const val EXTRA_KIND = "direkt_crashlytics_canary_kind"
        const val KIND_NON_FATAL = "nonfatal"
        const val KIND_FATAL = "fatal"
        const val NON_FATAL_MARKER = "DIREKT_CRASHLYTICS_NONFATAL_CANARY_"
        const val FATAL_MARKER = "DIREKT_CRASHLYTICS_FATAL_CANARY_"
        private const val LOG_TAG = "DIREKT_CRASHLYTICS_CANARY"
    }
}

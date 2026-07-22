package com.kudzimusar.direkt.notifications

import android.content.Context
import com.google.firebase.messaging.FirebaseMessaging
import com.kudzimusar.direkt.BuildConfig
import com.kudzimusar.direkt.auth.PilotSession
import com.kudzimusar.direkt.auth.PilotSessionStore
import org.json.JSONObject
import java.net.URL
import java.util.UUID
import java.util.concurrent.Executors
import javax.net.ssl.HttpsURLConnection

internal object PushRuntimePolicy {
    // RC4 proves synthetic delivery only. A later controlled-pilot privacy/release decision must
    // explicitly change this source-controlled kill switch before participant registrations are uploaded.
    const val PARTICIPANT_REGISTRATION_ENABLED = false
}

internal class PushRegistrationCoordinator(
    private val context: Context,
) {
    private val executor = Executors.newSingleThreadExecutor()
    private val sessionStore = PilotSessionStore(context)

    fun registerCurrentToken(session: PilotSession) {
        if (!PushRuntimePolicy.PARTICIPANT_REGISTRATION_ENABLED || session.accessToken.isBlank()) return
        FirebaseMessaging.getInstance().register()
    }

    fun registerRegisteredInstallation(installationId: String) {
        if (!PushRuntimePolicy.PARTICIPANT_REGISTRATION_ENABLED || installationId.length !in 20..4096) return
        val session = sessionStore.load() ?: return
        registerTarget(session, installationId)
    }

    fun unregisterCurrentDevice(session: PilotSession) {
        if (!PushRuntimePolicy.PARTICIPANT_REGISTRATION_ENABLED) return
        executor.execute {
            runCatching {
                val endpoint = URL(
                    "${BuildConfig.DIREKT_PILOT_API_BASE_URL.trimEnd('/')}/api/v1/notifications/push/devices/${installationId()}",
                )
                val connection = endpoint.openConnection() as HttpsURLConnection
                try {
                    connection.requestMethod = "DELETE"
                    connection.connectTimeout = 10_000
                    connection.readTimeout = 10_000
                    connection.setRequestProperty("Authorization", "Bearer ${session.accessToken}")
                    connection.setRequestProperty("Accept", "application/json")
                    if (connection.responseCode !in 200..299) {
                        throw IllegalStateException("Push device deletion was rejected.")
                    }
                } finally {
                    connection.disconnect()
                }
                FirebaseMessaging.getInstance().unregister()
            }
        }
    }

    private fun registerTarget(
        session: PilotSession,
        registrationId: String,
    ) {
        executor.execute {
            runCatching {
                val baseUrl = BuildConfig.DIREKT_PILOT_API_BASE_URL.trimEnd('/')
                require(baseUrl.startsWith("https://"))
                val connection =
                    URL("$baseUrl/api/v1/notifications/push/devices").openConnection() as HttpsURLConnection
                try {
                    connection.requestMethod = "POST"
                    connection.connectTimeout = 10_000
                    connection.readTimeout = 10_000
                    connection.doOutput = true
                    connection.setRequestProperty("Authorization", "Bearer ${session.accessToken}")
                    connection.setRequestProperty("Content-Type", "application/json")
                    connection.setRequestProperty("Accept", "application/json")
                    val body =
                        JSONObject()
                            .put("installationId", installationId())
                            .put("token", registrationId)
                            .put("platform", "android")
                            .put("appVersion", BuildConfig.VERSION_NAME)
                            .toString()
                    connection.outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
                    if (connection.responseCode !in 200..299) {
                        throw IllegalStateException("Push device registration was rejected.")
                    }
                } finally {
                    connection.disconnect()
                }
            }
        }
    }

    private fun installationId(): String {
        val preferences = context.getSharedPreferences(INSTALLATION_PREFERENCES, Context.MODE_PRIVATE)
        preferences.getString(KEY_INSTALLATION_ID, null)?.let { existing ->
            if (runCatching { UUID.fromString(existing) }.isSuccess) return existing
        }
        return UUID.randomUUID().toString().also { generated ->
            preferences.edit().putString(KEY_INSTALLATION_ID, generated).apply()
        }
    }

    private companion object {
        const val INSTALLATION_PREFERENCES = "direkt_push_installation"
        const val KEY_INSTALLATION_ID = "installation_id"
    }
}

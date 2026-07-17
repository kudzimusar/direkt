package com.kudzimusar.direkt.ui.interaction

import android.content.Context
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.UUID

enum class InteractionDraftState(val label: String) {
    Empty("No draft"),
    OfflineDraft("Saved offline"),
    Sending("Sending"),
    Retryable("Ready to retry"),
    StaleRevision("Refresh required"),
    ConsentExpired("Consent expired"),
    Submitted("Submitted"),
}

data class InteractionDraftSnapshot(
    val logicalRequestId: String?,
    val serviceSummary: String,
    val localitySummary: String,
    val preferredChannel: String,
    val state: InteractionDraftState,
    val attemptCount: Int,
    val expectedRevision: Int?,
    val lastErrorCode: String?,
    val updatedAtEpochMillis: Long,
) {
    val canRetry: Boolean
        get() = state in setOf(
            InteractionDraftState.OfflineDraft,
            InteractionDraftState.Retryable,
            InteractionDraftState.StaleRevision,
            InteractionDraftState.ConsentExpired,
        )

    val isTerminal: Boolean
        get() = state == InteractionDraftState.Submitted
}

interface InteractionDraftPersistence {
    fun load(): String?

    fun save(value: String)

    fun clear()
}

class SharedPreferencesInteractionDraftPersistence(context: Context) : InteractionDraftPersistence {
    private val preferences = context.applicationContext.getSharedPreferences(
        "direkt_phase8_interaction_drafts",
        Context.MODE_PRIVATE,
    )

    override fun load(): String? = preferences.getString(KEY_DRAFT, null)

    override fun save(value: String) {
        preferences.edit().putString(KEY_DRAFT, value).apply()
    }

    override fun clear() {
        preferences.edit().remove(KEY_DRAFT).apply()
    }

    private companion object {
        const val KEY_DRAFT = "active_interaction_draft"
    }
}

object InteractionDraftSnapshotCodec {
    private const val SEPARATOR = "|"

    fun encode(snapshot: InteractionDraftSnapshot): String = listOf(
        snapshot.logicalRequestId.orEmpty(),
        snapshot.serviceSummary,
        snapshot.localitySummary,
        snapshot.preferredChannel,
        snapshot.state.name,
        snapshot.attemptCount.toString(),
        snapshot.expectedRevision?.toString().orEmpty(),
        snapshot.lastErrorCode.orEmpty(),
        snapshot.updatedAtEpochMillis.toString(),
    ).joinToString(SEPARATOR) { value ->
        URLEncoder.encode(value, StandardCharsets.UTF_8.name())
    }

    fun decode(value: String): InteractionDraftSnapshot? {
        val parts = value.split(SEPARATOR).map { encoded ->
            runCatching {
                URLDecoder.decode(encoded, StandardCharsets.UTF_8.name())
            }.getOrNull() ?: return null
        }
        if (parts.size != 9) return null

        val state = runCatching { InteractionDraftState.valueOf(parts[4]) }.getOrNull() ?: return null
        val attempts = parts[5].toIntOrNull() ?: return null
        val revision = parts[6].ifBlank { null }?.toIntOrNull()
        val updatedAt = parts[8].toLongOrNull() ?: return null
        if (attempts < 0 || revision != null && revision < 1) return null

        return InteractionDraftSnapshot(
            logicalRequestId = parts[0].ifBlank { null },
            serviceSummary = parts[1],
            localitySummary = parts[2],
            preferredChannel = parts[3],
            state = state,
            attemptCount = attempts,
            expectedRevision = revision,
            lastErrorCode = parts[7].ifBlank { null },
            updatedAtEpochMillis = updatedAt,
        )
    }
}

class InteractionDraftStore(
    private val persistence: InteractionDraftPersistence,
    private val now: () -> Long = System::currentTimeMillis,
    private val idFactory: () -> String = { UUID.randomUUID().toString() },
) {
    private var snapshot = persistence.load()
        ?.let(InteractionDraftSnapshotCodec::decode)
        ?: emptySnapshot()

    fun current(): InteractionDraftSnapshot = snapshot

    fun saveOffline(
        serviceSummary: String,
        localitySummary: String,
        preferredChannel: String,
    ): InteractionDraftSnapshot {
        require(serviceSummary.trim().length in 20..1000) {
            "A bounded service summary between 20 and 1000 characters is required."
        }
        require(localitySummary.trim().length in 3..160) {
            "A locality summary between 3 and 160 characters is required."
        }
        require(preferredChannel in setOf("call", "whatsapp", "none")) {
            "Preferred channel is not supported."
        }
        require(!snapshot.isTerminal) { "A submitted request must be reset before drafting again." }

        snapshot = InteractionDraftSnapshot(
            logicalRequestId = snapshot.logicalRequestId ?: idFactory(),
            serviceSummary = serviceSummary.trim(),
            localitySummary = localitySummary.trim(),
            preferredChannel = preferredChannel,
            state = InteractionDraftState.OfflineDraft,
            attemptCount = snapshot.attemptCount,
            expectedRevision = snapshot.expectedRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun startSend(): InteractionDraftSnapshot {
        require(snapshot.state in setOf(InteractionDraftState.OfflineDraft, InteractionDraftState.Retryable)) {
            "Only a saved or retryable draft can be sent."
        }
        snapshot = snapshot.copy(
            state = InteractionDraftState.Sending,
            attemptCount = snapshot.attemptCount + 1,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markRetryable(errorCode: String): InteractionDraftSnapshot {
        require(snapshot.state == InteractionDraftState.Sending) {
            "Only an in-flight request can become retryable."
        }
        require(errorCode.matches(Regex("^[A-Z][A-Z0-9_]{2,63}$"))) {
            "A safe error code is required."
        }
        snapshot = snapshot.copy(
            state = InteractionDraftState.Retryable,
            lastErrorCode = errorCode,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markStaleRevision(expectedRevision: Int): InteractionDraftSnapshot {
        require(expectedRevision >= 1) { "Expected revision must be positive." }
        snapshot = snapshot.copy(
            state = InteractionDraftState.StaleRevision,
            expectedRevision = expectedRevision,
            lastErrorCode = "STALE_REVISION",
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun refreshRevision(currentRevision: Int): InteractionDraftSnapshot {
        require(snapshot.state == InteractionDraftState.StaleRevision) {
            "Only a stale action can be refreshed."
        }
        require(currentRevision >= 1) { "Current revision must be positive." }
        snapshot = snapshot.copy(
            state = InteractionDraftState.Retryable,
            expectedRevision = currentRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markConsentExpired(): InteractionDraftSnapshot {
        snapshot = snapshot.copy(
            state = InteractionDraftState.ConsentExpired,
            lastErrorCode = "CONSENT_EXPIRED",
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun renewConsent(): InteractionDraftSnapshot {
        require(snapshot.state == InteractionDraftState.ConsentExpired) {
            "Only expired consent can be renewed."
        }
        snapshot = snapshot.copy(
            state = InteractionDraftState.Retryable,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markSubmitted(serverRevision: Int): InteractionDraftSnapshot {
        require(snapshot.state == InteractionDraftState.Sending) {
            "Only an in-flight request can be submitted."
        }
        require(serverRevision >= 1) { "Server revision must be positive." }
        snapshot = snapshot.copy(
            state = InteractionDraftState.Submitted,
            expectedRevision = serverRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun reset(): InteractionDraftSnapshot {
        persistence.clear()
        snapshot = emptySnapshot()
        return snapshot
    }

    private fun persist() {
        persistence.save(InteractionDraftSnapshotCodec.encode(snapshot))
    }

    private fun emptySnapshot(): InteractionDraftSnapshot = InteractionDraftSnapshot(
        logicalRequestId = null,
        serviceSummary = "",
        localitySummary = "",
        preferredChannel = "none",
        state = InteractionDraftState.Empty,
        attemptCount = 0,
        expectedRevision = null,
        lastErrorCode = null,
        updatedAtEpochMillis = now(),
    )
}

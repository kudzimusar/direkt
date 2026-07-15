package com.kudzimusar.direkt.ui.provider

import android.content.Context
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.UUID

enum class ProviderUploadState(val label: String) {
    NotStarted("Not started"),
    Uploading("Uploading"),
    Interrupted("Interrupted"),
    Retryable("Ready to retry"),
    Submitted("Submitted"),
    TerminalFailure("Cannot retry"),
    Cancelled("Cancelled"),
}

data class ProviderUploadSnapshot(
    val logicalIntentId: String?,
    val documentLabel: String,
    val state: ProviderUploadState,
    val attemptCount: Int,
    val activeSessionId: String?,
    val lastErrorCode: String?,
    val updatedAtEpochMillis: Long,
) {
    val canRetry: Boolean
        get() = state == ProviderUploadState.Interrupted || state == ProviderUploadState.Retryable

    val isTerminal: Boolean
        get() = state in setOf(
            ProviderUploadState.Submitted,
            ProviderUploadState.TerminalFailure,
            ProviderUploadState.Cancelled,
        )
}

interface ProviderUploadPersistence {
    fun load(): String?

    fun save(value: String)

    fun clear()
}

class SharedPreferencesProviderUploadPersistence(context: Context) : ProviderUploadPersistence {
    private val preferences = context.applicationContext.getSharedPreferences(
        "direkt_phase6_provider_uploads",
        Context.MODE_PRIVATE,
    )

    override fun load(): String? = preferences.getString(KEY_UPLOAD_SNAPSHOT, null)

    override fun save(value: String) {
        preferences.edit().putString(KEY_UPLOAD_SNAPSHOT, value).apply()
    }

    override fun clear() {
        preferences.edit().remove(KEY_UPLOAD_SNAPSHOT).apply()
    }

    private companion object {
        const val KEY_UPLOAD_SNAPSHOT = "active_upload_snapshot"
    }
}

object ProviderUploadSnapshotCodec {
    private const val SEPARATOR = "|"

    fun encode(snapshot: ProviderUploadSnapshot): String = listOf(
        snapshot.logicalIntentId.orEmpty(),
        snapshot.documentLabel,
        snapshot.state.name,
        snapshot.attemptCount.toString(),
        snapshot.activeSessionId.orEmpty(),
        snapshot.lastErrorCode.orEmpty(),
        snapshot.updatedAtEpochMillis.toString(),
    ).joinToString(SEPARATOR) { value ->
        URLEncoder.encode(value, StandardCharsets.UTF_8.name())
    }

    fun decode(value: String): ProviderUploadSnapshot? {
        val parts = value.split(SEPARATOR).map { encoded ->
            runCatching {
                URLDecoder.decode(encoded, StandardCharsets.UTF_8.name())
            }.getOrNull() ?: return null
        }
        if (parts.size != 7) return null

        val state = runCatching { ProviderUploadState.valueOf(parts[2]) }.getOrNull() ?: return null
        val attemptCount = parts[3].toIntOrNull() ?: return null
        val updatedAt = parts[6].toLongOrNull() ?: return null
        if (attemptCount < 0) return null

        return ProviderUploadSnapshot(
            logicalIntentId = parts[0].ifBlank { null },
            documentLabel = parts[1],
            state = state,
            attemptCount = attemptCount,
            activeSessionId = parts[4].ifBlank { null },
            lastErrorCode = parts[5].ifBlank { null },
            updatedAtEpochMillis = updatedAt,
        )
    }
}

class ProviderUploadRecoveryStore(
    private val persistence: ProviderUploadPersistence,
    private val now: () -> Long = System::currentTimeMillis,
    private val idFactory: () -> String = { UUID.randomUUID().toString() },
) {
    private var snapshot: ProviderUploadSnapshot = persistence.load()
        ?.let(ProviderUploadSnapshotCodec::decode)
        ?: emptySnapshot()

    fun current(): ProviderUploadSnapshot = snapshot

    fun start(documentLabel: String): ProviderUploadSnapshot {
        require(documentLabel.isNotBlank()) { "Document label is required." }
        if (snapshot.logicalIntentId != null && !snapshot.isTerminal) {
            return snapshot
        }
        snapshot = ProviderUploadSnapshot(
            logicalIntentId = idFactory(),
            documentLabel = documentLabel.trim(),
            state = ProviderUploadState.Uploading,
            attemptCount = 1,
            activeSessionId = idFactory(),
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun interrupt(errorCode: String): ProviderUploadSnapshot {
        require(snapshot.state == ProviderUploadState.Uploading) {
            "Only an active upload can be interrupted."
        }
        require(errorCode.matches(Regex("^[A-Z][A-Z0-9_]{2,63}$"))) {
            "A safe error code is required."
        }
        snapshot = snapshot.copy(
            state = ProviderUploadState.Interrupted,
            activeSessionId = null,
            lastErrorCode = errorCode,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun retry(): ProviderUploadSnapshot {
        require(snapshot.canRetry) { "Only an interrupted upload can be retried." }
        snapshot = snapshot.copy(
            state = ProviderUploadState.Uploading,
            attemptCount = snapshot.attemptCount + 1,
            activeSessionId = idFactory(),
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun submit(): ProviderUploadSnapshot {
        require(snapshot.state == ProviderUploadState.Uploading) {
            "Only an active upload can be submitted."
        }
        snapshot = snapshot.copy(
            state = ProviderUploadState.Submitted,
            activeSessionId = null,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun cancel(): ProviderUploadSnapshot {
        require(snapshot.state != ProviderUploadState.Submitted) {
            "Submitted evidence cannot be cancelled from upload recovery."
        }
        snapshot = snapshot.copy(
            state = ProviderUploadState.Cancelled,
            activeSessionId = null,
            lastErrorCode = "PROVIDER_CANCELLED",
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun reset(): ProviderUploadSnapshot {
        persistence.clear()
        snapshot = emptySnapshot()
        return snapshot
    }

    private fun persist() {
        persistence.save(ProviderUploadSnapshotCodec.encode(snapshot))
    }

    private fun emptySnapshot(): ProviderUploadSnapshot = ProviderUploadSnapshot(
        logicalIntentId = null,
        documentLabel = "Identity evidence",
        state = ProviderUploadState.NotStarted,
        attemptCount = 0,
        activeSessionId = null,
        lastErrorCode = null,
        updatedAtEpochMillis = now(),
    )
}

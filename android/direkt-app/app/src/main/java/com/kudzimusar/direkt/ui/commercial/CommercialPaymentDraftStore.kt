package com.kudzimusar.direkt.ui.commercial

import android.content.Context
import java.net.URLDecoder
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.UUID

enum class CommercialPaymentDraftState(val label: String) {
    Empty("No payment draft"),
    PreparedOffline("Prepared offline"),
    Initiating("Initiating"),
    Retryable("Ready to retry"),
    StaleRevision("Refresh required"),
    RequiresAction("Synthetic action required"),
    Processing("Processing"),
    Failed("Failed"),
    Succeeded("Paid"),
    Reversed("Reversed"),
    Cancelled("Cancelled"),
    Expired("Expired"),
}

data class CommercialPaymentDraftSnapshot(
    val logicalRequestId: String?,
    val invoiceId: String?,
    val currency: String,
    val amountMinor: Long,
    val state: CommercialPaymentDraftState,
    val attemptCount: Int,
    val expectedRevision: Int?,
    val lastErrorCode: String?,
    val updatedAtEpochMillis: Long,
) {
    val canRetry: Boolean
        get() = state in setOf(
            CommercialPaymentDraftState.PreparedOffline,
            CommercialPaymentDraftState.Retryable,
            CommercialPaymentDraftState.StaleRevision,
            CommercialPaymentDraftState.Failed,
        )

    val isTerminal: Boolean
        get() = state in setOf(
            CommercialPaymentDraftState.Succeeded,
            CommercialPaymentDraftState.Reversed,
            CommercialPaymentDraftState.Cancelled,
            CommercialPaymentDraftState.Expired,
        )
}

interface CommercialPaymentDraftPersistence {
    fun load(): String?
    fun save(value: String)
    fun clear()
}

class SharedPreferencesCommercialPaymentDraftPersistence(
    context: Context,
) : CommercialPaymentDraftPersistence {
    private val preferences = context.applicationContext.getSharedPreferences(
        "direkt_phase9_commercial_payment_drafts",
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
        const val KEY_DRAFT = "active_commercial_payment_draft"
    }
}

object CommercialPaymentDraftSnapshotCodec {
    private const val SEPARATOR = "|"

    fun encode(snapshot: CommercialPaymentDraftSnapshot): String = listOf(
        snapshot.logicalRequestId.orEmpty(),
        snapshot.invoiceId.orEmpty(),
        snapshot.currency,
        snapshot.amountMinor.toString(),
        snapshot.state.name,
        snapshot.attemptCount.toString(),
        snapshot.expectedRevision?.toString().orEmpty(),
        snapshot.lastErrorCode.orEmpty(),
        snapshot.updatedAtEpochMillis.toString(),
    ).joinToString(SEPARATOR) { value ->
        URLEncoder.encode(value, StandardCharsets.UTF_8.name())
    }

    fun decode(value: String): CommercialPaymentDraftSnapshot? {
        val parts = value.split(SEPARATOR).map { encoded ->
            runCatching {
                URLDecoder.decode(encoded, StandardCharsets.UTF_8.name())
            }.getOrNull() ?: return null
        }
        if (parts.size != 9) return null

        val state = runCatching {
            CommercialPaymentDraftState.valueOf(parts[4])
        }.getOrNull() ?: return null
        val amountMinor = parts[3].toLongOrNull() ?: return null
        val attempts = parts[5].toIntOrNull() ?: return null
        val revision = parts[6].ifBlank { null }?.toIntOrNull()
        val updatedAt = parts[8].toLongOrNull() ?: return null
        if (amountMinor < 0 || attempts < 0 || revision != null && revision < 1) return null

        return CommercialPaymentDraftSnapshot(
            logicalRequestId = parts[0].ifBlank { null },
            invoiceId = parts[1].ifBlank { null },
            currency = parts[2],
            amountMinor = amountMinor,
            state = state,
            attemptCount = attempts,
            expectedRevision = revision,
            lastErrorCode = parts[7].ifBlank { null },
            updatedAtEpochMillis = updatedAt,
        )
    }
}

class CommercialPaymentDraftStore(
    private val persistence: CommercialPaymentDraftPersistence,
    private val now: () -> Long = System::currentTimeMillis,
    private val idFactory: () -> String = { UUID.randomUUID().toString() },
) {
    private var snapshot = persistence.load()
        ?.let(CommercialPaymentDraftSnapshotCodec::decode)
        ?: emptySnapshot()

    fun current(): CommercialPaymentDraftSnapshot = snapshot

    fun prepareOffline(
        invoiceId: String,
        currency: String,
        amountMinor: Long,
        expectedRevision: Int,
    ): CommercialPaymentDraftSnapshot {
        require(invoiceId.matches(Regex("^[0-9a-fA-F-]{36}$"))) { "An opaque invoice identifier is required." }
        require(currency.matches(Regex("^[A-Z]{3}$"))) { "A three-letter currency is required." }
        require(amountMinor > 0) { "A positive minor-unit amount is required." }
        require(expectedRevision >= 1) { "Expected revision must be positive." }
        require(!snapshot.isTerminal) { "A terminal payment draft must be reset first." }

        snapshot = CommercialPaymentDraftSnapshot(
            logicalRequestId = snapshot.logicalRequestId ?: idFactory(),
            invoiceId = invoiceId,
            currency = currency,
            amountMinor = amountMinor,
            state = CommercialPaymentDraftState.PreparedOffline,
            attemptCount = snapshot.attemptCount,
            expectedRevision = expectedRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun startInitiation(): CommercialPaymentDraftSnapshot {
        require(snapshot.canRetry) { "Only a prepared or recoverable payment can be initiated." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.Initiating,
            attemptCount = snapshot.attemptCount + 1,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markRetryable(errorCode: String): CommercialPaymentDraftSnapshot {
        require(snapshot.state in setOf(
            CommercialPaymentDraftState.Initiating,
            CommercialPaymentDraftState.Processing,
        )) { "Only an in-flight commercial request can become retryable." }
        require(errorCode.matches(Regex("^[A-Z][A-Z0-9_]{2,63}$"))) { "A safe error code is required." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.Retryable,
            lastErrorCode = errorCode,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markRequiresAction(serverRevision: Int): CommercialPaymentDraftSnapshot {
        require(snapshot.state == CommercialPaymentDraftState.Initiating) {
            "Only an initiating request can require synthetic action."
        }
        require(serverRevision >= 1) { "Server revision must be positive." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.RequiresAction,
            expectedRevision = serverRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markProcessing(): CommercialPaymentDraftSnapshot {
        require(snapshot.state == CommercialPaymentDraftState.RequiresAction) {
            "Only a synthetic action can enter processing."
        }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.Processing,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markFailed(errorCode: String): CommercialPaymentDraftSnapshot {
        require(snapshot.state in setOf(
            CommercialPaymentDraftState.Initiating,
            CommercialPaymentDraftState.RequiresAction,
            CommercialPaymentDraftState.Processing,
        )) { "Only a non-terminal payment can fail." }
        require(errorCode.matches(Regex("^[A-Z][A-Z0-9_]{2,63}$"))) { "A safe error code is required." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.Failed,
            lastErrorCode = errorCode,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markStaleRevision(currentRevision: Int): CommercialPaymentDraftSnapshot {
        require(currentRevision >= 1) { "Current revision must be positive." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.StaleRevision,
            expectedRevision = currentRevision,
            lastErrorCode = "STALE_REVISION",
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun refreshRevision(currentRevision: Int): CommercialPaymentDraftSnapshot {
        require(snapshot.state == CommercialPaymentDraftState.StaleRevision) {
            "Only a stale payment action can be refreshed."
        }
        require(currentRevision >= 1) { "Current revision must be positive." }
        snapshot = snapshot.copy(
            state = CommercialPaymentDraftState.Retryable,
            expectedRevision = currentRevision,
            lastErrorCode = null,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    fun markSucceeded(serverRevision: Int): CommercialPaymentDraftSnapshot = markTerminal(
        CommercialPaymentDraftState.Succeeded,
        serverRevision,
        null,
    )

    fun markReversed(serverRevision: Int): CommercialPaymentDraftSnapshot = markTerminal(
        CommercialPaymentDraftState.Reversed,
        serverRevision,
        "SYNTHETIC_REVERSAL",
    )

    fun markCancelled(serverRevision: Int): CommercialPaymentDraftSnapshot = markTerminal(
        CommercialPaymentDraftState.Cancelled,
        serverRevision,
        "PROVIDER_CANCELLED",
    )

    fun markExpired(serverRevision: Int): CommercialPaymentDraftSnapshot = markTerminal(
        CommercialPaymentDraftState.Expired,
        serverRevision,
        "PAYMENT_INTENT_EXPIRED",
    )

    fun reset(): CommercialPaymentDraftSnapshot {
        persistence.clear()
        snapshot = emptySnapshot()
        return snapshot
    }

    private fun markTerminal(
        state: CommercialPaymentDraftState,
        serverRevision: Int,
        errorCode: String?,
    ): CommercialPaymentDraftSnapshot {
        require(snapshot.state in setOf(
            CommercialPaymentDraftState.RequiresAction,
            CommercialPaymentDraftState.Processing,
            CommercialPaymentDraftState.Succeeded,
        )) { "The current payment state cannot enter $state." }
        require(serverRevision >= 1) { "Server revision must be positive." }
        snapshot = snapshot.copy(
            state = state,
            expectedRevision = serverRevision,
            lastErrorCode = errorCode,
            updatedAtEpochMillis = now(),
        )
        persist()
        return snapshot
    }

    private fun persist() {
        persistence.save(CommercialPaymentDraftSnapshotCodec.encode(snapshot))
    }

    private fun emptySnapshot(): CommercialPaymentDraftSnapshot = CommercialPaymentDraftSnapshot(
        logicalRequestId = null,
        invoiceId = null,
        currency = "ZMW",
        amountMinor = 0,
        state = CommercialPaymentDraftState.Empty,
        attemptCount = 0,
        expectedRevision = null,
        lastErrorCode = null,
        updatedAtEpochMillis = now(),
    )
}

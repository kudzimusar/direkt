package com.kudzimusar.direkt.ui.interaction

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class InteractionDraftStoreTest {
    @Test
    fun offlineDraftRestoresWithStableLogicalRequestAndRetries() {
        val persistence = MemoryInteractionDraftPersistence()
        var clock = 1_000L
        var idSequence = 0
        val store = InteractionDraftStore(
            persistence = persistence,
            now = { clock++ },
            idFactory = { "request-${++idSequence}" },
        )

        val saved = store.saveOffline(
            serviceSummary = "A synthetic kitchen tap needs a bounded plumbing assessment this week.",
            localitySummary = "Woodlands, Lusaka",
            preferredChannel = "whatsapp",
        )
        assertEquals(InteractionDraftState.OfflineDraft, saved.state)
        assertEquals("request-1", saved.logicalRequestId)
        assertEquals(0, saved.attemptCount)

        val restored = InteractionDraftStore(
            persistence = persistence,
            now = { clock++ },
            idFactory = { "unexpected" },
        )
        assertEquals(saved, restored.current())

        val sending = restored.startSend()
        assertEquals(InteractionDraftState.Sending, sending.state)
        assertEquals("request-1", sending.logicalRequestId)
        assertEquals(1, sending.attemptCount)

        val interrupted = restored.markRetryable("NETWORK_INTERRUPTED")
        assertEquals(InteractionDraftState.Retryable, interrupted.state)
        assertEquals("request-1", interrupted.logicalRequestId)
        assertTrue(interrupted.canRetry)

        val retry = restored.startSend()
        assertEquals(2, retry.attemptCount)
        assertEquals("request-1", retry.logicalRequestId)

        val submitted = restored.markSubmitted(serverRevision = 4)
        assertEquals(InteractionDraftState.Submitted, submitted.state)
        assertEquals(4, submitted.expectedRevision)
        assertTrue(submitted.isTerminal)
        assertFalse(submitted.canRetry)
    }

    @Test
    fun staleRevisionAndExpiredConsentRequireExplicitRecovery() {
        val persistence = MemoryInteractionDraftPersistence()
        val store = InteractionDraftStore(
            persistence = persistence,
            now = { 2_000L },
            idFactory = { "logical-request" },
        )
        store.saveOffline(
            serviceSummary = "A synthetic service request remains bounded and safe for retry testing.",
            localitySummary = "Kabulonga, Lusaka",
            preferredChannel = "call",
        )

        val stale = store.markStaleRevision(expectedRevision = 3)
        assertEquals(InteractionDraftState.StaleRevision, stale.state)
        assertEquals("STALE_REVISION", stale.lastErrorCode)
        assertEquals(3, stale.expectedRevision)

        val refreshed = store.refreshRevision(currentRevision = 4)
        assertEquals(InteractionDraftState.Retryable, refreshed.state)
        assertEquals(4, refreshed.expectedRevision)
        assertNull(refreshed.lastErrorCode)

        val expired = store.markConsentExpired()
        assertEquals(InteractionDraftState.ConsentExpired, expired.state)
        assertEquals("CONSENT_EXPIRED", expired.lastErrorCode)

        val renewed = store.renewConsent()
        assertEquals(InteractionDraftState.Retryable, renewed.state)
        assertNull(renewed.lastErrorCode)
    }

    @Test
    fun codecRejectsMalformedOrUnsafeSnapshots() {
        assertNull(InteractionDraftSnapshotCodec.decode("not-a-snapshot"))

        val persistence = MemoryInteractionDraftPersistence()
        val store = InteractionDraftStore(persistence = persistence)
        assertThrows(IllegalArgumentException::class.java) {
            store.saveOffline(
                serviceSummary = "too short",
                localitySummary = "Lusaka",
                preferredChannel = "chat",
            )
        }
        assertNull(store.current().logicalRequestId)
        assertNotNull(store.current().updatedAtEpochMillis)
    }

    private class MemoryInteractionDraftPersistence : InteractionDraftPersistence {
        private var value: String? = null

        override fun load(): String? = value

        override fun save(value: String) {
            this.value = value
        }

        override fun clear() {
            value = null
        }
    }
}

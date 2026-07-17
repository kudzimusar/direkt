package com.kudzimusar.direkt.ui.commercial

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class CommercialPaymentDraftStoreTest {
    @Test
    fun retryIdentityRestoresWithoutSensitiveCredentials() {
        val persistence = MemoryCommercialPaymentDraftPersistence()
        var clock = 1_000L
        var idSequence = 0
        val store = CommercialPaymentDraftStore(
            persistence = persistence,
            now = { clock++ },
            idFactory = { "commercial-request-${++idSequence}" },
        )

        val prepared = store.prepareOffline(
            invoiceId = "00000000-0000-4000-8000-000000009901",
            currency = "ZMW",
            amountMinor = 15_000,
            expectedRevision = 1,
        )
        assertEquals(CommercialPaymentDraftState.PreparedOffline, prepared.state)
        assertEquals("commercial-request-1", prepared.logicalRequestId)
        assertTrue(prepared.canRetry)

        val encoded = persistence.load().orEmpty()
        assertFalse(encoded.contains("pin", ignoreCase = true))
        assertFalse(encoded.contains("card", ignoreCase = true))
        assertFalse(encoded.contains("phone", ignoreCase = true))
        assertFalse(encoded.contains("secret", ignoreCase = true))

        val restored = CommercialPaymentDraftStore(
            persistence = persistence,
            now = { clock++ },
            idFactory = { "unexpected" },
        )
        assertEquals(prepared, restored.current())

        val initiating = restored.startInitiation()
        assertEquals(CommercialPaymentDraftState.Initiating, initiating.state)
        assertEquals(1, initiating.attemptCount)
        assertEquals("commercial-request-1", initiating.logicalRequestId)

        val retryable = restored.markRetryable("NETWORK_INTERRUPTED")
        assertEquals(CommercialPaymentDraftState.Retryable, retryable.state)
        assertTrue(retryable.canRetry)

        restored.startInitiation()
        val action = restored.markRequiresAction(serverRevision = 2)
        assertEquals(CommercialPaymentDraftState.RequiresAction, action.state)
        assertEquals(2, action.expectedRevision)

        restored.markProcessing()
        val paid = restored.markSucceeded(serverRevision = 3)
        assertEquals(CommercialPaymentDraftState.Succeeded, paid.state)
        assertTrue(paid.isTerminal)
        assertFalse(paid.canRetry)

        val reversed = restored.markReversed(serverRevision = 4)
        assertEquals(CommercialPaymentDraftState.Reversed, reversed.state)
        assertEquals("SYNTHETIC_REVERSAL", reversed.lastErrorCode)
    }

    @Test
    fun staleAndFailedStatesRequireExplicitRecovery() {
        val store = CommercialPaymentDraftStore(
            persistence = MemoryCommercialPaymentDraftPersistence(),
            now = { 2_000L },
            idFactory = { "logical-commercial-request" },
        )
        store.prepareOffline(
            invoiceId = "00000000-0000-4000-8000-000000009902",
            currency = "ZMW",
            amountMinor = 15_000,
            expectedRevision = 1,
        )

        val stale = store.markStaleRevision(currentRevision = 2)
        assertEquals(CommercialPaymentDraftState.StaleRevision, stale.state)
        assertEquals("STALE_REVISION", stale.lastErrorCode)

        val refreshed = store.refreshRevision(currentRevision = 2)
        assertEquals(CommercialPaymentDraftState.Retryable, refreshed.state)
        assertNull(refreshed.lastErrorCode)

        store.startInitiation()
        val failed = store.markFailed("SYNTHETIC_PROVIDER_DECLINED")
        assertEquals(CommercialPaymentDraftState.Failed, failed.state)
        assertTrue(failed.canRetry)
    }

    @Test
    fun codecAndInputRulesRejectUnsafeSnapshots() {
        assertNull(CommercialPaymentDraftSnapshotCodec.decode("not-a-commercial-snapshot"))

        val store = CommercialPaymentDraftStore(
            persistence = MemoryCommercialPaymentDraftPersistence(),
        )
        assertThrows(IllegalArgumentException::class.java) {
            store.prepareOffline(
                invoiceId = "not-an-opaque-id",
                currency = "zmw",
                amountMinor = 0,
                expectedRevision = 0,
            )
        }
        assertNull(store.current().logicalRequestId)
    }

    private class MemoryCommercialPaymentDraftPersistence : CommercialPaymentDraftPersistence {
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

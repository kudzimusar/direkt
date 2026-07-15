package com.kudzimusar.direkt.ui.provider

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class ProviderUploadRecoveryStoreTest {
    @Test
    fun `interrupted upload survives recreation and retries without replacing logical intent`() {
        val persistence = MemoryUploadPersistence()
        val ids = ArrayDeque(
            listOf(
                "intent-0001",
                "session-0001",
                "session-0002",
            ),
        )
        val idFactory = { ids.removeFirst() }
        var now = 1_000L

        val firstStore = ProviderUploadRecoveryStore(
            persistence = persistence,
            now = { now++ },
            idFactory = idFactory,
        )
        val started = firstStore.start("Identity evidence")
        val interrupted = firstStore.interrupt("NETWORK_INTERRUPTED")

        assertEquals("intent-0001", started.logicalIntentId)
        assertEquals("session-0001", started.activeSessionId)
        assertEquals(1, started.attemptCount)
        assertEquals(ProviderUploadState.Interrupted, interrupted.state)
        assertTrue(interrupted.canRetry)
        assertNull(interrupted.activeSessionId)

        val recreatedStore = ProviderUploadRecoveryStore(
            persistence = persistence,
            now = { now++ },
            idFactory = idFactory,
        )
        val restored = recreatedStore.current()
        val retried = recreatedStore.retry()

        assertEquals(interrupted, restored)
        assertEquals("intent-0001", retried.logicalIntentId)
        assertEquals(2, retried.attemptCount)
        assertEquals("session-0002", retried.activeSessionId)
        assertNotEquals(started.activeSessionId, retried.activeSessionId)
        assertFalse(retried.canRetry)
    }

    @Test
    fun `repeating start while active is idempotent`() {
        val persistence = MemoryUploadPersistence()
        val ids = ArrayDeque(listOf("intent-0002", "session-0003"))
        val store = ProviderUploadRecoveryStore(
            persistence = persistence,
            now = { 2_000L },
            idFactory = { ids.removeFirst() },
        )

        val first = store.start("Identity evidence")
        val repeated = store.start("Different label is ignored while active")

        assertEquals(first, repeated)
        assertEquals(1, repeated.attemptCount)
        assertEquals("intent-0002", repeated.logicalIntentId)
    }

    @Test
    fun `submitted upload restores as terminal and cannot be cancelled`() {
        val persistence = MemoryUploadPersistence()
        val ids = ArrayDeque(listOf("intent-0003", "session-0004"))
        val store = ProviderUploadRecoveryStore(
            persistence = persistence,
            now = { 3_000L },
            idFactory = { ids.removeFirst() },
        )

        store.start("Identity evidence")
        val submitted = store.submit()
        val recreated = ProviderUploadRecoveryStore(persistence = persistence).current()

        assertEquals(ProviderUploadState.Submitted, submitted.state)
        assertEquals(submitted, recreated)
        assertTrue(recreated.isTerminal)
        assertThrows(IllegalArgumentException::class.java) {
            ProviderUploadRecoveryStore(persistence = persistence).cancel()
        }
    }

    @Test
    fun `corrupt persistence falls back to an empty safe state`() {
        val persistence = MemoryUploadPersistence("not-a-valid-snapshot")
        val restored = ProviderUploadRecoveryStore(persistence = persistence).current()

        assertEquals(ProviderUploadState.NotStarted, restored.state)
        assertEquals(0, restored.attemptCount)
        assertNull(restored.logicalIntentId)
        assertNull(restored.activeSessionId)
    }

    private class MemoryUploadPersistence(
        private var value: String? = null,
    ) : ProviderUploadPersistence {
        override fun load(): String? = value

        override fun save(value: String) {
            this.value = value
        }

        override fun clear() {
            value = null
        }
    }
}

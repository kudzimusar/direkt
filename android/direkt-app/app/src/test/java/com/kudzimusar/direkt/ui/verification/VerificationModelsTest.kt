package com.kudzimusar.direkt.ui.verification

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class VerificationModelsTest {
    @Test
    fun `synthetic case contains no real evidence and is not discoverable`() {
        assertFalse(syntheticVerificationCase.containsRealEvidence)
        assertFalse(syntheticVerificationCase.publiclyDiscoverable)
    }

    @Test
    fun `replacement history preserves two evidence versions`() {
        assertEquals(listOf(1, 2), syntheticVerificationCase.evidenceVersions.map { it.version })
        assertEquals(
            EvidenceState.CorrectionRequired,
            syntheticVerificationCase.evidenceVersions.first().state,
        )
        assertEquals(EvidenceState.Approved, syntheticVerificationCase.evidenceVersions.last().state)
    }

    @Test
    fun `scoped claim expires deterministically`() {
        val claim = requireNotNull(syntheticVerificationCase.claim)

        assertEquals("active", claim.effectiveState(1_815_609_599_000))
        assertEquals("expired", claim.effectiveState(1_815_609_600_000))
    }

    @Test
    fun `claim limitation remains explicit`() {
        val claim = requireNotNull(syntheticVerificationCase.claim)

        assertTrue(claim.limitation.contains("does not verify qualifications"))
        assertTrue(claim.statement.contains("identity checked"))
    }
}
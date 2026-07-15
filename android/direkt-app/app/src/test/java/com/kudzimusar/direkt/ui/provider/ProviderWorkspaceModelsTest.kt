package com.kudzimusar.direkt.ui.provider

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ProviderWorkspaceModelsTest {
    @Test
    fun `synthetic readiness counts only completed independent controls`() {
        val readiness = syntheticProviderWorkspace.readiness

        assertEquals(40, readiness.completionPercent)
        assertEquals(2, readiness.mandatoryRequirements)
        assertEquals(1, readiness.evidenceSubmitted)
        assertEquals(1, readiness.correctionsRequired)
        assertEquals(0, readiness.currentClaims)
    }

    @Test
    fun `location summary never contains coordinates`() {
        val summary = syntheticProviderWorkspace.location.safeSummary

        assertTrue(summary.contains("Private base stored"))
        assertTrue(summary.contains("Public premises consented"))
        assertFalse(summary.contains("latitude", ignoreCase = true))
        assertFalse(summary.contains("longitude", ignoreCase = true))
        assertFalse(summary.contains("-15."))
        assertFalse(summary.contains("28."))
    }

    @Test
    fun `later phase surfaces are read only`() {
        assertEquals(3, syntheticProviderWorkspace.deferredSurfaces.size)
        assertTrue(syntheticProviderWorkspace.deferredSurfaces.all { !it.mutationAllowed })
        assertEquals(
            listOf("Phase 8", "Phase 8", "Phase 9"),
            syntheticProviderWorkspace.deferredSurfaces.map { it.phaseOwner },
        )
    }

    @Test
    fun `workspace tasks remain ordered and scoped`() {
        val tasks = syntheticProviderWorkspace.tasks.sortedBy { it.priority }

        assertEquals("complete_profile", tasks.first().key)
        assertEquals(ProviderTaskState.Complete, tasks.first().state)
        assertEquals("resolve_correction", tasks[1].key)
        assertEquals(ProviderTaskState.ActionRequired, tasks[1].state)
        assertTrue(syntheticProviderWorkspace.trustBoundary.contains("cannot create claims"))
    }
}

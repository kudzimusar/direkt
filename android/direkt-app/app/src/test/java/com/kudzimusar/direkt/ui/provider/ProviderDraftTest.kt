package com.kudzimusar.direkt.ui.provider

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ProviderDraftTest {
    @Test
    fun `provider drafts are never discoverable in Phase 3`() {
        assertFalse(syntheticProviderDraft.discoverable)
    }

    @Test
    fun `complete fixed-premises draft has no validation issues`() {
        assertTrue(syntheticProviderDraft.validationIssues().isEmpty())
    }

    @Test
    fun `fixed-premises draft requires a locality summary`() {
        val draft = syntheticProviderDraft.copy(localitySummary = null)

        assertTrue(draft.validationIssues().contains("A public-safe locality summary is required"))
    }

    @Test
    fun `archived draft cannot transition back to draft`() {
        val archived = syntheticProviderDraft.copy(status = ProviderDraftStatus.Archived)

        assertFalse(archived.canTransitionTo(ProviderDraftStatus.Draft))
    }

    @Test
    fun `draft may move to ready for verification but not suspended`() {
        assertTrue(syntheticProviderDraft.canTransitionTo(ProviderDraftStatus.ReadyForVerification))
        assertFalse(syntheticProviderDraft.canTransitionTo(ProviderDraftStatus.Suspended))
    }
}
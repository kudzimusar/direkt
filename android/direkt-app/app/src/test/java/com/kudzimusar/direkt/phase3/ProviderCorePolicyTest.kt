package com.kudzimusar.direkt.phase3

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ProviderCorePolicyTest {
    @Test
    fun `archived provider profiles cannot return to draft`() {
        assertFalse(
            ProviderCorePolicy.canTransition(
                ProviderProfileState.ARCHIVED,
                ProviderProfileState.DRAFT,
            ),
        )
    }

    @Test
    fun `drafts can become complete but remain blocked from discovery`() {
        val draft = syntheticProviderDrafts.first().copy(profileState = ProviderProfileState.DRAFT)
        assertTrue(ProviderCorePolicy.canTransition(draft.profileState, ProviderProfileState.COMPLETE))
        assertTrue(ProviderCorePolicy.canComplete(draft))
        assertTrue(draft.discoverabilityBlocked)
    }

    @Test
    fun `completion requires category selection and synthetic boundary`() {
        val missingCategory = syntheticProviderDrafts.first().copy(categories = emptyList())
        val unsafe = syntheticProviderDrafts.first().copy(discoverabilityBlocked = false)
        assertFalse(ProviderCorePolicy.canComplete(missingCategory))
        assertFalse(ProviderCorePolicy.canComplete(unsafe))
    }
}

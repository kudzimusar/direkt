package com.kudzimusar.direkt.ui

import org.junit.Assert.assertEquals
import org.junit.Test

class DirektAppStateTest {
    @Test
    fun `customer mode starts on discover`() {
        val state = DirektAppState()

        assertEquals(DirektMode.Customer, state.mode)
        assertEquals(DirektDestination.Discover, state.destination)
    }

    @Test
    fun `switching to provider mode resets to account foundation`() {
        val state = DirektAppState()
        state.navigate(DirektDestination.Enquiries)

        state.switchMode(DirektMode.Provider)

        assertEquals(DirektMode.Provider, state.mode)
        assertEquals(DirektDestination.Account, state.destination)
    }

    @Test
    fun `navigation changes only the selected destination`() {
        val state = DirektAppState(initialMode = DirektMode.Provider)

        state.navigate(DirektDestination.Enquiries)

        assertEquals(DirektMode.Provider, state.mode)
        assertEquals(DirektDestination.Enquiries, state.destination)
    }
}

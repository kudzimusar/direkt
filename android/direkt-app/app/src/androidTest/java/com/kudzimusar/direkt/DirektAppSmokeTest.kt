package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Rule
import org.junit.Test

class DirektAppSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun phase11ControlledPilotShellIsVisibleAndAuthDefaultsClosed() {
        composeRule.onNodeWithTag("foundation-root").assertIsDisplayed()
        composeRule.onNodeWithText("DIREKT").assertIsDisplayed()
        composeRule.onNodeWithText("Phase 11 — controlled pilot entry").assertIsDisplayed()
        composeRule.onNodeWithText("Find a provider").assertIsDisplayed()
        composeRule.onNodeWithText("Search area").assertIsDisplayed()
        composeRule.onNodeWithText("Background location: Off").assertIsDisplayed()

        composeRule.onNodeWithText("Account").performClick()
        composeRule.onNodeWithTag("pilot-auth-card").assertIsDisplayed()
        composeRule.onNodeWithText("Real participant sign-in is disabled.", substring = true)
            .assertIsDisplayed()
    }
}

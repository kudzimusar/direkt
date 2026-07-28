package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsSelected
import androidx.compose.ui.test.hasScrollAction
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performScrollToIndex
import org.junit.Rule
import org.junit.Test

class DirektAppSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun currentCustomerShellIsVisibleAndParticipantAuthDefaultsClosed() {
        composeRule.onNodeWithTag("foundation-root").assertIsDisplayed()
        composeRule.onNodeWithText("DIREKT").assertIsDisplayed()
        composeRule.onNodeWithText("What do you need help with?").assertIsDisplayed()
        composeRule.onNodeWithTag("customer-home-service-input").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithTag("customer-home-area-input").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithTag("customer-home-find-providers").performScrollTo().assertIsDisplayed()

        composeRule.onNodeWithTag("nav-saved").performClick().assertIsSelected()
        composeRule.onNodeWithTag("nav-enquiries").performClick().assertIsSelected()
        composeRule.onNodeWithTag("nav-account").performClick().assertIsSelected()

        composeRule.onNode(hasScrollAction()).performScrollToIndex(2)
        composeRule.onNodeWithTag("pilot-auth-card").assertIsDisplayed()
        composeRule.onNodeWithText(
            "Real participant sign-in is disabled.",
            substring = true,
        ).performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(
            "No production credential or participant endpoint is embedded in this build.",
        ).performScrollTo().assertIsDisplayed()
    }
}

package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
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

        composeRule.onNodeWithTag("nav-saved").performClick()
        composeRule.onNodeWithText("Your shortlist").assertIsDisplayed()
        composeRule.onNodeWithTag("customer-saved").performScrollTo().assertIsDisplayed()

        composeRule.onNodeWithTag("nav-enquiries").performClick()
        composeRule.onNodeWithText("Your service requests").assertIsDisplayed()

        composeRule.onNodeWithTag("nav-account").performClick()
        composeRule.onNodeWithText("Account and privacy").assertIsDisplayed()
        composeRule.onNode(hasScrollAction()).performScrollToIndex(3)
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

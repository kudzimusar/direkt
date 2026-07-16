package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Before
import org.junit.Rule
import org.junit.Test

class Phase8InteractionExperienceTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Before
    fun clearInteractionDrafts() {
        InstrumentationRegistry.getInstrumentation()
            .targetContext
            .getSharedPreferences("direkt_phase8_interaction_drafts", 0)
            .edit()
            .clear()
            .commit()
    }

    @Test
    fun customerDraftRestoresAndConsentStateIsAccessible() {
        openCustomerInteractions()

        composeRule
            .onNodeWithContentDescription(
                "Customer enquiries, contact consent, history, reviews and appeals",
            )
            .assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-save-offline").performScrollTo().performClick()
        composeRule.onNodeWithText("Saved offline").assertIsDisplayed()
        composeRule.onNodeWithText("Retry-safe request request-").assertDoesNotExist()
        composeRule.onNodeWithTag("phase8-offline-draft").assertIsDisplayed()

        composeRule.activityRule.scenario.recreate()
        openCustomerInteractions()

        composeRule.onNodeWithText("Saved offline").assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-send-draft").performScrollTo().performClick()
        composeRule.onNodeWithText("Sending").assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-interrupt-send").performScrollTo().performClick()
        composeRule.onNodeWithText("Ready to retry").assertIsDisplayed()
        composeRule.onNodeWithText("Recovery code: NETWORK_INTERRUPTED").assertIsDisplayed()

        composeRule
            .onNodeWithContentDescription(
                "WhatsApp consent active; masked contact +260 ••• •• 104",
            )
            .performScrollTo()
            .assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-revoke-handoff").performScrollTo().performClick()
        composeRule
            .onNodeWithContentDescription(
                "WhatsApp consent revoked; provider contact access denied",
            )
            .assertIsDisplayed()
    }

    @Test
    fun providerTransitionsAndOneReviewResponseRemainBounded() {
        composeRule.onNodeWithText("Provider").performClick()
        composeRule.onNodeWithText("Enquiries").performClick()
        composeRule.onNodeWithTag("phase8-provider-interactions").assertIsDisplayed()

        composeRule.onNodeWithTag("phase8-provider-acknowledge").performScrollTo().performClick()
        composeRule.onNodeWithText("Acknowledged · revision 2").assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-provider-accept").performScrollTo().performClick()
        composeRule.onNodeWithText("Accepted · revision 3").assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-provider-close").performScrollTo().performClick()
        composeRule.onNodeWithText("Closed · revision 4").assertIsDisplayed()
        composeRule.onNodeWithText("Terminal enquiries reject repeated or stale transitions.")
            .assertIsDisplayed()

        composeRule.onNodeWithTag("phase8-provider-submit-response").performScrollTo().performClick()
        composeRule.onNodeWithText("Response submitted").assertIsDisplayed()
        composeRule.onNodeWithTag("phase8-provider-submit-response").assertIsNotEnabled()
        composeRule.onNodeWithText("Response locked").assertIsDisplayed()
    }

    private fun openCustomerInteractions() {
        composeRule.onNodeWithText("Enquiries").performClick()
        composeRule.onNodeWithTag("phase8-customer-interactions").assertIsDisplayed()
    }
}

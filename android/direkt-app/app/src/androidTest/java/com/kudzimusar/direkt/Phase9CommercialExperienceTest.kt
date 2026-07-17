package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
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

class Phase9CommercialExperienceTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Before
    fun clearCommercialDrafts() {
        InstrumentationRegistry.getInstrumentation()
            .targetContext
            .getSharedPreferences("direkt_phase9_commercial_payment_drafts", 0)
            .edit()
            .clear()
            .commit()
    }

    @Test
    fun paymentDraftRestoresAndMovesThroughSyntheticReceiptAndReversal() {
        openProviderCommercialWorkspace()

        composeRule
            .onNodeWithContentDescription(
                "Provider products, subscription, invoices, synthetic payment and receipt recovery",
            )
            .assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-product").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-prepare-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Prepared offline").assertIsDisplayed()
        composeRule.onNodeWithText("ZMW 150.00").assertIsDisplayed()

        composeRule.activityRule.scenario.recreate()
        openProviderCommercialWorkspace()

        composeRule.onNodeWithText("Prepared offline").assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-initiate-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Initiating").assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-interrupt-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Ready to retry").assertIsDisplayed()
        composeRule.onNodeWithText("Recovery code: NETWORK_INTERRUPTED").assertIsDisplayed()

        composeRule.onNodeWithTag("phase9-initiate-payment").performScrollTo().performClick()
        composeRule.onNodeWithTag("phase9-requires-action").performScrollTo().performClick()
        composeRule.onNodeWithText("Synthetic action required").assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-process-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Processing").assertIsDisplayed()
        composeRule.onNodeWithTag("phase9-succeed-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Paid").assertIsDisplayed()
        composeRule.onNodeWithText("Backend-confirmed receipt is available.").assertIsDisplayed()

        composeRule.onNodeWithTag("phase9-reverse-payment").performScrollTo().performClick()
        composeRule.onNodeWithText("Reversed").assertIsDisplayed()
        composeRule.onNodeWithContentDescription("Subscription Grace period, revision 3")
            .performScrollTo()
            .assertIsDisplayed()
        composeRule.onNodeWithContentDescription("Synthetic invoice Open, revision 3")
            .performScrollTo()
            .assertIsDisplayed()
    }

    @Test
    fun graceAndPastDueStatesExplainEntitlementDegradation() {
        openProviderCommercialWorkspace()

        composeRule.onNodeWithTag("phase9-activate-subscription").performScrollTo().performClick()
        composeRule.onNodeWithText("Active · revision 2").assertIsDisplayed()
        composeRule.onNodeWithText(
            "Workspace, invoice history and productivity entitlements are active.",
        ).assertIsDisplayed()

        composeRule.onNodeWithTag("phase9-start-grace").performScrollTo().performClick()
        composeRule.onNodeWithText("Grace period · revision 3").assertIsDisplayed()
        composeRule.onNodeWithText(
            "Entitlements are limited until the seven-day grace window ends.",
        ).assertIsDisplayed()

        composeRule.onNodeWithTag("phase9-mark-past-due").performScrollTo().performClick()
        composeRule.onNodeWithText("Past due · revision 4").assertIsDisplayed()
        composeRule.onNodeWithText(
            "Commercial entitlements are suspended; trust and publication are unchanged.",
        ).assertIsDisplayed()
    }

    private fun openProviderCommercialWorkspace() {
        composeRule.onNodeWithText("Provider").performClick()
        composeRule.onNodeWithText("Account").performClick()
        composeRule.onNodeWithTag("phase9-commercial-workspace").performScrollTo().assertIsDisplayed()
    }
}

package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Before
import org.junit.Rule
import org.junit.Test

class ProviderWorkspaceRecoveryTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Before
    fun clearSyntheticUploadPersistence() {
        InstrumentationRegistry.getInstrumentation()
            .targetContext
            .getSharedPreferences("direkt_phase6_provider_uploads", 0)
            .edit()
            .clear()
            .commit()
    }

    @Test
    fun interruptedUploadRestoresAfterActivityRecreationAndRetriesAsSecondAttempt() {
        openEvidenceWorkspace()

        composeRule.onNodeWithTag("provider-upload-start").performClick()
        composeRule.onNodeWithText("Status: Uploading").assertIsDisplayed()
        composeRule.onNodeWithText("Attempt 1").assertIsDisplayed()
        composeRule.onNodeWithTag("provider-upload-interrupt").performClick()
        composeRule.onNodeWithText("Status: Interrupted").assertIsDisplayed()
        composeRule.onNodeWithText("Recovery code: NETWORK_INTERRUPTED").assertIsDisplayed()

        composeRule.activityRule.scenario.recreate()
        openEvidenceWorkspace()

        composeRule.onNodeWithText("Status: Interrupted").assertIsDisplayed()
        composeRule.onNodeWithText("Attempt 1").assertIsDisplayed()
        composeRule.onNodeWithTag("provider-upload-retry").performClick()
        composeRule.onNodeWithText("Status: Uploading").assertIsDisplayed()
        composeRule.onNodeWithText("Attempt 2").assertIsDisplayed()
    }

    @Test
    fun providerDashboardAndPhase9BoundaryAreAccessible() {
        composeRule.onNodeWithText("Provider").performClick()
        composeRule.onNodeWithText("Discover").performClick()

        composeRule.onNodeWithTag("provider-workspace-dashboard").assertIsDisplayed()
        composeRule.onNodeWithText("Priority tasks").assertIsDisplayed()
        composeRule.onNodeWithText("Location privacy boundary").assertIsDisplayed()
        composeRule.onNodeWithText("Provider trust boundary").assertIsDisplayed()

        composeRule.onNodeWithText("Account").performClick()
        composeRule.onNodeWithTag("provider-profile-workspace").assertIsDisplayed()
        composeRule.onNodeWithText("Subscription status: Synthetic read-only · Phase 9")
            .assertIsDisplayed()
    }

    private fun openEvidenceWorkspace() {
        composeRule.onNodeWithText("Provider").performClick()
        composeRule.onNodeWithText("Saved").performClick()
        composeRule.onNodeWithTag("provider-evidence-workspace").assertIsDisplayed()
    }
}

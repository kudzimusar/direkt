package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithTag
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class Rc7MapsRuntimeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun mapViewPreservesPrivacySafeFallbackOrLoadsRestrictedRuntime() {
        composeRule.onNodeWithText("Discover").performClick()
        composeRule.onNodeWithText("Map").performScrollTo().performClick()
        composeRule.onNodeWithTag("discovery-map-card").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(
            "Private provider bases never become markers.",
            substring = true,
        ).assertIsDisplayed()

        if (BuildConfig.DIREKT_MAPS_ENABLED) {
            composeRule.onNodeWithTag("discovery-google-map").assertIsDisplayed()
            composeRule.waitUntil(timeoutMillis = 25_000) {
                composeRule.onAllNodesWithTag("discovery-map-ready").fetchSemanticsNodes().isNotEmpty() ||
                    composeRule.onAllNodesWithTag("discovery-map-fallback").fetchSemanticsNodes().isNotEmpty()
            }
            val readyCount = composeRule.onAllNodesWithTag("discovery-map-ready").fetchSemanticsNodes().size
            val fallbackCount = composeRule.onAllNodesWithTag("discovery-map-fallback").fetchSemanticsNodes().size
            val loadingCount = composeRule.onAllNodesWithTag("discovery-map-loading").fetchSemanticsNodes().size
            assertTrue(
                "RC7 Maps runtime did not reach Ready; ready=$readyCount fallback=$fallbackCount loading=$loadingCount",
                readyCount > 0,
            )
            composeRule.onNodeWithTag("discovery-map-ready").assertIsDisplayed()
            assertTrue(
                composeRule.onAllNodesWithTag("discovery-map-fallback")
                    .fetchSemanticsNodes()
                    .isEmpty(),
            )
        } else {
            composeRule.onNodeWithTag("discovery-map-fallback").assertIsDisplayed()
            composeRule.onNodeWithText(
                "Manual area and list discovery remain fully available without location permission.",
            ).assertIsDisplayed()
        }
    }
}

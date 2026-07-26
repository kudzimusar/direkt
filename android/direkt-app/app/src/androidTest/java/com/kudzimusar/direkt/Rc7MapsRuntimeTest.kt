package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasScrollAction
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNode
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performScrollToIndex
import org.junit.Rule
import org.junit.Test

class Rc7MapsRuntimeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun mapViewPreservesPrivacySafeFallbackOrLoadsRestrictedRuntime() {
        composeRule.onNodeWithText("Discover").performClick()
        composeRule.onNode(hasScrollAction()).performScrollToIndex(4)
        composeRule.onNodeWithText("Map").performScrollTo().performClick()
        composeRule.onNodeWithTag("discovery-map-card").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText(
            "Private provider bases never become markers.",
            substring = true,
        ).assertIsDisplayed()

        if (BuildConfig.DIREKT_MAPS_ENABLED) {
            composeRule.onNodeWithTag("discovery-google-map").assertIsDisplayed()
        } else {
            composeRule.onNodeWithTag("discovery-map-fallback").assertIsDisplayed()
            composeRule.onNodeWithText(
                "Manual area and list discovery remain fully available without location permission.",
            ).assertIsDisplayed()
        }
    }
}

package com.kudzimusar.direkt

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test

class DirektAppSmokeTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun foundationShellIsVisible() {
        composeRule.onNodeWithTag("foundation-root").assertIsDisplayed()
        composeRule.onNodeWithText("DIREKT").assertIsDisplayed()
        composeRule.onNodeWithText("Foundation build — synthetic data only").assertIsDisplayed()
    }
}

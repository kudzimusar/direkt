package com.kudzimusar.direkt.auth

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PilotAuthConfigurationTest {
    @Test
    fun `configuration enables only with https endpoint and all approved bindings`() {
        val configuration =
            PilotAuthConfiguration(
                apiBaseUrl = "https://pilot.example.invalid",
                firebaseApiKey = "test-api-key",
                firebaseAppId = "test-app-id",
                firebaseProjectId = "direkt-dev-502701",
                noticeVersion = "pilot-notice-v1",
            )

        assertTrue(configuration.enabled)
    }

    @Test
    fun `configuration rejects non-https endpoint`() {
        val configuration =
            PilotAuthConfiguration(
                apiBaseUrl = "http://pilot.example.invalid",
                firebaseApiKey = "test-api-key",
                firebaseAppId = "test-app-id",
                firebaseProjectId = "direkt-dev-502701",
                noticeVersion = "pilot-notice-v1",
            )

        assertFalse(configuration.enabled)
    }

    @Test
    fun `configuration rejects missing approved notice version`() {
        val configuration =
            PilotAuthConfiguration(
                apiBaseUrl = "https://pilot.example.invalid",
                firebaseApiKey = "test-api-key",
                firebaseAppId = "test-app-id",
                firebaseProjectId = "direkt-dev-502701",
                noticeVersion = "",
            )

        assertFalse(configuration.enabled)
    }

    @Test
    fun `repository default build remains fail closed without injected values`() {
        assertFalse(PilotAuthConfiguration.fromBuildConfig().enabled)
    }
}

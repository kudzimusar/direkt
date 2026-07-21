package com.kudzimusar.direkt.observability

import org.junit.Assert.assertFalse
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class CrashlyticsConfigurationTest {
    @Test
    fun `disabled mode remains fail closed`() {
        val configuration =
            CrashlyticsConfiguration(
                mode = CrashlyticsConfiguration.DISABLED_MODE,
                release = "",
                firebaseApiKey = "",
                firebaseAppId = "",
                firebaseProjectId = "",
            )

        assertFalse(configuration.syntheticCanaryEnabled)
        assertThrows(IllegalArgumentException::class.java) {
            configuration.requireValidSyntheticCanary()
        }
    }

    @Test
    fun `synthetic canary accepts exact source and firebase configuration`() {
        val configuration = validConfiguration()

        assertTrue(configuration.syntheticCanaryEnabled)
        configuration.requireValidSyntheticCanary()
    }

    @Test
    fun `synthetic canary rejects non exact release`() {
        val configuration = validConfiguration().copy(release = "not-a-source-sha")

        assertThrows(IllegalArgumentException::class.java) {
            configuration.requireValidSyntheticCanary()
        }
    }

    @Test
    fun `synthetic canary rejects missing firebase configuration`() {
        val configuration = validConfiguration().copy(firebaseAppId = "")

        assertThrows(IllegalArgumentException::class.java) {
            configuration.requireValidSyntheticCanary()
        }
    }

    private fun validConfiguration(): CrashlyticsConfiguration =
        CrashlyticsConfiguration(
            mode = CrashlyticsConfiguration.SYNTHETIC_CANARY_MODE,
            release = "0123456789abcdef0123456789abcdef01234567",
            firebaseApiKey = "synthetic-api-key",
            firebaseAppId = "1:264358173369:android:synthetic",
            firebaseProjectId = "direkt-dev-502701",
        )
}

package com.kudzimusar.direkt.observability

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CrashlyticsCanaryPolicyTest {
    private val sha = "a".repeat(40)

    @Test
    fun `canary requires debug explicit enable synthetic mode and exact source sha`() {
        assertTrue(
            CrashlyticsCanaryPolicy.canRun(
                debugBuild = true,
                canaryEnabled = true,
                dataMode = "synthetic-only",
                sourceSha = sha,
            ),
        )
        assertFalse(CrashlyticsCanaryPolicy.canRun(false, true, "synthetic-only", sha))
        assertFalse(CrashlyticsCanaryPolicy.canRun(true, false, "synthetic-only", sha))
        assertFalse(CrashlyticsCanaryPolicy.canRun(true, true, "production", sha))
        assertFalse(CrashlyticsCanaryPolicy.canRun(true, true, "synthetic-only", "not-a-sha"))
    }

    @Test
    fun `only fixed synthetic canary modes are accepted`() {
        assertEquals("crash", CrashlyticsCanaryPolicy.normalizeMode(" CRASH "))
        assertEquals("anr", CrashlyticsCanaryPolicy.normalizeMode("anr"))
        assertEquals("flush", CrashlyticsCanaryPolicy.normalizeMode("flush"))
        assertEquals("disable", CrashlyticsCanaryPolicy.normalizeMode("disable"))
        assertNull(CrashlyticsCanaryPolicy.normalizeMode("profile"))
        assertNull(CrashlyticsCanaryPolicy.normalizeMode(null))
    }
}

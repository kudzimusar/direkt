package com.kudzimusar.direkt.auth

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import retrofit2.Response

class GeneratedPilotSessionExchangeClientTest {
    @Test
    fun `rejects non-HTTPS base URLs`() {
        assertThrows(IllegalArgumentException::class.java) {
            GeneratedPilotSessionExchangeClient.normalizeHttpsBaseUrl("http://api.example.invalid")
        }
        assertThrows(IllegalArgumentException::class.java) {
            GeneratedPilotSessionExchangeClient.normalizeHttpsBaseUrl("https://user@example.invalid")
        }
        assertThrows(IllegalArgumentException::class.java) {
            GeneratedPilotSessionExchangeClient.normalizeHttpsBaseUrl("https://api.example.invalid?escape=true")
        }
    }

    @Test
    fun `normalizes an approved HTTPS base URL`() {
        assertEquals(
            "https://api.example.invalid/",
            GeneratedPilotSessionExchangeClient.normalizeHttpsBaseUrl("  https://api.example.invalid  "),
        )
    }

    @Test
    fun `maps the approved request and preserves rejection semantics`() {
        val client =
            GeneratedPilotSessionExchangeClient(
                FirebaseSessionExchangeCall { request ->
                    assertEquals("firebase-id-token", request.idToken)
                    assertEquals("pilot-notice-v1", request.noticeVersion)
                    assertEquals(true, request.consentAccepted)
                    assertEquals("Android pilot device", request.deviceLabel)
                    Response.error(
                        401,
                        "{}".toResponseBody("application/json".toMediaType()),
                    )
                },
            )

        val error =
            assertThrows(IllegalStateException::class.java) {
                client.exchange(
                    idToken = "firebase-id-token",
                    noticeVersion = "pilot-notice-v1",
                )
            }

        assertEquals("Session exchange was rejected.", error.message)
    }
}

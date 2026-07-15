package com.kudzimusar.direkt.ui.discovery

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class DiscoveryModelsTest {
    @Test
    fun `manual area works without any location storage or background access`() {
        val state = DiscoveryUiState(areaMode = SearchAreaMode.Manual)

        assertEquals("Woodlands, Lusaka", state.manualArea)
        assertFalse(state.backgroundLocationEnabled)
        assertFalse(state.currentLocationStored)
        assertTrue(locationEducation(SearchAreaMode.Manual).contains("without location permission"))
    }

    @Test
    fun `one time location education keeps background tracking off`() {
        val state = DiscoveryUiState(areaMode = SearchAreaMode.OneTimeLocation)

        assertFalse(state.backgroundLocationEnabled)
        assertFalse(state.currentLocationStored)
        assertTrue(locationEducation(state.areaMode).contains("Background tracking stays off"))
    }

    @Test
    fun `mobile provider is matched by service area and has no distance or public point`() {
        val provider = syntheticDiscoveryProviders.first {
            it.operatingModel == PublicOperatingModel.Mobile
        }

        assertNull(provider.publicPremises)
        assertNull(provider.distanceKm)
        assertEquals("Matched by service area", provider.distanceLabel())
        assertFalse(provider.containsPrivateCoordinates)
        assertFalse(provider.containsRealProviderData)
    }

    @Test
    fun `fixed and hybrid providers expose only synthetic public premises`() {
        val safeProviders = syntheticDiscoveryProviders.filter {
            it.operatingModel != PublicOperatingModel.Mobile
        }

        assertTrue(safeProviders.all { it.publicPremises != null })
        assertTrue(safeProviders.all { it.distanceKm != null })
        assertTrue(safeProviders.all { !it.containsPrivateCoordinates })
    }

    @Test
    fun `filters and deterministic ordering preserve public ids`() {
        val result = filteredSyntheticProviders(
            DiscoveryUiState(
                query = "Synthetic",
                availabilityOnly = true,
                claimFilter = "identity_checked",
            ),
        )

        assertEquals(2, result.size)
        assertEquals(
            listOf(
                "10000000-0000-4000-8000-000000005001",
                "10000000-0000-4000-8000-000000005003",
            ),
            result.map { it.publicId },
        )
    }

    @Test
    fun `image free and low bandwidth modes keep essential profile data`() {
        val noImageProvider = syntheticDiscoveryProviders.first { it.image.standardLabel == null }

        assertTrue(noImageProvider.displayName.isNotBlank())
        assertTrue(noImageProvider.claims.isNotEmpty())
        assertTrue(noImageProvider.serviceAreaLabel.isNotBlank())
        assertTrue(noImageProvider.sharePath.startsWith("/providers/"))
    }

    @Test
    fun `empty filters return no fabricated provider`() {
        val result = filteredSyntheticProviders(
            DiscoveryUiState(query = "Provider That Does Not Exist"),
        )

        assertTrue(result.isEmpty())
    }

    @Test
    fun `all claims retain explicit limitations and expiry labels`() {
        val claims = syntheticDiscoveryProviders.flatMap { it.claims }

        assertTrue(claims.all { it.limitation.isNotBlank() })
        assertTrue(claims.all { it.validUntilLabel.startsWith("Current until") })
        assertTrue(claims.none { it.statement.equals("Verified provider", ignoreCase = true) })
    }
}

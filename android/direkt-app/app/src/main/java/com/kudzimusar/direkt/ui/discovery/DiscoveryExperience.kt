package com.kudzimusar.direkt.ui.discovery

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun CustomerDiscoveryExperience() {
    var state by remember { mutableStateOf(DiscoveryUiState(onboardingComplete = true)) }
    val providers = filteredSyntheticProviders(state)

    LocationPermissionEducationCard(
        areaMode = state.areaMode,
        onAreaModeChange = { mode -> state = state.copy(areaMode = mode) },
    )
    SearchControls(
        state = state,
        onStateChange = { next -> state = next },
    )
    ViewModeSelector(
        selected = state.viewMode,
        onSelected = { viewMode -> state = state.copy(viewMode = viewMode) },
    )

    if (providers.isEmpty()) {
        NoResultsCard()
    } else if (state.viewMode == DiscoveryViewMode.List) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("discovery-list"),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            providers.forEach { provider ->
                PublicProviderResultCard(provider = provider, imageMode = state.imageMode)
            }
        }
    } else {
        SyntheticMapCard(providers = providers)
    }

    DiscoveryBoundaryCard()
}

@Composable
fun CustomerOnboardingExperience() {
    DiscoveryCard {
        Text("Find local services safely", style = MaterialTheme.typography.titleLarge)
        Text(
            "Choose an area and compare current scoped checks. DIREKT never needs continuous location to search.",
        )
        Text("1. Pick an area or use your current area once.")
        Text("2. Filter by service, availability and specific claim cards.")
        Text("3. Read what was checked, what was not checked and when each claim expires.")
        Text(
            "Manual search is always available.",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.tertiary,
        )
    }
}

@Composable
fun SavedProvidersExperience() {
    DiscoveryCard {
        Text("Saved providers", style = MaterialTheme.typography.titleLarge)
        val saved = syntheticDiscoveryProviders.filter { provider -> provider.saved }
        if (saved.isEmpty()) {
            Text("No saved providers yet. Saving is optional and uses only a public provider ID.")
        } else {
            saved.forEach { provider ->
                Text(provider.displayName, fontWeight = FontWeight.Bold)
                Text("${provider.category} · ${provider.locality}")
                Text("Share-safe path: ${provider.sharePath}")
                Text(
                    "No private address or evidence is included.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

@Composable
private fun LocationPermissionEducationCard(
    areaMode: SearchAreaMode,
    onAreaModeChange: (SearchAreaMode) -> Unit,
) {
    DiscoveryCard {
        Text("Search area", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SearchAreaMode.entries.forEach { mode ->
                FilterChip(
                    selected = areaMode == mode,
                    onClick = { onAreaModeChange(mode) },
                    label = { Text(mode.label) },
                )
            }
        }
        Text(locationEducation(areaMode), style = MaterialTheme.typography.bodySmall)
        Text(
            "Background location: Off",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.tertiary,
        )
    }
}

@Composable
private fun SearchControls(
    state: DiscoveryUiState,
    onStateChange: (DiscoveryUiState) -> Unit,
) {
    DiscoveryCard {
        Text("Discovery filters", style = MaterialTheme.typography.titleMedium)
        OutlinedTextField(
            value = state.manualArea,
            onValueChange = { value -> onStateChange(state.copy(manualArea = value)) },
            label = { Text("Area or landmark") },
            modifier = Modifier.fillMaxWidth(),
            supportingText = { Text("Works without device location") },
        )
        OutlinedTextField(
            value = state.query,
            onValueChange = { value -> onStateChange(state.copy(query = value)) },
            label = { Text("Provider or locality") },
            modifier = Modifier.fillMaxWidth(),
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text("Available now")
                Text("Synthetic availability only", style = MaterialTheme.typography.bodySmall)
            }
            Switch(
                checked = state.availabilityOnly,
                onCheckedChange = { checked -> onStateChange(state.copy(availabilityOnly = checked)) },
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = state.claimFilter == null,
                onClick = { onStateChange(state.copy(claimFilter = null)) },
                label = { Text("All current claims") },
            )
            FilterChip(
                selected = state.claimFilter == "identity_checked",
                onClick = { onStateChange(state.copy(claimFilter = "identity_checked")) },
                label = { Text("Identity checked") },
            )
        }
        Text("Image preference", style = MaterialTheme.typography.labelLarge)
        DiscoveryImageMode.entries.forEach { mode ->
            FilterChip(
                selected = state.imageMode == mode,
                onClick = { onStateChange(state.copy(imageMode = mode)) },
                label = { Text(mode.label) },
            )
        }
    }
}

@Composable
private fun ViewModeSelector(
    selected: DiscoveryViewMode,
    onSelected: (DiscoveryViewMode) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        DiscoveryViewMode.entries.forEach { mode ->
            FilterChip(
                selected = selected == mode,
                onClick = { onSelected(mode) },
                label = { Text(mode.label) },
            )
        }
    }
}

@Composable
private fun PublicProviderResultCard(
    provider: SyntheticPublicProvider,
    imageMode: DiscoveryImageMode,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                contentDescription =
                    "${provider.displayName}, ${provider.category}, ${provider.operatingModel.label}, ${provider.distanceLabel()}"
            }
            .testTag("provider-${provider.publicId}"),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(provider.displayName, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("${provider.category} · ${provider.operatingModel.label}")
            Text(provider.locality)
            Text(provider.distanceLabel(), fontWeight = FontWeight.SemiBold)
            Text("Availability: ${provider.availability}")

            val imageLabel = when (imageMode) {
                DiscoveryImageMode.LowBandwidth -> provider.image.lowBandwidthLabel
                DiscoveryImageMode.Standard -> provider.image.standardLabel ?: provider.image.lowBandwidthLabel
                DiscoveryImageMode.NoImages -> null
            }
            if (imageLabel != null) {
                Text(imageLabel)
                provider.image.altText?.let { altText ->
                    Text("Image description: $altText", style = MaterialTheme.typography.bodySmall)
                }
            } else {
                Text(
                    "Image-free profile — all essential information remains available.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }

            provider.reasons.forEach { reason ->
                AssistChip(onClick = {}, label = { Text(reason) })
            }
            provider.claims.forEach { claim ->
                ClaimSummary(claim)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = {}) { Text(if (provider.saved) "Saved" else "Save") }
                Button(onClick = {}) { Text("Share") }
            }
            Text(
                "Public ID only: ${provider.publicId}",
                style = MaterialTheme.typography.labelSmall,
            )
        }
    }
}

@Composable
private fun ClaimSummary(claim: PublicClaim) {
    Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(claim.statement, fontWeight = FontWeight.Bold)
            Text(claim.limitation, style = MaterialTheme.typography.bodySmall)
            Text(claim.validUntilLabel, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun SyntheticMapCard(providers: List<SyntheticPublicProvider>) {
    DiscoveryCard {
        Text("Synthetic privacy-safe map", style = MaterialTheme.typography.titleMedium)
        Text(
            "No map SDK or production coordinates are connected. Markers use consented public premises only; mobile providers show service areas.",
            style = MaterialTheme.typography.bodySmall,
        )
        providers.forEach { provider ->
            val marker = if (provider.publicPremises == null) {
                "Service area: ${provider.serviceAreaLabel}"
            } else {
                "Public premises marker in ${provider.locality}"
            }
            Text("• ${provider.displayName} — $marker")
        }
    }
}

@Composable
private fun NoResultsCard() {
    DiscoveryCard {
        Text("No matching providers", style = MaterialTheme.typography.titleMedium)
        Text("Try a nearby area or landmark.")
        Text("Remove one filter or increase the public-premises distance.")
        Text("Choose another active service category.")
        Text(
            "DIREKT does not invent providers to fill empty results.",
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun DiscoveryBoundaryCard() {
    DiscoveryCard {
        Text("Phase 5 discovery boundary", fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(4.dp))
        Text(
            "All providers, coordinates, images and availability states in this build are fictional. No real maps, customer location, public indexing or provider traffic is connected.",
        )
    }
}

@Composable
private fun DiscoveryCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            content = { content() },
        )
    }
}

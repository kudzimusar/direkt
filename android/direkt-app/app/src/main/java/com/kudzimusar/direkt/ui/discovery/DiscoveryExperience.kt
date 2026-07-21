package com.kudzimusar.direkt.ui.discovery

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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

    DiscoveryHero(
        state = state,
        onStateChange = { next -> state = next },
    )
    CategoryQuickPick(
        selected = state.category,
        onSelected = { category -> state = state.copy(category = category) },
    )
    LocationPermissionEducationCard(
        areaMode = state.areaMode,
        onAreaModeChange = { mode -> state = state.copy(areaMode = mode) },
    )
    FilterAndViewControls(
        state = state,
        onStateChange = { next -> state = next },
    )

    if (providers.isEmpty()) {
        NoResultsCard()
    } else if (state.viewMode == DiscoveryViewMode.List) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .testTag("discovery-list"),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            SectionHeading(
                eyebrow = "Providers",
                title = "Available for your search",
                detail = "Compare service fit, availability and the check information currently available.",
            )
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
    DiscoveryCard(container = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)) {
        Text("Find local services with clearer proof", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(
            "Choose an area, compare service fit and read each current check in context before you contact a provider.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text("1. Tell DIREKT what you need and where you need it.")
        Text("2. Compare providers by service area, availability and scoped check information.")
        Text("3. Read what each check means, when it is current and what it does not guarantee.")
        Text(
            "Manual area search is always available without background location.",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}

@Composable
fun SavedProvidersExperience() {
    DiscoveryCard {
        SectionHeading(
            eyebrow = "Shortlist",
            title = "Saved providers",
            detail = "Keep useful providers together while you compare services and current trust information.",
        )
        val saved = syntheticDiscoveryProviders.filter { provider -> provider.saved }
        if (saved.isEmpty()) {
            Text("No saved providers yet. Save a provider from Discover when you want to compare them later.")
        } else {
            saved.forEach { provider ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(5.dp),
                    ) {
                        Text(provider.displayName, fontWeight = FontWeight.Bold)
                        Text("${provider.category} · ${provider.locality}")
                        Text(provider.distanceLabel(), style = MaterialTheme.typography.bodySmall)
                        Text(
                            "Shared links use only the provider's public profile and never include private evidence or a private base address.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DiscoveryHero(
    state: DiscoveryUiState,
    onStateChange: (DiscoveryUiState) -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.62f),
        ),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            Text(
                text = "LOCAL HELP · CLEARER PROOF",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary,
            )
            Text(
                text = "What do you need help with?",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.ExtraBold,
            )
            Text(
                text = "Search a service, provider or area, then compare current check information before deciding.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            OutlinedTextField(
                value = state.query,
                onValueChange = { value -> onStateChange(state.copy(query = value)) },
                label = { Text("Service, provider or problem") },
                placeholder = { Text("e.g. plumber, leaking sink") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            OutlinedTextField(
                value = state.manualArea,
                onValueChange = { value -> onStateChange(state.copy(manualArea = value)) },
                label = { Text("Area or landmark") },
                supportingText = { Text("Works without sharing precise background location") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
            Button(onClick = { }, modifier = Modifier.fillMaxWidth()) {
                Text("Find providers")
            }
        }
    }
}

@Composable
private fun CategoryQuickPick(
    selected: String,
    onSelected: (String) -> Unit,
) {
    DiscoveryCard {
        SectionHeading(
            eyebrow = "Browse services",
            title = "Start with what you need",
            detail = "The current controlled catalogue is intentionally small while real category validation remains gated.",
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(
                selected = selected == "Plumbing",
                onClick = { onSelected("Plumbing") },
                label = { Text("Plumbing") },
            )
        }
    }
}

@Composable
private fun LocationPermissionEducationCard(
    areaMode: SearchAreaMode,
    onAreaModeChange: (SearchAreaMode) -> Unit,
) {
    DiscoveryCard {
        SectionHeading(
            eyebrow = "Search area",
            title = "Choose the location context",
            detail = "Use a manual area at any time, or use current location once when that capability is available.",
        )
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
            "Background location stays off",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}

@Composable
private fun FilterAndViewControls(
    state: DiscoveryUiState,
    onStateChange: (DiscoveryUiState) -> Unit,
) {
    DiscoveryCard {
        SectionHeading(
            eyebrow = "Refine",
            title = "Filters and view",
            detail = "Use filters to narrow the list without turning a missing check into a positive trust claim.",
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text("Available now", fontWeight = FontWeight.SemiBold)
                Text("Based on provider availability state", style = MaterialTheme.typography.bodySmall)
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
                label = { Text("All") },
            )
            FilterChip(
                selected = state.claimFilter == "identity_checked",
                onClick = { onStateChange(state.copy(claimFilter = "identity_checked")) },
                label = { Text("Identity checked") },
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            DiscoveryViewMode.entries.forEach { mode ->
                FilterChip(
                    selected = state.viewMode == mode,
                    onClick = { onStateChange(state.copy(viewMode = mode)) },
                    label = { Text(mode.label) },
                )
            }
        }
        Text("Image loading", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            DiscoveryImageMode.entries.forEach { mode ->
                FilterChip(
                    selected = state.imageMode == mode,
                    onClick = { onStateChange(state.copy(imageMode = mode)) },
                    label = { Text(mode.label) },
                )
            }
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
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = provider.category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        provider.displayName,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        "${provider.locality} · ${provider.operatingModel.label}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                AssistChip(onClick = {}, label = { Text(provider.availability) })
            }

            val imageLabel = when (imageMode) {
                DiscoveryImageMode.LowBandwidth -> provider.image.lowBandwidthLabel
                DiscoveryImageMode.Standard -> provider.image.standardLabel ?: provider.image.lowBandwidthLabel
                DiscoveryImageMode.NoImages -> null
            }
            if (imageLabel != null) {
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
                    ),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(3.dp),
                    ) {
                        Text("Work image preview", fontWeight = FontWeight.SemiBold)
                        Text(imageLabel, style = MaterialTheme.typography.bodySmall)
                        provider.image.altText?.let { altText ->
                            Text(
                                altText,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                provider.reasons.take(2).forEach { reason ->
                    AssistChip(onClick = {}, label = { Text(reason) })
                }
            }

            Text("What DIREKT can currently say", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
            provider.claims.take(2).forEach { claim ->
                ClaimSummary(claim)
            }

            Text(
                provider.distanceLabel(),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = {}) { Text(if (provider.saved) "Saved" else "Save") }
                Button(onClick = {}) { Text("View profile") }
            }
        }
    }
}

@Composable
private fun ClaimSummary(claim: PublicClaim) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.52f),
        ),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(Modifier.padding(13.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(claim.statement, fontWeight = FontWeight.Bold)
            Text(claim.validUntilLabel, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
            Text(claim.limitation, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun SyntheticMapCard(providers: List<SyntheticPublicProvider>) {
    DiscoveryCard(container = MaterialTheme.colorScheme.surfaceContainerLow) {
        SectionHeading(
            eyebrow = "Map",
            title = "Privacy-safe map preview",
            detail = "The approved Maps runtime is not active yet. This preview demonstrates the location rules without publishing private provider bases.",
        )
        providers.forEach { provider ->
            val marker = if (provider.publicPremises == null) {
                "Service area: ${provider.serviceAreaLabel}"
            } else {
                "Consented public premises in ${provider.locality}"
            }
            Text("• ${provider.displayName} — $marker", style = MaterialTheme.typography.bodySmall)
        }
        Text(
            "List view remains the accessible and low-bandwidth equivalent.",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.SemiBold,
        )
    }
}

@Composable
private fun NoResultsCard() {
    DiscoveryCard {
        SectionHeading(
            eyebrow = "No matches",
            title = "No matching providers yet",
            detail = "Try a nearby area, remove a filter or choose another active service. DIREKT does not invent providers to fill empty results.",
        )
    }
}

@Composable
private fun DiscoveryBoundaryCard() {
    // Phase 5 discovery boundary: historical source marker retained for regression evidence only.
    DiscoveryCard(container = MaterialTheme.colorScheme.surfaceContainerLow) {
        Text("Review environment", fontWeight = FontWeight.Bold)
        Text(
            "Provider names, imagery labels and availability in this Android review build are fictional. Real participant access, production Maps and live marketplace traffic remain separately gated.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun SectionHeading(
    eyebrow: String,
    title: String,
    detail: String,
) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(
            text = eyebrow.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.primary,
        )
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(
            detail,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun DiscoveryCard(
    container: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.surface,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = container),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp),
            content = { content() },
        )
    }
}

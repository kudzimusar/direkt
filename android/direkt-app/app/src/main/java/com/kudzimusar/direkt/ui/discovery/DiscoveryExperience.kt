package com.kudzimusar.direkt.ui.discovery

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.kudzimusar.direkt.ui.DirektNeighborhoodIllustration
import com.kudzimusar.direkt.ui.theme.DirektAmber
import com.kudzimusar.direkt.ui.theme.DirektAmberSoft
import com.kudzimusar.direkt.ui.theme.DirektBlue
import com.kudzimusar.direkt.ui.theme.DirektBlueSoft
import com.kudzimusar.direkt.ui.theme.DirektIndigo
import com.kudzimusar.direkt.ui.theme.DirektOrange
import com.kudzimusar.direkt.ui.theme.DirektOrangeSoft
import com.kudzimusar.direkt.ui.theme.DirektSuccess
import com.kudzimusar.direkt.ui.theme.DirektSuccessSoft
import com.kudzimusar.direkt.ui.theme.DirektTeal
import com.kudzimusar.direkt.ui.theme.DirektTealSoft
import com.kudzimusar.direkt.ui.theme.DirektViolet
import com.kudzimusar.direkt.ui.theme.DirektVioletSoft

@Composable
fun CustomerDiscoveryExperience() {
    var state by remember { mutableStateOf(DiscoveryUiState(onboardingComplete = true)) }
    val providers = filteredSyntheticProviders(state)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("customer-home"),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        DiscoveryHero(
            state = state,
            onStateChange = { next -> state = next },
        )
        CategoryQuickPick(
            selected = state.category,
            onSelected = { category -> state = state.copy(category = category) },
        )
        ProofPrincipleCard()
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
            PrivacySafeMapCard(providers = providers)
        }

        DiscoveryBoundaryCard()
    }
}

@Composable
fun CustomerOnboardingExperience() {
    DiscoveryCard(container = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)) {
        Text(
            "Find local services with clearer proof",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )
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
    val saved = syntheticDiscoveryProviders.filter { provider -> provider.saved }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("customer-saved"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Saved providers (${saved.size})",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Private shortlist",
                style = MaterialTheme.typography.labelMedium,
                color = DirektBlue,
            )
        }
        if (saved.isEmpty()) {
            DiscoveryCard {
                SectionHeading(
                    eyebrow = "Shortlist",
                    title = "Save providers to compare later",
                    detail = "Add providers from Home after reviewing their service fit and current check information.",
                )
            }
        } else {
            saved.forEachIndexed { index, provider ->
                SavedProviderCard(provider = provider, accentIndex = index)
            }
        }
        DiscoveryCard(container = DirektBlueSoft.copy(alpha = 0.55f)) {
            Text(
                text = "Your shortlist stays private",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Shared links include only public profile information and never private evidence or a private provider base address.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun SavedProviderCard(
    provider: SyntheticPublicProvider,
    accentIndex: Int,
) {
    val accents = listOf(
        Triple(DirektTeal, DirektTealSoft, "P"),
        Triple(DirektOrange, DirektOrangeSoft, "E"),
        Triple(DirektViolet, DirektVioletSoft, "M"),
        Triple(DirektBlue, DirektBlueSoft, "S"),
    )
    val (accent, container, fallbackLetter) = accents[accentIndex % accents.size]
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.Top,
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(
                        Brush.linearGradient(
                            listOf(container, accent.copy(alpha = 0.86f)),
                        ),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = provider.category.firstOrNull()?.uppercase() ?: fallbackLetter,
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    text = provider.displayName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = provider.category,
                    style = MaterialTheme.typography.bodyMedium,
                    color = accent,
                )
                Text(
                    text = "${provider.distanceLabel()} · ${provider.locality}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                LazyRow(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                    items(provider.claims.take(2)) { claim ->
                        StatusPill(
                            text = claim.statement,
                            foreground = accent,
                            background = container,
                        )
                    }
                }
                Text(
                    text = provider.availability,
                    style = MaterialTheme.typography.labelMedium,
                    color = DirektSuccess,
                )
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
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        listOf(
                            DirektBlueSoft.copy(alpha = 0.62f),
                            MaterialTheme.colorScheme.surface,
                            DirektOrangeSoft.copy(alpha = 0.48f),
                        ),
                    ),
                )
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Surface(
                shape = CircleShape,
                color = DirektBlueSoft,
                contentColor = DirektBlue,
            ) {
                Text(
                    text = "Local help, with clearer proof",
                    modifier = Modifier.padding(horizontal = 13.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelLarge,
                )
            }
            Text(
                text = "What do you need help with?",
                style = MaterialTheme.typography.displaySmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Describe the job in your own words or choose a service. Compare local providers using current, check-specific trust information.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            DirektNeighborhoodIllustration(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
            )
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    OutlinedTextField(
                        value = state.query,
                        onValueChange = { value -> onStateChange(state.copy(query = value)) },
                        label = { Text("Service or problem") },
                        placeholder = { Text("e.g. leaking sink, electrician, repair") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("customer-home-service-input"),
                        shape = RoundedCornerShape(16.dp),
                        colors = livelyFieldColors(),
                        singleLine = true,
                    )
                    OutlinedTextField(
                        value = state.manualArea,
                        onValueChange = { value -> onStateChange(state.copy(manualArea = value)) },
                        label = { Text("Area or landmark") },
                        placeholder = { Text("e.g. Kabwata, Roma, City Centre") },
                        supportingText = { Text("Works without sharing precise background location") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("customer-home-area-input"),
                        shape = RoundedCornerShape(16.dp),
                        colors = livelyFieldColors(),
                        singleLine = true,
                    )
                    Button(
                        onClick = { },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .testTag("customer-home-find-providers"),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = DirektBlue),
                    ) {
                        Text(
                            text = "Find providers  →",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun livelyFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = DirektBlue,
    focusedLabelColor = DirektBlue,
    cursorColor = DirektBlue,
    unfocusedBorderColor = MaterialTheme.colorScheme.outline,
)

@Composable
private fun CategoryQuickPick(
    selected: String,
    onSelected: (String) -> Unit,
) {
    val categories = syntheticDiscoveryProviders
        .map { it.category }
        .distinct()
        .take(6)
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "Popular services",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Current catalogue",
                style = MaterialTheme.typography.labelMedium,
                color = DirektBlue,
            )
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            items(categories) { category ->
                val index = categories.indexOf(category)
                val palette = categoryPalette(index)
                Surface(
                    onClick = { onSelected(category) },
                    shape = CircleShape,
                    color = if (selected == category) palette.first.copy(alpha = 0.2f) else palette.second,
                    contentColor = palette.first,
                    border = CardDefaults.outlinedCardBorder(),
                ) {
                    Text(
                        text = category,
                        modifier = Modifier.padding(horizontal = 15.dp, vertical = 11.dp),
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            }
        }
    }
}

private fun categoryPalette(index: Int): Pair<Color, Color> = when (index % 4) {
    0 -> DirektBlue to DirektBlueSoft
    1 -> DirektTeal to DirektTealSoft
    2 -> DirektOrange to DirektOrangeSoft
    else -> DirektViolet to DirektVioletSoft
}

@Composable
private fun ProofPrincipleCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Row(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFFEEF2FF), Color(0xFFF4EEFF), Color(0xFFFFF1EA)),
                    ),
                )
                .padding(18.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.82f)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "✓",
                    color = DirektBlue,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text(
                    text = "Proof before persuasion",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10245D),
                )
                Text(
                    text = "Trust information is check-specific. Payment or subscription never upgrades a provider's trust status.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF385286),
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
        SectionHeading(
            eyebrow = "Search area",
            title = "Choose the location context",
            detail = "Use a manual area at any time, or use current location once when that capability is available.",
        )
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(SearchAreaMode.entries) { mode ->
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
            color = DirektTeal,
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
            detail = "Narrow the list without turning a missing check into a positive trust claim.",
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Available now", fontWeight = FontWeight.SemiBold)
                Text(
                    "Based on provider availability state",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Switch(
                checked = state.availabilityOnly,
                onCheckedChange = { checked -> onStateChange(state.copy(availabilityOnly = checked)) },
            )
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                FilterChip(
                    selected = state.claimFilter == null,
                    onClick = { onStateChange(state.copy(claimFilter = null)) },
                    label = { Text("All checks") },
                )
            }
            item {
                FilterChip(
                    selected = state.claimFilter == "identity_checked",
                    onClick = { onStateChange(state.copy(claimFilter = "identity_checked")) },
                    label = { Text("Identity checked") },
                )
            }
        }
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(DiscoveryViewMode.entries) { mode ->
                FilterChip(
                    selected = state.viewMode == mode,
                    onClick = { onStateChange(state.copy(viewMode = mode)) },
                    label = { Text(mode.label) },
                )
            }
        }
        Text("Image loading", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(DiscoveryImageMode.entries) { mode ->
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
            verticalArrangement = Arrangement.spacedBy(11.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                listOf(DirektBlueSoft, DirektBlue.copy(alpha = 0.88f)),
                            ),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = provider.category.firstOrNull()?.uppercase() ?: "D",
                        color = Color.White,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = provider.category.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = DirektBlue,
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
                StatusPill(
                    text = provider.availability,
                    foreground = DirektSuccess,
                    background = DirektSuccessSoft,
                )
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
                        Text("Public work image", fontWeight = FontWeight.SemiBold)
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

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(provider.reasons.take(2)) { reason ->
                    StatusPill(
                        text = reason,
                        foreground = DirektBlue,
                        background = DirektBlueSoft,
                    )
                }
            }

            Text(
                "What DIREKT can currently say",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
            )
            provider.claims.take(2).forEach { claim ->
                ClaimSummary(claim)
            }

            Text(
                provider.distanceLabel(),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = {},
                    colors = ButtonDefaults.buttonColors(containerColor = DirektBlueSoft, contentColor = DirektBlue),
                ) {
                    Text(if (provider.saved) "Saved" else "Save")
                }
                Button(
                    onClick = {},
                    colors = ButtonDefaults.buttonColors(containerColor = DirektBlue),
                ) {
                    Text("View profile")
                }
            }
        }
    }
}

@Composable
private fun StatusPill(
    text: String,
    foreground: Color,
    background: Color,
) {
    Surface(
        shape = CircleShape,
        color = background,
        contentColor = foreground,
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1,
        )
    }
}

@Composable
private fun ClaimSummary(claim: PublicClaim) {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = DirektBlueSoft.copy(alpha = 0.58f),
        ),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(Modifier.padding(13.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(claim.statement, fontWeight = FontWeight.Bold)
            Text(
                claim.validUntilLabel,
                style = MaterialTheme.typography.labelSmall,
                color = DirektBlue,
            )
            Text(
                claim.limitation,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
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
    Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(
            text = eyebrow.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = DirektBlue,
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
    container: Color = MaterialTheme.colorScheme.surface,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = container),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            content = { content() },
        )
    }
}

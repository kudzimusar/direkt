package com.kudzimusar.direkt.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.kudzimusar.direkt.ui.discovery.CustomerDiscoveryExperience
import com.kudzimusar.direkt.ui.discovery.CustomerOnboardingExperience
import com.kudzimusar.direkt.ui.discovery.SavedProvidersExperience
import com.kudzimusar.direkt.ui.provider.ProviderDraft
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceExperience
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceSection
import com.kudzimusar.direkt.ui.provider.syntheticProviderDraft

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DirektApp(
    appState: DirektAppState = rememberDirektAppState(),
) {
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("foundation-root"),
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("DIREKT", fontWeight = FontWeight.Bold)
                        Text(
                            text = "Phase 6 — synthetic provider workspace",
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            )
        },
        bottomBar = {
            NavigationBar {
                DirektDestination.entries.forEach { destination ->
                    NavigationBarItem(
                        selected = appState.destination == destination,
                        onClick = { appState.navigate(destination) },
                        icon = { Text(destination.label.take(1), fontWeight = FontWeight.Bold) },
                        label = { Text(destination.label) },
                    )
                }
            }
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ModeSelector(
                    selectedMode = appState.mode,
                    onModeSelected = appState::switchMode,
                )
            }
            item {
                Text(
                    text = screenTitle(appState),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                )
            }
            item {
                Text(
                    text = screenSummary(appState),
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }

            if (appState.mode == DirektMode.Customer) {
                when (appState.destination) {
                    DirektDestination.Discover -> item { CustomerDiscoveryExperience() }
                    DirektDestination.Saved -> item { SavedProvidersExperience() }
                    DirektDestination.Account -> item { CustomerOnboardingExperience() }
                    DirektDestination.Enquiries -> item {
                        PlaceholderCard(
                            title = "Enquiries begin in Phase 8",
                            body = "Phase 6 retains discovery, saves and share-safe metadata only. No provider contact is exposed.",
                        )
                    }
                }
            } else {
                when (appState.destination) {
                    DirektDestination.Discover -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Dashboard)
                    }
                    DirektDestination.Saved -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Evidence)
                    }
                    DirektDestination.Enquiries -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Timeline)
                    }
                    DirektDestination.Account -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Profile)
                    }
                }
            }
        }
    }
}

@Composable
private fun ModeSelector(
    selectedMode: DirektMode,
    onModeSelected: (DirektMode) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(text = "Synthetic preview mode", style = MaterialTheme.typography.labelLarge)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            DirektMode.entries.forEach { mode ->
                FilterChip(
                    selected = selectedMode == mode,
                    onClick = { onModeSelected(mode) },
                    label = { Text(mode.label) },
                )
            }
        }
        Text(
            text = "Mode is a presentation context only. Backend identity, role, provider, case and publication policy remain authoritative.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ProviderDraftCard(draft: ProviderDraft) {
    FoundationCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(draft.displayName, style = MaterialTheme.typography.titleMedium)
                Text("${draft.pathway.label} · ${draft.operatingModel.label}")
            }
            Text(draft.status.label, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(12.dp))
        Text("Locality: ${draft.localitySummary ?: "Mobile service only"}")
        Text("Service area: ${draft.serviceAreaSummary}")
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            draft.categoryNames.forEach { category ->
                AssistChip(onClick = {}, label = { Text("$category · v1") })
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Public publication is policy-controlled",
            color = MaterialTheme.colorScheme.tertiary,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "A provider draft, payment or client action cannot create a discovery listing. Search consumes only eligible safe projections.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ProviderBoundaryCard() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("Provider trust boundary", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(
                "No real evidence, private address, production storage, map credential, payment, regulator or public traffic is connected.",
            )
        }
    }
}

@Composable
private fun PlaceholderCard(
    title: String,
    body: String,
) {
    FoundationCard {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text(body)
    }
}

@Composable
private fun FoundationCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = { content() },
        )
    }
}

private fun screenTitle(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover -> "Find a provider"
        DirektDestination.Saved -> "Saved providers"
        DirektDestination.Enquiries -> "Enquiries"
        DirektDestination.Account -> "Customer onboarding"
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Provider workspace"
        DirektDestination.Saved -> "Private evidence uploads"
        DirektDestination.Enquiries -> "Verification timeline"
        DirektDestination.Account -> "Profile, services and availability"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer ->
        "Search fictional, policy-eligible providers using manual area or a one-time location model."
    DirektMode.Provider ->
        "Manage a fictional actor-scoped workspace with private evidence recovery, safe verification progress and independent availability."
}

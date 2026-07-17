package com.kudzimusar.direkt.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
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
import com.kudzimusar.direkt.ui.commercial.ProviderCommercialExperience
import com.kudzimusar.direkt.ui.discovery.CustomerDiscoveryExperience
import com.kudzimusar.direkt.ui.discovery.CustomerOnboardingExperience
import com.kudzimusar.direkt.ui.discovery.SavedProvidersExperience
import com.kudzimusar.direkt.ui.interaction.CustomerInteractionExperience
import com.kudzimusar.direkt.ui.interaction.ProviderInteractionExperience
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceExperience
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceSection

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
                            text = "Phase 9 — synthetic commercial foundation",
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
                    DirektDestination.Enquiries -> item { CustomerInteractionExperience() }
                }
            } else {
                when (appState.destination) {
                    DirektDestination.Discover -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Dashboard)
                    }
                    DirektDestination.Saved -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Evidence)
                    }
                    DirektDestination.Enquiries -> item { ProviderInteractionExperience() }
                    DirektDestination.Account -> item {
                        ProviderWorkspaceExperience(ProviderWorkspaceSection.Profile)
                    }
                }
                if (appState.destination == DirektDestination.Account) {
                    item { ProviderCommercialExperience() }
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
            text = "Mode is presentation context only. Backend identity, role, provider, publication, interaction, review and commercial policy remain authoritative.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

private fun screenTitle(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover -> "Find a provider"
        DirektDestination.Saved -> "Saved providers"
        DirektDestination.Enquiries -> "Enquiries and reviews"
        DirektDestination.Account -> "Customer onboarding"
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Provider workspace"
        DirektDestination.Saved -> "Private evidence uploads"
        DirektDestination.Enquiries -> "Enquiry inbox and review responses"
        DirektDestination.Account -> "Profile, services and subscription"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> if (appState.destination == DirektDestination.Enquiries) {
        "Track bounded service requests, time-limited contact consent, private history, eligible reviews and appeals."
    } else {
        "Search fictional, policy-eligible providers using manual area or a one-time location model."
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Enquiries ->
            "Respond inside the actor-resolved provider scope with optimistic revisions and one bounded review response."
        DirektDestination.Account ->
            "Manage profile and synthetic commercial state with retry-safe payments, immutable invoices and no trust or ranking effect."
        else ->
            "Manage a fictional actor-scoped workspace with private evidence recovery, safe verification progress and independent availability."
    }
}

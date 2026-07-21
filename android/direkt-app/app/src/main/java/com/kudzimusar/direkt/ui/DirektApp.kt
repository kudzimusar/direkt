package com.kudzimusar.direkt.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.kudzimusar.direkt.ui.auth.PilotAuthenticationExperience
import com.kudzimusar.direkt.ui.commercial.ProviderCommercialExperience
import com.kudzimusar.direkt.ui.discovery.CustomerDiscoveryExperience
import com.kudzimusar.direkt.ui.discovery.CustomerOnboardingExperience
import com.kudzimusar.direkt.ui.discovery.SavedProvidersExperience
import com.kudzimusar.direkt.ui.interaction.CustomerInteractionExperience
import com.kudzimusar.direkt.ui.interaction.ProviderInteractionExperience
import com.kudzimusar.direkt.ui.provider.ProviderWorkspaceSection
import com.kudzimusar.direkt.ui.provider.WorldClassProviderWorkspaceExperience

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
                        Text(
                            text = "DIREKT",
                            fontWeight = FontWeight.ExtraBold,
                            style = MaterialTheme.typography.titleLarge,
                        )
                        Text(
                            text = "Local services. Clearer proof.",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
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
                        icon = { DirektNavigationIcon(destination) },
                        label = { Text(destinationLabel(appState.mode, destination)) },
                    )
                }
            }
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                ModeSelector(
                    selectedMode = appState.mode,
                    onModeSelected = appState::switchMode,
                )
            }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = screenTitle(appState),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.ExtraBold,
                    )
                    Text(
                        text = screenSummary(appState),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            if (appState.destination != DirektDestination.Discover) {
                item { TrustPrincipleCard() }
            }
            if (appState.destination == DirektDestination.Account) {
                item { PilotAuthenticationExperience() }
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
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Dashboard)
                    }
                    DirektDestination.Saved -> item {
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Evidence)
                    }
                    DirektDestination.Enquiries -> item { ProviderInteractionExperience() }
                    DirektDestination.Account -> item {
                        WorldClassProviderWorkspaceExperience(ProviderWorkspaceSection.Profile)
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
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceContainerLow,
        ),
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = "Use DIREKT as",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.SemiBold,
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
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
                text = "Switching views does not change your account permissions. Provider access and trust decisions remain controlled by DIREKT.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun TrustPrincipleCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.55f),
        ),
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = "Proof before persuasion",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                text = "Trust information is shown check by check. A payment or subscription never upgrades a provider's trust status.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

private fun destinationLabel(mode: DirektMode, destination: DirektDestination): String =
    if (mode == DirektMode.Customer) {
        destination.label
    } else {
        when (destination) {
            DirektDestination.Discover -> "Overview"
            DirektDestination.Saved -> "Evidence"
            DirektDestination.Enquiries -> "Enquiries"
            DirektDestination.Account -> "Account"
        }
    }

private fun screenTitle(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover -> "Find the right local service"
        DirektDestination.Saved -> "Your shortlist"
        DirektDestination.Enquiries -> "Your service requests"
        DirektDestination.Account -> "Account and privacy"
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Run your service business"
        DirektDestination.Saved -> "Checks and evidence"
        DirektDestination.Enquiries -> "Customer enquiries"
        DirektDestination.Account -> "Business account"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> when (appState.destination) {
        DirektDestination.Discover ->
            "Search by what you need and where you need it, then compare providers using clear, check-specific trust information."
        DirektDestination.Saved ->
            "Keep promising providers together so you can compare services, availability and current trust information."
        DirektDestination.Enquiries ->
            "Follow service requests, provider responses, consent-aware contact handoffs and eligible review activity."
        DirektDestination.Account ->
            "Manage sign-in, consent and security while provider trust remains independently controlled."
    }
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover ->
            "See what needs attention, keep your services current and understand what customers can see."
        DirektDestination.Saved ->
            "Understand each requirement, track review progress and fix action-required items without exposing private evidence."
        DirektDestination.Enquiries ->
            "Respond to structured customer requests and keep tracked interactions moving."
        DirektDestination.Account ->
            "Manage your business profile, security and commercial settings while trust decisions remain independent."
    }
}

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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

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
                            text = "Foundation build — synthetic data only",
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

            if (appState.mode == DirektMode.Customer && appState.destination == DirektDestination.Discover) {
                item { DiscoveryCard() }
                item { ProviderCard() }
                item { TrustBoundaryCard() }
            } else if (appState.mode == DirektMode.Provider) {
                item { ProviderFoundationCard() }
                item { VerificationProgressCard() }
            } else {
                item { PlaceholderCard(appState.destination.label) }
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
        Text(
            text = "Preview mode",
            style = MaterialTheme.typography.labelLarge,
        )
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
            text = "Mode switching is a visual foundation only. Authorization is not implemented.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun DiscoveryCard() {
    FoundationCard {
        Text("Find trusted local services", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("Lusaka District · Woodlands selected")
        Spacer(Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            AssistChip(onClick = {}, label = { Text("Plumbing") })
            AssistChip(onClick = {}, label = { Text("Electrical") })
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = "The production app will support area, landmark, pin and optional Plus Code search without requiring precise location permission.",
            style = MaterialTheme.typography.bodySmall,
        )
    }
}

@Composable
private fun ProviderCard() {
    FoundationCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text("Mwamba Water Works", style = MaterialTheme.typography.titleMedium)
                Text("Mobile plumber · synthetic profile")
            }
            Text("2.4 km", fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(12.dp))
        Text("Phone confirmed", color = MaterialTheme.colorScheme.primary)
        Text("Identity reviewed", color = MaterialTheme.colorScheme.primary)
        Text("Qualification not supplied", color = MaterialTheme.colorScheme.tertiary)
        Spacer(Modifier.height(8.dp))
        Text(
            text = "DIREKT does not guarantee workmanship, safety or the outcome of a future service.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun TrustBoundaryCard() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("Trust boundary", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(
                "This build contains no backend, real provider, document upload, verification decision, payment or regulator connection.",
            )
        }
    }
}

@Composable
private fun ProviderFoundationCard() {
    FoundationCard {
        Text("Provider workspace foundation", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("Create a profile, choose a fixed/mobile/hybrid operating model and review category-specific evidence requirements.")
        Spacer(Modifier.height(8.dp))
        Text(
            "All content is synthetic. Account identity and role authorization will be implemented in a later phase.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun VerificationProgressCard() {
    FoundationCard {
        Text("Verification progress", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("Contact details · Not started")
        Text("Identity evidence · Not started")
        Text("Operating location · Not started")
        Text("Category evidence · Not started")
    }
}

@Composable
private fun PlaceholderCard(destination: String) {
    FoundationCard {
        Text("$destination foundation", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("The navigation boundary is present, but this feature is intentionally not implemented in Phase 2A.")
    }
}

@Composable
private fun FoundationCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = { content() },
        )
    }
}

private fun screenTitle(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> appState.destination.label
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Provider overview"
        DirektDestination.Saved -> "Provider profile"
        DirektDestination.Enquiries -> "Provider enquiries"
        DirektDestination.Account -> "Provider account"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> "Customer-facing navigation and trust presentation foundation."
    DirektMode.Provider -> "Provider-facing onboarding and verification-state foundation."
}

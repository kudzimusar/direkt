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
import com.kudzimusar.direkt.ui.provider.ProviderDraft
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
                            text = "Phase 3 — synthetic provider drafts only",
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
                item { NoPublicDirectoryCard() }
                item { TrustBoundaryCard() }
            } else if (appState.mode == DirektMode.Provider) {
                item { ProviderDraftCard(syntheticProviderDraft) }
                item { CategoryRequirementsCard() }
                item { TrustBoundaryCard() }
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
            text = "Production access is resolved by backend identity, session, role and provider scope. This switch grants no permission.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun NoPublicDirectoryCard() {
    FoundationCard {
        Text("Provider discovery is intentionally unavailable", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("Phase 3 creates private provider drafts and category contracts. It cannot publish a provider.")
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Customer discovery begins only after Phase 4 derives approved claims from privately reviewed evidence.",
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
            text = "Publicly discoverable: No",
            color = MaterialTheme.colorScheme.tertiary,
            fontWeight = FontWeight.Bold,
        )
        Text(
            text = "Profile fields are self-asserted draft data, not DIREKT verification or a workmanship guarantee.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun CategoryRequirementsCard() {
    FoundationCard {
        Text("Plumbing requirement version 1", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("Identity evidence · required later")
        Text("Experience or qualification · required later")
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Activated category versions are immutable. Evidence upload and review start in Phase 4.",
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
            Text("Phase 3 trust boundary", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(
                "No real provider data, evidence, verification decision, public listing, payment, map, regulator or production credential is connected.",
            )
        }
    }
}

@Composable
private fun PlaceholderCard(destination: String) {
    FoundationCard {
        Text("$destination foundation", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(8.dp))
        Text("This destination remains outside the bounded Phase 3 provider and category vertical slice.")
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
    DirektMode.Customer -> appState.destination.label
    DirektMode.Provider -> when (appState.destination) {
        DirektDestination.Discover -> "Provider overview"
        DirektDestination.Saved -> "Provider profile"
        DirektDestination.Enquiries -> "Provider representatives"
        DirektDestination.Account -> "Provider draft"
    }
}

private fun screenSummary(appState: DirektAppState): String = when (appState.mode) {
    DirektMode.Customer -> "Customer discovery remains blocked until evidence-derived publication exists."
    DirektMode.Provider -> "Prepare a private provider draft, operating model and versioned category selection."
}
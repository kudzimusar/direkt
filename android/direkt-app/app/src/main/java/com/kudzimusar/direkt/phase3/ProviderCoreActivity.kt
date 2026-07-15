package com.kudzimusar.direkt.phase3

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

/** Internal synthetic-only Phase 3 surface. It is not exported and performs no network access. */
class ProviderCoreActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                ProviderCoreScreen(drafts = syntheticProviderDrafts)
            }
        }
    }
}

@Composable
fun ProviderCoreScreen(
    drafts: List<ProviderDraftUiState>,
    modifier: Modifier = Modifier,
) {
    Scaffold(modifier = modifier.fillMaxSize()) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Phase 3 · synthetic provider core",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.semantics { heading() },
                    )
                    Text(
                        text = "Fictional provider drafts only. Profile completion does not create verification, trust claims, or public discovery.",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Surface(
                        color = MaterialTheme.colorScheme.errorContainer,
                        shape = MaterialTheme.shapes.medium,
                    ) {
                        Text(
                            text = "Publication blocked in Phase 3",
                            modifier = Modifier.padding(12.dp),
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }
            }
            items(drafts, key = { it.providerId }) { draft ->
                ProviderDraftCard(draft)
            }
        }
    }
}

@Composable
private fun ProviderDraftCard(draft: ProviderDraftUiState) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(draft.displayName, style = MaterialTheme.typography.titleMedium)
            Text(draft.pathway.label)
            Text("Operating model: ${draft.operatingModel.label}")
            Text("Categories: ${draft.categories.joinToString().ifBlank { "None selected" }}")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("State: ${draft.profileState.name.lowercase()}")
                Text("Discovery: blocked", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

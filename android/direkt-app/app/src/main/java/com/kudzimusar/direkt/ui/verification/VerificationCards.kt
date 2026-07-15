package com.kudzimusar.direkt.ui.verification

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun VerificationTimelineCard(
    verificationCase: SyntheticVerificationCase = syntheticVerificationCase,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Column(Modifier.fillMaxWidth()) {
                Text(
                    text = verificationCase.checkName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    text = verificationCase.requirementVersion,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            AssistChip(
                onClick = {},
                label = { Text(verificationCase.caseState.label) },
            )
            verificationCase.evidenceVersions.forEach { version ->
                Column {
                    Text(
                        text = "Evidence version ${version.version} · ${version.state.label}",
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = version.documentType,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
            }
            Spacer(Modifier.height(2.dp))
            verificationCase.timeline.forEach { item ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(item.title, fontWeight = FontWeight.SemiBold)
                        Text(
                            item.detail,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Text(
                        item.state.label,
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
            Text(
                text = "Original evidence is private and is never shown in this synthetic build.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.tertiary,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
fun ScopedClaimCardView(
    claim: ScopedClaimCard = requireNotNull(syntheticVerificationCase.claim),
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Scoped claim card", style = MaterialTheme.typography.labelLarge)
            Text(
                claim.statement,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            Text(claim.limitation, style = MaterialTheme.typography.bodyMedium)
            Text(
                text = "Current state: ${claim.effectiveState(System.currentTimeMillis())}",
                style = MaterialTheme.typography.bodySmall,
            )
            Text(
                text = "A claim is derived from a specific decision and expires automatically. It is not a blanket provider guarantee.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
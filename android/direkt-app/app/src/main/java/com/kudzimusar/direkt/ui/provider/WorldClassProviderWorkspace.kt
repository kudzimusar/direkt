package com.kudzimusar.direkt.ui.provider

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun WorldClassProviderWorkspaceExperience(
    section: ProviderWorkspaceSection,
    workspace: ProviderWorkspaceSnapshot = syntheticProviderWorkspace,
) {
    when (section) {
        ProviderWorkspaceSection.Dashboard -> WorldClassProviderDashboard(workspace)
        ProviderWorkspaceSection.Profile -> WorldClassProviderProfile(workspace)
        ProviderWorkspaceSection.Evidence,
        ProviderWorkspaceSection.Timeline,
        -> ProviderWorkspaceExperience(section = section, workspace = workspace)
    }
}

@Composable
private fun WorldClassProviderDashboard(workspace: ProviderWorkspaceSnapshot) {
    Column(
        modifier = Modifier.testTag("provider-workspace-dashboard"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(26.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.58f),
            ),
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "YOUR BUSINESS",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.ExtraBold,
                        )
                        Text(
                            text = workspace.displayName,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.ExtraBold,
                        )
                        Text(
                            text = "${workspace.localitySummary} · ${workspace.operatingModel}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    AssistChip(onClick = {}, label = { Text(workspace.availability.substringBefore(" ·")) })
                }

                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Profile readiness", fontWeight = FontWeight.SemiBold)
                        Text("${workspace.readiness.completionPercent}%", fontWeight = FontWeight.Bold)
                    }
                    LinearProgressIndicator(
                        progress = { workspace.readiness.completionPercent / 100f },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Text(
                        "Readiness helps you complete setup. It is not a trust score and cannot make a service discoverable by itself.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    BusinessMetric(
                        modifier = Modifier.weight(1f),
                        value = workspace.readiness.selectedServices.toString(),
                        label = "Services",
                    )
                    BusinessMetric(
                        modifier = Modifier.weight(1f),
                        value = workspace.readiness.currentClaims.toString(),
                        label = "Current checks",
                    )
                    BusinessMetric(
                        modifier = Modifier.weight(1f),
                        value = workspace.readiness.correctionsRequired.toString(),
                        label = "Need action",
                    )
                }
            }
        }

        SectionHeading(
            eyebrow = "Next actions",
            title = "What needs attention",
            detail = "Complete the highest-priority tasks first. Trust and publication remain separate backend decisions.",
        )
        workspace.tasks.sortedBy { it.priority }.forEach { task ->
            TaskCard(task)
        }

        SectionHeading(
            eyebrow = "Service presence",
            title = "What customers can understand",
            detail = "Keep service area, availability and public-safe location context useful without exposing your private base.",
        )
        LocationCard(workspace.location)
        InfoCard(
            title = "Availability",
            value = workspace.availability,
            detail = "Availability helps customers decide when to contact you. It never upgrades a trust check or ranking authority.",
        )
        TrustBoundaryCard(workspace.trustBoundary)
    }
}

@Composable
private fun WorldClassProviderProfile(workspace: ProviderWorkspaceSnapshot) {
    Column(
        modifier = Modifier.testTag("provider-profile-workspace"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        SectionHeading(
            eyebrow = "Business profile",
            title = "How customers see you",
            detail = "Keep your public service identity clear while private evidence and trust decisions stay separate.",
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(workspace.displayName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                ProfileFact("Service", workspace.selectedService.substringBefore(" ·"))
                ProfileFact("How you work", workspace.operatingModel)
                ProfileFact("Main locality", workspace.localitySummary)
                Text(
                    "Completing this profile does not create verification or publication eligibility.",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }
        LocationCard(workspace.location)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceContainerLow),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text("Commercial features", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                workspace.deferredSurfaces.forEach { surface ->
                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Text(surface.label, fontWeight = FontWeight.SemiBold)
                        Text(
                            surface.state,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                Text(
                    "Paid features remain visually and operationally separate from trust checks.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
        TrustBoundaryCard(workspace.trustBoundary)
    }
}

@Composable
private fun BusinessMetric(
    value: String,
    label: String,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f)),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun TaskCard(task: ProviderWorkspaceTask) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Row(
            modifier = Modifier.padding(15.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(task.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Text(task.detail, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            AssistChip(onClick = {}, label = { Text(task.state.label) })
        }
    }
}

@Composable
private fun LocationCard(location: ProviderWorkspaceLocationBoundary) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("Location and privacy", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(location.safeSummary)
            location.publicLocality?.let { locality ->
                ProfileFact("Public locality", locality)
            }
            Text(
                "Private base, consented public premises and service area are separate. Exact private coordinates are never shown here.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun InfoCard(
    title: String,
    value: String,
    detail: String,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(5.dp),
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text(value, fontWeight = FontWeight.SemiBold)
            Text(detail, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun TrustBoundaryCard(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.55f),
        ),
    ) {
        Column(
            modifier = Modifier.padding(15.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text("Trust stays independent", fontWeight = FontWeight.Bold)
            Text(message, style = MaterialTheme.typography.bodySmall)
            Text(
                "No payment, profile edit or availability change can create a check result.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun ProfileFact(label: String, value: String) {
    Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
        Text(label.uppercase(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, fontWeight = FontWeight.SemiBold)
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
            eyebrow.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.primary,
        )
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(detail, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

package com.kudzimusar.direkt.ui.provider

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ProviderWorkspaceExperience(
    section: ProviderWorkspaceSection,
    workspace: ProviderWorkspaceSnapshot = syntheticProviderWorkspace,
) {
    when (section) {
        ProviderWorkspaceSection.Dashboard -> ProviderDashboard(workspace)
        ProviderWorkspaceSection.Evidence -> ProviderEvidenceWorkspace(workspace)
        ProviderWorkspaceSection.Timeline -> ProviderVerificationTimeline(workspace)
        ProviderWorkspaceSection.Profile -> ProviderProfileWorkspace(workspace)
    }
}

@Composable
private fun ProviderDashboard(workspace: ProviderWorkspaceSnapshot) {
    Column(
        modifier = Modifier.testTag("provider-workspace-dashboard"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        ProviderCard {
            Text(workspace.displayName, style = MaterialTheme.typography.titleLarge)
            Text("${workspace.representativeRole} · ${workspace.operatingModel}")
            Spacer(Modifier.height(8.dp))
            Text(
                "Workspace readiness ${workspace.readiness.completionPercent}%",
                fontWeight = FontWeight.Bold,
            )
            Text(
                "${workspace.readiness.evidenceSubmitted}/${workspace.readiness.mandatoryRequirements} required evidence records submitted",
            )
            Text("${workspace.readiness.correctionsRequired} correction required")
            Text("${workspace.readiness.currentClaims} current scoped claims")
        }

        Text("Priority tasks", style = MaterialTheme.typography.titleMedium)
        workspace.tasks.sortedBy { it.priority }.forEach { task ->
            ProviderTaskCard(task)
        }

        ProviderLocationBoundaryCard(workspace.location)

        ProviderCard {
            Text("Availability", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text(workspace.availability)
            Text(
                "Availability is operational metadata only. It cannot create a claim or improve trust ranking.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        ProviderTrustBoundary(workspace.trustBoundary)
    }
}

@Composable
private fun ProviderEvidenceWorkspace(workspace: ProviderWorkspaceSnapshot) {
    val context = LocalContext.current
    val store = remember(context.applicationContext) {
        ProviderUploadRecoveryStore(
            persistence = SharedPreferencesProviderUploadPersistence(context.applicationContext),
        )
    }
    var upload by remember { mutableStateOf(store.current()) }

    Column(
        modifier = Modifier.testTag("provider-evidence-workspace"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        ProviderCard {
            Text("Private evidence capture", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(6.dp))
            Text("Case: representative identity check")
            Text("Requirement: Identity evidence · Plumbing v1")
            Text(
                "Original files, object keys and reviewer notes remain outside this screen.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        ProviderUploadRecoveryCard(
            snapshot = upload,
            onStart = {
                upload = if (upload.isTerminal) {
                    store.reset()
                    store.start("Identity evidence")
                } else {
                    store.start("Identity evidence")
                }
            },
            onInterrupt = { upload = store.interrupt("NETWORK_INTERRUPTED") },
            onRetry = { upload = store.retry() },
            onSubmit = { upload = store.submit() },
            onCancel = { upload = store.cancel() },
        )

        ProviderCard {
            Text("Evidence rules", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            Text("• One logical intent remains stable across retries.")
            Text("• Each retry receives a fresh private upload session.")
            Text("• Confirmation creates one immutable evidence version.")
            Text("• Upload state never creates a verification claim.")
        }

        ProviderTrustBoundary(workspace.trustBoundary)
    }
}

@Composable
private fun ProviderUploadRecoveryCard(
    snapshot: ProviderUploadSnapshot,
    onStart: () -> Unit,
    onInterrupt: () -> Unit,
    onRetry: () -> Unit,
    onSubmit: () -> Unit,
    onCancel: () -> Unit,
) {
    ProviderCard(
        modifier = Modifier
            .testTag("provider-upload-recovery")
            .semantics {
                contentDescription =
                    "Provider upload ${snapshot.state.label}, attempt ${snapshot.attemptCount}"
            },
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(snapshot.documentLabel, style = MaterialTheme.typography.titleMedium)
                Text("Status: ${snapshot.state.label}", fontWeight = FontWeight.SemiBold)
            }
            if (snapshot.attemptCount > 0) {
                AssistChip(onClick = {}, label = { Text("Attempt ${snapshot.attemptCount}") })
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            snapshot.logicalIntentId?.let { "Upload reference ${it.take(8)}…" }
                ?: "No upload intent has been created.",
        )
        snapshot.lastErrorCode?.let { errorCode ->
            Text("Retry status: $errorCode")
        }
        Spacer(Modifier.height(10.dp))

        when (snapshot.state) {
            ProviderUploadState.NotStarted,
            ProviderUploadState.Cancelled,
            ProviderUploadState.TerminalFailure,
            ProviderUploadState.Submitted,
            -> Button(
                modifier = Modifier.testTag("provider-upload-start"),
                onClick = onStart,
            ) {
                Text(
                    if (snapshot.state == ProviderUploadState.NotStarted) {
                        "Prepare evidence upload"
                    } else {
                        "Prepare another evidence upload"
                    },
                )
            }

            ProviderUploadState.Uploading -> {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        modifier = Modifier.testTag("provider-upload-submit"),
                        onClick = onSubmit,
                    ) {
                        Text("Submit")
                    }
                    OutlinedButton(
                        modifier = Modifier.testTag("provider-upload-interrupt"),
                        onClick = onInterrupt,
                    ) {
                        Text("Save and retry later")
                    }
                }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    modifier = Modifier.testTag("provider-upload-cancel"),
                    onClick = onCancel,
                ) {
                    Text("Cancel upload")
                }
            }

            ProviderUploadState.Interrupted,
            ProviderUploadState.Retryable,
            -> {
                Button(
                    modifier = Modifier.testTag("provider-upload-retry"),
                    onClick = onRetry,
                ) {
                    Text("Retry upload")
                }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    modifier = Modifier.testTag("provider-upload-cancel"),
                    onClick = onCancel,
                ) {
                    Text("Cancel upload")
                }
            }
        }
    }
}

@Composable
private fun ProviderVerificationTimeline(workspace: ProviderWorkspaceSnapshot) {
    Column(
        modifier = Modifier.testTag("provider-verification-timeline"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        ProviderCard {
            Text("Verification progress", style = MaterialTheme.typography.titleLarge)
            Text(
                "Events omit reviewer identities, private rationale, hashes and storage references.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        TimelineItem(
            title = "Correction required",
            detail = "Identity evidence needs a clearer image.",
            limitation = "This is scoped to one identity check, not the whole provider.",
        )
        TimelineItem(
            title = "Evidence submitted",
            detail = "Private evidence entered the review queue.",
            limitation = "Submission does not mean approval.",
        )
        TimelineItem(
            title = "Verification case created",
            detail = "Representative identity check opened under Plumbing v1.",
            limitation = "A case does not create a public trust claim.",
        )
        ProviderTrustBoundary(workspace.trustBoundary)
    }
}

@Composable
private fun ProviderProfileWorkspace(workspace: ProviderWorkspaceSnapshot) {
    Column(
        modifier = Modifier.testTag("provider-profile-workspace"),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        ProviderCard {
            Text("Provider profile and services", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(6.dp))
            Text(workspace.displayName, fontWeight = FontWeight.Bold)
            Text("Operating model: ${workspace.operatingModel}")
            Text("Locality: ${workspace.localitySummary}")
            Text("Service: ${workspace.selectedService}")
            Spacer(Modifier.height(8.dp))
            Text(
                "Profile completion does not publish this provider.",
                color = MaterialTheme.colorScheme.tertiary,
                fontWeight = FontWeight.Bold,
            )
        }
        ProviderLocationBoundaryCard(workspace.location)
        ProviderCard {
            Text("Additional workspace features", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(6.dp))
            workspace.deferredSurfaces.forEach { surface ->
                Text("${surface.label}: ${surface.state}")
                Text(
                    "Mutation allowed: ${if (surface.mutationAllowed) "Yes" else "No"}",
                    style = MaterialTheme.typography.bodySmall,
                )
                Spacer(Modifier.height(6.dp))
            }
        }
        ProviderTrustBoundary(workspace.trustBoundary)
    }
}

@Composable
private fun ProviderTaskCard(task: ProviderWorkspaceTask) {
    ProviderCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(task.title, style = MaterialTheme.typography.titleMedium)
            Text(task.state.label, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(6.dp))
        Text(task.detail)
    }
}

@Composable
private fun ProviderLocationBoundaryCard(location: ProviderWorkspaceLocationBoundary) {
    ProviderCard(
        modifier = Modifier.semantics {
            contentDescription = "Provider location privacy boundary"
        },
    ) {
        Text("Location privacy boundary", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        Text(location.safeSummary)
        location.publicLocality?.let { locality -> Text("Public locality: $locality") }
        Spacer(Modifier.height(6.dp))
        Text(
            "Private base, consented public premises and service area are separate records. Coordinates are not displayed here.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun TimelineItem(
    title: String,
    detail: String,
    limitation: String,
) {
    ProviderCard {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        Text(detail)
        Text(
            limitation,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun ProviderTrustBoundary(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("What this workspace can and cannot change", fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(6.dp))
            Text(message)
            Text(
                "This controlled review build uses fictional data. Trust decisions, private location, payments and publication remain backend-controlled.",
            )
        }
    }
}

@Composable
private fun ProviderCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            content = { content() },
        )
    }
}

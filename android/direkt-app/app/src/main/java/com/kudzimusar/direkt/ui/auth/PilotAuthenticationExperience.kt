package com.kudzimusar.direkt.ui.auth

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.kudzimusar.direkt.auth.PilotAuthResult
import com.kudzimusar.direkt.auth.PilotAuthenticationCoordinator

@Composable
fun PilotAuthenticationExperience() {
    val context = LocalContext.current
    val activity = context.findActivity()
    val coordinator = remember { PilotAuthenticationCoordinator(context.applicationContext) }
    var phoneNumber by remember { mutableStateOf("+260") }
    var verificationCode by remember { mutableStateOf("") }
    var consented by remember { mutableStateOf(false) }
    var codeSent by remember { mutableStateOf(false) }
    var signedIn by remember { mutableStateOf(coordinator.currentSession() != null) }
    var status by remember { mutableStateOf("") }

    Card(
        modifier =
            Modifier
                .fillMaxWidth()
                .testTag("pilot-auth-card"),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Text("Controlled pilot access", style = MaterialTheme.typography.titleMedium)
            if (!coordinator.enabled) {
                Text(
                    "Real participant sign-in is disabled. An approved pilot API, Firebase configuration and notice version must all be injected before OTP can start.",
                )
                Text(
                    "No production credential or participant endpoint is embedded in this build.",
                    style = MaterialTheme.typography.bodySmall,
                )
                return@Column
            }

            if (signedIn) {
                Text("A protected DIREKT pilot session is active.", fontWeight = FontWeight.Bold)
                Text(
                    "Firebase proved recent phone possession; DIREKT still owns the session, roles and authorization.",
                    style = MaterialTheme.typography.bodySmall,
                )
                Button(
                    onClick = {
                        coordinator.signOut()
                        signedIn = false
                        status = "Signed out."
                    },
                ) {
                    Text("Sign out")
                }
                if (status.isNotBlank()) {
                    Text(status, style = MaterialTheme.typography.bodySmall)
                }
                return@Column
            }

            Text(
                "Pilot notice version: ${coordinator.noticeVersion}",
                style = MaterialTheme.typography.labelMedium,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Checkbox(
                    checked = consented,
                    onCheckedChange = { consented = it },
                    modifier = Modifier.testTag("pilot-auth-consent"),
                )
                Text(
                    "I have read the approved controlled-pilot notice and consent to the required account and phone-authentication processing. Optional location and research consent remain separate.",
                )
            }
            OutlinedTextField(
                value = phoneNumber,
                onValueChange = { phoneNumber = it.trim() },
                label = { Text("Zambia phone number") },
                supportingText = { Text("Use +260 followed by 9 digits") },
                modifier =
                    Modifier
                        .fillMaxWidth()
                        .testTag("pilot-auth-phone"),
                singleLine = true,
            )
            Button(
                enabled = consented && activity != null,
                onClick = {
                    status = "Requesting verification code…"
                    coordinator.startPhoneVerification(
                        activity = activity ?: return@Button,
                        phoneNumber = phoneNumber,
                        consentAccepted = consented,
                        onResult = { result ->
                            when (result) {
                                PilotAuthResult.CodeSent -> {
                                    codeSent = true
                                    status = "Verification code sent."
                                }
                                is PilotAuthResult.SignedIn -> {
                                    signedIn = true
                                    status = "Signed in."
                                }
                                is PilotAuthResult.Error -> status = result.message
                            }
                        },
                    )
                },
                modifier = Modifier.testTag("pilot-auth-send-code"),
            ) {
                Text("Send verification code")
            }

            if (codeSent) {
                OutlinedTextField(
                    value = verificationCode,
                    onValueChange = { verificationCode = it.filter(Char::isDigit).take(6) },
                    label = { Text("6-digit code") },
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .testTag("pilot-auth-code"),
                    singleLine = true,
                )
                Button(
                    enabled = consented && verificationCode.length == 6 && activity != null,
                    onClick = {
                        status = "Verifying…"
                        coordinator.submitVerificationCode(
                            activity = activity ?: return@Button,
                            code = verificationCode,
                            onResult = { result ->
                                when (result) {
                                    PilotAuthResult.CodeSent -> status = "Verification code sent."
                                    is PilotAuthResult.SignedIn -> {
                                        signedIn = true
                                        codeSent = false
                                        verificationCode = ""
                                        status = "Signed in."
                                    }
                                    is PilotAuthResult.Error -> status = result.message
                                }
                            },
                        )
                    },
                    modifier = Modifier.testTag("pilot-auth-verify-code"),
                ) {
                    Text("Verify and enter pilot")
                }
            }

            if (status.isNotBlank()) {
                Text(status, style = MaterialTheme.typography.bodySmall)
            }
            Text(
                "Phone authentication is only proof of possession. It never grants provider, staff, verification or admin permissions.",
                style = MaterialTheme.typography.bodySmall,
            )
        }
    }
}

private tailrec fun Context.findActivity(): Activity? =
    when (this) {
        is Activity -> this
        is ContextWrapper -> baseContext.findActivity()
        else -> null
    }

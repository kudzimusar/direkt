package com.kudzimusar.direkt

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import com.kudzimusar.direkt.notifications.FcmCanary
import com.kudzimusar.direkt.notifications.NotificationPermissionController
import com.kudzimusar.direkt.observability.CrashlyticsCanary
import com.kudzimusar.direkt.ui.DirektApp
import com.kudzimusar.direkt.ui.theme.DirektTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        CrashlyticsCanary.handleLaunch(this, intent)
        FcmCanary.handleLaunch(this, intent)
        NotificationPermissionController.requestIfRequired(this)
        enableEdgeToEdge()
        setContent {
            DirektTheme {
                DeferredDirektApp()
            }
        }
    }
}

@Composable
private fun DeferredDirektApp() {
    var contentReady by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        // Let Android draw a small branded shell before composing the full customer/provider
        // workspace. This reduces cold-start time without delaying any user-triggered action.
        withFrameNanos { }
        contentReady = true
    }

    if (contentReady) {
        DirektApp()
    } else {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .testTag("launch-shell"),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "DIREKT",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

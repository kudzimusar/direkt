package com.kudzimusar.direkt.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

enum class DirektMode(val label: String) {
    Customer("Customer"),
    Provider("Provider"),
}

enum class DirektDestination(val label: String) {
    Discover("Discover"),
    Saved("Saved"),
    Enquiries("Enquiries"),
    Account("Account"),
}

@Stable
class DirektAppState(
    initialMode: DirektMode = DirektMode.Customer,
    initialDestination: DirektDestination = DirektDestination.Discover,
) {
    var mode by mutableStateOf(initialMode)
        private set

    var destination by mutableStateOf(initialDestination)
        private set

    fun switchMode(newMode: DirektMode) {
        mode = newMode
        destination = if (newMode == DirektMode.Customer) {
            DirektDestination.Discover
        } else {
            DirektDestination.Account
        }
    }

    fun navigate(destination: DirektDestination) {
        this.destination = destination
    }
}

@Composable
fun rememberDirektAppState(): DirektAppState = remember { DirektAppState() }

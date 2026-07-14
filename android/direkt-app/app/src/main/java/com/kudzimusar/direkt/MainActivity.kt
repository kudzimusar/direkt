package com.kudzimusar.direkt

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.kudzimusar.direkt.ui.DirektApp
import com.kudzimusar.direkt.ui.theme.DirektTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            DirektTheme {
                DirektApp()
            }
        }
    }
}

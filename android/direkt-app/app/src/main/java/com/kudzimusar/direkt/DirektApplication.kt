package com.kudzimusar.direkt

import android.app.Application
import com.kudzimusar.direkt.observability.CrashlyticsRuntime

class DirektApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        CrashlyticsRuntime.configure(this)
    }
}

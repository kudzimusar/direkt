plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose)
}

fun quotedBuildConfig(value: String): String =
    "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

val pilotApiBaseUrl = providers.gradleProperty("DIREKT_PILOT_API_BASE_URL")
    .orElse(providers.environmentVariable("DIREKT_PILOT_API_BASE_URL"))
    .orElse("")
    .get()
val firebaseApiKey = providers.gradleProperty("DIREKT_FIREBASE_API_KEY")
    .orElse(providers.environmentVariable("DIREKT_FIREBASE_API_KEY"))
    .orElse("")
    .get()
val firebaseAppId = providers.gradleProperty("DIREKT_FIREBASE_APP_ID")
    .orElse(providers.environmentVariable("DIREKT_FIREBASE_APP_ID"))
    .orElse("")
    .get()
val firebaseProjectId = providers.gradleProperty("DIREKT_FIREBASE_PROJECT_ID")
    .orElse(providers.environmentVariable("DIREKT_FIREBASE_PROJECT_ID"))
    .orElse("")
    .get()
val pilotNoticeVersion = providers.gradleProperty("DIREKT_PILOT_NOTICE_VERSION")
    .orElse(providers.environmentVariable("DIREKT_PILOT_NOTICE_VERSION"))
    .orElse("")
    .get()

android {
    namespace = "com.kudzimusar.direkt"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.kudzimusar.direkt"
        minSdk = 23
        targetSdk = 36
        versionCode = 8
        versionName = "0.8.0-phase8"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true

        buildConfigField("String", "DIREKT_PILOT_API_BASE_URL", quotedBuildConfig(pilotApiBaseUrl))
        buildConfigField("String", "DIREKT_FIREBASE_API_KEY", quotedBuildConfig(firebaseApiKey))
        buildConfigField("String", "DIREKT_FIREBASE_APP_ID", quotedBuildConfig(firebaseAppId))
        buildConfigField("String", "DIREKT_FIREBASE_PROJECT_ID", quotedBuildConfig(firebaseProjectId))
        buildConfigField("String", "DIREKT_PILOT_NOTICE_VERSION", quotedBuildConfig(pilotNoticeVersion))
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            isDebuggable = true
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }

    testOptions {
        unitTests.isIncludeAndroidResources = true
    }

    lint {
        abortOnError = true
        checkDependencies = true
        checkReleaseBuilds = true
        htmlReport = true
        xmlReport = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)

    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth)

    testImplementation(libs.junit)

    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

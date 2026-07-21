import java.io.StringReader
import java.util.Properties
import org.gradle.api.DefaultTask
import org.gradle.api.provider.Property
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose)
}

fun strictBooleanProvider(name: String) =
    providers.gradleProperty(name)
        .orElse(providers.environmentVariable(name))
        .orElse("false")
        .map { raw ->
            raw.toBooleanStrictOrNull()
                ?: error("$name must be exactly 'true' or 'false'")
        }

val crashlyticsBuildEnabled = strictBooleanProvider("DIREKT_CRASHLYTICS_BUILD_ENABLED").get()
val crashlyticsCanaryEnabled = strictBooleanProvider("DIREKT_CRASHLYTICS_CANARY_ENABLED").get()

if (crashlyticsBuildEnabled) {
    require(file("google-services.json").isFile) {
        "DIREKT_CRASHLYTICS_BUILD_ENABLED=true requires a runner-provisioned app/google-services.json"
    }
    pluginManager.apply("com.google.gms.google-services")
    pluginManager.apply("com.google.firebase.crashlytics")
}

abstract class VerifyReleaseArtifactSigningContract : DefaultTask() {
    @get:Input
    abstract val configuredReleaseChannel: Property<String>

    @get:Input
    abstract val configuredSigningEnabled: Property<Boolean>

    @TaskAction
    fun verifyContract() {
        val channel = configuredReleaseChannel.get()
        val signingEnabled = configuredSigningEnabled.get()

        if (channel == "preauthorization") {
            require(!signingEnabled) {
                "Preauthorization release artifacts must remain unsigned"
            }
        } else {
            require(signingEnabled) {
                "Release-candidate and production artifacts require DIREKT_RELEASE_SIGNING_ENABLED=true"
            }
        }
    }
}

fun quotedBuildConfig(value: String): String =
    "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

val releaseVersionFile = rootProject.layout.projectDirectory.file("release/version.properties")
val releaseVersionContents = providers.fileContents(releaseVersionFile).asText.get()
val releaseVersionProperties = Properties().apply {
    load(StringReader(releaseVersionContents))
}

fun requiredReleaseProperty(name: String): String =
    releaseVersionProperties.getProperty(name)
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
        ?: error("Missing required release property: $name")

val releaseVersionCodeRaw = requiredReleaseProperty("DIREKT_RELEASE_VERSION_CODE")
val releaseVersionCode = releaseVersionCodeRaw.toIntOrNull()
    ?.takeIf { it in 1..2_100_000_000 }
    ?: error("DIREKT_RELEASE_VERSION_CODE must be an integer from 1 to 2100000000")
val releaseVersionName = requiredReleaseProperty("DIREKT_RELEASE_VERSION_NAME")
val releaseChannel = requiredReleaseProperty("DIREKT_RELEASE_CHANNEL")

require(Regex("""[0-9]+(?:\.[0-9]+){2}(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?""").matches(releaseVersionName)) {
    "DIREKT_RELEASE_VERSION_NAME must be a SemVer-like Android version name"
}
require(releaseChannel in setOf("preauthorization", "release-candidate", "production")) {
    "DIREKT_RELEASE_CHANNEL must be preauthorization, release-candidate, or production"
}
require(releaseChannel != "preauthorization" || "preauth" in releaseVersionName) {
    "Preauthorization builds must be explicitly labelled in DIREKT_RELEASE_VERSION_NAME"
}
require(releaseChannel != "release-candidate" || "rc" in releaseVersionName) {
    "Release-candidate builds must be explicitly labelled in DIREKT_RELEASE_VERSION_NAME"
}
require(releaseChannel != "production" || ("preauth" !in releaseVersionName && "rc" !in releaseVersionName)) {
    "Production builds must not carry preauthorization or release-candidate labels"
}

val releaseSigningEnabled = providers.environmentVariable("DIREKT_RELEASE_SIGNING_ENABLED")
    .orElse("false")
    .map { raw ->
        raw.toBooleanStrictOrNull()
            ?: error("DIREKT_RELEASE_SIGNING_ENABLED must be exactly 'true' or 'false'")
    }
    .get()

val injectedSigningOverrides = providers
    .gradlePropertiesPrefixedBy("android.injected.signing.")
    .get()
require(injectedSigningOverrides.isEmpty()) {
    "AGP android.injected.signing.* overrides are prohibited; use the DIREKT protected signing contract"
}

require(!releaseSigningEnabled || releaseChannel != "preauthorization") {
    "Signing is prohibited while DIREKT_RELEASE_CHANNEL=preauthorization"
}

@Suppress("DEPRECATION")
val configurationCacheRequested = gradle.startParameter.isConfigurationCacheRequested
require(!releaseSigningEnabled || !configurationCacheRequested) {
    "Signed DIREKT release builds require --no-configuration-cache before protected signing inputs are read"
}

fun requiredSigningEnvironment(name: String): String =
    providers.environmentVariable(name)
        .orNull
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
        ?: error("Signing is enabled but required protected input $name is missing")

val releaseUploadKeystore = if (releaseSigningEnabled) {
    val configuredPath = requiredSigningEnvironment("DIREKT_UPLOAD_KEYSTORE_PATH")
    val configuredFile = file(configuredPath)
    require(configuredFile.isAbsolute) {
        "DIREKT_UPLOAD_KEYSTORE_PATH must point to an absolute protected-runner path"
    }
    require(configuredFile.isFile) {
        "DIREKT_UPLOAD_KEYSTORE_PATH does not point to a readable file"
    }

    val repositoryRoot = rootProject.rootDir.canonicalFile.toPath()
    val canonicalKeystore = configuredFile.canonicalFile
    require(!canonicalKeystore.toPath().startsWith(repositoryRoot)) {
        "DIREKT_UPLOAD_KEYSTORE_PATH must be outside the repository checkout"
    }
    canonicalKeystore
} else {
    null
}

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
val crashlyticsSourceSha = providers.gradleProperty("DIREKT_SOURCE_SHA")
    .orElse(providers.environmentVariable("DIREKT_SOURCE_SHA"))
    .orElse("")
    .get()
val crashlyticsDataMode = providers.gradleProperty("DIREKT_CRASHLYTICS_DATA_MODE")
    .orElse(providers.environmentVariable("DIREKT_CRASHLYTICS_DATA_MODE"))
    .orElse("disabled")
    .get()

if (crashlyticsCanaryEnabled) {
    require(crashlyticsBuildEnabled) {
        "DIREKT_CRASHLYTICS_CANARY_ENABLED=true requires DIREKT_CRASHLYTICS_BUILD_ENABLED=true"
    }
    require(releaseChannel == "preauthorization") {
        "RC3 Crashlytics canary is allowed only in preauthorization builds"
    }
    require(crashlyticsDataMode == "synthetic-only") {
        "RC3 Crashlytics canary requires DIREKT_CRASHLYTICS_DATA_MODE=synthetic-only"
    }
    require(Regex("^[0-9a-f]{40}$").matches(crashlyticsSourceSha)) {
        "RC3 Crashlytics canary requires an exact 40-character DIREKT_SOURCE_SHA"
    }
    require(firebaseApiKey.isNotBlank() && firebaseAppId.isNotBlank() && firebaseProjectId.isNotBlank()) {
        "RC3 Crashlytics canary requires runner-provisioned Firebase app configuration"
    }
}

android {
    namespace = "com.kudzimusar.direkt"
    compileSdk = 36

    signingConfigs {
        if (releaseSigningEnabled) {
            create("direktReleaseUpload") {
                storeFile = releaseUploadKeystore
                storePassword = requiredSigningEnvironment("DIREKT_UPLOAD_KEYSTORE_PASSWORD")
                keyAlias = requiredSigningEnvironment("DIREKT_UPLOAD_KEY_ALIAS")
                keyPassword = requiredSigningEnvironment("DIREKT_UPLOAD_KEY_PASSWORD")
            }
        }
    }

    defaultConfig {
        applicationId = "com.kudzimusar.direkt"
        minSdk = 23
        targetSdk = 36
        versionCode = releaseVersionCode
        versionName = releaseVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables.useSupportLibrary = true

        buildConfigField("String", "DIREKT_RELEASE_CHANNEL", quotedBuildConfig(releaseChannel))
        buildConfigField("String", "DIREKT_PILOT_API_BASE_URL", quotedBuildConfig(pilotApiBaseUrl))
        buildConfigField("String", "DIREKT_FIREBASE_API_KEY", quotedBuildConfig(firebaseApiKey))
        buildConfigField("String", "DIREKT_FIREBASE_APP_ID", quotedBuildConfig(firebaseAppId))
        buildConfigField("String", "DIREKT_FIREBASE_PROJECT_ID", quotedBuildConfig(firebaseProjectId))
        buildConfigField("String", "DIREKT_PILOT_NOTICE_VERSION", quotedBuildConfig(pilotNoticeVersion))
        buildConfigField("boolean", "DIREKT_CRASHLYTICS_CANARY_ENABLED", crashlyticsCanaryEnabled.toString())
        buildConfigField("String", "DIREKT_CRASHLYTICS_SOURCE_SHA", quotedBuildConfig(crashlyticsSourceSha))
        buildConfigField("String", "DIREKT_CRASHLYTICS_DATA_MODE", quotedBuildConfig(crashlyticsDataMode))
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
            if (releaseSigningEnabled) {
                signingConfig = signingConfigs.getByName("direktReleaseUpload")
            }
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

val verifyReleaseArtifactSigningContract = tasks.register<VerifyReleaseArtifactSigningContract>(
    "verifyReleaseArtifactSigningContract",
) {
    group = "verification"
    description = "Prevents release-capable artifacts from bypassing the DIREKT signing contract."
    configuredReleaseChannel.set(releaseChannel)
    configuredSigningEnabled.set(releaseSigningEnabled)
}

tasks.matching {
    it.name in setOf("bundleRelease", "assembleRelease", "packageReleaseBundle", "signReleaseBundle")
}.configureEach {
    dependsOn(verifyReleaseArtifactSigningContract)
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
    implementation(libs.firebase.crashlytics)

    testImplementation(libs.junit)

    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.test.ext.junit)
    androidTestImplementation(libs.androidx.test.espresso.core)
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}

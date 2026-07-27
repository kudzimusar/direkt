#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def replace_once(relative: str, old: str, new: str) -> None:
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"Expected exactly one RC9 replacement in {relative}, found {count}")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    "android/direkt-app/app/build.gradle.kts",
    '''plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose)
}
''',
    '''plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.compose)
    alias(libs.plugins.kotlin.serialization)
}
''',
)
replace_once(
    "android/direkt-app/app/build.gradle.kts",
    '''    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
''',
    '''    buildFeatures {
        compose = true
        buildConfig = true
    }

    sourceSets["main"].kotlin.srcDir(
        rootProject.file("../../clients/generated/kotlin/src/main/kotlin"),
    )

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
''',
)
replace_once(
    "android/direkt-app/app/build.gradle.kts",
    '''    implementation(libs.firebase.messaging)
    implementation(libs.google.maps.compose)

    testImplementation(libs.junit)
''',
    '''    implementation(libs.firebase.messaging)
    implementation(libs.google.maps.compose)

    implementation(libs.kotlinx.serialization.json)
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.retrofit.scalars)
    implementation(libs.okhttp.logging)
    coreLibraryDesugaring(libs.desugar.jdk.libs)

    testImplementation(libs.junit)
    testImplementation(libs.okhttp.mockwebserver)
''',
)

replace_once(
    "web/direkt-app/lib/server/direkt-auth-api.ts",
    '''import { getCloudRunIdentityToken } from "./cloud-run-identity";
import { getDirektWebRuntimeConfig } from "./runtime-config";
''',
    '''import { getCloudRunIdentityToken } from "./cloud-run-identity";
import {
  type DirektFirebaseSessionExchangeInput,
  type GeneratedAuthenticatedSessionResponse,
  toDirektAuthenticatedSession,
} from "./generated-auth-contracts";
import { getDirektWebRuntimeConfig } from "./runtime-config";
''',
)
replace_once(
    "web/direkt-app/lib/server/direkt-auth-api.ts",
    '''  exchangeFirebase(input: {
    idToken: string;
    noticeVersion: string;
    consentAccepted: true;
    deviceLabel?: string;
  }): Promise<DirektAuthenticatedSession> {
    return this.request("/api/v1/auth/firebase/exchange", { method: "POST", body: input });
  }
''',
    '''  async exchangeFirebase(input: DirektFirebaseSessionExchangeInput): Promise<DirektAuthenticatedSession> {
    const response = await this.request<GeneratedAuthenticatedSessionResponse>(
      "/api/v1/auth/firebase/exchange",
      { method: "POST", body: input },
    );
    return toDirektAuthenticatedSession(response);
  }
''',
)

print("RC9_RUNTIME_ADOPTION_PATCH|PASS")
print("focused_adapter_regressions=required")

#!/usr/bin/env python3
"""Apply deterministic RC7 review fixes, then remove through the one-shot bridge."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(path: str, old: str, new: str, label: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{label}: expected exactly one match, found {count}")
    write(path, text.replace(old, new, 1))


BUILD = "android/direkt-app/app/build.gradle.kts"
replace_once(
    BUILD,
    '''val mapsBuildEnabled = strictBooleanProvider("DIREKT_MAPS_BUILD_ENABLED").get()
val androidMapsApiKey = providers.gradleProperty("DIREKT_ANDROID_MAPS_API_KEY")
    .orElse(providers.environmentVariable("DIREKT_ANDROID_MAPS_API_KEY"))
    .orElse("")
    .get()

if (mapsBuildEnabled) {
    require(androidMapsApiKey.length in 20..512) {
        "DIREKT_MAPS_BUILD_ENABLED=true requires a protected DIREKT_ANDROID_MAPS_API_KEY"
    }
}
''',
    '''val mapsBuildEnabled = strictBooleanProvider("DIREKT_MAPS_BUILD_ENABLED").get()
val mapsSyntheticCanaryApproved =
    strictBooleanProvider("DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED").get()
val androidMapsApiKey = providers.gradleProperty("DIREKT_ANDROID_MAPS_API_KEY")
    .orElse(providers.environmentVariable("DIREKT_ANDROID_MAPS_API_KEY"))
    .orElse("")
    .get()
''',
    "Android Maps inputs",
)
replace_once(
    BUILD,
    '''require(releaseChannel != "production" || ("preauth" !in releaseVersionName && "rc" !in releaseVersionName)) {
    "Production builds must not carry preauthorization or release-candidate labels"
}
''',
    '''require(releaseChannel != "production" || ("preauth" !in releaseVersionName && "rc" !in releaseVersionName)) {
    "Production builds must not carry preauthorization or release-candidate labels"
}

if (mapsBuildEnabled) {
    require(releaseChannel == "preauthorization") {
        "RC7 Maps activation is allowed only in preauthorization builds"
    }
    require(mapsSyntheticCanaryApproved) {
        "DIREKT_MAPS_BUILD_ENABLED=true requires DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED=true"
    }
    require(androidMapsApiKey.length in 20..512) {
        "DIREKT_MAPS_BUILD_ENABLED=true requires a protected DIREKT_ANDROID_MAPS_API_KEY"
    }
}
require(!mapsSyntheticCanaryApproved || mapsBuildEnabled) {
    "DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED=true requires DIREKT_MAPS_BUILD_ENABLED=true"
}
''',
    "Android Maps preauthorization latch",
)
replace_once(
    BUILD,
    '''        buildConfigField("boolean", "DIREKT_MAPS_ENABLED", mapsBuildEnabled.toString())
        manifestPlaceholders["direktMapsApiKey"] =
''',
    '''        buildConfigField("boolean", "DIREKT_MAPS_ENABLED", mapsBuildEnabled.toString())
        buildConfigField(
            "boolean",
            "DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED",
            mapsSyntheticCanaryApproved.toString(),
        )
        manifestPlaceholders["direktMapsApiKey"] =
''',
    "Android Maps BuildConfig latch",
)

DTO = "backend/direkt-api/src/discovery/discovery.dto.ts"
replace_once(
    DTO,
    '''export class RefreshPublicationDto {
''',
    '''export class NormalizeSearchAreaDto {
  @IsString()
  @Length(3, 160)
  area!: string;
}

export class RefreshPublicationDto {
''',
    "normalize search-area DTO",
)

MODULE = "backend/direkt-api/src/discovery/discovery.module.ts"
replace_once(
    MODULE,
    '''import { AiModule } from '../ai/ai.module';
''',
    '''import { AiModule } from '../ai/ai.module';
import { LocationModule } from '../location/location.module';
''',
    "Discovery LocationModule import",
)
replace_once(MODULE, "  imports: [AiModule],", "  imports: [AiModule, LocationModule],", "Discovery module wiring")

CONTROLLER = "backend/direkt-api/src/discovery/discovery.controller.ts"
replace_once(
    CONTROLLER,
    '''import type { DirektRequest } from '../platform/http/request-context';
''',
    '''import { LocationService } from '../location/location.service';
import type { DirektRequest } from '../platform/http/request-context';
''',
    "Discovery LocationService import",
)
replace_once(
    CONTROLLER,
    '''import { DiscoverySearchDto, HidePublicationDto, RefreshPublicationDto } from './discovery.dto';
''',
    '''import {
  DiscoverySearchDto,
  HidePublicationDto,
  NormalizeSearchAreaDto,
  RefreshPublicationDto,
} from './discovery.dto';
''',
    "Discovery normalization DTO import",
)
replace_once(
    CONTROLLER,
    '''    private readonly discoveryAssist: DiscoveryAiAssistService,
  ) {}
''',
    '''    private readonly discoveryAssist: DiscoveryAiAssistService,
    private readonly locations: LocationService,
  ) {}
''',
    "Discovery LocationService injection",
)
replace_once(
    CONTROLLER,
    '''  assist(@Body() body: DiscoveryAiAssistRequestDto) {
    return this.discoveryAssist.assist(body);
  }

  @Get('public/providers/search')
''',
    '''  assist(@Body() body: DiscoveryAiAssistRequestDto) {
    return this.discoveryAssist.assist(body);
  }

  @Post('public/discovery/search-area/normalize')
  @PublicRoute()
  @ApiOperation({
    summary: 'Normalizes a bounded Zambian discovery area without storing private location.',
  })
  @ApiOkResponse({
    description:
      'Returns a Zambia-bounded search point for discovery only. Manual area search remains available on every failure.',
  })
  normalizeSearchArea(@Body() body: NormalizeSearchAreaDto) {
    return this.locations.normalizeSearchArea(body.area);
  }

  @Get('public/providers/search')
''',
    "Discovery normalization endpoint",
)

write(
    "backend/direkt-api/src/location/location.service.ts",
    '''import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  GEOCODING_PROVIDER,
  GeocodingProviderError,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from './geocoding-provider.port';

@Injectable()
export class LocationService {
  constructor(
    @Inject(GEOCODING_PROVIDER)
    private readonly geocodingProvider: GeocodingProviderPort,
  ) {}

  async normalizeSearchArea(address: string): Promise<NormalizedSearchArea> {
    try {
      return await this.geocodingProvider.normalizeSearchArea(address);
    } catch (error) {
      if (error instanceof GeocodingProviderError) {
        switch (error.code) {
          case 'invalid_input':
          case 'not_found':
          case 'outside_zambia':
            throw new BadRequestException({
              code: 'search_area_not_normalized',
              message: 'Enter a Zambian area or landmark and use manual area search if needed.',
              manualFallbackAvailable: true,
              privateLocationPublished: false,
            });
          case 'disabled':
          case 'quota_or_denied':
          case 'timeout':
          case 'provider_unavailable':
          case 'invalid_provider_response':
            throw new ServiceUnavailableException({
              code: 'map_normalization_unavailable',
              message: 'Map-backed area normalization is unavailable. Manual area search remains available.',
              manualFallbackAvailable: true,
              privateLocationPublished: false,
            });
        }
      }

      throw new ServiceUnavailableException({
        code: 'map_normalization_unavailable',
        message: 'Map-backed area normalization is unavailable. Manual area search remains available.',
        manualFallbackAvailable: true,
        privateLocationPublished: false,
      });
    }
  }
}
''',
)

MAP_CARD = "android/direkt-app/app/src/main/java/com/kudzimusar/direkt/ui/discovery/PrivacySafeMapCard.kt"
replace_once(
    MAP_CARD,
    '''                Text(
                    "Map loaded. List view remains the accessible and low-bandwidth equivalent.",
                    modifier = Modifier.testTag("discovery-map-ready"),
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold,
                )
                PublicMapTextEquivalent(providers)
''',
    '''                if (runtimeState == MapRuntimeState.Ready) {
                    Text(
                        "Map loaded. List view remains the accessible and low-bandwidth equivalent.",
                        modifier = Modifier.testTag("discovery-map-ready"),
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                PublicMapTextEquivalent(providers)
''',
    "truthful map-ready message",
)

OPENAPI = "backend/direkt-api/scripts/check-openapi.ts"
replace_once(
    OPENAPI,
    '''    ['/api/v1/public/categories', 'get'],
    ['/api/v1/public/providers/search', 'get'],
''',
    '''    ['/api/v1/public/categories', 'get'],
    ['/api/v1/public/discovery/search-area/normalize', 'post'],
    ['/api/v1/public/providers/search', 'get'],
''',
    "required normalization OpenAPI operation",
)
replace_once(
    OPENAPI,
    '''    'GET /api/v1/public/categories',
    'GET /api/v1/public/providers/search',
''',
    '''    'GET /api/v1/public/categories',
    'POST /api/v1/public/discovery/search-area/normalize',
    'GET /api/v1/public/providers/search',
''',
    "public normalization OpenAPI operation",
)

STATUS = "docs/integrations/CURRENT_INTEGRATION_STATUS.md"
replace_once(
    STATUS,
    '''| Google Maps Platform | **EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN** | RC7 restricted credentials, SDK/server binding, privacy/quotas/fallback/kill switch/non-leakage proof required. |
''',
    '''| Google Maps Platform | **IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS** | RC7 source now includes separate Android/backend switches, privacy-safe native rendering, backend-only Zambia geocoding, reachable bounded discovery normalization, manual/list fallback and permanent non-leakage tests. Restricted credentials, quotas/budget controls and exact-main managed proof remain required before `ACTIVE`. |
''',
    "current integration Maps state",
)

LEDGER = "docs/integrations/LIVE_INTEGRATION_LEDGER.md"
replace_once(
    LEDGER,
    '''| Google Maps Platform | `EXTERNALLY_PROVISIONED / RUNTIME NOT PROVEN` | Separate restricted Android/backend credentials if required; privacy, quotas, fallback, kill switch and non-leakage tests. |
''',
    '''| Google Maps Platform | `IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS` | RC7 source includes Maps Compose behind an explicit preauthorization synthetic latch, backend-only Zambia geocoding exposed through a bounded public discovery-normalization route, privacy-safe public premises/service-area rendering, manual/list fallback and permanent non-leakage checks. Separate restricted credentials, quotas/budget controls and exact-main managed proof remain pending. |
''',
    "live ledger Maps state",
)

VERIFIER = "scripts/rc7/verify-maps-contract.py"
replace_once(
    VERIFIER,
    '''    module = read("backend/direkt-api/src/location/location.module.ts")
    adapter = read("backend/direkt-api/src/location/google-maps-geocoding-provider.adapter.ts")
''',
    '''    module = read("backend/direkt-api/src/location/location.module.ts")
    service = read("backend/direkt-api/src/location/location.service.ts")
    discovery_module = read("backend/direkt-api/src/discovery/discovery.module.ts")
    discovery_controller = read("backend/direkt-api/src/discovery/discovery.controller.ts")
    discovery_dto = read("backend/direkt-api/src/discovery/discovery.dto.ts")
    status = read("docs/integrations/CURRENT_INTEGRATION_STATUS.md")
    ledger = read("docs/integrations/LIVE_INTEGRATION_LEDGER.md")
    adapter = read("backend/direkt-api/src/location/google-maps-geocoding-provider.adapter.ts")
''',
    "RC7 verifier application wiring inputs",
)
replace_once(
    VERIFIER,
    '''    require(module, "DisabledGeocodingProviderAdapter", "disabled provider adapter")
    require(module, "GoogleMapsGeocodingProviderAdapter", "Google provider adapter")

    for needle in (
''',
    '''    require(module, "DisabledGeocodingProviderAdapter", "disabled provider adapter")
    require(module, "GoogleMapsGeocodingProviderAdapter", "Google provider adapter")
    for needle in (
        "LocationModule",
        "LocationService",
        "public/discovery/search-area/normalize",
        "NormalizeSearchAreaDto",
        "manualFallbackAvailable: true",
        "privateLocationPublished: false",
    ):
        require(
            discovery_module + discovery_controller + discovery_dto + service,
            needle,
            "reachable sanitized discovery-normalization boundary",
        )

    for needle in (
''',
    "RC7 verifier reachable endpoint assertions",
)
replace_once(
    VERIFIER,
    '''        "DIREKT_MAPS_BUILD_ENABLED",
        "DIREKT_ANDROID_MAPS_API_KEY",
        "DIREKT_MAPS_ENABLED",
        "direktMapsApiKey",
''',
    '''        "DIREKT_MAPS_BUILD_ENABLED",
        "DIREKT_MAPS_SYNTHETIC_CANARY_APPROVED",
        "RC7 Maps activation is allowed only in preauthorization builds",
        "DIREKT_ANDROID_MAPS_API_KEY",
        "DIREKT_MAPS_ENABLED",
        "direktMapsApiKey",
''',
    "RC7 verifier Android synthetic latch",
)
replace_once(
    VERIFIER,
    '''        "MapRuntimeState.Failed",
        "discovery-map-fallback",
''',
    '''        "MapRuntimeState.Failed",
        "runtimeState == MapRuntimeState.Ready",
        "discovery-map-fallback",
''',
    "RC7 verifier truthful readiness",
)
replace_once(
    VERIFIER,
    '''    require(models, "provider.operatingModel == PublicOperatingModel.Mobile -> null", "mobile base-marker prohibition")

    for client_root in ("android", "web", "admin"):
''',
    '''    require(models, "provider.operatingModel == PublicOperatingModel.Mobile -> null", "mobile base-marker prohibition")
    require(status, "IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS", "current Maps integration state")
    require(ledger, "IMPLEMENTED_GATED / MANAGED PROOF IN PROGRESS", "live Maps ledger state")

    for client_root in ("android", "web", "admin"):
''',
    "RC7 verifier ledger state",
)

write(
    "backend/direkt-api/test/unit/location/location.service.spec.ts",
    '''import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import {
  GeocodingProviderError,
  type GeocodingProviderPort,
  type NormalizedSearchArea,
} from '../../../src/location/geocoding-provider.port';
import { LocationService } from '../../../src/location/location.service';

const NORMALIZED_AREA: NormalizedSearchArea = {
  provider: 'google_maps',
  formattedArea: 'Cairo Road, Lusaka, Zambia',
  countryCode: 'ZM',
  point: { latitude: -15.4167, longitude: 28.2833 },
  precision: 'geometric_center',
  privateLocationPublished: false,
  persistedByAdapter: false,
};

describe('LocationService', () => {
  it('returns the bounded provider result through the application service', async () => {
    const normalizeSearchArea = vi.fn().mockResolvedValue(NORMALIZED_AREA);
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    await expect(service.normalizeSearchArea('Cairo Road, Lusaka')).resolves.toEqual(
      NORMALIZED_AREA,
    );
    expect(normalizeSearchArea).toHaveBeenCalledWith('Cairo Road, Lusaka');
  });

  it('maps invalid or outside-Zambia input to a sanitized manual-fallback response', async () => {
    const normalizeSearchArea = vi
      .fn()
      .mockRejectedValue(new GeocodingProviderError('outside_zambia', 'provider detail'));
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    const error = await service.normalizeSearchArea('Outside').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({
      code: 'search_area_not_normalized',
      manualFallbackAvailable: true,
      privateLocationPublished: false,
    });
    expect(JSON.stringify((error as BadRequestException).getResponse())).not.toContain(
      'provider detail',
    );
  });

  it('maps disabled, quota and provider failures to a sanitized unavailable response', async () => {
    const normalizeSearchArea = vi
      .fn()
      .mockRejectedValue(new GeocodingProviderError('quota_or_denied', 'secret upstream detail'));
    const service = new LocationService({ normalizeSearchArea } as GeocodingProviderPort);

    const error = await service.normalizeSearchArea('Lusaka').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toMatchObject({
      code: 'map_normalization_unavailable',
      manualFallbackAvailable: true,
      privateLocationPublished: false,
    });
    expect(JSON.stringify((error as ServiceUnavailableException).getResponse())).not.toContain(
      'secret upstream detail',
    );
  });
});
''',
)

print("RC7 review fixes applied.")

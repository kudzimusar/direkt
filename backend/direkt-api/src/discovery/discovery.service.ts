import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type { DiscoverySearchDto } from './discovery.dto';
import { DiscoveryRepository, type DiscoverySearchRow } from './discovery.repository';
import type {
  DiscoverySearchResponse,
  PublicProviderCard,
  PublicProviderProfile,
  SavedProviderView,
} from './discovery.types';

interface CursorPayload {
  version: 1;
  offset: number;
}

@Injectable()
export class DiscoveryService {
  constructor(private readonly repository: DiscoveryRepository) {}

  categories() {
    return this.repository.categories();
  }

  async search(dto: DiscoverySearchDto): Promise<DiscoverySearchResponse> {
    this.assertLocationPair(dto);
    const offset = this.decodeCursor(dto.cursor);
    const result = await this.repository.search(dto, offset);
    const items: PublicProviderCard[] = [];
    for (const row of result.rows) {
      items.push(await this.card(row));
    }

    const nextCursor = result.hasMore
      ? this.encodeCursor({ version: 1, offset: offset + items.length })
      : null;

    return {
      items,
      nextCursor,
      searchContext: {
        manualArea: dto.area?.trim() ?? null,
        usedOneTimeLocation: dto.latitude !== undefined && dto.longitude !== undefined,
        backgroundLocationUsed: false,
        resultCount: items.length,
        noResultsSuggestions:
          items.length === 0
            ? [
                'Try a nearby area or landmark.',
                'Remove one filter or increase the public-premises distance.',
                'Choose another active service category.',
              ]
            : [],
      },
    };
  }

  async profile(publicProviderId: string): Promise<PublicProviderProfile> {
    const row = await this.repository.searchRow(publicProviderId);
    const card = await this.card(row);
    return {
      ...card,
      trustSummary:
        'Every claim below names a scoped check, limitation and expiry. DIREKT does not provide a blanket provider guarantee.',
      locationExplanation: this.locationExplanation(row),
      imagePolicy:
        row.low_bandwidth_url || row.standard_url
          ? 'A public-approved image variant is available; low-bandwidth clients may choose the smaller asset.'
          : 'No public image is required. The profile remains usable with text and map-area information only.',
    };
  }

  claims(publicProviderId: string) {
    return this.repository.claims(publicProviderId);
  }

  async refreshPublication(providerId: string, categoryKey: string, policyVersion: string) {
    const publicProviderId = await this.repository.refreshPublication(
      providerId,
      categoryKey,
      policyVersion,
    );
    return this.profile(publicProviderId);
  }

  async hidePublication(publicProviderId: string, reason: string): Promise<{ hidden: true }> {
    await this.repository.hidePublication(publicProviderId, reason);
    return { hidden: true };
  }

  eligibility() {
    return this.repository.eligibility();
  }

  save(actor: AuthenticatedActor, publicProviderId: string): Promise<SavedProviderView> {
    return this.repository.save(actor.identityId, publicProviderId);
  }

  async unsave(actor: AuthenticatedActor, publicProviderId: string): Promise<{ removed: true }> {
    await this.repository.unsave(actor.identityId, publicProviderId);
    return { removed: true };
  }

  saved(actor: AuthenticatedActor): Promise<SavedProviderView[]> {
    return this.repository.saved(actor.identityId);
  }

  share(publicProviderId: string): Promise<{
    publicProviderId: string;
    title: string;
    text: string;
    path: string;
    containsPrivateLocation: false;
  }> {
    return this.profile(publicProviderId).then((profile) => ({
      publicProviderId,
      title: `${profile.displayName} on DIREKT`,
      text: `${profile.displayName} provides ${profile.categoryName.toLowerCase()} services in ${profile.locality}. Review current scoped claims and limitations in DIREKT.`,
      path: profile.sharePath,
      containsPrivateLocation: false,
    }));
  }

  private async card(row: DiscoverySearchRow): Promise<PublicProviderCard> {
    const claims = await this.repository.claims(row.public_provider_id);
    const reasons = ['Current mandatory checks'];
    if (row.area_match) {
      reasons.push('Serves your selected area');
    }
    if (row.distance_km !== null) {
      reasons.push('Public premises within selected distance');
    }
    if (row.availability_state === 'available') {
      reasons.push('Currently marked available');
    }

    return {
      publicProviderId: row.public_provider_id,
      categoryKey: row.category_key,
      categoryName: row.category_name,
      displayName: row.public_display_name,
      operatingModel: row.operating_model,
      locality: row.public_locality,
      publicPremises:
        row.public_latitude === null || row.public_longitude === null
          ? null
          : { latitude: row.public_latitude, longitude: row.public_longitude },
      serviceAreaGeoJson: row.service_area_geojson,
      availability: row.availability_state,
      nextAvailableAt: row.next_available_at?.toISOString() ?? null,
      image: {
        lowBandwidthUrl: row.low_bandwidth_url,
        standardUrl: row.standard_url,
        altText: row.alt_text,
      },
      claims,
      reasons,
      distanceKm: row.distance_km === null ? null : Number(row.distance_km.toFixed(1)),
      sharePath: `/providers/${row.public_provider_id}`,
      synthetic: true,
    };
  }

  private locationExplanation(row: DiscoverySearchRow): string {
    if (row.operating_model === 'mobile') {
      return 'This mobile provider is matched by its public service area. DIREKT does not show or measure distance from a private base.';
    }
    if (row.operating_model === 'hybrid') {
      return 'This hybrid provider has a consented public premises point and a separate public service area. No private base is exposed.';
    }
    return 'Distance is calculated only from the provider’s consented public premises point.';
  }

  private assertLocationPair(dto: DiscoverySearchDto): void {
    const hasLatitude = dto.latitude !== undefined;
    const hasLongitude = dto.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      throw new BadRequestException('Latitude and longitude must be supplied together.');
    }
  }

  private encodeCursor(payload: CursorPayload): string {
    return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  }

  private decodeCursor(cursor?: string): number {
    if (!cursor) {
      return 0;
    }
    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as Partial<CursorPayload>;
      if (parsed.version !== 1 || !Number.isInteger(parsed.offset) || Number(parsed.offset) < 0) {
        throw new Error('Invalid cursor payload.');
      }
      return Number(parsed.offset);
    } catch {
      throw new BadRequestException('Discovery cursor is invalid or unsupported.');
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type { UpdateProviderProfileDto } from '../provider-core/provider.dto';
import { ProviderService } from '../provider-core/provider.service';
import { ProviderWorkspaceCommandRepository } from './provider-workspace-command.repository';
import type {
  RemoveWorkspaceServiceDto,
  UpdateWorkspaceAvailabilityDto,
  UpdateWorkspaceLocationDto,
} from './provider-workspace.dto';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceTimelineRepository } from './provider-workspace-timeline.repository';
import type {
  ProviderWorkspaceSummary,
  ProviderWorkspaceTimelineEventView,
} from './provider-workspace.types';

@Injectable()
export class ProviderWorkspaceService {
  constructor(
    private readonly repository: ProviderWorkspaceRepository,
    private readonly commands: ProviderWorkspaceCommandRepository,
    private readonly timelineRepository: ProviderWorkspaceTimelineRepository,
    private readonly providers: ProviderService,
  ) {}

  workspace(actor: AuthenticatedActor): Promise<ProviderWorkspaceSummary> {
    return this.repository.workspace(actor.identityId);
  }

  async timeline(actor: AuthenticatedActor): Promise<ProviderWorkspaceTimelineEventView[]> {
    const context = await this.commands.context(actor.identityId);
    return this.timelineRepository.timeline(context.providerId);
  }

  async updateProfile(
    actor: AuthenticatedActor,
    input: UpdateProviderProfileDto,
  ): Promise<ProviderWorkspaceSummary> {
    const context = await this.commands.context(actor.identityId);
    await this.providers.updateProvider(actor, context.providerId, input);
    return this.workspace(actor);
  }

  async selectService(
    actor: AuthenticatedActor,
    categoryKey: string,
  ): Promise<ProviderWorkspaceSummary> {
    const context = await this.commands.context(actor.identityId);
    await this.providers.selectCategory(actor, context.providerId, categoryKey);
    return this.workspace(actor);
  }

  async removeService(
    actor: AuthenticatedActor,
    categoryKey: string,
    input: RemoveWorkspaceServiceDto,
  ): Promise<ProviderWorkspaceSummary> {
    await this.commands.removeService(actor, categoryKey, input);
    return this.workspace(actor);
  }

  async updateLocation(
    actor: AuthenticatedActor,
    input: UpdateWorkspaceLocationDto,
  ): Promise<ProviderWorkspaceSummary> {
    this.assertCoordinatePairs(input);
    await this.commands.updateLocation(actor, input);
    return this.workspace(actor);
  }

  async updateAvailability(
    actor: AuthenticatedActor,
    categoryKey: string,
    input: UpdateWorkspaceAvailabilityDto,
  ): Promise<ProviderWorkspaceSummary> {
    if (input.state === 'limited') {
      if (!input.nextAvailableAt || new Date(input.nextAvailableAt).getTime() <= Date.now()) {
        throw new BadRequestException(
          'Limited availability requires a future nextAvailableAt timestamp.',
        );
      }
    } else if (input.nextAvailableAt) {
      throw new BadRequestException(
        'nextAvailableAt is accepted only when availability is limited.',
      );
    }
    await this.commands.updateAvailability(actor, categoryKey, input);
    return this.workspace(actor);
  }

  private assertCoordinatePairs(input: UpdateWorkspaceLocationDto): void {
    const privateLatitudeProvided = input.privateBaseLatitude !== undefined;
    const privateLongitudeProvided = input.privateBaseLongitude !== undefined;
    if (privateLatitudeProvided !== privateLongitudeProvided) {
      throw new BadRequestException(
        'Private base latitude and longitude must be provided together.',
      );
    }

    const publicLatitudeProvided = input.publicPremisesLatitude !== undefined;
    const publicLongitudeProvided = input.publicPremisesLongitude !== undefined;
    if (publicLatitudeProvided !== publicLongitudeProvided) {
      throw new BadRequestException(
        'Public premises latitude and longitude must be provided together.',
      );
    }
    if (input.publicPremisesConsent && !publicLatitudeProvided) {
      throw new BadRequestException(
        'Public premises consent requires a public premises coordinate pair.',
      );
    }
    if (!input.publicPremisesConsent && publicLatitudeProvided) {
      throw new BadRequestException(
        'Public premises coordinates cannot be stored without explicit consent.',
      );
    }
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { UpdateProviderProfileDto } from '../provider-core/provider.dto';
import {
  RemoveWorkspaceServiceDto,
  UpdateWorkspaceAvailabilityDto,
  UpdateWorkspaceLocationDto,
} from './provider-workspace.dto';
import { ProviderWorkspaceService } from './provider-workspace.service';
import type { ProviderWorkspaceSummary } from './provider-workspace.types';

@ApiTags('provider workspace')
@ApiBearerAuth()
@Controller('provider-workspace')
export class ProviderWorkspaceController {
  constructor(private readonly service: ProviderWorkspaceService) {}

  @Get('me')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Returns the single active provider workspace resolved from the authenticated identity. No provider ownership is accepted from client input.',
  })
  workspace(@Req() request: DirektRequest): Promise<ProviderWorkspaceSummary> {
    return this.service.workspace(request.actor);
  }

  @Patch('me/profile')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({ description: 'Updates the actor-resolved provider profile without publishing it.' })
  updateProfile(
    @Req() request: DirektRequest,
    @Body() body: UpdateProviderProfileDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateProfile(request.actor, body);
  }

  @Put('me/services/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description: 'Selects the active immutable requirement version for a provider service.',
  })
  selectService(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.selectService(request.actor, categoryKey);
  }

  @Delete('me/services/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Removes a provider service without deleting its historical cases, evidence, decisions or claims.',
  })
  removeService(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
    @Body() body: RemoveWorkspaceServiceDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.removeService(request.actor, categoryKey, body);
  }

  @Put('me/location')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Stores private base, consented public premises and service-area geometry as separate models. Coordinates are write-only in this response contract.',
  })
  updateLocation(
    @Req() request: DirektRequest,
    @Body() body: UpdateWorkspaceLocationDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateLocation(request.actor, body);
  }

  @Put('me/availability/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Updates minimal availability independently of claims, publication and trust ranking.',
  })
  updateAvailability(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
    @Body() body: UpdateWorkspaceAvailabilityDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateAvailability(request.actor, categoryKey, body);
  }
}

import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { ProviderWorkspaceService } from './provider-workspace.service';
import type { ProviderWorkspaceDeferredSurfaceView } from './provider-workspace.types';

@ApiTags('provider workspace deferred')
@ApiBearerAuth()
@Controller('provider-workspace/me')
export class ProviderWorkspaceDeferredController {
  constructor(private readonly service: ProviderWorkspaceService) {}

  @Get('review-responses')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerFromActor: true })
  @ApiOkResponse({ description: 'Read-only empty Phase 8 review-response boundary.' })
  async reviewResponses(
    @Req() request: DirektRequest,
  ): Promise<ProviderWorkspaceDeferredSurfaceView> {
    const workspace = await this.service.workspace(request.actor);
    return workspace.deferredSurfaces.reviewResponses;
  }

  @Get('subscription-status')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerFromActor: true })
  @ApiOkResponse({ description: 'Read-only synthetic Phase 9 subscription boundary.' })
  async subscriptionStatus(
    @Req() request: DirektRequest,
  ): Promise<ProviderWorkspaceDeferredSurfaceView> {
    const workspace = await this.service.workspace(request.actor);
    return workspace.deferredSurfaces.subscription;
  }
}

import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
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
}

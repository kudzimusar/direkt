import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import {
  ProviderWorkspaceOperationsRepository,
  type ProviderWorkspaceOperationsView,
} from './provider-workspace-operations.repository';

@ApiTags('operations provider workspaces')
@ApiBearerAuth()
@Controller('operations/provider-workspaces')
export class ProviderWorkspaceOperationsController {
  constructor(private readonly repository: ProviderWorkspaceOperationsRepository) {}

  @Get()
  @RequirePermission(PERMISSIONS.OPERATIONS_PROVIDERS_READ)
  @ApiOkResponse({
    description:
      'Returns aggregate provider-workspace readiness, verification and upload-state counts without coordinates, evidence identifiers or private object keys.',
  })
  list(): Promise<ProviderWorkspaceOperationsView[]> {
    return this.repository.list();
  }
}

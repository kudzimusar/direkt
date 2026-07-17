import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { InteractionOperationsService } from './interaction-operations.service';

@ApiTags('operations interaction history')
@ApiBearerAuth()
@Controller('operations/interactions')
export class InteractionOperationsController {
  constructor(private readonly interactions: InteractionOperationsService) {}

  @Get()
  @RequirePermission(PERMISSIONS.OPERATIONS_INTERACTIONS_READ)
  @ApiOkResponse({
    description:
      'Lists privacy-safe tracked interaction summaries without customer identity, contact values, evidence or moderation rationale.',
  })
  list() {
    return this.interactions.list();
  }
}

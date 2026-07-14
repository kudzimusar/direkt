import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthorizationService } from '../authorization/authorization.service';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import { AuditService } from '../platform/audit/audit.service';
import type { DirektRequest } from '../platform/http/request-context';
import { EmergencyActionDto } from './operations.dto';

@ApiTags('operations')
@ApiBearerAuth()
@Controller('operations')
export class OperationsController {
  constructor(
    private readonly authorization: AuthorizationService,
    private readonly audit: AuditService,
  ) {}

  @Get('session')
  @RequirePermission(PERMISSIONS.OPERATIONS_PORTAL_ACCESS)
  @ApiOkResponse({ description: 'Returns the server-resolved operations authorization snapshot.' })
  async session(@Req() request: DirektRequest): Promise<{
    synthetic: true;
    identityId: string;
    sessionId: string;
    roles: string[];
    permissions: string[];
  }> {
    const snapshot = await this.authorization.snapshot(request.actor);
    return {
      synthetic: true,
      identityId: request.actor.identityId,
      sessionId: request.actor.sessionId,
      roles: snapshot.roles,
      permissions: snapshot.permissions,
    };
  }

  @Post('emergency-actions')
  @HttpCode(200)
  @RequirePermission(PERMISSIONS.ADMIN_EMERGENCY_ACTION)
  @ApiOkResponse({
    description: 'Records a synthetic emergency-action audit event without changing domain state.',
  })
  async emergencyAction(
    @Body() dto: EmergencyActionDto,
    @Req() request: DirektRequest,
  ): Promise<{ recorded: true; appliedDomainChange: false }> {
    await this.authorization.assertEmergencyAction(request.actor, dto.reason, request.requestId);
    await this.audit.record({
      actorType: 'identity',
      actorId: request.actor.identityId,
      requestId: request.requestId,
      action: 'synthetic_emergency_action_recorded',
      resourceType: 'operations_control',
      outcome: 'success',
      metadata: {
        requestedAction: dto.action,
        reason: dto.reason,
        appliedDomainChange: false,
      },
    });
    return { recorded: true, appliedDomainChange: false };
  }
}

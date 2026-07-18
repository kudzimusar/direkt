import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { CreatePilotInvitationDto, RevokePilotInvitationDto } from './pilot-invitation.dto';
import { PilotInvitationService } from './pilot-invitation.service';

@ApiTags('pilot-invitations')
@ApiBearerAuth()
@Controller('operations/pilot-invitations')
@RequirePermission(PERMISSIONS.PILOT_INVITATIONS_MANAGE)
export class PilotInvitationController {
  constructor(private readonly invitations: PilotInvitationService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Creates one invite-only controlled-pilot admission record.' })
  create(
    @Body() dto: CreatePilotInvitationDto,
    @Req() request: DirektRequest,
  ): ReturnType<PilotInvitationService['create']> {
    return this.invitations.create(dto, request.actor.identityId, request.requestId);
  }

  @Get()
  @ApiOkResponse({ description: 'Lists privacy-minimized pilot invitation states.' })
  list(): ReturnType<PilotInvitationService['list']> {
    return this.invitations.list();
  }

  @Post(':invitationId/revoke')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Revokes one unclaimed pilot invitation.' })
  revoke(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @Body() dto: RevokePilotInvitationDto,
    @Req() request: DirektRequest,
  ): ReturnType<PilotInvitationService['revoke']> {
    return this.invitations.revoke(
      invitationId,
      dto,
      request.actor.identityId,
      request.requestId,
    );
  }
}

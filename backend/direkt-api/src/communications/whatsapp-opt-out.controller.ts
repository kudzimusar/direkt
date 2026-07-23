import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { WhatsAppOptOutService } from './whatsapp-opt-out.service';

@ApiTags('communications')
@ApiBearerAuth()
@RequirePermission(PERMISSIONS.ACCOUNT_SESSIONS_MANAGE)
@Controller('communications/whatsapp')
export class WhatsAppOptOutController {
  constructor(private readonly optOutService: WhatsAppOptOutService) {}

  @Post('opt-out')
  @HttpCode(200)
  @ApiOkResponse({
    description:
      'Opts all verified phone contacts owned by the authenticated identity out of WhatsApp delivery without exposing raw contact values.',
  })
  optOut(@Req() request: DirektRequest): ReturnType<WhatsAppOptOutService['optOut']> {
    return this.optOutService.optOut(request.actor, request.requestId);
  }
}

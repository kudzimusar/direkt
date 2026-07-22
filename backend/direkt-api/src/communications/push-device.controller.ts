import { Body, Controller, Delete, HttpCode, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { DirektRequest } from '../platform/http/request-context';
import { RegisterPushDeviceDto } from './push-device.dto';
import { PushDeviceTokenService } from './push-device-token.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/push/devices')
export class PushDeviceController {
  constructor(private readonly pushDeviceTokenService: PushDeviceTokenService) {}

  @Post()
  @HttpCode(200)
  @ApiOkResponse({
    description:
      'Registers or rotates the authenticated identity’s Android push installation when the controlled-pilot gate is enabled.',
  })
  register(
    @Body() dto: RegisterPushDeviceDto,
    @Req() request: DirektRequest,
  ): ReturnType<PushDeviceTokenService['register']> {
    return this.pushDeviceTokenService.register(request.actor, dto, request.requestId);
  }

  @Delete(':installationId')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Deletes one push installation owned by the authenticated identity.' })
  unregister(
    @Param('installationId', ParseUUIDPipe) installationId: string,
    @Req() request: DirektRequest,
  ): ReturnType<PushDeviceTokenService['unregister']> {
    return this.pushDeviceTokenService.unregister(request.actor, installationId, request.requestId);
  }
}

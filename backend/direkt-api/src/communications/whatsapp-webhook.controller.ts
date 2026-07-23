import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Public } from '../authorization/public.decorator';
import { WhatsAppWebhookService } from './whatsapp-webhook.service';

interface RawBodyRequestLike {
  rawBody?: Buffer;
}

@ApiTags('communications')
@Controller('communications/whatsapp/webhook')
export class WhatsAppWebhookController {
  constructor(private readonly webhookService: WhatsAppWebhookService) {}

  @Get()
  @Public()
  @ApiExcludeEndpoint()
  verify(
    @Query('hub.mode') mode: unknown,
    @Query('hub.verify_token') token: unknown,
    @Query('hub.challenge') challenge: unknown,
  ): string {
    return this.webhookService.verifyChallenge(mode, token, challenge);
  }

  @Post()
  @Public()
  @ApiExcludeEndpoint()
  receive(
    @Req() request: RawBodyRequestLike,
    @Headers('x-hub-signature-256') signature: string | undefined,
    @Body() body: unknown,
  ): ReturnType<WhatsAppWebhookService['processWebhook']> {
    return this.webhookService.processWebhook(request.rawBody, signature, body);
  }
}

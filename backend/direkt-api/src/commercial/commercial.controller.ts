import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { Public } from '../authorization/public.decorator';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  CancelCommercialPaymentIntentDto,
  CancelCommercialSubscriptionDto,
  CommercialPolicyDto,
  CreateCommercialPaymentIntentDto,
  CreateCommercialSubscriptionDto,
  SyntheticPaymentWebhookDto,
} from './commercial.dto';
import { CommercialService } from './commercial.service';

@ApiTags('commercial products and provider subscriptions')
@Controller()
export class CommercialController {
  constructor(private readonly commercial: CommercialService) {}

  @Get('commercial/products')
  @Public()
  @ApiOkResponse({ description: 'Returns the safe synthetic commercial product catalogue.' })
  products() {
    return this.commercial.products();
  }

  @Get('provider-workspace/me/commercial')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_SUBSCRIPTIONS_READ, { providerFromActor: true })
  @ApiOkResponse({ description: 'Returns the actor-resolved provider commercial workspace.' })
  providerWorkspace(@Req() request: DirektRequest) {
    return this.commercial.providerWorkspace(request.actor);
  }

  @Post('provider-workspace/me/subscriptions')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_SUBSCRIPTIONS_MANAGE, {
    providerFromActor: true,
  })
  @ApiCreatedResponse({ description: 'Creates one retry-safe pending provider subscription.' })
  createSubscription(
    @Req() request: DirektRequest,
    @Body() dto: CreateCommercialSubscriptionDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.commercial.createSubscription(
      request.actor,
      dto,
      idempotencyKey,
      request.requestId,
    );
  }

  @Post('provider-workspace/me/subscriptions/:subscriptionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_SUBSCRIPTIONS_MANAGE, {
    providerFromActor: true,
  })
  @ApiOkResponse({ description: 'Cancels one provider-scoped non-terminal subscription.' })
  cancelSubscription(
    @Req() request: DirektRequest,
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: CancelCommercialSubscriptionDto,
  ) {
    return this.commercial.cancelSubscription(
      request.actor,
      subscriptionId,
      dto,
      request.requestId,
    );
  }

  @Post('provider-workspace/me/subscriptions/:subscriptionId/invoices')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_SUBSCRIPTIONS_MANAGE, {
    providerFromActor: true,
  })
  @ApiCreatedResponse({ description: 'Issues or returns the current immutable subscription invoice.' })
  issueInvoice(
    @Req() request: DirektRequest,
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: CommercialPolicyDto,
  ) {
    return this.commercial.issueInvoice(
      request.actor,
      subscriptionId,
      dto,
      request.requestId,
    );
  }

  @Post('provider-workspace/me/invoices/:invoiceId/payment-intents')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_PAYMENTS_INITIATE, { providerFromActor: true })
  @ApiCreatedResponse({ description: 'Creates one retry-safe synthetic payment intent.' })
  createPaymentIntent(
    @Req() request: DirektRequest,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
    @Body() dto: CreateCommercialPaymentIntentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.commercial.createPaymentIntent(
      request.actor,
      invoiceId,
      dto,
      idempotencyKey,
      request.requestId,
    );
  }

  @Post('provider-workspace/me/payment-intents/:paymentIntentId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.COMMERCIAL_PAYMENTS_INITIATE, { providerFromActor: true })
  @ApiOkResponse({ description: 'Cancels one provider-scoped non-terminal payment intent.' })
  cancelPaymentIntent(
    @Req() request: DirektRequest,
    @Param('paymentIntentId', ParseUUIDPipe) paymentIntentId: string,
    @Body() dto: CancelCommercialPaymentIntentDto,
  ) {
    return this.commercial.cancelPaymentIntent(
      request.actor,
      paymentIntentId,
      dto,
      request.requestId,
    );
  }
}

@ApiTags('synthetic payment webhooks')
@Controller('webhooks/payments')
export class CommercialWebhookController {
  constructor(private readonly commercial: CommercialService) {}

  @Post('synthetic')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiHeader({ name: 'x-direkt-signature', required: true })
  @ApiHeader({ name: 'x-direkt-timestamp', required: true })
  @ApiOkResponse({
    description: 'Verifies and processes one bounded synthetic webhook without storing raw payload.',
  })
  processSyntheticWebhook(
    @Body() dto: SyntheticPaymentWebhookDto,
    @Headers('x-direkt-signature') signature?: string,
    @Headers('x-direkt-timestamp') timestamp?: string,
  ) {
    return this.commercial.processSyntheticWebhook(dto, signature, timestamp);
  }
}

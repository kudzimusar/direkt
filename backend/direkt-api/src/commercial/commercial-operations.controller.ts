import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  CommercialPolicyDto,
  DecideCommercialAdjustmentDto,
  RequestCommercialAdjustmentDto,
  TransitionCommercialProductDto,
  TransitionCommercialSubscriptionDto,
  TransitionReconciliationCaseDto,
} from './commercial.dto';
import { CommercialService } from './commercial.service';

@ApiTags('operations commercial controls')
@ApiBearerAuth()
@Controller('operations/commercial')
export class CommercialOperationsController {
  constructor(private readonly commercial: CommercialService) {}

  @Get()
  @RequirePermission(PERMISSIONS.COMMERCIAL_RECONCILIATION_READ)
  @ApiOkResponse({ description: 'Returns the safe API-only commercial operations overview.' })
  overview() {
    return this.commercial.operationsOverview();
  }

  @Post('products/:productId/transitions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COMMERCIAL_PRODUCTS_MANAGE)
  @ApiOkResponse({ description: 'Activates or retires one commercial product.' })
  transitionProduct(
    @Req() request: DirektRequest,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: TransitionCommercialProductDto,
  ) {
    return this.commercial.transitionProduct(request.actor, productId, dto, request.requestId);
  }

  @Post('subscriptions/:subscriptionId/transitions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COMMERCIAL_SUBSCRIPTIONS_MANAGE)
  @ApiOkResponse({ description: 'Applies an authorized subscription lifecycle transition.' })
  transitionSubscription(
    @Req() request: DirektRequest,
    @Param('subscriptionId', ParseUUIDPipe) subscriptionId: string,
    @Body() dto: TransitionCommercialSubscriptionDto,
  ) {
    return this.commercial.transitionSubscriptionOperations(
      request.actor,
      subscriptionId,
      dto,
      request.requestId,
    );
  }

  @Post('reconciliation/:reconciliationCaseId/transitions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COMMERCIAL_RECONCILIATION_MANAGE)
  @ApiOkResponse({ description: 'Transitions one reconciliation exception with reasoned audit.' })
  transitionReconciliation(
    @Req() request: DirektRequest,
    @Param('reconciliationCaseId', ParseUUIDPipe) reconciliationCaseId: string,
    @Body() dto: TransitionReconciliationCaseDto,
  ) {
    return this.commercial.transitionReconciliation(
      request.actor,
      reconciliationCaseId,
      dto,
      request.requestId,
    );
  }

  @Post('adjustments')
  @RequirePermission(PERMISSIONS.COMMERCIAL_ADJUSTMENTS_REQUEST)
  @ApiCreatedResponse({ description: 'Creates one bounded adjustment request.' })
  requestAdjustment(
    @Req() request: DirektRequest,
    @Body() dto: RequestCommercialAdjustmentDto,
  ) {
    return this.commercial.requestAdjustment(request.actor, dto, request.requestId);
  }

  @Post('adjustments/:adjustmentId/decisions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COMMERCIAL_ADJUSTMENTS_APPROVE)
  @ApiOkResponse({ description: 'Records one separated adjustment approval or rejection.' })
  decideAdjustment(
    @Req() request: DirektRequest,
    @Param('adjustmentId', ParseUUIDPipe) adjustmentId: string,
    @Body() dto: DecideCommercialAdjustmentDto,
  ) {
    return this.commercial.decideAdjustment(
      request.actor,
      adjustmentId,
      dto,
      request.requestId,
    );
  }

  @Post('adjustments/:adjustmentId/apply')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.COMMERCIAL_ADJUSTMENTS_APPROVE)
  @ApiOkResponse({ description: 'Posts an approved adjustment through the balanced ledger.' })
  applyAdjustment(
    @Req() request: DirektRequest,
    @Param('adjustmentId', ParseUUIDPipe) adjustmentId: string,
    @Body() dto: CommercialPolicyDto,
  ) {
    return this.commercial.applyAdjustment(
      request.actor,
      adjustmentId,
      dto,
      request.requestId,
    );
  }
}

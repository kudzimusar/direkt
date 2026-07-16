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
  ApproveOperationsOverrideDto,
  CreateOperationsEscalationDto,
  CreateOperationsOverrideDto,
  ResolveOperationsEscalationDto,
  StartOperationsEscalationDto,
} from './operations-escalation.dto';
import { OperationsEscalationService } from './operations-escalation.service';
import type {
  OperationsEscalationView,
  OperationsOverrideRequestView,
} from './operations-escalation.types';

@ApiTags('operations escalations and overrides')
@ApiBearerAuth()
@Controller('operations')
export class OperationsEscalationController {
  constructor(private readonly service: OperationsEscalationService) {}

  @Get('escalations')
  @RequirePermission(PERMISSIONS.OPERATIONS_ESCALATIONS_READ)
  @ApiOkResponse({
    description:
      'Lists assigned or authorized escalations without private evidence content or reviewer notes.',
  })
  escalations(@Req() request: DirektRequest): Promise<OperationsEscalationView[]> {
    return this.service.escalations(request.actor);
  }

  @Post('escalations')
  @RequirePermission(PERMISSIONS.OPERATIONS_ESCALATIONS_MANAGE)
  @ApiCreatedResponse({
    description: 'Creates a policy-versioned verification escalation with owner and due date.',
  })
  createEscalation(
    @Req() request: DirektRequest,
    @Body() body: CreateOperationsEscalationDto,
  ): Promise<OperationsEscalationView> {
    return this.service.createEscalation(request.actor, body, request.requestId);
  }

  @Post('escalations/:escalationId/start')
  @RequirePermission(PERMISSIONS.OPERATIONS_ESCALATIONS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Starts an escalation owned by the authenticated supervisor.' })
  startEscalation(
    @Req() request: DirektRequest,
    @Param('escalationId', ParseUUIDPipe) escalationId: string,
    @Body() body: StartOperationsEscalationDto,
  ): Promise<OperationsEscalationView> {
    return this.service.startEscalation(
      request.actor,
      escalationId,
      body.reason,
      request.requestId,
    );
  }

  @Post('escalations/:escalationId/resolve')
  @RequirePermission(PERMISSIONS.OPERATIONS_ESCALATIONS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Resolves or dismisses an active verification escalation.' })
  resolveEscalation(
    @Req() request: DirektRequest,
    @Param('escalationId', ParseUUIDPipe) escalationId: string,
    @Body() body: ResolveOperationsEscalationDto,
  ): Promise<OperationsEscalationView> {
    return this.service.resolveEscalation(request.actor, escalationId, body, request.requestId);
  }

  @Get('high-risk-overrides')
  @RequirePermission(PERMISSIONS.OPERATIONS_OVERRIDE_REQUEST)
  @ApiOkResponse({
    description:
      'Lists evidence-backed override authorizations. These records never create decisions, claims or publication.',
  })
  overrides(@Req() request: DirektRequest): Promise<OperationsOverrideRequestView[]> {
    return this.service.overrides(request.actor);
  }

  @Post('high-risk-overrides')
  @RequirePermission(PERMISSIONS.OPERATIONS_OVERRIDE_REQUEST)
  @ApiCreatedResponse({
    description:
      'Requests high-risk authorization from a server-owned current mandatory-evidence snapshot.',
  })
  createOverride(
    @Req() request: DirektRequest,
    @Body() body: CreateOperationsOverrideDto,
  ): Promise<OperationsOverrideRequestView> {
    return this.service.createOverride(request.actor, body, request.requestId);
  }

  @Post('high-risk-overrides/:overrideRequestId/approvals')
  @RequirePermission(PERMISSIONS.OPERATIONS_OVERRIDE_APPROVE)
  @ApiCreatedResponse({
    description:
      'Records one immutable independent approval or rejection. Two distinct approvals are required.',
  })
  approveOverride(
    @Req() request: DirektRequest,
    @Param('overrideRequestId', ParseUUIDPipe) overrideRequestId: string,
    @Body() body: ApproveOperationsOverrideDto,
  ): Promise<OperationsOverrideRequestView> {
    return this.service.approveOverride(request.actor, overrideRequestId, body, request.requestId);
  }
}

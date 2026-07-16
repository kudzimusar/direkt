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
  CancelOperationsFieldWorkDto,
  CreateOperationsFieldWorkDto,
  ReassignOperationsFieldWorkDto,
  SubmitOperationsFieldInspectionDto,
  TransitionOperationsFieldWorkDto,
} from './operations-field.dto';
import { OperationsFieldService } from './operations-field.service';
import type { OperationsFieldQueue, OperationsFieldWorkItem } from './operations-field.types';

@ApiTags('operations field workflow')
@ApiBearerAuth()
@Controller('operations/field-work-items')
export class OperationsFieldController {
  constructor(private readonly service: OperationsFieldService) {}

  @Get()
  @RequirePermission(PERMISSIONS.OPERATIONS_FIELD_WORK_READ)
  @ApiOkResponse({
    description:
      'Lists field work for the assigned field agent or all work for trust supervisors and administrators.',
  })
  queue(@Req() request: DirektRequest): Promise<OperationsFieldQueue> {
    return this.service.queue(request.actor);
  }

  @Get(':workItemId')
  @RequirePermission(PERMISSIONS.OPERATIONS_FIELD_WORK_READ)
  @ApiOkResponse({
    description:
      'Reads one scoped field-work item without private coordinates, private notes or evidence identifiers.',
  })
  detail(
    @Req() request: DirektRequest,
    @Param('workItemId', ParseUUIDPipe) workItemId: string,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.detail(request.actor, workItemId);
  }

  @Post()
  @RequirePermission(PERMISSIONS.OPERATIONS_FIELD_WORK_MANAGE)
  @ApiCreatedResponse({
    description:
      'Creates one scoped field-agent assignment and policy-versioned inspection work item.',
  })
  create(
    @Req() request: DirektRequest,
    @Body() body: CreateOperationsFieldWorkDto,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.create(request.actor, body, request.requestId);
  }

  @Post(':workItemId/transitions')
  @RequirePermission(PERMISSIONS.VERIFICATION_FIELD_VISIT_RECORD)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Lets the assigned field agent accept or start the scoped inspection.',
  })
  transition(
    @Req() request: DirektRequest,
    @Param('workItemId', ParseUUIDPipe) workItemId: string,
    @Body() body: TransitionOperationsFieldWorkDto,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.transition(request.actor, workItemId, body, request.requestId);
  }

  @Post(':workItemId/submissions')
  @RequirePermission(PERMISSIONS.VERIFICATION_FIELD_VISIT_RECORD)
  @ApiCreatedResponse({
    description:
      'Records an immutable idempotent advisory inspection submission and the existing scoped field-visit record.',
  })
  submit(
    @Req() request: DirektRequest,
    @Param('workItemId', ParseUUIDPipe) workItemId: string,
    @Body() body: SubmitOperationsFieldInspectionDto,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.submit(request.actor, workItemId, body, request.requestId);
  }

  @Post(':workItemId/reassign')
  @RequirePermission(PERMISSIONS.OPERATIONS_FIELD_WORK_MANAGE)
  @ApiCreatedResponse({
    description: 'Atomically closes the prior field assignment and creates a scoped replacement.',
  })
  reassign(
    @Req() request: DirektRequest,
    @Param('workItemId', ParseUUIDPipe) workItemId: string,
    @Body() body: ReassignOperationsFieldWorkDto,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.reassign(request.actor, workItemId, body, request.requestId);
  }

  @Post(':workItemId/cancel')
  @RequirePermission(PERMISSIONS.OPERATIONS_FIELD_WORK_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Cancels active field work and revokes its field-agent assignment.',
  })
  cancel(
    @Req() request: DirektRequest,
    @Param('workItemId', ParseUUIDPipe) workItemId: string,
    @Body() body: CancelOperationsFieldWorkDto,
  ): Promise<OperationsFieldWorkItem> {
    return this.service.cancel(request.actor, workItemId, body, request.requestId);
  }
}

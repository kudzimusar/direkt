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
  CreateOperationsIncidentDto,
  ResolveOperationsIncidentDto,
  StartOperationsIncidentDto,
} from './operations-reporting.dto';
import { OperationsReportingService } from './operations-reporting.service';
import type {
  OperationsExpiryItem,
  OperationsIncidentView,
  OperationsMetricsExport,
  OperationsMetricsSnapshot,
} from './operations-reporting.types';

@ApiTags('operations incidents and reporting')
@ApiBearerAuth()
@Controller('operations')
export class OperationsReportingController {
  constructor(private readonly service: OperationsReportingService) {}

  @Get('incidents')
  @RequirePermission(PERMISSIONS.OPERATIONS_INCIDENTS_READ)
  @ApiOkResponse({
    description:
      'Lists bounded internal complaint and incident records without private details or customer interaction history.',
  })
  incidents(@Req() request: DirektRequest): Promise<OperationsIncidentView[]> {
    return this.service.incidents(request.actor);
  }

  @Post('incidents')
  @RequirePermission(PERMISSIONS.OPERATIONS_INCIDENTS_MANAGE)
  @ApiCreatedResponse({
    description:
      'Creates an internal operations record linked only to authorized provider, case and evidence scope.',
  })
  createIncident(
    @Req() request: DirektRequest,
    @Body() body: CreateOperationsIncidentDto,
  ): Promise<OperationsIncidentView> {
    return this.service.createIncident(request.actor, body, request.requestId);
  }

  @Post('incidents/:incidentId/start')
  @RequirePermission(PERMISSIONS.OPERATIONS_INCIDENTS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Starts an internal incident owned by the authenticated operator.',
  })
  startIncident(
    @Req() request: DirektRequest,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Body() body: StartOperationsIncidentDto,
  ): Promise<OperationsIncidentView> {
    return this.service.startIncident(request.actor, incidentId, body.reason, request.requestId);
  }

  @Post('incidents/:incidentId/resolve')
  @RequirePermission(PERMISSIONS.OPERATIONS_INCIDENTS_MANAGE)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Resolves or dismisses a bounded internal operations record.' })
  resolveIncident(
    @Req() request: DirektRequest,
    @Param('incidentId', ParseUUIDPipe) incidentId: string,
    @Body() body: ResolveOperationsIncidentDto,
  ): Promise<OperationsIncidentView> {
    return this.service.resolveIncident(request.actor, incidentId, body, request.requestId);
  }

  @Get('expiry-renewal')
  @RequirePermission(PERMISSIONS.OPERATIONS_REPORTING_READ)
  @ApiOkResponse({
    description:
      'Lists evidence and claim expiry/renewal states without document content, object keys or private coordinates.',
  })
  expiry(): Promise<OperationsExpiryItem[]> {
    return this.service.expiry();
  }

  @Get('reporting/metrics')
  @RequirePermission(PERMISSIONS.OPERATIONS_REPORTING_READ)
  @ApiOkResponse({ description: 'Returns aggregate privacy-safe operations metrics.' })
  metrics(): Promise<OperationsMetricsSnapshot> {
    return this.service.metrics();
  }

  @Get('reporting/export')
  @RequirePermission(PERMISSIONS.OPERATIONS_REPORTING_EXPORT)
  @ApiOkResponse({
    description:
      'Returns an allowlisted JSON metrics export without provider, evidence or private-location identifiers.',
  })
  exportMetrics(): Promise<OperationsMetricsExport> {
    return this.service.exportMetrics();
  }
}

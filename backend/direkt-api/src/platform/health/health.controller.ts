import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PublicRoute } from '../../authorization/public.decorator';
import { HealthService, type LivenessResponse, type ReadinessResponse } from './health.service';

@PublicRoute()
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOkResponse({ description: 'The API process is alive.' })
  liveness(): LivenessResponse {
    return this.healthService.liveness();
  }

  @Get('ready')
  @ApiOkResponse({ description: 'The API, PostgreSQL and PostGIS are ready.' })
  @ApiServiceUnavailableResponse({ description: 'PostgreSQL or PostGIS is unavailable.' })
  readiness(): Promise<ReadinessResponse> {
    return this.healthService.readiness();
  }
}

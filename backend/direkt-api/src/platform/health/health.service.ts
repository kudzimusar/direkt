import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface LivenessResponse {
  status: 'ok';
  service: 'direkt-api';
  timestamp: string;
}

export interface ReadinessResponse extends LivenessResponse {
  database: {
    status: 'ready';
    name: string;
    postgisVersion: string;
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  liveness(): LivenessResponse {
    return {
      status: 'ok',
      service: 'direkt-api',
      timestamp: new Date().toISOString(),
    };
  }

  async readiness(): Promise<ReadinessResponse> {
    try {
      const readiness = await this.database.checkReadiness();
      return {
        ...this.liveness(),
        database: {
          status: 'ready',
          name: readiness.database,
          postgisVersion: readiness.postgisVersion,
        },
      };
    } catch {
      throw new ServiceUnavailableException('Database or PostGIS is not ready.');
    }
  }
}

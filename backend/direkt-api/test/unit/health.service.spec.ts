import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { DatabaseService } from '../../src/platform/database/database.service';
import { HealthService } from '../../src/platform/health/health.service';

describe('HealthService', () => {
  it('returns deterministic liveness metadata', () => {
    const database = {
      checkReadiness: vi.fn(),
    } as unknown as DatabaseService;
    const service = new HealthService(database);

    const result = service.liveness();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('direkt-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it('reports the database and PostGIS version when ready', async () => {
    const database = {
      checkReadiness: vi.fn().mockResolvedValue({
        database: 'direkt',
        postgisVersion: '3.6.4',
      }),
    } as unknown as DatabaseService;
    const service = new HealthService(database);

    await expect(service.readiness()).resolves.toMatchObject({
      status: 'ok',
      database: {
        status: 'ready',
        name: 'direkt',
        postgisVersion: '3.6.4',
      },
    });
  });

  it('converts database failures into a safe service-unavailable response', async () => {
    const database = {
      checkReadiness: vi.fn().mockRejectedValue(new Error('private database detail')),
    } as unknown as DatabaseService;
    const service = new HealthService(database);

    await expect(service.readiness()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});

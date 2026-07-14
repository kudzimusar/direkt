import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';

describe('DIREKT API HTTP foundation', () => {
  let app: INestApplication;

  const httpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves liveness with a generated request ID', async () => {
    const response = await request(httpServer()).get('/api/v1/health/live').expect(200);

    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/i);
    expect(response.body as unknown).toMatchObject({
      status: 'ok',
      service: 'direkt-api',
    });
  });

  it('preserves a valid caller request ID', async () => {
    const requestId = '4d3f531f-2218-49ac-8ad2-2df414d12c25';
    const response = await request(httpServer())
      .get('/api/v1/health/live')
      .set('x-request-id', requestId)
      .expect(200);

    expect(response.headers['x-request-id']).toBe(requestId);
  });

  it('returns RFC 7807-compatible details for unknown routes', async () => {
    const response = await request(httpServer())
      .get('/api/v1/not-a-real-route')
      .expect('content-type', /application\/problem\+json/)
      .expect(404);
    const body = response.body as { requestId?: unknown };

    expect(body).toMatchObject({
      type: 'about:blank',
      status: 404,
      instance: '/api/v1/not-a-real-route',
    });
    expect(body.requestId).toBe(response.headers['x-request-id']);
  });
});

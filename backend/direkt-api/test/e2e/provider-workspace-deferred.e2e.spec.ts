import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';

interface ChallengeResponse {
  challengeId: string;
  synthetic: { code: string };
}

interface SessionResponse {
  accessToken: string;
}

interface DeferredSurfaceResponse {
  state: string;
  phaseOwner: string;
  mutationAllowed: false;
  message: string;
}

describe('Phase 6 deferred provider workspace boundaries', () => {
  const url = databaseUrl();
  let app: INestApplication;
  let owner: SessionResponse;

  const httpServer = (): Server => app.getHttpServer() as Server;

  async function signIn(contact: string): Promise<SessionResponse> {
    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact })
      .expect(202);
    const body = challenge.body as ChallengeResponse;
    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: body.challengeId,
        code: body.synthetic.code,
        deviceLabel: 'Synthetic deferred-boundary client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase6-deferred-owner@example.invalid');
    await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Deferred Boundary Provider',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic locality',
        serviceAreaSummary: 'Synthetic service area',
        registeredBusinessName: 'Synthetic Deferred Boundary Provider Limited',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['enquiries', 'phase8', 'empty'],
    ['review-responses', 'phase8', 'empty'],
    ['subscription-status', 'phase9', 'synthetic_only'],
  ])('returns a read-only %s boundary', async (path, phaseOwner, state) => {
    const response = await request(httpServer())
      .get(`/api/v1/provider-workspace/me/${path}`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const body = response.body as DeferredSurfaceResponse;

    expect(body).toMatchObject({
      phaseOwner,
      state,
      mutationAllowed: false,
    });
    expect(body.message.length).toBeGreaterThan(20);
  });

  it.each(['enquiries', 'review-responses', 'subscription-status'])(
    'exposes no Phase 6 mutation route for %s',
    async (path) => {
      await request(httpServer())
        .post(`/api/v1/provider-workspace/me/${path}`)
        .set('authorization', `Bearer ${owner.accessToken}`)
        .send({ syntheticMutation: true })
        .expect(404);

      await request(httpServer())
        .put(`/api/v1/provider-workspace/me/${path}`)
        .set('authorization', `Bearer ${owner.accessToken}`)
        .send({ syntheticMutation: true })
        .expect(404);
    },
  );
});

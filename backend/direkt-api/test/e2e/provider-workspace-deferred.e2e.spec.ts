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

interface CommercialWorkspaceResponse {
  providerScope: string;
  products: Array<{ productKey: string; synthetic: true }>;
  subscriptions: unknown[];
  invoices: unknown[];
  paymentIntents: unknown[];
  paymentProviderMode: string;
  credentialStored: false;
  verificationMutation: false;
  publicationMutation: false;
  rankingMutation: false;
}

describe('Promoted provider workspace phase boundaries', () => {
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
        deviceLabel: 'Synthetic promoted-boundary client',
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

    owner = await signIn('phase9-promoted-owner@example.invalid');
    await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Promoted Boundary Provider',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic locality',
        serviceAreaSummary: 'Synthetic service area',
        registeredBusinessName: 'Synthetic Promoted Boundary Provider Limited',
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('removes the former Phase 9 subscription placeholder', async () => {
    await request(httpServer())
      .get('/api/v1/provider-workspace/me/subscription-status')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(404);

    await request(httpServer())
      .post('/api/v1/provider-workspace/me/subscription-status')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ syntheticMutation: true })
      .expect(404);
  });

  it('returns the live actor-resolved Phase 9 commercial workspace', async () => {
    const response = await request(httpServer())
      .get('/api/v1/provider-workspace/me/commercial')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const body = response.body as CommercialWorkspaceResponse;

    expect(body).toMatchObject({
      providerScope: 'actor_resolved',
      subscriptions: [],
      invoices: [],
      paymentIntents: [],
      paymentProviderMode: 'synthetic',
      credentialStored: false,
      verificationMutation: false,
      publicationMutation: false,
      rankingMutation: false,
    });
    expect(body.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productKey: 'provider_workspace_core', synthetic: true }),
      ]),
    );
  });

  it('keeps the former Phase 8 review-response placeholder removed', async () => {
    await request(httpServer())
      .get('/api/v1/provider-workspace/me/review-responses')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(404);

    await request(httpServer())
      .post('/api/v1/provider-workspace/me/review-responses')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ syntheticMutation: true })
      .expect(404);
  });
});

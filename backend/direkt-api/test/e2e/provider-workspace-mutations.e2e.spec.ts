import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import { Pool } from 'pg';
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
  identityId: string;
  accessToken: string;
}

interface ProviderResponse {
  id: string;
}

interface WorkspaceResponse {
  providerId: string;
  provider: { displayName: string; localitySummary: string | null; discoverable: boolean };
  categories: Array<{ categoryKey: string; status: string; currentClaims: number }>;
  location: {
    configured: boolean;
    privateBaseStored: boolean;
    publicPremisesConfigured: boolean;
    publicPremisesConsent: boolean;
    publicLocality: string | null;
    serviceAreaConfigured: boolean;
  };
  availability: Array<{
    categoryKey: string;
    state: string;
    nextAvailableAt: string | null;
  }>;
}

describe('Phase 6 provider workspace mutation boundaries', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let owner: SessionResponse;
  let provider: ProviderResponse;

  const httpServer = (): Server => app.getHttpServer() as Server;

  async function signIn(contact: string): Promise<SessionResponse> {
    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact })
      .expect(202);
    const challengeBody = challenge.body as ChallengeResponse;
    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: challengeBody.challengeId,
        code: challengeBody.synthetic.code,
        deviceLabel: 'Synthetic Phase 6 workspace mutation client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function trustState(): Promise<{ claims: number; publications: number }> {
    const result = await pool.query<{ claims: string; publications: string }>(
      `SELECT
         (SELECT count(*) FROM verification.claims WHERE provider_id = $1)::text AS claims,
         (SELECT count(*) FROM discovery.publications WHERE provider_id = $1)::text AS publications`,
      [provider.id],
    );
    return {
      claims: Number(result.rows[0]?.claims ?? 0),
      publications: Number(result.rows[0]?.publications ?? 0),
    };
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase6-workspace-mutations@example.invalid');
    const response = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Workspace Mutations',
        operatingModel: 'hybrid',
        localitySummary: 'Initial synthetic locality',
        serviceAreaSummary: 'Initial synthetic service area',
        registeredBusinessName: 'Synthetic Workspace Mutations Limited',
      })
      .expect(201);
    provider = response.body as ProviderResponse;

    await request(httpServer())
      .put(`/api/v1/providers/${provider.id}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('updates the server-resolved profile without creating claims or publication', async () => {
    const before = await trustState();
    const response = await request(httpServer())
      .patch('/api/v1/provider-workspace/me/profile')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('x-direkt-provider-id', '00000000-0000-4000-8000-000000000999')
      .send({
        displayName: 'Synthetic Workspace Updated',
        localitySummary: 'Woodlands, Lusaka',
      })
      .expect(200);
    const workspace = response.body as WorkspaceResponse;

    expect(workspace).toMatchObject({
      providerId: provider.id,
      provider: {
        displayName: 'Synthetic Workspace Updated',
        localitySummary: 'Woodlands, Lusaka',
        discoverable: false,
      },
    });
    expect(await trustState()).toEqual(before);
  });

  it('stores private base, consented public premises and service area separately without echoing coordinates', async () => {
    const before = await trustState();
    const response = await request(httpServer())
      .put('/api/v1/provider-workspace/me/location')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        privateBaseLatitude: -14.101,
        privateBaseLongitude: 27.101,
        publicPremisesLatitude: -15.421,
        publicPremisesLongitude: 28.335,
        publicPremisesConsent: true,
        publicLocality: 'Woodlands, Lusaka',
        serviceAreaWkt:
          'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
      })
      .expect(200);
    const workspace = response.body as WorkspaceResponse;

    expect(workspace.location).toEqual(
      expect.objectContaining({
        configured: true,
        privateBaseStored: true,
        publicPremisesConfigured: true,
        publicPremisesConsent: true,
        publicLocality: 'Woodlands, Lusaka',
        serviceAreaConfigured: true,
      }),
    );
    const serialized = JSON.stringify(workspace);
    expect(serialized).not.toContain('-14.101');
    expect(serialized).not.toContain('27.101');
    expect(serialized).not.toContain('-15.421');
    expect(serialized).not.toContain('28.335');
    expect(serialized).not.toContain('POLYGON');

    const audit = await pool.query<{ metadata: Record<string, unknown> }>(
      `SELECT metadata
       FROM platform.audit_events
       WHERE provider_id = $1
         AND action = 'provider_workspace_location_updated'
       ORDER BY occurred_at DESC
       LIMIT 1`,
      [provider.id],
    );
    expect(JSON.stringify(audit.rows[0]?.metadata)).not.toContain('latitude');
    expect(JSON.stringify(audit.rows[0]?.metadata)).not.toContain('longitude');
    expect(await trustState()).toEqual(before);
  });

  it('rejects partial or unconsented public coordinate writes', async () => {
    await request(httpServer())
      .put('/api/v1/provider-workspace/me/location')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        privateBaseLatitude: -14.101,
        publicPremisesConsent: false,
        publicLocality: 'Woodlands, Lusaka',
        serviceAreaWkt:
          'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
      })
      .expect(400);

    await request(httpServer())
      .put('/api/v1/provider-workspace/me/location')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        publicPremisesLatitude: -15.421,
        publicPremisesLongitude: 28.335,
        publicPremisesConsent: false,
        publicLocality: 'Woodlands, Lusaka',
        serviceAreaWkt:
          'POLYGON((28.25 -15.50, 28.45 -15.50, 28.45 -15.30, 28.25 -15.30, 28.25 -15.50))',
      })
      .expect(400);
  });

  it('updates availability independently of claims and publication', async () => {
    const before = await trustState();
    const nextAvailableAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const response = await request(httpServer())
      .put('/api/v1/provider-workspace/me/availability/plumbing')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ state: 'limited', nextAvailableAt })
      .expect(200);
    const workspace = response.body as WorkspaceResponse;

    expect(workspace.availability).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryKey: 'plumbing',
          state: 'limited',
          nextAvailableAt,
        }),
      ]),
    );
    expect(await trustState()).toEqual(before);

    await request(httpServer())
      .put('/api/v1/provider-workspace/me/availability/plumbing')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ state: 'limited' })
      .expect(400);
  });

  it('removes and reselects a service without deleting historical trust records', async () => {
    const before = await trustState();
    const removedResponse = await request(httpServer())
      .delete('/api/v1/provider-workspace/me/services/plumbing')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ reason: 'Synthetic provider no longer offers this service.' })
      .expect(200);
    const removed = removedResponse.body as WorkspaceResponse;

    expect(removed.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ categoryKey: 'plumbing', status: 'removed' }),
      ]),
    );
    expect(removed.availability).toEqual([]);
    expect(await trustState()).toEqual(before);

    const selectedResponse = await request(httpServer())
      .put('/api/v1/provider-workspace/me/services/plumbing')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const selected = selectedResponse.body as WorkspaceResponse;
    expect(selected.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ categoryKey: 'plumbing', status: 'selected' }),
      ]),
    );
    expect(await trustState()).toEqual(before);
  });
});

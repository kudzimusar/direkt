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
  status: string;
  discoverable: boolean;
  displayName: string;
  categories: Array<{ categoryKey: string; requirementVersion: number }>;
}

describe('Phase 3 provider and category HTTP contracts', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let owner: SessionResponse;
  let representative: SessionResponse;
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
        deviceLabel: 'Synthetic Phase 3 client',
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
    owner = await signIn('phase3-owner@example.invalid');
    representative = await signIn('phase3-representative@example.invalid');
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('denies unauthenticated provider creation', async () => {
    await request(httpServer())
      .post('/api/v1/providers')
      .send({
        pathway: 'registered_business',
        displayName: 'Unauthorized synthetic provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Woodlands, Lusaka',
        serviceAreaSummary: 'Lusaka District',
        registeredBusinessName: 'Unauthorized Synthetic Limited',
      })
      .expect(401);
  });

  it('creates a customer profile and a non-public provider draft', async () => {
    await request(httpServer())
      .put('/api/v1/account/profile')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ displayName: 'Synthetic provider owner' })
      .expect(200);

    const response = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Copperbelt Repairs',
        operatingModel: 'fixed_premises',
        localitySummary: 'Woodlands, Lusaka',
        serviceAreaSummary: 'Woodlands and nearby Lusaka neighbourhoods',
        registeredBusinessName: 'Synthetic Copperbelt Repairs Limited',
      })
      .expect(201);
    provider = response.body as ProviderResponse;

    expect(provider.status).toBe('draft');
    expect(provider.discoverable).toBe(false);
    expect(provider.displayName).toBe('Synthetic Copperbelt Repairs');
  });

  it('lists versioned categories and pins the provider to an active version', async () => {
    const categories = await request(httpServer())
      .get('/api/v1/categories')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    expect(categories.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'plumbing', version: 1 }),
        expect.objectContaining({ key: 'mechanics', version: 1 }),
      ]),
    );

    const selected = await request(httpServer())
      .put(`/api/v1/providers/${provider.id}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    provider = selected.body as ProviderResponse;
    expect(provider.categories).toContainEqual(
      expect.objectContaining({ categoryKey: 'plumbing', requirementVersion: 1 }),
    );
  });

  it('denies a different customer despite tampered client role and provider headers', async () => {
    await request(httpServer())
      .get(`/api/v1/providers/${provider.id}`)
      .set('authorization', `Bearer ${representative.accessToken}`)
      .set('x-direkt-role', 'provider_owner')
      .set('x-direkt-provider-id', provider.id)
      .expect(403);
  });

  it('allows an owner to assign a provider-scoped representative', async () => {
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/representatives`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        identityId: representative.identityId,
        role: 'provider_member',
        reason: 'Synthetic representative assigned for Phase 3 testing',
      })
      .expect(201);

    await request(httpServer())
      .get(`/api/v1/providers/${provider.id}`)
      .set('authorization', `Bearer ${representative.accessToken}`)
      .expect(200);
  });

  it('denies the representative after the server-side assignment is revoked', async () => {
    await pool.query(
      `UPDATE authz.role_assignments AS assignments
       SET revoked_at = now()
       FROM authz.roles AS roles
       WHERE assignments.role_id = roles.id
         AND assignments.identity_id = $1
         AND assignments.provider_id = $2
         AND roles.role_key = 'provider_member'
         AND assignments.revoked_at IS NULL`,
      [representative.identityId, provider.id],
    );

    await request(httpServer())
      .get(`/api/v1/providers/${provider.id}`)
      .set('authorization', `Bearer ${representative.accessToken}`)
      .expect(403);
  });

  it('updates and transitions the provider only through valid internal states', async () => {
    const updated = await request(httpServer())
      .patch(`/api/v1/providers/${provider.id}/profile`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ serviceAreaSummary: 'Lusaka District synthetic coverage area' })
      .expect(200);
    expect((updated.body as ProviderResponse).discoverable).toBe(false);

    const ready = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic profile completed for Phase 3 contract testing',
      })
      .expect(201);
    expect((ready.body as ProviderResponse).status).toBe('ready_for_verification');

    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'archived',
        reason: 'Synthetic archive transition for lifecycle testing',
      })
      .expect(201);

    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'draft',
        reason: 'Invalid transition must remain blocked by the database',
      })
      .expect(400);
  });

  it('returns no discoverable provider and records actor-attributed audit events', async () => {
    const publicDirectory = await pool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM provider.public_directory',
    );
    expect(publicDirectory.rows[0]?.count).toBe('0');

    const audit = await pool.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM platform.audit_events
       WHERE provider_id = $1
         AND actor_id = $2
         AND action IN ('provider_draft_created', 'provider_profile_updated', 'provider_status_transitioned')`,
      [provider.id, owner.identityId],
    );
    expect(Number(audit.rows[0]?.count ?? '0')).toBeGreaterThanOrEqual(3);
  });
});
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
  message: string;
  synthetic: { code: string };
}

interface SessionResponse {
  identityId: string;
  sessionId: string;
  accessToken: string;
  refreshToken: string;
}

describe('Phase 2C authentication and authorization HTTP contracts', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let initial: SessionResponse;

  const httpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('acknowledges a synthetic challenge without account enumeration', async () => {
    const response = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact: 'phase2c@example.invalid' })
      .expect(202);
    const body = response.body as ChallengeResponse;

    expect(body.message).toMatch(/if the contact can receive/i);
    expect(body.synthetic.code).toBe('246810');

    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: body.challengeId,
        code: body.synthetic.code,
        deviceLabel: 'Phase 2C test client',
      })
      .expect(200);
    initial = verified.body as SessionResponse;
    expect(initial.accessToken).toMatch(/^dat1\./);
    expect(initial.refreshToken).toMatch(/^drt1_/);
  });

  it('lists only server-owned sessions for the authenticated identity', async () => {
    const response = await request(httpServer())
      .get('/api/v1/auth/sessions')
      .set('authorization', `Bearer ${initial.accessToken}`)
      .expect(200);
    const sessions = response.body as Array<{ id: string; current: boolean }>;

    expect(sessions).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: initial.sessionId, current: true })]),
    );
  });

  it('ignores a tampered client role and denies operations access', async () => {
    await request(httpServer())
      .get('/api/v1/operations/session')
      .set('authorization', `Bearer ${initial.accessToken}`)
      .set('x-direkt-role', 'admin')
      .expect(403);
  });

  it('grants operations access only after a server-side role assignment', async () => {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id,
         role_id,
         scope_type,
         reason
       )
       SELECT $1, id, 'global', 'Synthetic operations authorization test'
       FROM authz.roles
       WHERE role_key = 'admin'`,
      [initial.identityId],
    );

    const response = await request(httpServer())
      .get('/api/v1/operations/session')
      .set('authorization', `Bearer ${initial.accessToken}`)
      .expect(200);
    const body = response.body as { roles: string[]; permissions: string[] };
    expect(body.roles).toContain('admin');
    expect(body.permissions).toContain('admin.emergency_action');

    await request(httpServer())
      .post('/api/v1/operations/emergency-actions')
      .set('authorization', `Bearer ${initial.accessToken}`)
      .send({
        action: 'synthetic-access-review',
        reason: 'Synthetic Phase 2C incident-response exercise',
      })
      .expect(200, { recorded: true, appliedDomainChange: false });
  });

  it('rotates refresh tokens and revokes the family when an old token is reused', async () => {
    const rotatedResponse = await request(httpServer())
      .post('/api/v1/auth/sessions/rotate')
      .send({ refreshToken: initial.refreshToken })
      .expect(200);
    const rotated = rotatedResponse.body as SessionResponse;
    expect(rotated.refreshToken).not.toBe(initial.refreshToken);

    await request(httpServer())
      .post('/api/v1/auth/sessions/rotate')
      .send({ refreshToken: initial.refreshToken })
      .expect(401);

    await request(httpServer())
      .get('/api/v1/auth/sessions')
      .set('authorization', `Bearer ${rotated.accessToken}`)
      .expect(401);
  });
});

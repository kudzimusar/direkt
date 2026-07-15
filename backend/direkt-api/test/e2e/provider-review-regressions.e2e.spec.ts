import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';
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

describe('Phase 3 provider HTTP review regressions', () => {
  const url = databaseUrl();
  let app: INestApplication;
  let session: SessionResponse;

  const httpServer = (): Server => app.getHttpServer() as Server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    const challenge = await request(httpServer())
      .post('/api/v1/auth/challenges')
      .send({ channel: 'email', contact: 'phase3-review@example.invalid' })
      .expect(202);
    const challengeBody = challenge.body as ChallengeResponse;

    const verified = await request(httpServer())
      .post('/api/v1/auth/challenges/verify')
      .send({
        challengeId: challengeBody.challengeId,
        code: challengeBody.synthetic.code,
        deviceLabel: 'Synthetic Phase 3 review client',
      })
      .expect(200);
    session = verified.body as SessionResponse;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 when a trimmed customer display name violates the domain constraint', async () => {
    await request(httpServer())
      .put('/api/v1/account/profile')
      .set('authorization', `Bearer ${session.accessToken}`)
      .send({ displayName: '  ' })
      .expect(400);
  });
});

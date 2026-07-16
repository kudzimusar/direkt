import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { runMigrations } from '../../scripts/migration-lib';
import { databaseUrl } from '../../scripts/runtime-config';
import { AppModule } from '../../src/app.module';
import type { AuthenticatedActor } from '../../src/authorization/authenticated-actor';
import { configureApplication } from '../../src/configure-application';
import { OperationsFieldRepository } from '../../src/operations/operations-field.repository';

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

interface CaseResponse {
  id: string;
}

describe('Stage 7 field-work creation diagnostic', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let repository: OperationsFieldRepository;
  let owner: SessionResponse;
  let admin: SessionResponse;
  let fieldAgent: SessionResponse;
  let caseId: string;

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
        deviceLabel: 'Synthetic Stage 7 field creation diagnostic',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function grantRole(session: SessionResponse, roleKey: string): Promise<void> {
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $3
       FROM authz.roles
       WHERE role_key = $2`,
      [session.identityId, roleKey, `Synthetic Stage 7 diagnostic ${roleKey} role`],
    );
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();
    repository = app.get(OperationsFieldRepository);

    owner = await signIn('phase7-field-diagnostic-owner@example.invalid');
    admin = await signIn('phase7-field-diagnostic-admin@example.invalid');
    fieldAgent = await signIn('phase7-field-diagnostic-agent@example.invalid');
    await grantRole(admin, 'admin');
    await grantRole(fieldAgent, 'field_agent');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Field Diagnostic Provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Synthetic diagnostic locality',
        serviceAreaSummary: 'Synthetic diagnostic service area',
        registeredBusinessName: 'Synthetic Field Diagnostic Provider Limited',
      })
      .expect(201);
    const providerId = (providerResponse.body as ProviderResponse).id;

    await request(httpServer())
      .put(`/api/v1/providers/${providerId}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/providers/${providerId}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic provider ready for field creation diagnostic.',
      })
      .expect(201);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'phase7_field_creation_diagnostic',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase7-field-v1',
      })
      .expect(201);
    caseId = (caseResponse.body as CaseResponse).id;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('creates one valid scoped field work item', async () => {
    const scheduledFor = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const dueAt = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

    try {
      const result = await repository.create(
        { identityId: admin.identityId } as AuthenticatedActor,
        {
          caseId,
          fieldAgentIdentityId: fieldAgent.identityId,
          templateKey: 'standard_field_inspection',
          templateVersion: 1,
          scheduledFor,
          dueAt,
          reason: 'Synthetic scoped field inspection assignment for diagnostic coverage.',
          policyVersion: 'phase7-field-v1',
        },
      );
      expect(result).toMatchObject({ caseId, fieldAgentIdentityId: fieldAgent.identityId });
    } catch (error) {
      const databaseError = error as {
        name?: string;
        message?: string;
        code?: string;
        detail?: string;
        constraint?: string;
        table?: string;
        column?: string;
      };
      throw new Error(
        `STAGE7_FIELD_CREATE ${JSON.stringify({
          name: databaseError.name,
          message: databaseError.message,
          code: databaseError.code,
          detail: databaseError.detail,
          constraint: databaseError.constraint,
          table: databaseError.table,
          column: databaseError.column,
        })}`,
      );
    }
  });
});

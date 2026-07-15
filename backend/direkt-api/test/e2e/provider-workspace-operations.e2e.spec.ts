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

interface CaseResponse {
  id: string;
}

interface UploadIntentResponse {
  uploadIntentId: string;
}

interface WorkspaceOperationsResponse {
  providerId: string;
  displayName: string;
  profileComplete: boolean;
  location: {
    privateBaseStored: boolean;
    publicPremisesConfigured: boolean;
    publicPremisesConsent: boolean;
    serviceAreaConfigured: boolean;
    coordinatesExposed: false;
  };
  verification: {
    openCases: number;
    correctionsRequired: number;
    currentClaims: number;
    publicationEligibleServices: number;
  };
  uploads: {
    queued: number;
    active: number;
    interruptedOrRetryable: number;
    submitted: number;
    terminalOrCancelled: number;
    evidenceIdentifiersExposed: false;
    objectKeysExposed: false;
  };
  synthetic: true;
}

describe('Phase 6 provider workspace operations projection', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 3 });
  let app: INestApplication;
  let owner: SessionResponse;
  let admin: SessionResponse;
  let provider: ProviderResponse;

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
        deviceLabel: 'Synthetic provider-workspace operations client',
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

    owner = await signIn('phase6-operations-owner@example.invalid');
    admin = await signIn('phase6-operations-admin@example.invalid');
    await pool.query(
      `INSERT INTO authz.role_assignments (
         identity_id, role_id, scope_type, assigned_by_identity_id, reason
       )
       SELECT $1, id, 'global', $1, $2
       FROM authz.roles
       WHERE role_key = 'admin'`,
      [admin.identityId, 'Synthetic Phase 6 provider-workspace operations administrator'],
    );

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Operations Workspace',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic private locality',
        serviceAreaSummary: 'Synthetic Lusaka service area',
        registeredBusinessName: 'Synthetic Operations Workspace Limited',
      })
      .expect(201);
    provider = providerResponse.body as ProviderResponse;

    await request(httpServer())
      .put(`/api/v1/providers/${provider.id}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic workspace is ready for aggregate operations visibility',
      })
      .expect(201);

    await request(httpServer())
      .put('/api/v1/provider-workspace/me/location')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        privateBaseLatitude: -14.101,
        privateBaseLongitude: 27.101,
        publicPremisesConsent: false,
        publicLocality: 'Lusaka mobile service area',
        serviceAreaWkt:
          'POLYGON((28.20 -15.55, 28.50 -15.55, 28.50 -15.25, 28.20 -15.25, 28.20 -15.55))',
      })
      .expect(200);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'phase6_operations_identity_check',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase6-operations-v1',
      })
      .expect(201);
    const verificationCase = caseResponse.body as CaseResponse;

    const uploadResponse = await request(httpServer())
      .post('/api/v1/provider-workspace/me/upload-intents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        caseId: verificationCase.id,
        clientIntentKey: 'operations-visible-interrupted-upload',
        evidenceClass: 'identity',
        documentType: 'national_identity_document',
        contentType: 'image/jpeg',
        maxBytes: 5_000_000,
        consentConfirmed: true,
      })
      .expect(201);
    const uploadIntent = uploadResponse.body as UploadIntentResponse;

    await request(httpServer())
      .put(
        `/api/v1/provider-workspace/me/upload-intents/${uploadIntent.uploadIntentId}/interrupted`,
      )
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({ errorCode: 'NETWORK_INTERRUPTED' })
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('requires operations provider-read permission', async () => {
    await request(httpServer())
      .get('/api/v1/operations/provider-workspaces')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(403);
  });

  it('returns aggregate readiness and upload states without private content', async () => {
    const response = await request(httpServer())
      .get('/api/v1/operations/provider-workspaces')
      .set('authorization', `Bearer ${admin.accessToken}`)
      .expect(200);
    const workspaces = response.body as WorkspaceOperationsResponse[];
    const workspace = workspaces.find((item) => item.providerId === provider.id);

    expect(workspace).toMatchObject({
      providerId: provider.id,
      displayName: 'Synthetic Operations Workspace',
      profileComplete: true,
      location: {
        privateBaseStored: true,
        publicPremisesConfigured: false,
        publicPremisesConsent: false,
        serviceAreaConfigured: true,
        coordinatesExposed: false,
      },
      verification: {
        openCases: 1,
        correctionsRequired: 0,
        currentClaims: 0,
        publicationEligibleServices: 0,
      },
      uploads: {
        queued: 0,
        active: 0,
        interruptedOrRetryable: 1,
        submitted: 0,
        terminalOrCancelled: 0,
        evidenceIdentifiersExposed: false,
        objectKeysExposed: false,
      },
      synthetic: true,
    });

    const serialized = JSON.stringify(workspace);
    expect(serialized).not.toContain('-14.101');
    expect(serialized).not.toContain('27.101');
    expect(serialized).not.toContain('"uploadIntentId":');
    expect(serialized).not.toContain('"uploadSessionId":');
    expect(serialized).not.toContain('"evidenceId":');
    expect(serialized).not.toContain('"objectKey":');
    expect(serialized).not.toContain('"sha256":');
    expect(serialized).not.toContain('reviewer');
  });
});

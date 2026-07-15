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
  representativeRole: string;
  provider: { displayName: string; discoverable: boolean };
  readiness: {
    profileComplete: boolean;
    selectedCategories: number;
    mandatoryRequirements: number;
    evidenceSubmitted: number;
    completionPercent: number;
  };
  location: {
    configured: boolean;
    privateBaseStored: boolean;
    publicPremisesConfigured: boolean;
  };
  tasks: Array<{ key: string; state: string }>;
  deferredSurfaces: {
    enquiries: { phaseOwner: string; mutationAllowed: boolean };
    reviewResponses: { phaseOwner: string; mutationAllowed: boolean };
    subscription: { phaseOwner: string; mutationAllowed: boolean };
  };
  synthetic: true;
}

interface TimelineEventResponse {
  eventType: string;
  categoryKey: string;
  requirementKey: string;
  message: string;
  reviewerIdentityExposed: false;
  privateRationaleExposed: false;
  privateObjectKeyExposed: false;
}

describe('Phase 6 actor-scoped provider workspace HTTP contracts', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 2 });
  let app: INestApplication;
  let owner: SessionResponse;
  let member: SessionResponse;
  let customer: SessionResponse;
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
        deviceLabel: 'Synthetic Phase 6 provider workspace client',
      })
      .expect(200);
    return verified.body as SessionResponse;
  }

  async function createProvider(
    session: SessionResponse,
    displayName: string,
  ): Promise<ProviderResponse> {
    const response = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${session.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName,
        operatingModel: 'fixed_premises',
        localitySummary: 'Woodlands, Lusaka',
        serviceAreaSummary: 'Synthetic Lusaka service area',
        registeredBusinessName: `${displayName} Limited`,
      })
      .expect(201);
    return response.body as ProviderResponse;
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase6-workspace-owner@example.invalid');
    member = await signIn('phase6-workspace-member@example.invalid');
    customer = await signIn('phase6-workspace-customer@example.invalid');
    provider = await createProvider(owner, 'Synthetic Phase Six Workspace');

    await request(httpServer())
      .put(`/api/v1/providers/${provider.id}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('denies unauthenticated and non-provider identities', async () => {
    await request(httpServer()).get('/api/v1/provider-workspace/me').expect(401);

    await request(httpServer())
      .get('/api/v1/provider-workspace/me')
      .set('authorization', `Bearer ${customer.accessToken}`)
      .expect(403);
  });

  it('resolves the provider from the authenticated owner without client ownership input', async () => {
    const response = await request(httpServer())
      .get('/api/v1/provider-workspace/me')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('x-direkt-provider-id', '00000000-0000-4000-8000-000000000999')
      .set('x-direkt-role', 'admin')
      .expect(200);
    const workspace = response.body as WorkspaceResponse;

    expect(workspace).toMatchObject({
      providerId: provider.id,
      representativeRole: 'provider_owner',
      provider: {
        displayName: 'Synthetic Phase Six Workspace',
        discoverable: false,
      },
      readiness: {
        profileComplete: true,
        selectedCategories: 1,
        mandatoryRequirements: 2,
        evidenceSubmitted: 0,
      },
      location: {
        configured: false,
        privateBaseStored: false,
        publicPremisesConfigured: false,
      },
      deferredSurfaces: {
        enquiries: { phaseOwner: 'phase8', mutationAllowed: false },
        reviewResponses: { phaseOwner: 'phase8', mutationAllowed: false },
        subscription: { phaseOwner: 'phase9', mutationAllowed: false },
      },
      synthetic: true,
    });
    expect(workspace.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'complete_profile', state: 'complete' }),
        expect.objectContaining({ key: 'configure_service_area', state: 'action_required' }),
        expect.objectContaining({ key: 'submit_evidence', state: 'action_required' }),
      ]),
    );

    const serialized = JSON.stringify(workspace);
    expect(serialized).not.toContain('object_key');
    expect(serialized).not.toContain('reviewer');
    expect(serialized).not.toContain('private_base');
    expect(serialized).not.toContain('latitude');
    expect(serialized).not.toContain('longitude');
  });

  it('returns a provider-safe verification timeline without private review or storage data', async () => {
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic Phase 6 provider is ready for scoped verification testing.',
      })
      .expect(201);

    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'representative_identity_check',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase6-v1',
      })
      .expect(201);

    const response = await request(httpServer())
      .get('/api/v1/provider-workspace/me/verification-timeline')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    const timeline = response.body as TimelineEventResponse[];

    expect(timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: 'case_created',
          categoryKey: 'plumbing',
          requirementKey: 'identity',
          message: 'Verification check created.',
          reviewerIdentityExposed: false,
          privateRationaleExposed: false,
          privateObjectKeyExposed: false,
        }),
      ]),
    );

    const serialized = JSON.stringify(timeline);
    expect(serialized).not.toContain('reviewerIdentityId');
    expect(serialized).not.toContain('privateRationale');
    expect(serialized).not.toContain('objectKey');
    expect(serialized).not.toContain('accessUrl');
  });

  it('allows an assigned member and denies access after server-side revocation', async () => {
    await request(httpServer())
      .post(`/api/v1/providers/${provider.id}/representatives`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        identityId: member.identityId,
        role: 'provider_member',
        reason: 'Synthetic Phase 6 workspace membership assignment',
      })
      .expect(201);

    const response = await request(httpServer())
      .get('/api/v1/provider-workspace/me')
      .set('authorization', `Bearer ${member.accessToken}`)
      .expect(200);
    expect(response.body).toMatchObject({
      providerId: provider.id,
      representativeRole: 'provider_member',
    });

    await pool.query(
      `UPDATE authz.role_assignments AS assignments
       SET revoked_at = now()
       FROM authz.roles AS roles
       WHERE assignments.role_id = roles.id
         AND assignments.identity_id = $1
         AND assignments.provider_id = $2
         AND roles.role_key = 'provider_member'
         AND assignments.revoked_at IS NULL`,
      [member.identityId, provider.id],
    );

    await request(httpServer())
      .get('/api/v1/provider-workspace/me')
      .set('authorization', `Bearer ${member.accessToken}`)
      .expect(403);
  });

  it('rejects ambiguous multi-provider ownership instead of accepting a client-selected provider', async () => {
    await createProvider(owner, 'Synthetic Second Workspace');

    await request(httpServer())
      .get('/api/v1/provider-workspace/me')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .set('x-direkt-provider-id', provider.id)
      .expect(409);
  });
});

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
interface UploadResponse {
  uploadSessionId: string;
}
interface EvidenceResponse {
  id: string;
}
interface IncidentResponse {
  incidentId: string;
  recordType: string;
  providerId: string;
  caseId: string | null;
  evidenceLinked: boolean;
  status: string;
  ownerIdentityId: string;
  source: 'operations_internal';
  privateDetailsIncluded: false;
  customerInteractionIncluded: false;
  privateEvidenceIncluded: false;
  privateCoordinatesIncluded: false;
}
interface ExpiryResponse {
  recordType: string;
  providerId: string;
  recordId: string;
  actionState: string;
  objectKeyIncluded: false;
  documentContentIncluded: false;
  privateCoordinatesIncluded: false;
}
interface MetricsExportResponse {
  schemaVersion: 'phase7-v1';
  fields: Array<{ key: string; value: number }>;
  allowlistedFieldsOnly: true;
  providerIdentifiersIncluded: false;
  evidenceIdentifiersIncluded: false;
  privateCoordinatesIncluded: false;
}

describe('Phase 7 bounded incidents, expiry and reporting', () => {
  const url = databaseUrl();
  const pool = new Pool({ connectionString: url, max: 4 });
  let app: INestApplication;
  let owner: SessionResponse;
  let support: SessionResponse;
  let admin: SessionResponse;
  let auditor: SessionResponse;
  let providerId: string;
  let caseId: string;
  let evidenceId: string;

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
        deviceLabel: 'Synthetic Phase 7 reporting client',
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
      [session.identityId, roleKey, `Synthetic Phase 7 ${roleKey} reporting role`],
    );
  }

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await runMigrations(url);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApplication(app);
    await app.init();

    owner = await signIn('phase7-reporting-owner@example.invalid');
    support = await signIn('phase7-reporting-support@example.invalid');
    admin = await signIn('phase7-reporting-admin@example.invalid');
    auditor = await signIn('phase7-reporting-auditor@example.invalid');
    await grantRole(support, 'support');
    await grantRole(admin, 'admin');
    await grantRole(auditor, 'auditor');

    const providerResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Reporting Provider',
        operatingModel: 'fixed_premises',
        localitySummary: 'Synthetic reporting locality',
        serviceAreaSummary: 'Synthetic reporting service area',
        registeredBusinessName: 'Synthetic Reporting Provider Limited',
      })
      .expect(201);
    providerId = (providerResponse.body as ProviderResponse).id;
    await request(httpServer())
      .put(`/api/v1/providers/${providerId}/categories/plumbing`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(200);
    await request(httpServer())
      .post(`/api/v1/providers/${providerId}/state-transitions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        targetStatus: 'ready_for_verification',
        reason: 'Synthetic provider ready for internal reporting tests.',
      })
      .expect(201);

    const caseResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/verification-cases`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        checkKey: 'phase7_reporting_identity',
        checkFamily: 'representative_identity',
        highRisk: false,
        policyVersion: 'phase7-reporting-v1',
      })
      .expect(201);
    caseId = (caseResponse.body as CaseResponse).id;

    const uploadResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/evidence/upload-sessions`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        categoryKey: 'plumbing',
        requirementKey: 'identity',
        evidenceClass: 'identity',
        documentType: 'synthetic_identity_document',
        contentType: 'application/pdf',
        maxBytes: 4096,
        consentConfirmed: true,
      })
      .expect(201);
    const upload = uploadResponse.body as UploadResponse;
    const evidenceResponse = await request(httpServer())
      .post(`/api/v1/providers/${providerId}/evidence`)
      .set('authorization', `Bearer ${owner.accessToken}`)
      .send({
        uploadSessionId: upload.uploadSessionId,
        caseId,
        sha256: 'b'.repeat(64),
        sizeBytes: 2048,
        issuingAuthority: 'Synthetic Reporting Authority',
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        retentionClass: 'regulated',
      })
      .expect(201);
    evidenceId = (evidenceResponse.body as EvidenceResponse).id;
  });

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  it('keeps internal complaint records bounded and private-detail free', async () => {
    await request(httpServer())
      .get('/api/v1/operations/incidents')
      .set('authorization', `Bearer ${owner.accessToken}`)
      .expect(403);

    const createResponse = await request(httpServer())
      .post('/api/v1/operations/incidents')
      .set('authorization', `Bearer ${support.accessToken}`)
      .send({
        recordType: 'operations_complaint',
        providerId,
        caseId,
        evidenceId,
        categoryCode: 'INTERNAL_SERVICE_CONCERN',
        severity: 'high',
        summary: 'Synthetic internal complaint requires scoped operations investigation.',
        privateDetails:
          'Synthetic internal-only detail that must never be returned by the operations API.',
        ownerIdentityId: support.identityId,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        policyVersion: 'phase7-reporting-v1',
      })
      .expect(201);
    const incident = createResponse.body as IncidentResponse;
    expect(incident).toMatchObject({
      recordType: 'operations_complaint',
      providerId,
      caseId,
      evidenceLinked: true,
      status: 'open',
      ownerIdentityId: support.identityId,
      source: 'operations_internal',
      privateDetailsIncluded: false,
      customerInteractionIncluded: false,
      privateEvidenceIncluded: false,
      privateCoordinatesIncluded: false,
    });
    expect(JSON.stringify(incident)).not.toContain('internal-only detail');

    await request(httpServer())
      .post(`/api/v1/operations/incidents/${incident.incidentId}/start`)
      .set('authorization', `Bearer ${admin.accessToken}`)
      .send({ reason: 'Unowned administrator must not start the support-owned incident.' })
      .expect(404);
    await request(httpServer())
      .post(`/api/v1/operations/incidents/${incident.incidentId}/start`)
      .set('authorization', `Bearer ${support.accessToken}`)
      .send({ reason: 'Assigned support operator started the synthetic internal investigation.' })
      .expect(200);
    const resolvedResponse = await request(httpServer())
      .post(`/api/v1/operations/incidents/${incident.incidentId}/resolve`)
      .set('authorization', `Bearer ${support.accessToken}`)
      .send({
        targetStatus: 'resolved',
        resolutionCode: 'INTERNAL_SCOPE_CONFIRMED',
        resolutionSummary:
          'Synthetic complaint resolved as an internal control record without a customer review workflow.',
      })
      .expect(200);
    expect(resolvedResponse.body as IncidentResponse).toMatchObject({ status: 'resolved' });
  });

  it('rejects cross-provider case and evidence references', async () => {
    const otherOwner = await signIn('phase7-reporting-other-owner@example.invalid');
    const otherProviderResponse = await request(httpServer())
      .post('/api/v1/providers')
      .set('authorization', `Bearer ${otherOwner.accessToken}`)
      .send({
        pathway: 'registered_business',
        displayName: 'Synthetic Other Reporting Provider',
        operatingModel: 'mobile',
        localitySummary: 'Synthetic other locality',
        serviceAreaSummary: 'Synthetic other service area',
        registeredBusinessName: 'Synthetic Other Reporting Provider Limited',
      })
      .expect(201);
    const otherProviderId = (otherProviderResponse.body as ProviderResponse).id;

    await request(httpServer())
      .post('/api/v1/operations/incidents')
      .set('authorization', `Bearer ${support.accessToken}`)
      .send({
        recordType: 'operations_incident',
        providerId: otherProviderId,
        caseId,
        evidenceId,
        categoryCode: 'CROSS_SCOPE_ATTEMPT',
        severity: 'critical',
        summary: 'Synthetic cross-provider linkage must be rejected by the database boundary.',
        ownerIdentityId: support.identityId,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        policyVersion: 'phase7-reporting-v1',
      })
      .expect(400);
  });

  it('shows expiry states without evidence content or storage metadata', async () => {
    const response = await request(httpServer())
      .get('/api/v1/operations/expiry-renewal')
      .set('authorization', `Bearer ${auditor.accessToken}`)
      .expect(200);
    const items = response.body as ExpiryResponse[];
    const evidence = items.find((item) => item.recordId === evidenceId);
    expect(evidence).toMatchObject({
      recordType: 'evidence',
      providerId,
      actionState: 'due_soon',
      objectKeyIncluded: false,
      documentContentIncluded: false,
      privateCoordinatesIncluded: false,
    });
    const serialized = JSON.stringify(items);
    expect(serialized).not.toContain('private/');
    expect(serialized).not.toContain('sha256');
    expect(serialized).not.toContain('objectKey');
  });

  it('exports only the fixed aggregate metric allowlist', async () => {
    await request(httpServer())
      .get('/api/v1/operations/reporting/export')
      .set('authorization', `Bearer ${support.accessToken}`)
      .expect(403);

    const response = await request(httpServer())
      .get('/api/v1/operations/reporting/export')
      .set('authorization', `Bearer ${auditor.accessToken}`)
      .expect(200);
    const exportBody = response.body as MetricsExportResponse;
    expect(exportBody).toMatchObject({
      schemaVersion: 'phase7-v1',
      allowlistedFieldsOnly: true,
      providerIdentifiersIncluded: false,
      evidenceIdentifiersIncluded: false,
      privateCoordinatesIncluded: false,
    });
    expect(exportBody.fields.map((field) => field.key)).toEqual([
      'triageTotal',
      'triageOverdue',
      'triageBreached',
      'decisionsLast30Days',
      'correctionsLast30Days',
      'fieldWorkActive',
      'fieldWorkCompletedLast30Days',
      'escalationsActive',
      'incidentsActive',
      'evidenceDue',
      'claimsDue',
    ]);
    const serialized = JSON.stringify(exportBody);
    expect(serialized).not.toContain(providerId);
    expect(serialized).not.toContain(evidenceId);
    expect(serialized).not.toContain('recordId');
  });
});

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AuditService } from '../platform/audit/audit.service';
import {
  EVIDENCE_STORAGE,
  type EvidenceStoragePort,
} from '../verification-evidence/evidence-storage.port';
import type {
  OperationsEvidenceReviewGrant,
  OperationsEvidenceReviewRedemption,
  OperationsReviewWorkspace,
  RevokedVerificationAssignment,
} from './operations-review.types';
import { OperationsReviewRepository } from './operations-review.repository';

@Injectable()
export class OperationsReviewService {
  constructor(
    private readonly repository: OperationsReviewRepository,
    private readonly audit: AuditService,
    @Inject(EVIDENCE_STORAGE) private readonly storage: EvidenceStoragePort,
  ) {}

  workspace(actor: AuthenticatedActor, caseId: string): Promise<OperationsReviewWorkspace> {
    return this.repository.workspace(caseId, actor.identityId);
  }

  async issueGrant(
    actor: AuthenticatedActor,
    caseId: string,
    evidenceId: string,
    requestId?: string,
  ): Promise<OperationsEvidenceReviewGrant> {
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const grant = await this.repository.issueGrant({
      actor,
      caseId,
      evidenceId,
      tokenHash,
      expiresAt,
      ...(requestId ? { requestId } : {}),
    });
    return {
      grantId: grant.grantId,
      caseId,
      evidenceId,
      evidenceVersionId: grant.evidenceVersionId,
      assignmentId: grant.assignmentId,
      accessUrl: `/api/v1/operations/evidence-access/${rawToken}`,
      expiresAt: expiresAt.toISOString(),
      watermark: `DIREKT synthetic review · ${actor.identityId.slice(0, 8)} · case:${caseId.slice(0, 8)}`,
      applicationMediated: true,
      objectKeyIncluded: false,
      synthetic: true,
    };
  }

  async redeem(
    actor: AuthenticatedActor,
    rawToken: string,
    requestId?: string,
  ): Promise<OperationsEvidenceReviewRedemption> {
    if (!/^[A-Za-z0-9_-]{40,80}$/.test(rawToken)) {
      throw new BadRequestException('Evidence review grant token is invalid.');
    }
    const context = await this.repository.redemption(actor.identityId, this.hashToken(rawToken));
    const storageGrant = this.storage.createReadGrant(
      context.object_key,
      actor.identityId,
      `case:${context.case_id.slice(0, 8)}`,
    );
    await this.audit.record({
      actorType: 'identity',
      actorId: actor.identityId,
      providerId: context.provider_id,
      ...(requestId ? { requestId } : {}),
      action: 'private_evidence_review_grant_redeemed',
      resourceType: 'evidence_review_grant',
      resourceId: context.grant_id,
      outcome: 'success',
      metadata: {
        caseId: context.case_id,
        evidenceId: context.evidence_id,
        evidenceVersionId: context.evidence_version_id,
        assignmentId: context.assignment_id,
        assignmentRevalidated: true,
        evidenceVersionRevalidated: true,
        objectKeyExposed: false,
      },
    });
    return {
      grantId: context.grant_id,
      caseId: context.case_id,
      evidenceId: context.evidence_id,
      accessUrl: storageGrant.accessUrl,
      expiresAt: storageGrant.expiresAt.toISOString(),
      watermark: storageGrant.watermark,
      assignmentRevalidated: true,
      evidenceVersionRevalidated: true,
      objectKeyIncluded: false,
      synthetic: true,
    };
  }

  revokeGrant(
    actor: AuthenticatedActor,
    grantId: string,
    reason: string,
    requestId?: string,
  ): Promise<{ grantId: string; revoked: true }> {
    return this.repository.revokeGrant({
      actor,
      grantId,
      reason,
      ...(requestId ? { requestId } : {}),
    });
  }

  revokeAssignment(
    actor: AuthenticatedActor,
    caseId: string,
    assignmentId: string,
    reason: string,
    requestId?: string,
  ): Promise<RevokedVerificationAssignment> {
    return this.repository.revokeAssignment({
      actor,
      caseId,
      assignmentId,
      reason,
      ...(requestId ? { requestId } : {}),
    });
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken, 'utf8').digest('hex');
  }
}

import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { EVIDENCE_STORAGE, type EvidenceStoragePort } from './evidence-storage.port';
import { EvidenceReviewRepository } from './evidence-review.repository';
import type {
  EvidenceAccessGrantState,
  PrivateEvidenceAccessGrant,
  PrivateEvidenceAccessResolution,
  ReviewWorkspaceView,
} from './verification-evidence.types';

interface PostgresErrorLike {
  code?: string;
  message?: string;
}

@Injectable()
export class EvidenceReviewService {
  constructor(
    private readonly repository: EvidenceReviewRepository,
    @Inject(EVIDENCE_STORAGE) private readonly storage: EvidenceStoragePort,
  ) {}

  reviewWorkspace(actor: AuthenticatedActor, caseId: string): Promise<ReviewWorkspaceView> {
    return this.repository.reviewWorkspace(caseId, actor.identityId);
  }

  async issueAccessGrant(
    actor: AuthenticatedActor,
    caseId: string,
    evidenceId: string,
    requestId?: string,
  ): Promise<PrivateEvidenceAccessGrant> {
    try {
      const authorization = await this.repository.issueAccessGrant({
        actor,
        caseId,
        evidenceId,
        purpose: 'Assigned reviewer private evidence inspection',
        requestId,
      });
      const storageGrant = await this.storage.createReadGrant(
        authorization.object_key,
        actor.identityId,
        `grant:${authorization.grant_id.slice(0, 8)}`,
        authorization.expires_at,
      );
      return {
        grantId: authorization.grant_id,
        assignmentId: authorization.assignment_id,
        evidenceId: authorization.evidence_id,
        evidenceVersionId: authorization.evidence_version_id,
        status: 'active',
        accessUrl: storageGrant.accessUrl,
        expiresAt: storageGrant.expiresAt.toISOString(),
        watermark: storageGrant.watermark,
        synthetic: storageGrant.synthetic,
      };
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  async resolveAccessGrant(
    actor: AuthenticatedActor,
    grantId: string,
    requestId?: string,
  ): Promise<PrivateEvidenceAccessResolution> {
    try {
      const authorization = await this.repository.resolveAccessGrant({
        actor,
        grantId,
        requestId,
      });
      const storageGrant = await this.storage.createReadGrant(
        authorization.object_key,
        actor.identityId,
        `grant:${authorization.grant_id.slice(0, 8)}`,
        authorization.expires_at,
      );
      return {
        grantId: authorization.grant_id,
        status: 'active',
        accessUrl: storageGrant.accessUrl,
        expiresAt: storageGrant.expiresAt.toISOString(),
        watermark: storageGrant.watermark,
        synthetic: storageGrant.synthetic,
      };
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  revokeAccessGrant(
    actor: AuthenticatedActor,
    grantId: string,
    reason: string,
  ): Promise<EvidenceAccessGrantState> {
    return this.repository
      .revokeAccessGrant({ actor, grantId, reason })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  private throwDomainError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }
    const databaseError = error as PostgresErrorLike;
    if (
      databaseError.code === '23503' ||
      databaseError.code === '23505' ||
      databaseError.code === '23514' ||
      databaseError.code === 'P0001'
    ) {
      throw new BadRequestException(
        databaseError.message ?? 'The evidence review request violates a domain rule.',
      );
    }
    throw error;
  }
}

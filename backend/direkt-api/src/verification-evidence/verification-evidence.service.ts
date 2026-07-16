import { BadRequestException, ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { EVIDENCE_STORAGE, type EvidenceStoragePort } from './evidence-storage.port';
import type {
  AssignVerificationCaseDto,
  ConfirmEvidenceDto,
  CreateDecisionDto,
  CreateFieldVisitDto,
  CreateRecommendationDto,
  CreateUploadSessionDto,
  CreateVerificationCaseDto,
  ExpireClaimsDto,
  RevokeEvidenceDto,
} from './verification-evidence.dto';
import { VerificationEvidenceRepository } from './verification-evidence.repository';
import type {
  EvidenceView,
  SafeClaimCard,
  UploadSessionView,
  VerificationCaseView,
  VerificationQueueItem,
} from './verification-evidence.types';

interface PostgresErrorLike {
  code?: string;
  constraint?: string;
  message?: string;
}

@Injectable()
export class VerificationEvidenceService {
  constructor(
    private readonly repository: VerificationEvidenceRepository,
    @Inject(EVIDENCE_STORAGE) private readonly storage: EvidenceStoragePort,
  ) {}

  async createUploadSession(
    actor: AuthenticatedActor,
    providerId: string,
    dto: CreateUploadSessionDto,
    requestId?: string,
  ): Promise<UploadSessionView> {
    try {
      const requirement = await this.repository.resolveRequirement(
        providerId,
        dto.categoryKey,
        dto.requirementKey,
      );
      if (dto.replacementForEvidenceId) {
        await this.repository.evidence(providerId, dto.replacementForEvidenceId);
      }
      const uploadSessionId = randomUUID();
      const grant = this.storage.createUploadGrant({
        providerId,
        uploadSessionId,
        contentType: dto.contentType,
        maxBytes: dto.maxBytes,
      });
      await this.repository.createUploadSession({
        actor,
        providerId,
        dto,
        requirement,
        uploadSessionId,
        objectKey: grant.objectKey,
        expiresAt: grant.expiresAt,
        requestId,
      });
      return {
        uploadSessionId,
        uploadUrl: grant.uploadUrl,
        expiresAt: grant.expiresAt.toISOString(),
        requiredHeaders: grant.requiredHeaders,
        synthetic: true,
      };
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  async confirmEvidence(
    actor: AuthenticatedActor,
    providerId: string,
    dto: ConfirmEvidenceDto,
    requestId?: string,
  ): Promise<EvidenceView> {
    try {
      const session = await this.repository.uploadSession(providerId, dto.uploadSessionId);
      this.storage.confirmUpload({
        objectKey: session.object_key,
        contentType: session.expected_content_type,
        sizeBytes: dto.sizeBytes,
        sha256: dto.sha256,
      });
      return await this.repository.confirmEvidence({ actor, providerId, dto, requestId });
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  evidence(providerId: string): Promise<EvidenceView[]> {
    return this.repository.listEvidence(providerId);
  }

  evidenceItem(providerId: string, evidenceId: string): Promise<EvidenceView> {
    return this.repository.evidence(providerId, evidenceId);
  }

  createCase(
    actor: AuthenticatedActor,
    providerId: string,
    dto: CreateVerificationCaseDto,
    requestId?: string,
  ): Promise<VerificationCaseView> {
    return this.repository
      .createCase({ actor, providerId, dto, requestId })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  cases(providerId: string): Promise<VerificationCaseView[]> {
    return this.repository.listCases(providerId);
  }

  assignedCase(caseId: string, actor: AuthenticatedActor): Promise<VerificationCaseView> {
    return this.repository.caseForActor(caseId, actor.identityId);
  }

  assignCase(
    actor: AuthenticatedActor,
    caseId: string,
    dto: AssignVerificationCaseDto,
    requestId?: string,
  ): Promise<VerificationCaseView> {
    return this.repository
      .assignCase({ actor, caseId, dto, requestId })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  recommend(
    actor: AuthenticatedActor,
    caseId: string,
    dto: CreateRecommendationDto,
    requestId?: string,
  ): Promise<{ recommendationId: string }> {
    return this.repository
      .recommend({ actor, caseId, dto, requestId })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  decide(
    actor: AuthenticatedActor,
    caseId: string,
    dto: CreateDecisionDto,
    requestId?: string,
  ): Promise<{ decisionId: string; case: VerificationCaseView; claims: SafeClaimCard[] }> {
    return this.repository
      .decide({ actor, caseId, dto, requestId })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  fieldVisit(
    actor: AuthenticatedActor,
    caseId: string,
    dto: CreateFieldVisitDto,
    requestId?: string,
  ): Promise<{ fieldVisitId: string }> {
    return this.repository
      .recordFieldVisit({ actor, caseId, dto, requestId })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  revokeEvidence(
    actor: AuthenticatedActor,
    providerId: string,
    evidenceId: string,
    dto: RevokeEvidenceDto,
    requestId?: string,
  ): Promise<{ evidence: EvidenceView; affectedClaims: number }> {
    return this.repository
      .revokeEvidence({
        actor,
        providerId,
        evidenceId,
        reason: dto.reason,
        requestId,
      })
      .catch((error: unknown) => this.throwDomainError(error));
  }

  queue(): Promise<VerificationQueueItem[]> {
    return this.repository.queue();
  }

  claims(providerId: string): Promise<SafeClaimCard[]> {
    return this.repository.claims(providerId);
  }

  async expireClaims(dto: ExpireClaimsDto): Promise<{ affectedClaims: number; asOf: string }> {
    try {
      const asOf = dto.asOf ? new Date(dto.asOf) : new Date();
      if (Number.isNaN(asOf.getTime())) {
        throw new BadRequestException('Expiry processing timestamp is invalid.');
      }
      const affectedClaims = await this.repository.expireClaims(asOf);
      return { affectedClaims, asOf: asOf.toISOString() };
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  private throwDomainError(error: unknown): never {
    if (error instanceof BadRequestException || error instanceof ConflictException) {
      throw error;
    }
    const databaseError = error as PostgresErrorLike;
    if (databaseError.code === '23505' || databaseError.code === '23P01') {
      throw new ConflictException(
        databaseError.message ?? 'The verification record conflicts with an active record.',
      );
    }
    if (
      databaseError.code === '23503' ||
      databaseError.code === '23514' ||
      databaseError.code === 'P0001'
    ) {
      throw new BadRequestException(
        databaseError.message ?? 'The verification request violates a domain rule.',
      );
    }
    throw error;
  }
}

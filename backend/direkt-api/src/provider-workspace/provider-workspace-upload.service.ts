import { ConflictException, Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { VerificationEvidenceService } from '../verification-evidence/verification-evidence.service';
import type {
  CancelWorkspaceUploadDto,
  ConfirmWorkspaceUploadDto,
  CreateWorkspaceUploadIntentDto,
  MarkWorkspaceUploadInterruptedDto,
} from './provider-workspace.dto';
import { ProviderWorkspaceUploadRepository } from './provider-workspace-upload.repository';
import type {
  ProviderWorkspaceUploadGrantView,
  ProviderWorkspaceUploadIntentView,
} from './provider-workspace.types';

@Injectable()
export class ProviderWorkspaceUploadService {
  constructor(
    private readonly repository: ProviderWorkspaceUploadRepository,
    private readonly evidence: VerificationEvidenceService,
  ) {}

  async create(
    actor: AuthenticatedActor,
    input: CreateWorkspaceUploadIntentDto,
    requestId?: string,
  ): Promise<ProviderWorkspaceUploadGrantView | ProviderWorkspaceUploadIntentView> {
    const prepared = await this.repository.prepareNew(actor, input);
    return this.createAttempt(actor, prepared, requestId);
  }

  async retry(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    requestId?: string,
  ): Promise<ProviderWorkspaceUploadGrantView> {
    const prepared = await this.repository.prepareRetry(actor, uploadIntentId);
    const result = await this.createAttempt(actor, prepared, requestId);
    if (!('upload' in result)) {
      throw new ConflictException('The retry did not create a new private upload session.');
    }
    return result;
  }

  list(actor: AuthenticatedActor): Promise<ProviderWorkspaceUploadIntentView[]> {
    return this.repository.list(actor);
  }

  detail(
    actor: AuthenticatedActor,
    uploadIntentId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.repository.detail(actor, uploadIntentId);
  }

  interrupted(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    input: MarkWorkspaceUploadInterruptedDto,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.repository.markInterrupted(actor, uploadIntentId, input.errorCode);
  }

  cancel(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    input: CancelWorkspaceUploadDto,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.repository.cancel(actor, uploadIntentId, input.reason);
  }

  async confirm(
    actor: AuthenticatedActor,
    uploadIntentId: string,
    input: ConfirmWorkspaceUploadDto,
    requestId?: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    const context = await this.repository.confirmationContext(actor, uploadIntentId);
    if (context.intent.state === 'submitted') {
      return context.intent;
    }
    if (context.intent.state !== 'uploading' || !context.uploadSessionId) {
      throw new ConflictException('The provider upload intent has no active session to confirm.');
    }

    const evidence = await this.evidence.confirmEvidence(
      actor,
      context.providerId,
      {
        uploadSessionId: context.uploadSessionId,
        caseId: context.intent.caseId,
        sha256: input.sha256,
        sizeBytes: input.sizeBytes,
        ...(input.issuingAuthority ? { issuingAuthority: input.issuingAuthority } : {}),
        ...(input.issuedAt ? { issuedAt: input.issuedAt } : {}),
        ...(input.validFrom ? { validFrom: input.validFrom } : {}),
        ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
        retentionClass: input.retentionClass,
      },
      requestId,
    );
    return this.repository.complete(actor, uploadIntentId, evidence.id);
  }

  private async createAttempt(
    actor: AuthenticatedActor,
    prepared: Awaited<ReturnType<ProviderWorkspaceUploadRepository['prepareNew']>>,
    requestId?: string,
  ): Promise<ProviderWorkspaceUploadGrantView | ProviderWorkspaceUploadIntentView> {
    if (!prepared.shouldCreateSession) {
      return prepared.intent;
    }

    try {
      const upload = await this.evidence.createUploadSession(
        actor,
        prepared.providerId,
        {
          categoryKey: prepared.categoryKey,
          requirementKey: prepared.requirementKey,
          evidenceClass: prepared.evidenceClass,
          documentType: prepared.documentType,
          contentType: prepared.contentType,
          maxBytes: prepared.maxBytes,
          consentConfirmed: prepared.consentConfirmed,
          ...(prepared.replacementForEvidenceId
            ? { replacementForEvidenceId: prepared.replacementForEvidenceId }
            : {}),
        },
        requestId,
      );
      const intent = await this.repository.attachSession(
        actor,
        prepared.intent.uploadIntentId,
        upload.uploadSessionId,
      );
      return { ...intent, upload };
    } catch (error) {
      await this.repository.markPreparationFailure(
        actor,
        prepared.intent.uploadIntentId,
        'SESSION_PREPARATION_FAILED',
      );
      throw error;
    }
  }
}

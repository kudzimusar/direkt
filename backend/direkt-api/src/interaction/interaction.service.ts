import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type { CancelEnquiryDto, CreateEnquiryDto, TransitionEnquiryDto } from './interaction.dto';
import { InteractionRepository } from './interaction.repository';
import type { EnquiryView, ProviderEnquiryListView } from './interaction.types';

@Injectable()
export class InteractionService {
  constructor(private readonly repository: InteractionRepository) {}

  create(
    actor: AuthenticatedActor,
    dto: CreateEnquiryDto,
    idempotencyKey: string | undefined,
    requestId?: string,
  ): Promise<EnquiryView> {
    const normalizedKey = idempotencyKey?.trim();
    if (!normalizedKey || normalizedKey.length < 8 || normalizedKey.length > 200) {
      throw new BadRequestException('A valid Idempotency-Key header is required.');
    }
    const keyHash = this.hash(normalizedKey);
    const fingerprint = this.hash(
      JSON.stringify({
        publicProviderId: dto.publicProviderId,
        serviceSummary: dto.serviceSummary.trim(),
        timing: dto.timing,
        requestedFor: dto.requestedFor ?? null,
        localitySummary: dto.localitySummary.trim(),
        preferredChannel: dto.preferredChannel,
        policyVersion: dto.policyVersion.trim(),
      }),
    );
    return this.repository.createEnquiry(actor, dto, keyHash, fingerprint, requestId);
  }

  listCustomer(actor: AuthenticatedActor): Promise<EnquiryView[]> {
    return this.repository.listCustomer(actor);
  }

  detailCustomer(actor: AuthenticatedActor, enquiryId: string): Promise<EnquiryView> {
    return this.repository.detailCustomer(actor, enquiryId);
  }

  cancel(
    actor: AuthenticatedActor,
    enquiryId: string,
    dto: CancelEnquiryDto,
    requestId?: string,
  ): Promise<EnquiryView> {
    return this.repository.cancelCustomer(
      actor,
      enquiryId,
      dto.expectedRevision,
      dto.reason,
      dto.policyVersion,
      requestId,
    );
  }

  listProvider(actor: AuthenticatedActor): Promise<ProviderEnquiryListView> {
    return this.repository.listProvider(actor);
  }

  detailProvider(actor: AuthenticatedActor, enquiryId: string): Promise<EnquiryView> {
    return this.repository.detailProvider(actor, enquiryId);
  }

  transitionProvider(
    actor: AuthenticatedActor,
    enquiryId: string,
    dto: TransitionEnquiryDto,
    requestId?: string,
  ): Promise<EnquiryView> {
    return this.repository.transitionProvider(
      actor,
      enquiryId,
      dto.targetStatus,
      dto.expectedRevision,
      dto.reason,
      dto.policyVersion,
      requestId,
    );
  }

  private hash(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }
}

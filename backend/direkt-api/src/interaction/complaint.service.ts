import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type {
  CreateInteractionComplaintDto,
  OperationsComplaintQueryDto,
  TransitionInteractionComplaintDto,
} from './complaint.dto';
import { ComplaintRepository } from './complaint.repository';

@Injectable()
export class ComplaintService {
  constructor(private readonly repository: ComplaintRepository) {}

  create(
    actor: AuthenticatedActor,
    interactionId: string,
    dto: CreateInteractionComplaintDto,
    idempotencyKey: string | undefined,
    requestId?: string,
  ) {
    const normalizedKey = idempotencyKey?.trim();
    if (!normalizedKey || normalizedKey.length < 8 || normalizedKey.length > 200) {
      throw new BadRequestException('A valid Idempotency-Key header is required.');
    }
    return this.repository.create(
      actor,
      interactionId,
      dto,
      this.hash(normalizedKey),
      this.hash(
        JSON.stringify({
          interactionId,
          complaintType: dto.complaintType,
          summary: dto.summary.trim(),
          policyVersion: dto.policyVersion.trim(),
        }),
      ),
      requestId,
    );
  }

  listCustomer(actor: AuthenticatedActor) {
    return this.repository.listCustomer(actor);
  }

  detailCustomer(actor: AuthenticatedActor, complaintId: string) {
    return this.repository.detailCustomer(actor, complaintId);
  }

  operations(query: OperationsComplaintQueryDto) {
    return this.repository.operations(query);
  }

  transition(
    actor: AuthenticatedActor,
    complaintId: string,
    dto: TransitionInteractionComplaintDto,
    requestId?: string,
  ) {
    return this.repository.transition(actor, complaintId, dto, requestId);
  }

  private hash(value: string): string {
    return createHash('sha256').update(value, 'utf8').digest('hex');
  }
}

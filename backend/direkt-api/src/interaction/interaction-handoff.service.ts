import { BadRequestException, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import type { AuthenticatedActor } from "../authorization/authenticated-actor";
import type {
  CreateContactHandoffDto,
  RevokeContactHandoffDto,
} from "./interaction-handoff.dto";
import { InteractionHandoffRepository } from "./interaction-handoff.repository";
import type {
  ContactHandoffView,
  ProviderInteractionListView,
  ReviewEligibilityView,
  TrackedInteractionView,
} from "./interaction-handoff.types";

@Injectable()
export class InteractionHandoffService {
  constructor(private readonly repository: InteractionHandoffRepository) {}

  create(
    actor: AuthenticatedActor,
    enquiryId: string,
    dto: CreateContactHandoffDto,
    idempotencyKey: string | undefined,
    requestId?: string,
  ): Promise<ContactHandoffView> {
    const normalizedKey = idempotencyKey?.trim();
    if (!normalizedKey || normalizedKey.length < 8 || normalizedKey.length > 200) {
      throw new BadRequestException("A valid Idempotency-Key header is required.");
    }
    return this.repository.createHandoff(
      actor,
      enquiryId,
      dto,
      this.hash(normalizedKey),
      this.hash(
        JSON.stringify({
          enquiryId,
          channel: dto.channel,
          contactId: dto.contactId,
          policyVersion: dto.policyVersion.trim(),
        }),
      ),
      requestId,
    );
  }

  listCustomer(actor: AuthenticatedActor, enquiryId: string): Promise<ContactHandoffView[]> {
    return this.repository.listCustomerHandoffs(actor, enquiryId);
  }

  providerCurrent(actor: AuthenticatedActor, enquiryId: string): Promise<ContactHandoffView> {
    return this.repository.providerHandoff(actor, enquiryId);
  }

  revoke(
    actor: AuthenticatedActor,
    enquiryId: string,
    handoffId: string,
    dto: RevokeContactHandoffDto,
    requestId?: string,
  ): Promise<ContactHandoffView> {
    return this.repository.revokeHandoff(
      actor,
      enquiryId,
      handoffId,
      dto.reason,
      dto.policyVersion,
      requestId,
    );
  }

  customerInteractions(actor: AuthenticatedActor): Promise<TrackedInteractionView[]> {
    return this.repository.listCustomerInteractions(actor);
  }

  customerInteraction(actor: AuthenticatedActor, interactionId: string): Promise<TrackedInteractionView> {
    return this.repository.customerInteraction(actor, interactionId);
  }

  providerInteractions(actor: AuthenticatedActor): Promise<ProviderInteractionListView> {
    return this.repository.providerInteractions(actor);
  }

  reviewEligibility(actor: AuthenticatedActor, interactionId: string): Promise<ReviewEligibilityView> {
    return this.repository.reviewEligibility(actor, interactionId);
  }

  private hash(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
  }
}

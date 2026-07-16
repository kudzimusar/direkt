import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { PERMISSIONS } from "../authorization/permissions";
import { RequirePermission } from "../authorization/require-permission.decorator";
import type { DirektRequest } from "../platform/http/request-context";
import {
  CreateContactHandoffDto,
  RevokeContactHandoffDto,
} from "./interaction-handoff.dto";
import { InteractionHandoffService } from "./interaction-handoff.service";

@ApiTags("tracked interactions and contact handoff")
@ApiBearerAuth()
@Controller()
export class InteractionHandoffController {
  constructor(private readonly handoffs: InteractionHandoffService) {}

  @Post("enquiries/:enquiryId/handoffs")
  @RequirePermission(PERMISSIONS.INTERACTION_HANDOFF_CREATE)
  @ApiCreatedResponse({
    description:
      "Creates a synthetic disabled-delivery contact handoff after provider acceptance and current channel-specific consent.",
  })
  create(
    @Req() request: DirektRequest,
    @Param("enquiryId", ParseUUIDPipe) enquiryId: string,
    @Body() dto: CreateContactHandoffDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.handoffs.create(
      request.actor,
      enquiryId,
      dto,
      idempotencyKey,
      request.requestId,
    );
  }

  @Get("enquiries/:enquiryId/handoffs")
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_READ_OWN)
  @ApiOkResponse({ description: "Lists consent-scoped handoffs owned by this customer." })
  listCustomer(
    @Req() request: DirektRequest,
    @Param("enquiryId", ParseUUIDPipe) enquiryId: string,
  ) {
    return this.handoffs.listCustomer(request.actor, enquiryId);
  }

  @Post("enquiries/:enquiryId/handoffs/:handoffId/revoke")
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.INTERACTION_HANDOFF_CREATE)
  @ApiOkResponse({ description: "Revokes current customer consent and its linked handoff." })
  revoke(
    @Req() request: DirektRequest,
    @Param("enquiryId", ParseUUIDPipe) enquiryId: string,
    @Param("handoffId", ParseUUIDPipe) handoffId: string,
    @Body() dto: RevokeContactHandoffDto,
  ) {
    return this.handoffs.revoke(
      request.actor,
      enquiryId,
      handoffId,
      dto,
      request.requestId,
    );
  }

  @Get("interactions")
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_READ_OWN)
  @ApiOkResponse({ description: "Lists tracked interactions owned by this customer." })
  customerInteractions(@Req() request: DirektRequest) {
    return this.handoffs.customerInteractions(request.actor);
  }

  @Get("interactions/:interactionId")
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_READ_OWN)
  @ApiOkResponse({ description: "Returns one customer-owned tracked interaction and safe history." })
  customerInteraction(
    @Req() request: DirektRequest,
    @Param("interactionId", ParseUUIDPipe) interactionId: string,
  ) {
    return this.handoffs.customerInteraction(request.actor, interactionId);
  }

  @Get("interactions/:interactionId/review-eligibility")
  @RequirePermission(PERMISSIONS.INTERACTION_REVIEW_READ_OWN)
  @ApiOkResponse({ description: "Returns deterministic tracked-interaction review eligibility." })
  reviewEligibility(
    @Req() request: DirektRequest,
    @Param("interactionId", ParseUUIDPipe) interactionId: string,
  ) {
    return this.handoffs.reviewEligibility(request.actor, interactionId);
  }

  @Get("provider-workspace/me/interactions")
  @RequirePermission(PERMISSIONS.PROVIDER_ENQUIRIES_READ, { providerFromActor: true })
  @ApiOkResponse({ description: "Lists tracked interactions in the actor-resolved provider scope." })
  providerInteractions(@Req() request: DirektRequest) {
    return this.handoffs.providerInteractions(request.actor);
  }

  @Get("provider-workspace/me/enquiries/:enquiryId/handoff")
  @RequirePermission(PERMISSIONS.PROVIDER_ENQUIRIES_READ, { providerFromActor: true })
  @ApiOkResponse({
    description:
      "Returns only the current masked, consent-scoped contact hint. External delivery remains disabled.",
  })
  providerHandoff(
    @Req() request: DirektRequest,
    @Param("enquiryId", ParseUUIDPipe) enquiryId: string,
  ) {
    return this.handoffs.providerCurrent(request.actor, enquiryId);
  }
}

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
  Query,
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
  CreateInteractionComplaintDto,
  OperationsComplaintQueryDto,
  TransitionInteractionComplaintDto,
} from "./complaint.dto";
import { ComplaintService } from "./complaint.service";

@ApiTags("interaction complaints")
@ApiBearerAuth()
@Controller()
export class ComplaintController {
  constructor(private readonly complaints: ComplaintService) {}

  @Post("interactions/:interactionId/complaints")
  @RequirePermission(PERMISSIONS.INTERACTION_COMPLAINT_CREATE)
  @ApiCreatedResponse({
    description:
      "Creates an idempotent customer complaint linked to an owned tracked interaction without creating a Phase 7 internal incident.",
  })
  create(
    @Req() request: DirektRequest,
    @Param("interactionId", ParseUUIDPipe) interactionId: string,
    @Body() dto: CreateInteractionComplaintDto,
    @Headers("idempotency-key") idempotencyKey?: string,
  ) {
    return this.complaints.create(
      request.actor,
      interactionId,
      dto,
      idempotencyKey,
      request.requestId,
    );
  }

  @Get("complaints")
  @RequirePermission(PERMISSIONS.INTERACTION_COMPLAINT_READ_OWN)
  @ApiOkResponse({ description: "Lists complaints owned by the authenticated customer." })
  listCustomer(@Req() request: DirektRequest) {
    return this.complaints.listCustomer(request.actor);
  }

  @Get("complaints/:complaintId")
  @RequirePermission(PERMISSIONS.INTERACTION_COMPLAINT_READ_OWN)
  @ApiOkResponse({ description: "Returns one customer-owned complaint and safe event history." })
  detailCustomer(
    @Req() request: DirektRequest,
    @Param("complaintId", ParseUUIDPipe) complaintId: string,
  ) {
    return this.complaints.detailCustomer(request.actor, complaintId);
  }

  @Get("operations/interaction-complaints")
  @RequirePermission(PERMISSIONS.OPERATIONS_COMPLAINTS_READ)
  @ApiOkResponse({
    description:
      "Lists privacy-safe customer complaint projections without Phase 7 incident details.",
  })
  operations(@Query() query: OperationsComplaintQueryDto) {
    return this.complaints.operations(query);
  }

  @Post("operations/interaction-complaints/:complaintId/transitions")
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.OPERATIONS_COMPLAINTS_MANAGE)
  @ApiOkResponse({
    description: "Applies a revision-safe complaint transition with an immutable reason.",
  })
  transition(
    @Req() request: DirektRequest,
    @Param("complaintId", ParseUUIDPipe) complaintId: string,
    @Body() dto: TransitionInteractionComplaintDto,
  ) {
    return this.complaints.transition(request.actor, complaintId, dto, request.requestId);
  }
}

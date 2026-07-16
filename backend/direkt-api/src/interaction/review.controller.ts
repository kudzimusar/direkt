import {
  Body,
  Controller,
  Get,
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
import { PublicRoute } from "../authorization/public.decorator";
import { RequirePermission } from "../authorization/require-permission.decorator";
import type { DirektRequest } from "../platform/http/request-context";
import {
  CreateProviderReviewResponseDto,
  CreateReviewAppealDto,
  CreateReviewDto,
  DecideReviewAppealDto,
  ModerateReviewDto,
  OperationsReviewQueryDto,
  ReportReviewDto,
} from "./review.dto";
import { ReviewService } from "./review.service";

@ApiTags("tracked reviews and moderation")
@Controller()
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Post("interactions/:interactionId/reviews")
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.INTERACTION_REVIEW_CREATE)
  @ApiCreatedResponse({ description: "Creates one pending review from an eligible owned interaction." })
  create(
    @Req() request: DirektRequest,
    @Param("interactionId", ParseUUIDPipe) interactionId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(request.actor, interactionId, dto, request.requestId);
  }

  @Get("reviews")
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.INTERACTION_REVIEW_READ_OWN)
  @ApiOkResponse({ description: "Lists reviews and appeals owned by this customer." })
  listCustomer(@Req() request: DirektRequest) {
    return this.reviews.listCustomer(request.actor);
  }

  @Get("reviews/:reviewId")
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.INTERACTION_REVIEW_READ_OWN)
  @ApiOkResponse({ description: "Returns one customer-owned review with safe appeal state." })
  detailCustomer(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
  ) {
    return this.reviews.detailCustomer(request.actor, reviewId);
  }

  @Post("reviews/:reviewId/appeals")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.INTERACTION_REVIEW_READ_OWN)
  appealCustomer(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateReviewAppealDto,
  ) {
    return this.reviews.appealCustomer(request.actor, reviewId, dto, request.requestId);
  }

  @Post("reviews/:reviewId/reports")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.INTERACTION_REPORT_CREATE)
  report(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: ReportReviewDto,
  ) {
    return this.reviews.report(request.actor, reviewId, dto);
  }

  @Get("provider-workspace/me/reviews")
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.PROVIDER_REVIEWS_RESPOND, { providerFromActor: true })
  listProvider(@Req() request: DirektRequest) {
    return this.reviews.listProvider(request.actor);
  }

  @Post("provider-workspace/me/reviews/:reviewId/response")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.PROVIDER_REVIEWS_RESPOND, { providerFromActor: true })
  respondProvider(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateProviderReviewResponseDto,
  ) {
    return this.reviews.respondProvider(request.actor, reviewId, dto, request.requestId);
  }

  @Post("provider-workspace/me/reviews/:reviewId/appeals")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.PROVIDER_REVIEWS_RESPOND, { providerFromActor: true })
  appealProvider(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: CreateReviewAppealDto,
  ) {
    return this.reviews.appealProvider(request.actor, reviewId, dto, request.requestId);
  }

  @Get("operations/reviews")
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.OPERATIONS_REVIEWS_READ)
  operations(@Query() query: OperationsReviewQueryDto) {
    return this.reviews.operations(query);
  }

  @Post("operations/reviews/:reviewId/moderation")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.OPERATIONS_REVIEWS_MANAGE)
  moderate(
    @Req() request: DirektRequest,
    @Param("reviewId", ParseUUIDPipe) reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    return this.reviews.moderate(request.actor, reviewId, dto, request.requestId);
  }

  @Post("operations/review-appeals/:appealId/decisions")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.OPERATIONS_REVIEWS_MANAGE)
  decideAppeal(
    @Req() request: DirektRequest,
    @Param("appealId", ParseUUIDPipe) appealId: string,
    @Body() dto: DecideReviewAppealDto,
  ) {
    return this.reviews.decideAppeal(request.actor, appealId, dto, request.requestId);
  }

  @Get("public/providers/:publicProviderId/reviews")
  @PublicRoute()
  publicReviews(@Param("publicProviderId", ParseUUIDPipe) publicProviderId: string) {
    return this.reviews.publicReviews(publicProviderId);
  }
}

import { Injectable } from "@nestjs/common";
import type { AuthenticatedActor } from "../authorization/authenticated-actor";
import type {
  CreateProviderReviewResponseDto,
  CreateReviewAppealDto,
  CreateReviewDto,
  DecideReviewAppealDto,
  ModerateReviewDto,
  OperationsReviewQueryDto,
  ReportReviewDto,
} from "./review.dto";
import { ReviewRepository } from "./review.repository";

@Injectable()
export class ReviewService {
  constructor(private readonly repository: ReviewRepository) {}

  create(actor: AuthenticatedActor, interactionId: string, dto: CreateReviewDto, requestId?: string) {
    return this.repository.createReview(actor, interactionId, dto, requestId);
  }

  listCustomer(actor: AuthenticatedActor) {
    return this.repository.listCustomer(actor);
  }

  detailCustomer(actor: AuthenticatedActor, reviewId: string) {
    return this.repository.detailCustomer(actor, reviewId);
  }

  listProvider(actor: AuthenticatedActor) {
    return this.repository.providerReviews(actor);
  }

  respondProvider(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateProviderReviewResponseDto,
    requestId?: string,
  ) {
    return this.repository.respondProvider(actor, reviewId, dto, requestId);
  }

  appealCustomer(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateReviewAppealDto,
    requestId?: string,
  ) {
    return this.repository.createCustomerAppeal(actor, reviewId, dto, requestId);
  }

  appealProvider(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: CreateReviewAppealDto,
    requestId?: string,
  ) {
    return this.repository.createProviderAppeal(actor, reviewId, dto, requestId);
  }

  operations(query: OperationsReviewQueryDto) {
    return this.repository.operationsReviews(query);
  }

  moderate(
    actor: AuthenticatedActor,
    reviewId: string,
    dto: ModerateReviewDto,
    requestId?: string,
  ) {
    return this.repository.moderate(actor, reviewId, dto, requestId);
  }

  decideAppeal(
    actor: AuthenticatedActor,
    appealId: string,
    dto: DecideReviewAppealDto,
    requestId?: string,
  ) {
    return this.repository.decideAppeal(actor, appealId, dto, requestId);
  }

  report(actor: AuthenticatedActor, reviewId: string, dto: ReportReviewDto) {
    return this.repository.report(actor, reviewId, dto);
  }

  publicReviews(publicProviderId: string) {
    return this.repository.publicReviews(publicProviderId);
  }
}

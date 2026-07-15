import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
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
import { VerificationEvidenceService } from './verification-evidence.service';
import type {
  EvidenceView,
  PrivateEvidenceAccessGrant,
  SafeClaimCard,
  UploadSessionView,
  VerificationCaseView,
  VerificationQueueItem,
} from './verification-evidence.types';

@ApiTags('verification and evidence')
@ApiBearerAuth()
@Controller()
export class VerificationEvidenceController {
  constructor(private readonly service: VerificationEvidenceService) {}

  @Post('providers/:providerId/evidence/upload-sessions')
  @RequirePermission(PERMISSIONS.EVIDENCE_UPLOAD_CREATE, { providerParam: 'providerId' })
  @ApiCreatedResponse({
    description: 'Creates a short-lived synthetic private upload grant after provider-scope checks.',
  })
  createUploadSession(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: CreateUploadSessionDto,
    @Req() request: DirektRequest,
  ): Promise<UploadSessionView> {
    return this.service.createUploadSession(request.actor, providerId, dto, request.requestId);
  }

  @Post('providers/:providerId/evidence')
  @RequirePermission(PERMISSIONS.EVIDENCE_MANAGE, { providerParam: 'providerId' })
  @ApiCreatedResponse({
    description: 'Confirms synthetic private upload metadata and creates an immutable evidence version.',
  })
  confirmEvidence(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: ConfirmEvidenceDto,
    @Req() request: DirektRequest,
  ): Promise<EvidenceView> {
    return this.service.confirmEvidence(request.actor, providerId, dto, request.requestId);
  }

  @Get('providers/:providerId/evidence')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_OWN, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Lists private evidence metadata without storage object references.' })
  evidence(
    @Param('providerId', ParseUUIDPipe) providerId: string,
  ): Promise<EvidenceView[]> {
    return this.service.evidence(providerId);
  }

  @Get('providers/:providerId/evidence/:evidenceId')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_OWN, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Reads one private evidence metadata record without evidence bytes.' })
  evidenceItem(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
  ): Promise<EvidenceView> {
    return this.service.evidenceItem(providerId, evidenceId);
  }

  @Post('providers/:providerId/evidence/:evidenceId/revoke')
  @RequirePermission(PERMISSIONS.EVIDENCE_MANAGE, { providerParam: 'providerId' })
  @ApiOkResponse({
    description: 'Revokes provider evidence and deterministically degrades dependent claims.',
  })
  revokeEvidence(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
    @Body() dto: RevokeEvidenceDto,
    @Req() request: DirektRequest,
  ): Promise<{ evidence: EvidenceView; affectedClaims: number }> {
    return this.service.revokeEvidence(
      request.actor,
      providerId,
      evidenceId,
      dto,
      request.requestId,
    );
  }

  @Post('providers/:providerId/verification-cases')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_CREATE, { providerParam: 'providerId' })
  @ApiCreatedResponse({ description: 'Creates a separate scoped verification case.' })
  createCase(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: CreateVerificationCaseDto,
    @Req() request: DirektRequest,
  ): Promise<VerificationCaseView> {
    return this.service.createCase(request.actor, providerId, dto, request.requestId);
  }

  @Get('providers/:providerId/verification-cases')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_READ, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Lists provider-scoped verification cases and safe evidence metadata.' })
  cases(
    @Param('providerId', ParseUUIDPipe) providerId: string,
  ): Promise<VerificationCaseView[]> {
    return this.service.cases(providerId);
  }

  @Get('providers/:providerId/claims')
  @RequirePermission(PERMISSIONS.VERIFICATION_CLAIM_READ, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Lists safe scoped claim cards without original evidence.' })
  providerClaims(
    @Param('providerId', ParseUUIDPipe) providerId: string,
  ): Promise<SafeClaimCard[]> {
    return this.service.claims(providerId);
  }

  @Get('operations/verification-queue')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_REVIEW)
  @ApiOkResponse({ description: 'Lists synthetic verification queue items for authorized operators.' })
  queue(): Promise<VerificationQueueItem[]> {
    return this.service.queue();
  }

  @Get('verification-cases/:caseId')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_READ)
  @ApiOkResponse({ description: 'Reads a verification case only for an active assigned operator.' })
  assignedCase(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Req() request: DirektRequest,
  ): Promise<VerificationCaseView> {
    return this.service.assignedCase(caseId, request.actor);
  }

  @Post('verification-cases/:caseId/assignments')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_ASSIGN)
  @ApiCreatedResponse({ description: 'Assigns an authorized reviewer, field agent or supervisor.' })
  assignCase(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: AssignVerificationCaseDto,
    @Req() request: DirektRequest,
  ): Promise<VerificationCaseView> {
    return this.service.assignCase(request.actor, caseId, dto, request.requestId);
  }

  @Post('verification-cases/:caseId/evidence/:evidenceId/access')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_PRIVATE)
  @ApiCreatedResponse({
    description: 'Creates an audited short-lived synthetic reviewer access grant.',
  })
  privateEvidenceAccess(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
    @Req() request: DirektRequest,
  ): Promise<PrivateEvidenceAccessGrant> {
    return this.service.privateEvidenceAccess(
      request.actor,
      caseId,
      evidenceId,
      request.requestId,
    );
  }

  @Post('verification-cases/:caseId/recommendations')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_REVIEW)
  @ApiCreatedResponse({ description: 'Records an immutable assigned-reviewer recommendation.' })
  recommend(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: CreateRecommendationDto,
    @Req() request: DirektRequest,
  ): Promise<{ recommendationId: string }> {
    return this.service.recommend(request.actor, caseId, dto, request.requestId);
  }

  @Post('verification-cases/:caseId/decisions')
  @RequirePermission(PERMISSIONS.VERIFICATION_FINAL_DECISION)
  @ApiCreatedResponse({
    description: 'Records an immutable final decision and derives a scoped claim when approved.',
  })
  decide(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: CreateDecisionDto,
    @Req() request: DirektRequest,
  ): ReturnType<VerificationEvidenceService['decide']> {
    return this.service.decide(request.actor, caseId, dto, request.requestId);
  }

  @Post('verification-cases/:caseId/field-visits')
  @RequirePermission(PERMISSIONS.VERIFICATION_FIELD_VISIT_RECORD)
  @ApiCreatedResponse({ description: 'Records an immutable assignment-bound field-visit outcome.' })
  fieldVisit(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: CreateFieldVisitDto,
    @Req() request: DirektRequest,
  ): Promise<{ fieldVisitId: string }> {
    return this.service.fieldVisit(request.actor, caseId, dto, request.requestId);
  }

  @Post('operations/verification/expire-claims')
  @RequirePermission(PERMISSIONS.VERIFICATION_CLAIM_EXPIRE)
  @ApiOkResponse({ description: 'Runs deterministic evidence and claim expiry processing.' })
  expireClaims(@Body() dto: ExpireClaimsDto): Promise<{ affectedClaims: number; asOf: string }> {
    return this.service.expireClaims(dto);
  }

  @Get('operations/providers/:providerId/claims')
  @RequirePermission(PERMISSIONS.VERIFICATION_CLAIM_READ)
  @ApiOkResponse({ description: 'Lists safe claim cards for internal operations review.' })
  operationsClaims(
    @Param('providerId', ParseUUIDPipe) providerId: string,
  ): Promise<SafeClaimCard[]> {
    return this.service.claims(providerId);
  }
}
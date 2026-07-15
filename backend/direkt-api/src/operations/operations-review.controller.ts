import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  RevokeEvidenceReviewGrantDto,
  RevokeVerificationAssignmentDto,
} from './operations-review.dto';
import { OperationsReviewService } from './operations-review.service';
import type {
  OperationsEvidenceReviewGrant,
  OperationsEvidenceReviewRedemption,
  OperationsReviewWorkspace,
  RevokedVerificationAssignment,
} from './operations-review.types';

@ApiTags('operations evidence review')
@ApiBearerAuth()
@Controller()
export class OperationsReviewController {
  constructor(private readonly service: OperationsReviewService) {}

  @Get('operations/review-workspaces/:caseId')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_PRIVATE)
  @ApiOkResponse({
    description:
      'Returns an assigned review workspace with allowlisted evidence metadata and no storage keys, checksums, submitter identity, private rationale or coordinates.',
  })
  workspace(
    @Req() request: DirektRequest,
    @Param('caseId', ParseUUIDPipe) caseId: string,
  ): Promise<OperationsReviewWorkspace> {
    return this.service.workspace(request.actor, caseId);
  }

  @Post('operations/review-workspaces/:caseId/evidence/:evidenceId/access-grants')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_PRIVATE)
  @ApiCreatedResponse({
    description:
      'Creates a short-lived application-mediated grant after revalidating the active reviewer assignment and current evidence version.',
  })
  issueGrant(
    @Req() request: DirektRequest,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('evidenceId', ParseUUIDPipe) evidenceId: string,
  ): Promise<OperationsEvidenceReviewGrant> {
    return this.service.issueGrant(request.actor, caseId, evidenceId, request.requestId);
  }

  @Get('operations/evidence-access/:token')
  @RequirePermission(PERMISSIONS.EVIDENCE_READ_PRIVATE)
  @ApiOkResponse({
    description:
      'Redeems an application-mediated grant only while its assignment, expiry, evidence version and revocation state remain valid.',
  })
  redeem(
    @Req() request: DirektRequest,
    @Param('token') token: string,
  ): Promise<OperationsEvidenceReviewRedemption> {
    return this.service.redeem(request.actor, token, request.requestId);
  }

  @Post('operations/evidence-access-grants/:grantId/revoke')
  @RequirePermission(PERMISSIONS.OPERATIONS_EVIDENCE_ACCESS_REVOKE)
  @ApiOkResponse({ description: 'Revokes an active private evidence review grant.' })
  revokeGrant(
    @Req() request: DirektRequest,
    @Param('grantId', ParseUUIDPipe) grantId: string,
    @Body() body: RevokeEvidenceReviewGrantDto,
  ): Promise<{ grantId: string; revoked: true }> {
    return this.service.revokeGrant(request.actor, grantId, body.reason, request.requestId);
  }

  @Post('verification-cases/:caseId/assignments/:assignmentId/revoke')
  @RequirePermission(PERMISSIONS.VERIFICATION_CASE_ASSIGN)
  @ApiOkResponse({
    description:
      'Revokes an active review assignment and immediately invalidates its application-mediated evidence grants.',
  })
  revokeAssignment(
    @Req() request: DirektRequest,
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body() body: RevokeVerificationAssignmentDto,
  ): Promise<RevokedVerificationAssignment> {
    return this.service.revokeAssignment(
      request.actor,
      caseId,
      assignmentId,
      body.reason,
      request.requestId,
    );
  }
}

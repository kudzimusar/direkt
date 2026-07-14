import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { PublicRoute } from '../authorization/public.decorator';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  RequestChallengeDto,
  RevokeSessionDto,
  RotateSessionDto,
  VerifyChallengeDto,
} from './auth.dto';
import { AuthService, type RequestSecurityContext } from './auth.service';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicRoute()
  @Post('challenges')
  @HttpCode(202)
  @ApiAcceptedResponse({
    description: 'Enumeration-safe challenge acknowledgement. Delivery is synthetic in Phase 2C.',
  })
  requestChallenge(
    @Body() dto: RequestChallengeDto,
    @Req() request: DirektRequest,
  ): ReturnType<AuthService['requestChallenge']> {
    return this.authService.requestChallenge(dto, this.securityContext(request));
  }

  @PublicRoute()
  @Post('challenges/verify')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Creates an identity and rotating session after verification.' })
  @ApiUnauthorizedResponse({ description: 'The challenge is invalid, expired or locked.' })
  verifyChallenge(
    @Body() dto: VerifyChallengeDto,
    @Req() request: DirektRequest,
  ): ReturnType<AuthService['verifyChallenge']> {
    return this.authService.verifyChallenge(dto, this.securityContext(request));
  }

  @PublicRoute()
  @Post('sessions/rotate')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Rotates an active refresh session and returns new tokens.' })
  @ApiUnauthorizedResponse({ description: 'The refresh token is invalid, expired or reused.' })
  rotateSession(
    @Body() dto: RotateSessionDto,
    @Req() request: DirektRequest,
  ): ReturnType<AuthService['rotateSession']> {
    return this.authService.rotateSession(dto, this.securityContext(request));
  }

  @Get('sessions')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.ACCOUNT_SESSIONS_MANAGE)
  @ApiOkResponse({ description: 'Lists sessions belonging to the authenticated identity.' })
  listSessions(@Req() request: DirektRequest): ReturnType<AuthService['listSessions']> {
    return this.authService.listSessions(request.actor);
  }

  @Post('sessions/revoke-others')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.ACCOUNT_SESSIONS_MANAGE)
  @ApiOkResponse({ description: 'Revokes all sessions except the current session.' })
  revokeOtherSessions(
    @Req() request: DirektRequest,
  ): ReturnType<AuthService['revokeOtherSessions']> {
    return this.authService.revokeOtherSessions(request.actor, request.requestId);
  }

  @Post('sessions/:sessionId/revoke')
  @HttpCode(200)
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.ACCOUNT_SESSIONS_MANAGE)
  @ApiOkResponse({ description: 'Revokes one session belonging to the authenticated identity.' })
  revokeSession(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: RevokeSessionDto,
    @Req() request: DirektRequest,
  ): ReturnType<AuthService['revokeSession']> {
    return this.authService.revokeSession(request.actor, sessionId, dto, request.requestId);
  }

  private securityContext(request: DirektRequest): RequestSecurityContext {
    return {
      requestId: request.requestId,
      ...(request.header('user-agent')
        ? { userAgent: request.header('user-agent') as string }
        : {}),
      ...(request.ip ? { ip: request.ip } : {}),
    };
  }
}

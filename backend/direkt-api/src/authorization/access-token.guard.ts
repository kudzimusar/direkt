import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRepository } from '../auth/auth.repository';
import { TokenService } from '../auth/token.service';
import type { DirektRequest } from '../platform/http/request-context';
import { PUBLIC_ROUTE_KEY } from './public.decorator';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: TokenService,
    private readonly sessions: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const publicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<DirektRequest>();
    const authorization = request.header('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match?.[1]) {
      throw new UnauthorizedException('A valid bearer access token is required.');
    }

    const claims = this.tokens.verifyAccessToken(match[1]);
    const actor = await this.sessions.findActiveActor(claims.identityId, claims.sessionId);
    if (!actor) {
      throw new UnauthorizedException('The session is expired or revoked.');
    }
    request.actor = actor;
    return true;
  }
}

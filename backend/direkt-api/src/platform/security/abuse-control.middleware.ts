import { createHmac } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Response } from 'express';
import type { DirektTrafficMode } from '../../config/environment';
import { DatabaseService } from '../database/database.service';
import type { DirektRequest } from '../http/request-context';
import { abuseControlPolicy } from './abuse-control.policies';

interface RateLimitResultRow {
  allowed: boolean;
  remaining: number;
  retry_after_seconds: number;
  current_count: number;
  window_expires_at: Date;
}

const HEALTH_PATHS = new Set(['/api/v1/health/live', '/api/v1/health/ready']);

@Injectable()
export class AbuseControlMiddleware implements NestMiddleware {
  private readonly trafficMode: DirektTrafficMode;
  private readonly dataMode: string;
  private readonly rateLimitsEnabled: boolean;
  private readonly hashPepper: string;

  constructor(
    private readonly config: ConfigService,
    private readonly database: DatabaseService,
  ) {
    this.trafficMode = this.config.getOrThrow<DirektTrafficMode>('DIREKT_TRAFFIC_MODE');
    this.dataMode = this.config.getOrThrow<string>('DIREKT_DATA_MODE');
    this.rateLimitsEnabled = this.config.getOrThrow<boolean>('RATE_LIMITS_ENABLED');
    this.hashPepper = this.config.getOrThrow<string>('RATE_LIMIT_HASH_PEPPER');
  }

  async use(request: DirektRequest, response: Response, next: NextFunction): Promise<void> {
    const path = request.path;

    if (request.method === 'OPTIONS' || HEALTH_PATHS.has(path)) {
      next();
      return;
    }

    if (this.trafficMode === 'disabled') {
      this.rejectUnavailable(request, response, 'DIREKT traffic is administratively disabled.');
      return;
    }

    if (this.trafficMode === 'synthetic-public' && this.dataMode !== 'synthetic-only') {
      this.rejectUnavailable(
        request,
        response,
        'The public synthetic traffic boundary is not available for this data mode.',
      );
      return;
    }

    if (!this.rateLimitsEnabled) {
      next();
      return;
    }

    const policy = abuseControlPolicy(request.method, path);
    if (!policy) {
      next();
      return;
    }

    try {
      const subjectHash = this.subjectHash(request);
      const result = await this.database.query<RateLimitResultRow>(
        `SELECT *
         FROM security.consume_rate_limit($1, $2::character(64), $3, $4)`,
        [policy.key, subjectHash, policy.windowSeconds, policy.requestLimit],
      );
      const outcome = result.rows[0];
      if (!outcome) {
        throw new Error('Rate-limit function returned no row.');
      }

      response.setHeader('RateLimit-Limit', String(policy.requestLimit));
      response.setHeader('RateLimit-Remaining', String(outcome.remaining));
      response.setHeader('RateLimit-Reset', String(outcome.retry_after_seconds));

      if (!outcome.allowed) {
        response.setHeader('Retry-After', String(outcome.retry_after_seconds));
        response.status(429).json({
          type: 'https://direkt.invalid/problems/rate-limit-exceeded',
          title: 'Request rate limit exceeded',
          status: 429,
          detail: 'Retry this bounded operation after the supplied delay.',
          instance: request.originalUrl,
          requestId: request.requestId,
          policy: policy.key,
          retryAfterSeconds: outcome.retry_after_seconds,
        });
        return;
      }

      next();
    } catch {
      this.rejectUnavailable(
        request,
        response,
        'The abuse-control service is unavailable; the protected operation failed closed.',
      );
    }
  }

  private subjectHash(request: DirektRequest): string {
    const subject = request.ip || request.socket.remoteAddress || 'unresolved-network-subject';
    return createHmac('sha256', this.hashPepper).update(subject, 'utf8').digest('hex');
  }

  private rejectUnavailable(request: DirektRequest, response: Response, detail: string): void {
    response.setHeader('Retry-After', '60');
    response.status(503).json({
      type: 'https://direkt.invalid/problems/traffic-unavailable',
      title: 'DIREKT traffic is unavailable',
      status: 503,
      detail,
      instance: request.originalUrl,
      requestId: request.requestId,
    });
  }
}

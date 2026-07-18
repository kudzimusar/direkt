import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import type { NodeEnvironment } from '../../config/environment';

const API_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

interface ExpressApplicationLike {
  disable?: (setting: string) => void;
}

export function applySecurityHeaders(app: INestApplication, environment: NodeEnvironment): void {
  const expressApplication = app.getHttpAdapter().getInstance() as ExpressApplicationLike;
  expressApplication.disable?.('x-powered-by');

  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader(
      'Permissions-Policy',
      'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    );
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    if (!request.path.startsWith('/api/docs')) {
      response.setHeader('Content-Security-Policy', API_CONTENT_SECURITY_POLICY);
    }
    if (environment === 'production') {
      response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  });
}

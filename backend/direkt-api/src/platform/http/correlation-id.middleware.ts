import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { DirektRequest } from './request-context';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(request: DirektRequest, response: Response, next: NextFunction): void {
    const provided = request.header('x-request-id');
    const requestId = provided && UUID_PATTERN.test(provided) ? provided : randomUUID();

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  }
}

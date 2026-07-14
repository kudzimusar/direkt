import { STATUS_CODES } from 'node:http';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import type { DirektRequest } from './request-context';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  requestId: string;
  timestamp: string;
}

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<DirektRequest>();
    const response = context.getResponse<Response>();

    const { status, title, detail } = this.describe(exception);
    const problem: ProblemDetails = {
      type: 'about:blank',
      title,
      status,
      detail,
      instance: request.originalUrl,
      requestId: request.requestId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).type('application/problem+json').json(problem);
  }

  private describe(exception: unknown): {
    status: number;
    title: string;
    detail: string;
  } {
    if (!(exception instanceof HttpException)) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        title: STATUS_CODES[HttpStatus.INTERNAL_SERVER_ERROR] ?? 'Internal Server Error',
        detail: 'An unexpected error occurred.',
      };
    }

    const status = exception.getStatus();
    const body: unknown = exception.getResponse();
    let detail = exception.message;
    let title = STATUS_CODES[status] ?? 'Request Failed';

    if (typeof body === 'string') {
      detail = body;
    } else if (this.isRecord(body)) {
      const message = body.message;
      if (Array.isArray(message)) {
        detail = message.filter((item): item is string => typeof item === 'string').join('; ');
      } else if (typeof message === 'string') {
        detail = message;
      }

      if (typeof body.error === 'string') {
        title = body.error;
      }
    }

    return { status, title, detail };
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}

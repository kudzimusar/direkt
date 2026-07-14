import type { Request } from 'express';

export interface DirektRequest extends Request {
  requestId: string;
}

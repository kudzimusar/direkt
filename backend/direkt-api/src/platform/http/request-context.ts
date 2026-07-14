import type { Request } from 'express';
import type { AuthenticatedActor } from '../../authorization/authenticated-actor';

export interface DirektRequest extends Request {
  requestId: string;
  actor: AuthenticatedActor;
}

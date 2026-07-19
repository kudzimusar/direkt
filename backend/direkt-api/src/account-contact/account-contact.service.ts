import { Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { AccountContactRepository } from './account-contact.repository';
import type { AccountContactReference } from './account-contact.types';

@Injectable()
export class AccountContactService {
  constructor(private readonly repository: AccountContactRepository) {}

  list(actor: AuthenticatedActor): Promise<AccountContactReference[]> {
    return this.repository.list(actor.identityId);
  }
}

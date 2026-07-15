import { Injectable } from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import type { ProviderWorkspaceSummary } from './provider-workspace.types';

@Injectable()
export class ProviderWorkspaceService {
  constructor(private readonly repository: ProviderWorkspaceRepository) {}

  workspace(actor: AuthenticatedActor): Promise<ProviderWorkspaceSummary> {
    return this.repository.workspace(actor.identityId);
  }
}

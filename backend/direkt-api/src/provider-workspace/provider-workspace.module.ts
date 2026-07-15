import { Module } from '@nestjs/common';
import { ProviderModule } from '../provider-core/provider.module';
import { ProviderWorkspaceCommandRepository } from './provider-workspace-command.repository';
import { ProviderWorkspaceController } from './provider-workspace.controller';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceService } from './provider-workspace.service';

@Module({
  imports: [ProviderModule],
  controllers: [ProviderWorkspaceController],
  providers: [
    ProviderWorkspaceCommandRepository,
    ProviderWorkspaceRepository,
    ProviderWorkspaceService,
  ],
})
export class ProviderWorkspaceModule {}

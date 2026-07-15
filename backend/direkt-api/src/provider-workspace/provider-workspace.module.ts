import { Module } from '@nestjs/common';
import { ProviderWorkspaceController } from './provider-workspace.controller';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceService } from './provider-workspace.service';

@Module({
  controllers: [ProviderWorkspaceController],
  providers: [ProviderWorkspaceRepository, ProviderWorkspaceService],
})
export class ProviderWorkspaceModule {}

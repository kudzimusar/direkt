import { Module } from '@nestjs/common';
import { ProviderModule } from '../provider-core/provider.module';
import { VerificationEvidenceModule } from '../verification-evidence/verification-evidence.module';
import { ProviderWorkspaceCommandRepository } from './provider-workspace-command.repository';
import { ProviderWorkspaceController } from './provider-workspace.controller';
import { ProviderWorkspaceDeferredController } from './provider-workspace-deferred.controller';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceService } from './provider-workspace.service';
import { ProviderWorkspaceTimelineRepository } from './provider-workspace-timeline.repository';
import { ProviderWorkspaceUploadRepository } from './provider-workspace-upload.repository';
import { ProviderWorkspaceUploadService } from './provider-workspace-upload.service';

@Module({
  imports: [ProviderModule, VerificationEvidenceModule],
  controllers: [ProviderWorkspaceController, ProviderWorkspaceDeferredController],
  providers: [
    ProviderWorkspaceCommandRepository,
    ProviderWorkspaceRepository,
    ProviderWorkspaceService,
    ProviderWorkspaceTimelineRepository,
    ProviderWorkspaceUploadRepository,
    ProviderWorkspaceUploadService,
  ],
})
export class ProviderWorkspaceModule {}

import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ProviderModule } from '../provider-core/provider.module';
import { VerificationEvidenceModule } from '../verification-evidence/verification-evidence.module';
import { ProviderWorkspaceAiService } from './provider-workspace-ai.service';
import { ProviderWorkspaceCommandRepository } from './provider-workspace-command.repository';
import { ProviderWorkspaceController } from './provider-workspace.controller';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceService } from './provider-workspace.service';
import { ProviderWorkspaceTimelineRepository } from './provider-workspace-timeline.repository';
import { ProviderWorkspaceUploadRepository } from './provider-workspace-upload.repository';
import { ProviderWorkspaceUploadService } from './provider-workspace-upload.service';

@Module({
  imports: [AiModule, ProviderModule, VerificationEvidenceModule],
  controllers: [ProviderWorkspaceController],
  providers: [
    ProviderWorkspaceAiService,
    ProviderWorkspaceCommandRepository,
    ProviderWorkspaceRepository,
    ProviderWorkspaceService,
    ProviderWorkspaceTimelineRepository,
    ProviderWorkspaceUploadRepository,
    ProviderWorkspaceUploadService,
  ],
})
export class ProviderWorkspaceModule {}

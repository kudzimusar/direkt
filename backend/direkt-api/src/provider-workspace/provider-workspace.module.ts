import { Module } from '@nestjs/common';
import { ProviderModule } from '../provider-core/provider.module';
import { VerificationEvidenceModule } from '../verification-evidence/verification-evidence.module';
import { ProviderWorkspaceCommandRepository } from './provider-workspace-command.repository';
import { ProviderWorkspaceController } from './provider-workspace.controller';
import { ProviderWorkspaceRepository } from './provider-workspace.repository';
import { ProviderWorkspaceService } from './provider-workspace.service';
import { ProviderWorkspaceUploadRepository } from './provider-workspace-upload.repository';
import { ProviderWorkspaceUploadService } from './provider-workspace-upload.service';

@Module({
  imports: [ProviderModule, VerificationEvidenceModule],
  controllers: [ProviderWorkspaceController],
  providers: [
    ProviderWorkspaceCommandRepository,
    ProviderWorkspaceRepository,
    ProviderWorkspaceService,
    ProviderWorkspaceUploadRepository,
    ProviderWorkspaceUploadService,
  ],
})
export class ProviderWorkspaceModule {}

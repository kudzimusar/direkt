import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsTriageRepository } from './operations-triage.repository';
import { OperationsTriageService } from './operations-triage.service';
import { ProviderWorkspaceOperationsController } from './provider-workspace-operations.controller';
import { ProviderWorkspaceOperationsRepository } from './provider-workspace-operations.repository';

@Module({
  controllers: [OperationsController, ProviderWorkspaceOperationsController],
  providers: [
    OperationsTriageRepository,
    OperationsTriageService,
    ProviderWorkspaceOperationsRepository,
  ],
  exports: [OperationsTriageService],
})
export class OperationsModule {}

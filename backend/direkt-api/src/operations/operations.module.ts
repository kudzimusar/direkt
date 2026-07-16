import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsFieldController } from './operations-field.controller';
import { OperationsFieldRepository } from './operations-field.repository';
import { OperationsFieldService } from './operations-field.service';
import { OperationsTriageRepository } from './operations-triage.repository';
import { OperationsTriageService } from './operations-triage.service';
import { ProviderWorkspaceOperationsController } from './provider-workspace-operations.controller';
import { ProviderWorkspaceOperationsRepository } from './provider-workspace-operations.repository';

@Module({
  controllers: [
    OperationsController,
    OperationsFieldController,
    ProviderWorkspaceOperationsController,
  ],
  providers: [
    OperationsFieldRepository,
    OperationsFieldService,
    OperationsTriageRepository,
    OperationsTriageService,
    ProviderWorkspaceOperationsRepository,
  ],
  exports: [OperationsTriageService],
})
export class OperationsModule {}

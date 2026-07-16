import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { OperationsEscalationController } from './operations-escalation.controller';
import { OperationsEscalationRepository } from './operations-escalation.repository';
import { OperationsEscalationService } from './operations-escalation.service';
import { OperationsFieldController } from './operations-field.controller';
import { OperationsFieldRepository } from './operations-field.repository';
import { OperationsFieldService } from './operations-field.service';
import { OperationsReportingController } from './operations-reporting.controller';
import { OperationsReportingRepository } from './operations-reporting.repository';
import { OperationsReportingService } from './operations-reporting.service';
import { OperationsTriageRepository } from './operations-triage.repository';
import { OperationsTriageService } from './operations-triage.service';
import { ProviderWorkspaceOperationsController } from './provider-workspace-operations.controller';
import { ProviderWorkspaceOperationsRepository } from './provider-workspace-operations.repository';

@Module({
  controllers: [
    OperationsController,
    OperationsEscalationController,
    OperationsFieldController,
    OperationsReportingController,
    ProviderWorkspaceOperationsController,
  ],
  providers: [
    OperationsEscalationRepository,
    OperationsEscalationService,
    OperationsFieldRepository,
    OperationsFieldService,
    OperationsReportingRepository,
    OperationsReportingService,
    OperationsTriageRepository,
    OperationsTriageService,
    ProviderWorkspaceOperationsRepository,
  ],
  exports: [OperationsTriageService],
})
export class OperationsModule {}

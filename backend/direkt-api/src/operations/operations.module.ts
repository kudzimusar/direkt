import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller';
import { ProviderWorkspaceOperationsController } from './provider-workspace-operations.controller';
import { ProviderWorkspaceOperationsRepository } from './provider-workspace-operations.repository';

@Module({
  controllers: [OperationsController, ProviderWorkspaceOperationsController],
  providers: [ProviderWorkspaceOperationsRepository],
})
export class OperationsModule {}

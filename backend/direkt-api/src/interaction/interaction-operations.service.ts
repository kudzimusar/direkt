import { Injectable } from '@nestjs/common';
import { InteractionOperationsRepository } from './interaction-operations.repository';
import type { OperationsInteractionListView } from './interaction-operations.types';

@Injectable()
export class InteractionOperationsService {
  constructor(private readonly repository: InteractionOperationsRepository) {}

  list(): Promise<OperationsInteractionListView> {
    return this.repository.list();
  }
}

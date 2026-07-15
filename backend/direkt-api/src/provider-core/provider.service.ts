import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedActor } from '../authorization/authenticated-actor';
import type {
  AddRepresentativeDto,
  CreateProviderDto,
  ProviderTransitionDto,
  UpdateProviderProfileDto,
  UpsertCustomerProfileDto,
} from './provider.dto';
import { ProviderRepository } from './provider.repository';
import type {
  CategoryView,
  CustomerProfileView,
  ProviderOperationsSummary,
  ProviderView,
} from './provider.types';

interface PostgresErrorLike {
  code?: string;
  constraint?: string;
  message?: string;
}

@Injectable()
export class ProviderService {
  constructor(private readonly repository: ProviderRepository) {}

  async upsertCustomerProfile(
    actor: AuthenticatedActor,
    dto: UpsertCustomerProfileDto,
    requestId?: string,
  ): Promise<CustomerProfileView> {
    try {
      return await this.repository.upsertCustomerProfile(actor, dto.displayName, requestId);
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  async createProvider(
    actor: AuthenticatedActor,
    dto: CreateProviderDto,
    requestId?: string,
  ): Promise<ProviderView> {
    try {
      return await this.repository.createProvider(actor, dto, requestId);
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  async provider(providerId: string): Promise<ProviderView> {
    const provider = await this.repository.findProvider(providerId);
    if (!provider) {
      throw new NotFoundException('Provider draft was not found.');
    }
    return provider;
  }

  async updateProvider(
    actor: AuthenticatedActor,
    providerId: string,
    dto: UpdateProviderProfileDto,
    requestId?: string,
  ): Promise<ProviderView> {
    try {
      const provider = await this.repository.updateProviderProfile(
        actor,
        providerId,
        dto,
        requestId,
      );
      if (!provider) {
        throw new NotFoundException('Provider draft was not found.');
      }
      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.throwDomainError(error);
    }
  }

  async transitionProvider(
    actor: AuthenticatedActor,
    providerId: string,
    dto: ProviderTransitionDto,
    requestId?: string,
  ): Promise<ProviderView> {
    try {
      const provider = await this.repository.transitionProvider(
        actor,
        providerId,
        dto.targetStatus,
        dto.reason,
        requestId,
      );
      if (!provider) {
        throw new NotFoundException('Provider draft was not found.');
      }
      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.throwDomainError(error);
    }
  }

  async addRepresentative(
    actor: AuthenticatedActor,
    providerId: string,
    dto: AddRepresentativeDto,
    requestId?: string,
  ): Promise<{ assignmentId: string; providerId: string; identityId: string; role: string }> {
    try {
      return await this.repository.addRepresentative(actor, providerId, dto, requestId);
    } catch (error) {
      this.throwDomainError(error);
    }
  }

  async selectCategory(
    actor: AuthenticatedActor,
    providerId: string,
    categoryKey: string,
    requestId?: string,
  ): Promise<ProviderView> {
    try {
      const provider = await this.repository.selectCategory(
        actor,
        providerId,
        categoryKey,
        requestId,
      );
      if (!provider) {
        throw new NotFoundException('Active service category was not found.');
      }
      return provider;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.throwDomainError(error);
    }
  }

  categories(): Promise<CategoryView[]> {
    return this.repository.listCategories();
  }

  operationsProviders(): Promise<ProviderOperationsSummary[]> {
    return this.repository.listOperationsProviders();
  }

  private throwDomainError(error: unknown): never {
    const databaseError = error as PostgresErrorLike;
    if (databaseError.code === '23P01' || databaseError.code === '23505') {
      throw new ConflictException('The requested provider assignment or record already exists.');
    }
    if (
      databaseError.code === '23503' ||
      databaseError.code === '23514' ||
      databaseError.code === 'P0001'
    ) {
      throw new BadRequestException(
        databaseError.message ?? 'The provider request violates a domain rule.',
      );
    }
    throw error;
  }
}

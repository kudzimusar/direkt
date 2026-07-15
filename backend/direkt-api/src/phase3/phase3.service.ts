import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import type {
  AssignRepresentativeDto,
  CreateProviderDraftDto,
  SelectCategoryDto,
  TransitionProviderProfileDto,
  UpdateProviderProfileDto,
  UpsertCustomerProfileDto,
} from './dto/phase3.dto';
import { Phase3Repository } from './phase3.repository';
import {
  canTransitionProfile,
  type OperatingModel,
  type ProfileState,
  validateOperatingModel,
} from './provider-policy';

@Injectable()
export class Phase3Service {
  constructor(private readonly repository: Phase3Repository) {}

  getCustomerProfile(identityId: string) {
    return this.repository.getCustomerProfile(identityId);
  }

  upsertCustomerProfile(identityId: string, input: UpsertCustomerProfileDto) {
    return this.repository.upsertCustomerProfile(identityId, input);
  }

  createProviderDraft(identityId: string, input: CreateProviderDraftDto) {
    this.assertOperatingModel(input);
    return this.repository.createProviderDraft(identityId, input);
  }

  getProviderProfile(providerId: string) {
    return this.repository.getProviderProfile(providerId);
  }

  async updateProviderProfile(
    providerId: string,
    identityId: string,
    input: UpdateProviderProfileDto,
  ) {
    const current = await this.repository.getProviderProfile(providerId);
    const operatingInput: {
      operatingModel: OperatingModel;
      serviceAreaLabel?: string;
      premisesLabel?: string;
    } = {
      operatingModel: (input.operatingModel ?? current.operatingModel) as OperatingModel,
    };
    const serviceAreaLabel = input.serviceAreaLabel ?? current.serviceAreaLabel;
    const premisesLabel = input.premisesLabel ?? current.premisesLabel;
    if (serviceAreaLabel !== null && serviceAreaLabel !== undefined) {
      operatingInput.serviceAreaLabel = serviceAreaLabel;
    }
    if (premisesLabel !== null && premisesLabel !== undefined) {
      operatingInput.premisesLabel = premisesLabel;
    }
    this.assertOperatingModel(operatingInput);
    return this.repository.updateProviderProfile(providerId, identityId, input);
  }

  async transitionProviderProfile(
    providerId: string,
    identityId: string,
    input: TransitionProviderProfileDto,
  ) {
    const current = await this.repository.getProviderProfile(providerId);
    if (!canTransitionProfile(current.profileState, input.targetState as ProfileState)) {
      throw new ConflictException(
        `Provider profile cannot transition from ${current.profileState} to ${input.targetState}.`,
      );
    }
    if (input.targetState === 'complete' && current.categories.length === 0) {
      throw new ConflictException('At least one active category is required before completion.');
    }
    return this.repository.transitionProviderProfile(
      providerId,
      identityId,
      input.targetState as ProfileState,
    );
  }

  assignRepresentative(
    providerId: string,
    actorIdentityId: string,
    input: AssignRepresentativeDto,
  ) {
    if (actorIdentityId === input.identityId) {
      throw new BadRequestException('The provider owner already has provider-scoped access.');
    }
    return this.repository.assignRepresentative({
      providerId,
      actorIdentityId,
      identityId: input.identityId,
      role: input.role,
      reason: input.reason,
    });
  }

  selectCategory(
    providerId: string,
    identityId: string,
    categoryId: string,
    input: SelectCategoryDto,
  ) {
    return this.repository.selectCategory({
      providerId,
      identityId,
      categoryId,
      requirementVersionId: input.requirementVersionId,
    });
  }

  listCategories() {
    return this.repository.listCategories();
  }

  operationsSummary() {
    return this.repository.operationsSummary();
  }

  private assertOperatingModel(input: {
    operatingModel: OperatingModel;
    serviceAreaLabel?: string;
    premisesLabel?: string;
  }): void {
    const issues = validateOperatingModel(input);
    if (issues.length > 0) {
      throw new BadRequestException(issues.join(' '));
    }
  }
}

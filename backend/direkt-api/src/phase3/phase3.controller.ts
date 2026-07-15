import { Body, Controller, Get, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  AssignRepresentativeDto,
  CreateProviderDraftDto,
  SelectCategoryDto,
  TransitionProviderProfileDto,
  UpdateProviderProfileDto,
  UpsertCustomerProfileDto,
} from './dto/phase3.dto';
import { Phase3Service } from './phase3.service';

@ApiTags('Phase 3 provider core')
@ApiBearerAuth()
@Controller('api/v1')
export class Phase3Controller {
  constructor(private readonly phase3: Phase3Service) {}

  @Get('account/profile')
  @RequirePermission(PERMISSIONS.ACCOUNT_PROFILE_READ)
  getCustomerProfile(@Req() request: DirektRequest) {
    return this.phase3.getCustomerProfile(request.actor.identityId);
  }

  @Put('account/profile')
  @RequirePermission(PERMISSIONS.ACCOUNT_PROFILE_MANAGE)
  upsertCustomerProfile(@Req() request: DirektRequest, @Body() input: UpsertCustomerProfileDto) {
    return this.phase3.upsertCustomerProfile(request.actor.identityId, input);
  }

  @Post('providers')
  @ApiOperation({ summary: 'Create a blocked, non-public provider profile draft' })
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_CREATE)
  createProviderDraft(@Req() request: DirektRequest, @Body() input: CreateProviderDraftDto) {
    return this.phase3.createProviderDraft(request.actor.identityId, input);
  }

  @Get('providers/:providerId')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerParam: 'providerId' })
  getProviderProfile(@Param('providerId') providerId: string) {
    return this.phase3.getProviderProfile(providerId);
  }

  @Patch('providers/:providerId')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerParam: 'providerId' })
  updateProviderProfile(
    @Req() request: DirektRequest,
    @Param('providerId') providerId: string,
    @Body() input: UpdateProviderProfileDto,
  ) {
    return this.phase3.updateProviderProfile(providerId, request.actor.identityId, input);
  }

  @Post('providers/:providerId/transitions')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_TRANSITION, { providerParam: 'providerId' })
  transitionProviderProfile(
    @Req() request: DirektRequest,
    @Param('providerId') providerId: string,
    @Body() input: TransitionProviderProfileDto,
  ) {
    return this.phase3.transitionProviderProfile(providerId, request.actor.identityId, input);
  }

  @Post('providers/:providerId/representatives')
  @RequirePermission(PERMISSIONS.PROVIDER_REPRESENTATIVES_MANAGE, {
    providerParam: 'providerId',
  })
  assignRepresentative(
    @Req() request: DirektRequest,
    @Param('providerId') providerId: string,
    @Body() input: AssignRepresentativeDto,
  ) {
    return this.phase3.assignRepresentative(providerId, request.actor.identityId, input);
  }

  @Put('providers/:providerId/categories/:categoryId')
  @RequirePermission(PERMISSIONS.PROVIDER_CATEGORIES_MANAGE, { providerParam: 'providerId' })
  selectCategory(
    @Req() request: DirektRequest,
    @Param('providerId') providerId: string,
    @Param('categoryId') categoryId: string,
    @Body() input: SelectCategoryDto,
  ) {
    return this.phase3.selectCategory(providerId, request.actor.identityId, categoryId, input);
  }

  @Get('categories')
  @RequirePermission(PERMISSIONS.CATALOG_CATEGORIES_READ)
  listCategories() {
    return this.phase3.listCategories();
  }

  @Get('operations/provider-core/summary')
  @RequirePermission(PERMISSIONS.OPERATIONS_PORTAL_ACCESS)
  operationsSummary() {
    return this.phase3.operationsSummary();
  }
}

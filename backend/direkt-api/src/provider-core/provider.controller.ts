import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import {
  AddRepresentativeDto,
  CreateProviderDto,
  ProviderTransitionDto,
  UpdateProviderProfileDto,
  UpsertCustomerProfileDto,
} from './provider.dto';
import { ProviderService } from './provider.service';
import type {
  CategoryView,
  CustomerProfileView,
  ProviderOperationsSummary,
  ProviderView,
} from './provider.types';

@ApiTags('provider core')
@ApiBearerAuth()
@Controller()
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Put('account/profile')
  @RequirePermission(PERMISSIONS.ACCOUNT_PROFILE_MANAGE)
  @ApiOkResponse({ description: 'Creates or updates the authenticated synthetic customer profile.' })
  upsertCustomerProfile(
    @Body() dto: UpsertCustomerProfileDto,
    @Req() request: DirektRequest,
  ): Promise<CustomerProfileView> {
    return this.providerService.upsertCustomerProfile(request.actor, dto, request.requestId);
  }

  @Post('providers')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_CREATE)
  @ApiCreatedResponse({
    description: 'Creates a non-public provider draft and assigns the creator as provider owner.',
  })
  createProvider(
    @Body() dto: CreateProviderDto,
    @Req() request: DirektRequest,
  ): Promise<ProviderView> {
    return this.providerService.createProvider(request.actor, dto, request.requestId);
  }

  @Get('providers/:providerId')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Reads a non-public provider draft within server-owned scope.' })
  provider(
    @Param('providerId', ParseUUIDPipe) providerId: string,
  ): Promise<ProviderView> {
    return this.providerService.provider(providerId);
  }

  @Patch('providers/:providerId/profile')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Updates a non-public provider profile draft.' })
  updateProvider(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: UpdateProviderProfileDto,
    @Req() request: DirektRequest,
  ): Promise<ProviderView> {
    return this.providerService.updateProvider(
      request.actor,
      providerId,
      dto,
      request.requestId,
    );
  }

  @Post('providers/:providerId/state-transitions')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerParam: 'providerId' })
  @ApiOkResponse({
    description: 'Performs a validated internal provider-state transition without publication.',
  })
  transitionProvider(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: ProviderTransitionDto,
    @Req() request: DirektRequest,
  ): Promise<ProviderView> {
    return this.providerService.transitionProvider(
      request.actor,
      providerId,
      dto,
      request.requestId,
    );
  }

  @Post('providers/:providerId/representatives')
  @RequirePermission(PERMISSIONS.PROVIDER_REPRESENTATIVES_MANAGE, {
    providerParam: 'providerId',
  })
  @ApiCreatedResponse({ description: 'Assigns a provider-scoped synthetic representative.' })
  addRepresentative(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() dto: AddRepresentativeDto,
    @Req() request: DirektRequest,
  ): ReturnType<ProviderService['addRepresentative']> {
    return this.providerService.addRepresentative(
      request.actor,
      providerId,
      dto,
      request.requestId,
    );
  }

  @Put('providers/:providerId/categories/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerParam: 'providerId' })
  @ApiOkResponse({ description: 'Pins the provider draft to the active category requirement version.' })
  selectCategory(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Param('categoryKey') categoryKey: string,
    @Req() request: DirektRequest,
  ): Promise<ProviderView> {
    return this.providerService.selectCategory(
      request.actor,
      providerId,
      categoryKey,
      request.requestId,
    );
  }

  @Get('categories')
  @RequirePermission(PERMISSIONS.CATALOG_CATEGORIES_READ)
  @ApiOkResponse({ description: 'Lists active service categories and immutable requirements.' })
  categories(): Promise<CategoryView[]> {
    return this.providerService.categories();
  }

  @Get('operations/providers')
  @RequirePermission(PERMISSIONS.OPERATIONS_PROVIDERS_READ)
  @ApiOkResponse({
    description: 'Lists internal non-public provider drafts for the synthetic operations portal.',
  })
  operationsProviders(): Promise<ProviderOperationsSummary[]> {
    return this.providerService.operationsProviders();
  }
}
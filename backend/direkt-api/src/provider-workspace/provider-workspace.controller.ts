import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { UpdateProviderProfileDto } from '../provider-core/provider.dto';
import {
  CancelWorkspaceUploadDto,
  ConfirmWorkspaceUploadDto,
  CreateWorkspaceUploadIntentDto,
  MarkWorkspaceUploadInterruptedDto,
  RemoveWorkspaceServiceDto,
  UpdateWorkspaceAvailabilityDto,
  UpdateWorkspaceLocationDto,
} from './provider-workspace.dto';
import { ProviderWorkspaceService } from './provider-workspace.service';
import { ProviderWorkspaceUploadService } from './provider-workspace-upload.service';
import type {
  ProviderWorkspaceSummary,
  ProviderWorkspaceUploadGrantView,
  ProviderWorkspaceUploadIntentView,
} from './provider-workspace.types';

@ApiTags('provider workspace')
@ApiBearerAuth()
@Controller('provider-workspace')
export class ProviderWorkspaceController {
  constructor(
    private readonly service: ProviderWorkspaceService,
    private readonly uploads: ProviderWorkspaceUploadService,
  ) {}

  @Get('me')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_READ, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Returns the single active provider workspace resolved from the authenticated identity. No provider ownership is accepted from client input.',
  })
  workspace(@Req() request: DirektRequest): Promise<ProviderWorkspaceSummary> {
    return this.service.workspace(request.actor);
  }

  @Patch('me/profile')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({ description: 'Updates the actor-resolved provider profile without publishing it.' })
  updateProfile(
    @Req() request: DirektRequest,
    @Body() body: UpdateProviderProfileDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateProfile(request.actor, body);
  }

  @Put('me/services/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description: 'Selects the active immutable requirement version for a provider service.',
  })
  selectService(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.selectService(request.actor, categoryKey);
  }

  @Delete('me/services/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Removes a provider service without deleting its historical cases, evidence, decisions or claims.',
  })
  removeService(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
    @Body() body: RemoveWorkspaceServiceDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.removeService(request.actor, categoryKey, body);
  }

  @Put('me/location')
  @RequirePermission(PERMISSIONS.PROVIDER_PROFILE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Stores private base, consented public premises and service-area geometry as separate models. Coordinates are write-only in this response contract.',
  })
  updateLocation(
    @Req() request: DirektRequest,
    @Body() body: UpdateWorkspaceLocationDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateLocation(request.actor, body);
  }

  @Put('me/availability/:categoryKey')
  @RequirePermission(PERMISSIONS.PROVIDER_AVAILABILITY_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Updates minimal availability independently of claims, publication and trust ranking.',
  })
  updateAvailability(
    @Req() request: DirektRequest,
    @Param('categoryKey') categoryKey: string,
    @Body() body: UpdateWorkspaceAvailabilityDto,
  ): Promise<ProviderWorkspaceSummary> {
    return this.service.updateAvailability(request.actor, categoryKey, body);
  }

  @Post('me/upload-intents')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiCreatedResponse({
    description:
      'Creates an idempotent logical upload intent and, when needed, a fresh synthetic private upload session.',
  })
  createUploadIntent(
    @Req() request: DirektRequest,
    @Body() body: CreateWorkspaceUploadIntentDto,
  ): Promise<ProviderWorkspaceUploadGrantView | ProviderWorkspaceUploadIntentView> {
    return this.uploads.create(request.actor, body, request.requestId);
  }

  @Get('me/upload-intents')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Lists the authenticated representative’s recoverable upload intents without private object keys.',
  })
  uploadIntents(@Req() request: DirektRequest): Promise<ProviderWorkspaceUploadIntentView[]> {
    return this.uploads.list(request.actor);
  }

  @Get('me/upload-intents/:uploadIntentId')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({ description: 'Returns safe persistent state for one provider upload intent.' })
  uploadIntent(
    @Req() request: DirektRequest,
    @Param('uploadIntentId') uploadIntentId: string,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.uploads.detail(request.actor, uploadIntentId);
  }

  @Post('me/upload-intents/:uploadIntentId/retry')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiCreatedResponse({ description: 'Creates a fresh private upload session for a retryable intent.' })
  retryUploadIntent(
    @Req() request: DirektRequest,
    @Param('uploadIntentId') uploadIntentId: string,
  ): Promise<ProviderWorkspaceUploadGrantView> {
    return this.uploads.retry(request.actor, uploadIntentId, request.requestId);
  }

  @Put('me/upload-intents/:uploadIntentId/interrupted')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description: 'Marks the active attempt interrupted and makes the logical intent safely retryable.',
  })
  interruptUploadIntent(
    @Req() request: DirektRequest,
    @Param('uploadIntentId') uploadIntentId: string,
    @Body() body: MarkWorkspaceUploadInterruptedDto,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.uploads.interrupted(request.actor, uploadIntentId, body);
  }

  @Post('me/upload-intents/:uploadIntentId/confirm')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({
    description:
      'Confirms the active private upload against the intent’s server-owned case and creates one immutable evidence version.',
  })
  confirmUploadIntent(
    @Req() request: DirektRequest,
    @Param('uploadIntentId') uploadIntentId: string,
    @Body() body: ConfirmWorkspaceUploadDto,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.uploads.confirm(request.actor, uploadIntentId, body, request.requestId);
  }

  @Delete('me/upload-intents/:uploadIntentId')
  @RequirePermission(PERMISSIONS.PROVIDER_EVIDENCE_MANAGE, { providerFromActor: true })
  @ApiOkResponse({ description: 'Cancels a non-submitted provider upload intent.' })
  cancelUploadIntent(
    @Req() request: DirektRequest,
    @Param('uploadIntentId') uploadIntentId: string,
    @Body() body: CancelWorkspaceUploadDto,
  ): Promise<ProviderWorkspaceUploadIntentView> {
    return this.uploads.cancel(request.actor, uploadIntentId, body);
  }
}

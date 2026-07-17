import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { CancelEnquiryDto, CreateEnquiryDto, TransitionEnquiryDto } from './interaction.dto';
import { InteractionService } from './interaction.service';

@ApiTags('enquiries and tracked interactions')
@ApiBearerAuth()
@Controller()
export class InteractionController {
  constructor(private readonly interactions: InteractionService) {}

  @Post('enquiries')
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_CREATE)
  @ApiCreatedResponse({ description: 'Creates an idempotent structured enquiry.' })
  create(
    @Req() request: DirektRequest,
    @Body() dto: CreateEnquiryDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.interactions.create(request.actor, dto, idempotencyKey, request.requestId);
  }

  @Get('enquiries')
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_READ_OWN)
  @ApiOkResponse({ description: 'Lists enquiries owned by the authenticated customer.' })
  listCustomer(@Req() request: DirektRequest) {
    return this.interactions.listCustomer(request.actor);
  }

  @Get('enquiries/:enquiryId')
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_READ_OWN)
  @ApiOkResponse({ description: 'Returns one customer-owned enquiry and safe history.' })
  detailCustomer(
    @Req() request: DirektRequest,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
  ) {
    return this.interactions.detailCustomer(request.actor, enquiryId);
  }

  @Post('enquiries/:enquiryId/cancel')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.INTERACTION_ENQUIRY_CANCEL_OWN)
  @ApiOkResponse({ description: 'Cancels a customer-owned non-terminal enquiry.' })
  cancelCustomer(
    @Req() request: DirektRequest,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
    @Body() dto: CancelEnquiryDto,
  ) {
    return this.interactions.cancel(request.actor, enquiryId, dto, request.requestId);
  }

  @Get('provider-workspace/me/enquiries')
  @RequirePermission(PERMISSIONS.PROVIDER_ENQUIRIES_READ, { providerFromActor: true })
  @ApiOkResponse({ description: 'Lists enquiries in the server-resolved provider workspace.' })
  listProvider(@Req() request: DirektRequest) {
    return this.interactions.listProvider(request.actor);
  }

  @Get('provider-workspace/me/enquiries/:enquiryId')
  @RequirePermission(PERMISSIONS.PROVIDER_ENQUIRIES_READ, { providerFromActor: true })
  @ApiOkResponse({ description: 'Returns one provider-scoped enquiry and safe history.' })
  detailProvider(
    @Req() request: DirektRequest,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
  ) {
    return this.interactions.detailProvider(request.actor, enquiryId);
  }

  @Post('provider-workspace/me/enquiries/:enquiryId/transitions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission(PERMISSIONS.PROVIDER_ENQUIRIES_RESPOND, { providerFromActor: true })
  @ApiOkResponse({ description: 'Applies a concurrency-safe provider enquiry transition.' })
  transitionProvider(
    @Req() request: DirektRequest,
    @Param('enquiryId', ParseUUIDPipe) enquiryId: string,
    @Body() dto: TransitionEnquiryDto,
  ) {
    return this.interactions.transitionProvider(request.actor, enquiryId, dto, request.requestId);
  }
}

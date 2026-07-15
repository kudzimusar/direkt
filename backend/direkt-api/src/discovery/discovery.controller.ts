import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { PublicRoute } from '../authorization/public.decorator';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { DiscoverySearchDto, HidePublicationDto, RefreshPublicationDto } from './discovery.dto';
import { DiscoveryService } from './discovery.service';

@ApiTags('customer discovery')
@Controller()
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Get('public/categories')
  @PublicRoute()
  @ApiOkResponse({ description: 'Lists active public-safe service categories.' })
  categories() {
    return this.discovery.categories();
  }

  @Get('public/providers/search')
  @PublicRoute()
  @ApiOperation({
    summary: 'Searches eligible synthetic provider publications without private coordinates.',
  })
  @ApiOkResponse({ description: 'Returns deterministic public-safe discovery cards.' })
  search(@Query() query: DiscoverySearchDto) {
    return this.discovery.search(query);
  }

  @Get('public/providers/:publicProviderId')
  @PublicRoute()
  @ApiOkResponse({ description: 'Returns one eligible public-safe provider profile.' })
  profile(@Param('publicProviderId', ParseUUIDPipe) publicProviderId: string) {
    return this.discovery.profile(publicProviderId);
  }

  @Get('public/providers/:publicProviderId/claims')
  @PublicRoute()
  @ApiOkResponse({ description: 'Returns current scoped claim cards and limitations only.' })
  claims(@Param('publicProviderId', ParseUUIDPipe) publicProviderId: string) {
    return this.discovery.claims(publicProviderId);
  }

  @Get('public/providers/:publicProviderId/availability')
  @PublicRoute()
  @ApiOkResponse({ description: 'Returns minimal public availability from the safe profile.' })
  async availability(@Param('publicProviderId', ParseUUIDPipe) publicProviderId: string) {
    const profile = await this.discovery.profile(publicProviderId);
    return {
      publicProviderId,
      state: profile.availability,
      nextAvailableAt: profile.nextAvailableAt,
      synthetic: true,
    };
  }

  @Get('public/providers/:publicProviderId/share')
  @PublicRoute()
  @ApiOkResponse({ description: 'Returns share-safe metadata with no private location.' })
  share(@Param('publicProviderId', ParseUUIDPipe) publicProviderId: string) {
    return this.discovery.share(publicProviderId);
  }

  @Post('account/saved-providers/:publicProviderId')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_SAVES_MANAGE)
  @ApiCreatedResponse({ description: 'Saves an eligible public provider for this identity.' })
  save(
    @Param('publicProviderId', ParseUUIDPipe) publicProviderId: string,
    @Req() request: DirektRequest,
  ) {
    return this.discovery.save(request.actor, publicProviderId);
  }

  @Delete('account/saved-providers/:publicProviderId')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_SAVES_MANAGE)
  @ApiOkResponse({ description: 'Removes a saved public provider for this identity.' })
  unsave(
    @Param('publicProviderId', ParseUUIDPipe) publicProviderId: string,
    @Req() request: DirektRequest,
  ) {
    return this.discovery.unsave(request.actor, publicProviderId);
  }

  @Get('account/saved-providers')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_SAVES_MANAGE)
  @ApiOkResponse({ description: 'Lists the authenticated identity’s eligible saved providers.' })
  saved(@Req() request: DirektRequest) {
    return this.discovery.saved(request.actor);
  }

  @Get('operations/discovery/publication-eligibility')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_PUBLICATION_READ)
  @ApiOkResponse({
    description: 'Lists publication eligibility without private coordinates or evidence details.',
  })
  eligibility() {
    return this.discovery.eligibility();
  }

  @Post('operations/providers/:providerId/discovery/publication')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_PUBLICATION_MANAGE)
  @ApiCreatedResponse({
    description: 'Evaluates and refreshes a synthetic publication through database policy.',
  })
  refreshPublication(
    @Param('providerId', ParseUUIDPipe) providerId: string,
    @Body() body: RefreshPublicationDto,
  ) {
    return this.discovery.refreshPublication(providerId, body.categoryKey, body.policyVersion);
  }

  @Post('operations/discovery/publications/:publicProviderId/hide')
  @ApiBearerAuth()
  @RequirePermission(PERMISSIONS.DISCOVERY_PUBLICATION_MANAGE)
  @ApiOkResponse({ description: 'Hides a publication through an audited policy function.' })
  hidePublication(
    @Param('publicProviderId', ParseUUIDPipe) publicProviderId: string,
    @Body() body: HidePublicationDto,
  ) {
    return this.discovery.hidePublication(publicProviderId, body.reason);
  }
}

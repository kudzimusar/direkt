import { Controller, Get, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermission } from '../authorization/require-permission.decorator';
import type { DirektRequest } from '../platform/http/request-context';
import { AccountContactService } from './account-contact.service';
import type { AccountContactReference } from './account-contact.types';

@ApiTags('account')
@ApiBearerAuth()
@Controller('account/contacts')
export class AccountContactController {
  constructor(private readonly service: AccountContactService) {}

  @Get()
  @RequirePermission(PERMISSIONS.ACCOUNT_PROFILE_MANAGE)
  @ApiOkResponse({
    description:
      'Lists opaque authenticated-account contact references and masked hints. Raw contact values are never returned.',
  })
  list(@Req() request: DirektRequest): Promise<AccountContactReference[]> {
    return this.service.list(request.actor);
  }
}

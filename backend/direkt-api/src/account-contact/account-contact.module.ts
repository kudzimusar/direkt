import { Module } from '@nestjs/common';
import { AccountContactController } from './account-contact.controller';
import { AccountContactRepository } from './account-contact.repository';
import { AccountContactService } from './account-contact.service';

@Module({
  controllers: [AccountContactController],
  providers: [AccountContactRepository, AccountContactService],
})
export class AccountContactModule {}

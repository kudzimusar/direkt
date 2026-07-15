import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderRepository, ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}

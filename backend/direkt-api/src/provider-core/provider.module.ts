import { Module } from '@nestjs/common';
import { ProviderController } from './provider.controller';
import { ProviderRepository } from './provider.repository';
import { ProviderService } from './provider.service';

@Module({
  controllers: [ProviderController],
  providers: [ProviderRepository, ProviderService],
})
export class ProviderModule {}

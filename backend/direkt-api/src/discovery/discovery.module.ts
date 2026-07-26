import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { LocationModule } from '../location/location.module';
import { DiscoveryAiAssistService } from './discovery-ai-assist.service';
import { DiscoveryController } from './discovery.controller';
import { DiscoveryRepository } from './discovery.repository';
import { DiscoveryService } from './discovery.service';

@Module({
  imports: [AiModule, LocationModule],
  controllers: [DiscoveryController],
  providers: [DiscoveryRepository, DiscoveryService, DiscoveryAiAssistService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}

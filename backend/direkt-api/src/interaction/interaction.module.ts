import { Module } from '@nestjs/common';
import { InteractionController } from './interaction.controller';
import { InteractionRepository } from './interaction.repository';
import { InteractionService } from './interaction.service';

@Module({
  controllers: [InteractionController],
  providers: [InteractionRepository, InteractionService],
  exports: [InteractionService],
})
export class InteractionModule {}

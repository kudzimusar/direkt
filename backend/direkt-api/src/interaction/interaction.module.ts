import { Module } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintRepository } from './complaint.repository';
import { ComplaintService } from './complaint.service';
import { InteractionHandoffController } from './interaction-handoff.controller';
import { InteractionHandoffRepository } from './interaction-handoff.repository';
import { InteractionHandoffService } from './interaction-handoff.service';
import { InteractionController } from './interaction.controller';
import { InteractionRepository } from './interaction.repository';
import { InteractionService } from './interaction.service';
import { ReviewController } from './review.controller';
import { ReviewRepository } from './review.repository';
import { ReviewService } from './review.service';

@Module({
  controllers: [
    InteractionController,
    InteractionHandoffController,
    ReviewController,
    ComplaintController,
  ],
  providers: [
    InteractionRepository,
    InteractionService,
    InteractionHandoffRepository,
    InteractionHandoffService,
    ReviewRepository,
    ReviewService,
    ComplaintRepository,
    ComplaintService,
  ],
  exports: [InteractionService, InteractionHandoffService, ReviewService, ComplaintService],
})
export class InteractionModule {}

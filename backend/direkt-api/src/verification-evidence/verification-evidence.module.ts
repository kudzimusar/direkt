import { Module } from '@nestjs/common';
import { OperationsModule } from '../operations/operations.module';
import { EvidenceReviewRepository } from './evidence-review.repository';
import { EvidenceReviewService } from './evidence-review.service';
import { EVIDENCE_STORAGE } from './evidence-storage.port';
import { SyntheticPrivateStorageAdapter } from './synthetic-private-storage.adapter';
import { VerificationEvidenceController } from './verification-evidence.controller';
import { VerificationEvidenceRepository } from './verification-evidence.repository';
import { VerificationEvidenceService } from './verification-evidence.service';

@Module({
  imports: [OperationsModule],
  controllers: [VerificationEvidenceController],
  providers: [
    EvidenceReviewRepository,
    EvidenceReviewService,
    VerificationEvidenceRepository,
    VerificationEvidenceService,
    SyntheticPrivateStorageAdapter,
    {
      provide: EVIDENCE_STORAGE,
      useExisting: SyntheticPrivateStorageAdapter,
    },
  ],
  exports: [EvidenceReviewService, VerificationEvidenceService],
})
export class VerificationEvidenceModule {}

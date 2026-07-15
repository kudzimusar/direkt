import { Module } from '@nestjs/common';
import { EVIDENCE_STORAGE } from './evidence-storage.port';
import { SyntheticPrivateStorageAdapter } from './synthetic-private-storage.adapter';
import { VerificationEvidenceController } from './verification-evidence.controller';
import { VerificationEvidenceRepository } from './verification-evidence.repository';
import { VerificationEvidenceService } from './verification-evidence.service';

@Module({
  controllers: [VerificationEvidenceController],
  providers: [
    VerificationEvidenceRepository,
    VerificationEvidenceService,
    SyntheticPrivateStorageAdapter,
    {
      provide: EVIDENCE_STORAGE,
      useExisting: SyntheticPrivateStorageAdapter,
    },
  ],
})
export class VerificationEvidenceModule {}
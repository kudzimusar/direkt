import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OperationsModule } from '../operations/operations.module';
import { EvidenceReviewRepository } from './evidence-review.repository';
import { EvidenceReviewService } from './evidence-review.service';
import { EVIDENCE_STORAGE, type EvidenceStoragePort } from './evidence-storage.port';
import { SupabasePrivateStorageAdapter } from './supabase-private-storage.adapter';
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
    {
      provide: EVIDENCE_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): EvidenceStoragePort => {
        if (configService.get<string>('EVIDENCE_STORAGE_PROVIDER', 'synthetic') === 'supabase') {
          return new SupabasePrivateStorageAdapter(configService);
        }
        return new SyntheticPrivateStorageAdapter();
      },
    },
  ],
  exports: [EvidenceReviewService, VerificationEvidenceService],
})
export class VerificationEvidenceModule {}

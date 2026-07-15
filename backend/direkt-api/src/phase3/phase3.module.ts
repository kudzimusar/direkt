import { Module } from '@nestjs/common';
import { DatabaseModule } from '../platform/database/database.module';
import { Phase3Controller } from './phase3.controller';
import { Phase3Repository } from './phase3.repository';
import { Phase3Service } from './phase3.service';

@Module({
  imports: [DatabaseModule],
  controllers: [Phase3Controller],
  providers: [Phase3Repository, Phase3Service],
})
export class Phase3Module {}

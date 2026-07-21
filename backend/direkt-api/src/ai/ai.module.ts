import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AiFallbackProviderMode, AiProviderMode } from '../config/environment';
import { AI_FALLBACK_PROVIDER, AI_PRIMARY_PROVIDER } from './ai-provider.port';
import { AiService } from './ai.service';
import { DisabledAiProviderAdapter } from './disabled-ai-provider.adapter';
import { GeminiAiProviderAdapter } from './gemini-ai-provider.adapter';
import { GroqAiProviderAdapter } from './groq-ai-provider.adapter';
import { PublicSupportController } from './public-support.controller';
import { PublicSupportService } from './public-support.service';

@Module({
  controllers: [PublicSupportController],
  providers: [
    {
      provide: AI_PRIMARY_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mode = configService.getOrThrow<AiProviderMode>('AI_PROVIDER_MODE');
        if (mode === 'disabled') {
          return new DisabledAiProviderAdapter();
        }
        return new GeminiAiProviderAdapter(
          configService.getOrThrow<string>('AI_GEMINI_API_KEY'),
          configService.getOrThrow<string>('AI_GEMINI_MODEL'),
          configService.getOrThrow<number>('AI_REQUEST_TIMEOUT_MS'),
        );
      },
    },
    {
      provide: AI_FALLBACK_PROVIDER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mode = configService.getOrThrow<AiFallbackProviderMode>('AI_FALLBACK_PROVIDER');
        if (mode === 'disabled') {
          return new DisabledAiProviderAdapter();
        }
        return new GroqAiProviderAdapter(
          configService.getOrThrow<string>('AI_GROQ_API_KEY'),
          configService.getOrThrow<string>('AI_GROQ_MODEL'),
          configService.getOrThrow<number>('AI_REQUEST_TIMEOUT_MS'),
        );
      },
    },
    AiService,
    PublicSupportService,
  ],
  exports: [AiService, PublicSupportService],
})
export class AiModule {}

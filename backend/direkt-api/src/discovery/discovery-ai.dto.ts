import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class DiscoveryAiAssistRequestDto {
  @IsString()
  @Length(3, 240)
  need!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  area?: string;
}

export interface DiscoveryAiAssistSuggestion {
  categoryKey: string;
  categoryName: string;
  confidence: number;
  reason: string;
  searchTerms: string[];
}

export interface DiscoveryAiAssistResponse {
  source: 'ai' | 'deterministic' | 'unavailable';
  normalizedQuery: string;
  clarificationQuestion: string | null;
  suggestions: DiscoveryAiAssistSuggestion[];
  ai: {
    attempted: boolean;
    available: boolean;
    provider: string | null;
    model: string | null;
    fallbackReason: string | null;
  };
  limitations: string[];
}

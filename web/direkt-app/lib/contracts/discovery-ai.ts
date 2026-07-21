export interface DiscoveryAiAssistSuggestion {
  categoryKey: string;
  categoryName: string;
  confidence: number;
  reason: string;
  searchTerms: string[];
}

export interface DiscoveryAiAssistResponse {
  source: "ai" | "deterministic" | "unavailable";
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

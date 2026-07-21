export interface ProviderOnboardingAssistResponse {
  source: "ai" | "deterministic";
  headline: string;
  nextSteps: string[];
  limitations: string[];
}

export interface ProviderProfileDraftResponse {
  source: "ai" | "deterministic";
  draft: string;
  requiresProviderConfirmation: true;
  limitations: string[];
}

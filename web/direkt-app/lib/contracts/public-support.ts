export interface PublicSupportAssistResponse {
  source: "ai" | "deterministic" | "unavailable";
  answer: string;
  sources: Array<{ id: string; title: string }>;
  limitations: string[];
}

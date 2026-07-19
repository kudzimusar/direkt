export type DirektMode = "customer" | "provider";
export type DirektDestination = "discover" | "saved" | "enquiries" | "account";

export interface NavigationItem {
  id: DirektDestination;
  customerLabel: string;
  providerLabel: string;
  shortLabel: string;
  glyph: string;
}

export const navigationItems: readonly NavigationItem[] = [
  {
    id: "discover",
    customerLabel: "Discover",
    providerLabel: "Overview",
    shortLabel: "Home",
    glyph: "⌂",
  },
  {
    id: "saved",
    customerLabel: "Saved",
    providerLabel: "Evidence",
    shortLabel: "Saved",
    glyph: "◇",
  },
  {
    id: "enquiries",
    customerLabel: "Enquiries",
    providerLabel: "Enquiries",
    shortLabel: "Enquiries",
    glyph: "↔",
  },
  {
    id: "account",
    customerLabel: "Account",
    providerLabel: "Account",
    shortLabel: "Account",
    glyph: "○",
  },
] as const;

export function destinationLabel(mode: DirektMode, item: NavigationItem): string {
  return mode === "customer" ? item.customerLabel : item.providerLabel;
}

export function destinationHeading(
  mode: DirektMode,
  destination: DirektDestination,
): { title: string; summary: string } {
  if (mode === "customer") {
    switch (destination) {
      case "discover":
        return {
          title: "Find a provider",
          summary:
            "Search by category and area, then inspect scoped trust claims before making contact.",
        };
      case "saved":
        return {
          title: "Saved providers",
          summary:
            "Keep a private shortlist without changing publication, ranking or trust state.",
        };
      case "enquiries":
        return {
          title: "Enquiries and interactions",
          summary:
            "Track service requests, consent-aware contact handoffs, interaction history and review eligibility.",
        };
      case "account":
        return {
          title: "Account and security",
          summary:
            "Manage identity, sessions, consent and access without making client-side role claims authoritative.",
        };
    }
  }

  switch (destination) {
    case "discover":
      return {
        title: "Provider overview",
        summary:
          "Review profile readiness, service coverage, availability and verification progress in one workspace.",
      };
    case "saved":
      return {
        title: "Evidence and verification",
        summary:
          "Track requirement status and recoverable private evidence submissions without exposing reviewer-only detail.",
      };
    case "enquiries":
      return {
        title: "Enquiry inbox",
        summary:
          "Respond within actor-resolved provider scope and follow the tracked interaction lifecycle.",
      };
    case "account":
      return {
        title: "Provider account",
        summary:
          "Manage profile, security and commercial state while verification and authorization remain backend-owned.",
      };
  }
}

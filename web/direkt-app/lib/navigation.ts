import type { DirektIconName } from "@/components/ui/direkt-icon";

export type DirektMode = "customer" | "provider";
export type DirektDestination = "discover" | "saved" | "enquiries" | "account";

export interface NavigationItem {
  id: DirektDestination;
  customerLabel: string;
  providerLabel: string;
  shortLabel: string;
  customerIcon: DirektIconName;
  providerIcon: DirektIconName;
}

export const navigationItems: readonly NavigationItem[] = [
  {
    id: "discover",
    customerLabel: "Discover",
    providerLabel: "Overview",
    shortLabel: "Home",
    customerIcon: "home",
    providerIcon: "briefcase",
  },
  {
    id: "saved",
    customerLabel: "Saved",
    providerLabel: "Evidence",
    shortLabel: "Saved",
    customerIcon: "bookmark",
    providerIcon: "shield",
  },
  {
    id: "enquiries",
    customerLabel: "Enquiries",
    providerLabel: "Enquiries",
    shortLabel: "Enquiries",
    customerIcon: "messages",
    providerIcon: "messages",
  },
  {
    id: "account",
    customerLabel: "Account",
    providerLabel: "Account",
    shortLabel: "Account",
    customerIcon: "user",
    providerIcon: "user",
  },
] as const;

export function destinationLabel(mode: DirektMode, item: NavigationItem): string {
  return mode === "customer" ? item.customerLabel : item.providerLabel;
}

export function destinationIcon(mode: DirektMode, item: NavigationItem): DirektIconName {
  return mode === "customer" ? item.customerIcon : item.providerIcon;
}

export function destinationHeading(
  mode: DirektMode,
  destination: DirektDestination,
): { title: string; summary: string } {
  if (mode === "customer") {
    switch (destination) {
      case "discover":
        return {
          title: "Find the right local service",
          summary:
            "Search by what you need and where you need it, then compare providers using clear, check-specific trust information.",
        };
      case "saved":
        return {
          title: "Your shortlist",
          summary:
            "Keep promising providers together so you can compare services, availability and current trust information before deciding.",
        };
      case "enquiries":
        return {
          title: "Your service requests",
          summary:
            "Follow enquiries, provider responses, consent-aware contact handoffs and eligible review activity in one place.",
        };
      case "account":
        return {
          title: "Account and privacy",
          summary:
            "Manage your identity, active sessions, consent and security preferences.",
        };
    }
  }

  switch (destination) {
    case "discover":
      return {
        title: "Run your service business",
        summary:
          "See what needs attention, keep your services current and respond quickly to new customer opportunities.",
      };
    case "saved":
      return {
        title: "Checks and evidence",
        summary:
          "Understand each requirement, track review progress and fix action-required items without exposing private evidence.",
      };
    case "enquiries":
      return {
        title: "Customer enquiries",
        summary:
          "Review incoming service requests, respond clearly and keep each tracked interaction moving.",
      };
    case "account":
      return {
        title: "Business account",
        summary:
          "Manage your profile, security and commercial settings while trust decisions remain independent.",
      };
  }
}

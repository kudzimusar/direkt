import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";
import "./discovery.css";
import "./account.css";
import "./customer.css";
import "./provider.css";
import "./world-class.css";
import "./provider-world-class.css";
import "./provider-workspace-world-class.css";

export const metadata: Metadata = {
  title: {
    default: "DIREKT",
    template: "%s · DIREKT",
  },
  description:
    "DIREKT helps people in Zambia find local service providers and understand clear, evidence-backed trust information before making contact.",
  applicationName: "DIREKT",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1713" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}

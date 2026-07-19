import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";
import "./discovery.css";
import "./account.css";
import "./customer.css";

export const metadata: Metadata = {
  title: {
    default: "DIREKT",
    template: "%s · DIREKT",
  },
  description:
    "DIREKT customer and provider application for evidence-backed local service discovery in Zambia.",
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

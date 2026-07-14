import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DIREKT Operations',
    template: '%s · DIREKT Operations',
  },
  description: 'Synthetic internal operations-portal foundation for DIREKT.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-ZM">
      <body>{children}</body>
    </html>
  );
}

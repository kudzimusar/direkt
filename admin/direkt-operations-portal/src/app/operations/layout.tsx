import type { ReactNode } from 'react';
import { OperationsShell } from '@/components/operations-shell';
import { syntheticReviewerSession } from '@/lib/session';

export default function OperationsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <OperationsShell session={syntheticReviewerSession}>{children}</OperationsShell>;
}

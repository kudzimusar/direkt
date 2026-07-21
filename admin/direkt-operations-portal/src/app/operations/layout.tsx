import type { ReactNode } from 'react';
import { OperationsShell } from '@/components/operations-shell';
import { syntheticSupervisorSession } from '@/lib/session';
import './operations.css';
import './world-class-operations.css';

export default function OperationsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <OperationsShell session={syntheticSupervisorSession}>{children}</OperationsShell>;
}

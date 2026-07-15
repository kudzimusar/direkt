import { hasPermission, type OperationsSession } from './session';

export interface NavigationItem {
  label: string;
  href: string;
  permission: string;
  status: 'available' | 'planned';
}

const navigation: readonly NavigationItem[] = [
  {
    label: 'Mission control',
    href: '/operations',
    permission: 'operations.portal.access',
    status: 'available',
  },
  {
    label: 'Provider drafts',
    href: '/operations/providers',
    permission: 'operations.providers.read',
    status: 'available',
  },
  {
    label: 'Verification queue',
    href: '/operations/verification',
    permission: 'verification.case.review',
    status: 'available',
  },
  {
    label: 'Field visits',
    href: '/operations/field-visits',
    permission: 'verification.field_visit.record',
    status: 'planned',
  },
  {
    label: 'Support',
    href: '/operations/support',
    permission: 'support.ticket.manage',
    status: 'planned',
  },
  {
    label: 'Trust and safety',
    href: '/operations/trust',
    permission: 'trust.provider.suspend',
    status: 'planned',
  },
  {
    label: 'Finance',
    href: '/operations/finance',
    permission: 'finance.ledger.read',
    status: 'planned',
  },
  {
    label: 'Audit',
    href: '/operations/audit',
    permission: 'audit.read',
    status: 'planned',
  },
  {
    label: 'Role management',
    href: '/operations/roles',
    permission: 'admin.roles.manage',
    status: 'planned',
  },
];

export function visibleNavigation(session: OperationsSession): NavigationItem[] {
  return navigation.filter((item) => hasPermission(session, item.permission));
}
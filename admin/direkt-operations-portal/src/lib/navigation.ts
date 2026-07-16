import { hasPermission, type OperationsSession } from './session';

export interface NavigationItem {
  label: string;
  href: string;
  permission: string;
  status: 'available' | 'planned';
  description: string;
}

const navigation: readonly NavigationItem[] = [
  {
    label: 'Mission control',
    href: '/operations',
    permission: 'operations.portal.access',
    status: 'available',
    description: 'Aggregate synthetic Phase 7 operations status.',
  },
  {
    label: 'Triage queue',
    href: '/operations/triage',
    permission: 'operations.triage.read',
    status: 'available',
    description: 'Role-scoped queue priority, ownership, age and SLA state.',
  },
  {
    label: 'Evidence review',
    href: '/operations/evidence-review',
    permission: 'evidence.read.private',
    status: 'available',
    description: 'Assigned short-lived and revocable private evidence access.',
  },
  {
    label: 'Field workflow',
    href: '/operations/field-work',
    permission: 'operations.field_work.read',
    status: 'available',
    description: 'Structured advisory field assignments and safe submissions.',
  },
  {
    label: 'Escalations and overrides',
    href: '/operations/escalations',
    permission: 'operations.escalations.read',
    status: 'available',
    description: 'Explicit escalation ownership and four-eyes authorization.',
  },
  {
    label: 'Incidents and complaints',
    href: '/operations/incidents',
    permission: 'operations.incidents.read',
    status: 'available',
    description: 'Bounded internal records outside Phase 8 customer workflows.',
  },
  {
    label: 'Expiry and reporting',
    href: '/operations/reporting',
    permission: 'operations.reporting.read',
    status: 'available',
    description: 'Privacy-safe renewal states and aggregate metrics.',
  },
  {
    label: 'Provider drafts',
    href: '/operations/providers',
    permission: 'operations.providers.read',
    status: 'available',
    description: 'Non-public synthetic provider profiles.',
  },
  {
    label: 'Provider workspaces',
    href: '/operations/provider-workspaces',
    permission: 'operations.providers.read',
    status: 'available',
    description: 'Provider-scoped evidence and verification readiness.',
  },
  {
    label: 'Discovery eligibility',
    href: '/operations/discovery',
    permission: 'discovery.publication.read',
    status: 'available',
    description: 'Read-only publication eligibility boundaries.',
  },
  {
    label: 'Finance',
    href: '/operations/finance',
    permission: 'finance.ledger.read',
    status: 'planned',
    description: 'Reserved for Phase 9 commercial workflows.',
  },
  {
    label: 'Audit',
    href: '/operations/audit',
    permission: 'audit.read',
    status: 'planned',
    description: 'Dedicated audit explorer remains outside this stage.',
  },
  {
    label: 'Role management',
    href: '/operations/roles',
    permission: 'admin.roles.manage',
    status: 'planned',
    description: 'Administrative role mutation remains separately controlled.',
  },
];

export function visibleNavigation(session: OperationsSession): NavigationItem[] {
  return navigation.filter((item) => hasPermission(session, item.permission));
}

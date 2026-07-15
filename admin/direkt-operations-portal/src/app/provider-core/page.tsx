import Link from 'next/link';
import { ProviderCorePanel } from '@/components/provider-core-panel';
import { syntheticProviderCoreFixtures } from '@/lib/provider-core';

export default function ProviderCorePage() {
  return (
    <main className="page-shell stack">
      <nav aria-label="Breadcrumb"><Link href="/">Operations home</Link> / Provider core</nav>
      <ProviderCorePanel fixtures={syntheticProviderCoreFixtures} />
    </main>
  );
}

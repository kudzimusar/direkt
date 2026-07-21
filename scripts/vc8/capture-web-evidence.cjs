const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE);

const outputDir = process.env.VC8_EVIDENCE_DIR || 'visual-evidence/web';
fs.mkdirSync(outputDir, { recursive: true });

async function capture() {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await desktop.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle' });
    await desktop.getByLabel('Service or problem').fill('leaking pipe');
    await desktop.getByLabel('Area or landmark').fill('Woodlands');
    await desktop.getByRole('button', { name: 'Find providers' }).click();
    await desktop.getByRole('heading', { name: 'Synthetic Copperbelt Repairs' }).waitFor();
    await desktop.screenshot({
      path: path.join(outputDir, 'customer-discovery-desktop.png'),
      fullPage: true,
    });

    await desktop.goto(
      'http://127.0.0.1:3100/providers/11111111-1111-4111-8111-111111111111',
      { waitUntil: 'networkidle' },
    );
    await desktop.getByRole('heading', { name: 'Synthetic Copperbelt Repairs' }).waitFor();
    await desktop.screenshot({
      path: path.join(outputDir, 'provider-public-profile-desktop.png'),
      fullPage: true,
    });

    await desktop.goto('http://127.0.0.1:3100/?view=account', {
      waitUntil: 'networkidle',
    });
    await desktop.getByLabel('Your question').fill('How do provider trust checks work?');
    await desktop.getByRole('button', { name: 'Get help' }).click();
    await desktop.getByText('How DIREKT trust information works').waitFor();
    await desktop.screenshot({
      path: path.join(outputDir, 'account-help-desktop.png'),
      fullPage: true,
    });

    const mobile = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    await mobile.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle' });
    await mobile.getByLabel('Service or problem').fill('leaking pipe');
    await mobile.getByRole('button', { name: 'Help me choose' }).click();
    await mobile.getByText('DIREKT category match').waitFor();
    await mobile.screenshot({
      path: path.join(outputDir, 'customer-ai-fallback-mobile.png'),
      fullPage: true,
    });

    const tablet = await browser.newPage({ viewport: { width: 820, height: 1180 } });
    await tablet.goto('http://127.0.0.1:3100', { waitUntil: 'networkidle' });
    await tablet.screenshot({
      path: path.join(outputDir, 'customer-discovery-tablet.png'),
      fullPage: true,
    });

    await desktop.goto('http://127.0.0.1:3200/operations', {
      waitUntil: 'networkidle',
    });
    await desktop.screenshot({
      path: path.join(outputDir, 'operations-mission-control-desktop.png'),
      fullPage: true,
    });
    await desktop.goto('http://127.0.0.1:3200/operations/evidence-review', {
      waitUntil: 'networkidle',
    });
    await desktop.screenshot({
      path: path.join(outputDir, 'operations-evidence-review-desktop.png'),
      fullPage: true,
    });

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(
        {
          sourceSha: process.env.SOURCE_SHA,
          data: 'synthetic/public-safe only',
          designDirection:
            'Structured Trust + Neighbourhood Marketplace + Field Utility',
          captures: [
            {
              file: 'customer-discovery-desktop.png',
              viewport: '1440x1000',
              state: 'search results',
            },
            {
              file: 'provider-public-profile-desktop.png',
              viewport: '1440x1000',
              state: 'check-specific trust profile',
            },
            {
              file: 'account-help-desktop.png',
              viewport: '1440x1000',
              state: 'deterministic grounded help fallback',
            },
            {
              file: 'customer-ai-fallback-mobile.png',
              viewport: '390x844',
              state: 'AI unavailable / deterministic category fallback',
            },
            {
              file: 'customer-discovery-tablet.png',
              viewport: '820x1180',
              state: 'tablet discovery',
            },
            {
              file: 'operations-mission-control-desktop.png',
              viewport: '1440x1000',
              state: 'mission control',
            },
            {
              file: 'operations-evidence-review-desktop.png',
              viewport: '1440x1000',
              state: 'restricted-AI inactive evidence review',
            },
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

capture().catch((error) => {
  console.error(error);
  process.exit(1);
});

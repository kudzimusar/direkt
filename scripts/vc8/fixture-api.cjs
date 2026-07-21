const http = require('node:http');

const providerId = '11111111-1111-4111-8111-111111111111';
const claim = {
  claimKey: 'identity.current',
  statement: 'Representative identity check is current',
  limitation:
    'Confirms the reviewed identity evidence only; it does not guarantee workmanship or future conduct.',
  evidenceClass: 'identity',
  checkedAt: '2026-07-01T10:00:00.000Z',
  validUntil: '2027-07-01T10:00:00.000Z',
  policyVersion: 'synthetic-v1',
};
const card = {
  publicProviderId: providerId,
  categoryKey: 'plumbing',
  categoryName: 'Plumbing',
  displayName: 'Synthetic Copperbelt Repairs',
  operatingModel: 'mobile',
  locality: 'Woodlands, Lusaka',
  publicPremises: null,
  serviceAreaGeoJson: { type: 'Polygon', coordinates: [] },
  availability: 'available',
  nextAvailableAt: '2026-07-22T08:00:00.000Z',
  image: { lowBandwidthUrl: null, standardUrl: null, altText: null },
  claims: [claim],
  reasons: [
    'Current mandatory checks',
    'Serves your selected area',
    'Currently marked available',
  ],
  distanceKm: null,
  sharePath: `/providers/${providerId}`,
  synthetic: true,
};
const profile = {
  ...card,
  trustSummary:
    'Every check below is scoped, dated and limited. DIREKT does not provide a blanket provider guarantee.',
  locationExplanation:
    'This mobile provider is matched by its public service area. DIREKT does not expose a private base.',
  imagePolicy:
    'No public image is required; the profile remains usable with text and area information.',
};
const review = {
  reviewId: '22222222-2222-4222-8222-222222222222',
  publicProviderId: providerId,
  providerDisplayName: card.displayName,
  categoryKey: 'plumbing',
  rating: 5,
  title: 'Clear communication',
  body: 'Synthetic review: the provider explained the repair options clearly and kept the tracked enquiry updated.',
  publishedAt: '2026-07-10T09:00:00.000Z',
  providerResponse: null,
  contactIncluded: false,
  interactionIdentifierIncluded: false,
  moderationRationaleIncluded: false,
  synthetic: true,
};
const categories = [
  {
    key: 'plumbing',
    name: 'Plumbing',
    description: 'Leaks, pipes, taps and water fixtures',
  },
  {
    key: 'electrical',
    name: 'Electrical repair',
    description: 'Wiring, sockets, lights and electrical faults',
  },
  {
    key: 'moving',
    name: 'Moving help',
    description: 'Local moving and item transport support',
  },
  {
    key: 'cleaning',
    name: 'Cleaning',
    description: 'Home and small-business cleaning services',
  },
];

function send(res, value, status = 200) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(value));
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1:4100');
    const path = url.pathname;
    if (req.method === 'GET' && path === '/api/v1/public/categories') {
      return send(res, categories);
    }
    if (req.method === 'GET' && path === '/api/v1/public/providers/search') {
      return send(res, {
        items: [card],
        nextCursor: null,
        searchContext: {
          manualArea: url.searchParams.get('area'),
          usedOneTimeLocation: false,
          backgroundLocationUsed: false,
          resultCount: 1,
          noResultsSuggestions: [],
        },
      });
    }
    if (req.method === 'GET' && path === `/api/v1/public/providers/${providerId}`) {
      return send(res, profile);
    }
    if (
      req.method === 'GET' &&
      path === `/api/v1/public/providers/${providerId}/claims`
    ) {
      return send(res, [claim]);
    }
    if (
      req.method === 'GET' &&
      path === `/api/v1/public/providers/${providerId}/availability`
    ) {
      return send(res, {
        publicProviderId: providerId,
        state: 'available',
        nextAvailableAt: '2026-07-22T08:00:00.000Z',
        synthetic: true,
      });
    }
    if (
      req.method === 'GET' &&
      path === `/api/v1/public/providers/${providerId}/reviews`
    ) {
      return send(res, [review]);
    }
    if (
      req.method === 'GET' &&
      path === `/api/v1/public/providers/${providerId}/share`
    ) {
      return send(res, {
        publicProviderId: providerId,
        title: 'Synthetic Copperbelt Repairs on DIREKT',
        text: 'Synthetic Copperbelt Repairs provides plumbing services in Woodlands, Lusaka. Review current scoped checks and limitations in DIREKT.',
        path: `/providers/${providerId}`,
        containsPrivateLocation: false,
      });
    }
    if (req.method === 'POST' && path === '/api/v1/public/discovery/assist') {
      return send(res, {
        source: 'deterministic',
        normalizedQuery: 'leaking pipe',
        clarificationQuestion: null,
        suggestions: [
          {
            categoryKey: 'plumbing',
            categoryName: 'Plumbing',
            confidence: 0.84,
            reason:
              'Your description shares terms with Plumbing. Confirm this service before searching.',
            searchTerms: ['plumbing', 'leaking pipe'],
          },
        ],
        ai: {
          attempted: false,
          available: false,
          provider: null,
          model: null,
          fallbackReason: 'Synthetic visual evidence uses deterministic fallback.',
        },
        limitations: [
          'Suggestions do not select or endorse a provider.',
          'Trust checks remain backend-authoritative.',
          'You can ignore the suggestion and search normally.',
        ],
      });
    }
    if (req.method === 'POST' && path === '/api/v1/public/support/assist') {
      return send(res, {
        source: 'deterministic',
        answer:
          'DIREKT shows check-specific trust information rather than a blanket provider guarantee. Each public check explains what was checked and its limitation.',
        sources: [
          { id: 'trust.checks', title: 'How DIREKT trust information works' },
        ],
        limitations: ['Help cannot change trust or account state.'],
      });
    }
    return send(res, { title: 'Not found', status: 404 }, 404);
  })
  .listen(4100, '127.0.0.1');

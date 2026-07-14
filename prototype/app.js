(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const appRoot = $('#app-root');
  const screenNav = $('#screen-nav');
  const screenTitle = $('#screen-title');
  const screenId = $('#screen-id');
  const deviceFrame = $('#device-frame');
  const stateSimulator = $('#state-simulator');
  const feedbackDialog = $('#feedback-dialog');
  const actionDialog = $('#action-dialog');
  const actionDialogContent = $('#action-dialog-content');
  const dialogConfirm = $('#dialog-confirm');

  const providers = [
    {
      id: 'mwamba',
      name: 'Mwamba Water Works',
      initials: 'MW',
      category: 'Plumbing and water repairs',
      symbol: '💧',
      model: 'Mobile provider',
      area: 'Travels across central Lusaka areas',
      distance: 'About 3 km from Woodlands',
      availability: 'Usually replies within 35 minutes',
      summary: ['Identity checked', 'Phone checked', 'Qualification current'],
      stats: { current: 4, attention: 1, reviews: 18 },
      claims: [
        { icon: 'ID', name: 'Identity', state: 'current', stateLabel: 'Current', summary: 'Identity details matched the submitted document.', reviewed: '10 July 2026', expires: 'Recheck after material change', source: 'Private identity evidence', means: 'DIREKT checked that the submitted identity details belong to the provider representative.', limit: 'This does not prove workmanship, availability or future behaviour.' },
        { icon: '☎', name: 'Phone number', state: 'current', stateLabel: 'Current', summary: 'The listed contact number completed a confirmation challenge.', reviewed: '10 July 2026', expires: 'Recheck after number change', source: 'Phone confirmation', means: 'The provider controlled the phone number at the time of the check.', limit: 'DIREKT cannot guarantee that every future call or message is answered by the same person.' },
        { icon: 'Q', name: 'Plumbing qualification', state: 'current', stateLabel: 'Current', summary: 'A qualification document was reviewed against the submitted identity.', reviewed: '12 July 2026', expires: '12 July 2027', source: 'Qualification evidence', means: 'The reviewed document matched the provider identity and named plumbing training.', limit: 'DIREKT does not guarantee skill level, workmanship or the outcome of a future service.' },
        { icon: '⌖', name: 'Operating location', state: 'current', stateLabel: 'Checked', summary: 'A private operating-location check was completed.', reviewed: '13 July 2026', expires: 'Recheck by 13 January 2027', source: 'Private location evidence', means: 'DIREKT reviewed evidence that the provider operates from the declared general area.', limit: 'The exact location is private. This provider travels to customers and does not advertise a walk-in shop.' },
        { icon: '▣', name: 'Business registration', state: 'not-supplied', stateLabel: 'Not supplied', summary: 'The provider is listed as an individual, not a registered business.', reviewed: 'Not applicable', expires: 'Not applicable', source: 'Provider pathway', means: 'DIREKT is not displaying a registered-business claim for this provider.', limit: 'Do not assume the provider is registered with PACRA.' },
        { icon: '◎', name: 'Field visit', state: 'not-checked', stateLabel: 'Not checked', summary: 'No DIREKT field visit has been completed.', reviewed: 'Not checked', expires: 'Not applicable', source: 'No field evidence', means: 'The profile does not claim that a DIREKT agent visited this provider.', limit: 'A location evidence check is different from a physical field visit.' }
      ]
    },
    {
      id: 'zedspark',
      name: 'ZedSpark Electrical Studio',
      initials: 'ZE',
      category: 'Electrical installation and repairs',
      symbol: '⚡',
      model: 'Fixed premises',
      area: 'Customer-facing workshop near Chelstone',
      distance: 'About 7 km from Woodlands',
      availability: 'Open today until 17:30',
      summary: ['Business checked', 'Premises checked', 'Qualification expiring'],
      stats: { current: 5, attention: 1, reviews: 31 },
      claims: [
        { icon: 'ID', name: 'Representative identity', state: 'current', stateLabel: 'Current', summary: 'Representative identity matched submitted evidence.', reviewed: '2 July 2026', expires: 'Recheck after material change', source: 'Private identity evidence', means: 'The named representative completed an identity check.', limit: 'This does not prove every employee or contractor has been checked.' },
        { icon: 'B', name: 'Business registration', state: 'current', stateLabel: 'Current', summary: 'The submitted business details matched a public registration record.', reviewed: '3 July 2026', expires: 'Recheck by 3 January 2027', source: 'Business registration claim', means: 'The business name and registration details were checked for a match.', limit: 'Registration is not proof of electrical competence or quality.' },
        { icon: 'Q', name: 'Electrical qualification', state: 'expiring', stateLabel: 'Expiring soon', summary: 'Qualification evidence is current but nearing its review date.', reviewed: '4 July 2026', expires: '28 August 2026', source: 'Qualification evidence', means: 'The reviewed evidence named relevant electrical training.', limit: 'Renewal is pending. DIREKT does not guarantee workmanship.' },
        { icon: '⌂', name: 'Customer-facing premises', state: 'current', stateLabel: 'Current', summary: 'The public workshop pin and premises evidence were reviewed.', reviewed: '5 July 2026', expires: 'Recheck by 5 January 2027', source: 'Premises and public-location consent', means: 'Customers may visit the published workshop during stated hours.', limit: 'Opening hours can change. Confirm before travelling.' },
        { icon: '◎', name: 'Field visit', state: 'pending', stateLabel: 'Scheduled', summary: 'A DIREKT field visit is scheduled but not complete.', reviewed: 'Scheduled for 20 July 2026', expires: 'Not applicable', source: 'Operations schedule', means: 'The field-visit claim is not yet active.', limit: 'A scheduled visit is not an approval.' }
      ]
    },
    {
      id: 'kafue-auto',
      name: 'Kafue Road Auto Care',
      initials: 'KA',
      category: 'Motor-vehicle mechanics',
      symbol: '🔧',
      model: 'Hybrid provider',
      area: 'Workshop plus roadside assistance in selected areas',
      distance: 'About 9 km from Woodlands',
      availability: 'Next workshop slot tomorrow',
      summary: ['Identity checked', 'Workshop checked', 'Experience reviewed'],
      stats: { current: 4, attention: 0, reviews: 24 },
      claims: [
        { icon: 'ID', name: 'Representative identity', state: 'current', stateLabel: 'Current', summary: 'Representative identity matched submitted evidence.', reviewed: '1 July 2026', expires: 'Recheck after material change', source: 'Private identity evidence', means: 'DIREKT checked the identity of the provider representative.', limit: 'Other workshop workers may not have individual identity checks.' },
        { icon: '⌂', name: 'Workshop location', state: 'current', stateLabel: 'Current', summary: 'Workshop evidence and public pin were reviewed.', reviewed: '2 July 2026', expires: '2 January 2027', source: 'Premises evidence', means: 'The public profile may show the customer-facing workshop location.', limit: 'Roadside service availability and travel distance are self-managed by the provider.' },
        { icon: 'W', name: 'Work experience evidence', state: 'current', stateLabel: 'Reviewed', summary: 'A sample of work history and references was reviewed.', reviewed: '3 July 2026', expires: 'Review annually', source: 'Experience evidence', means: 'DIREKT reviewed examples supporting the provider’s stated experience.', limit: 'This is not a formal qualification and does not guarantee future work.' },
        { icon: 'Q', name: 'Formal qualification', state: 'not-supplied', stateLabel: 'Not supplied', summary: 'No formal mechanical qualification claim is displayed.', reviewed: 'Not supplied', expires: 'Not applicable', source: 'No qualification evidence', means: 'The provider is participating through an experience-evidence pathway.', limit: 'Do not interpret reviewed experience as a certified qualification.' }
      ]
    },
    {
      id: 'brightfix',
      name: 'BrightFix Appliance Lab',
      initials: 'BF',
      category: 'Appliance and electronics repair',
      symbol: '🔌',
      model: 'Fixed premises',
      area: 'Drop-off counter in Matero',
      distance: 'About 11 km from Woodlands',
      availability: 'Diagnostics slots available today',
      summary: ['Phone checked', 'Premises checked', 'Identity pending renewal'],
      stats: { current: 3, attention: 2, reviews: 12 },
      claims: [
        { icon: 'ID', name: 'Representative identity', state: 'expired', stateLabel: 'Expired', summary: 'The previous identity review period ended.', reviewed: '10 January 2026', expires: '10 July 2026', source: 'Private identity evidence', means: 'The earlier identity check is no longer shown as current.', limit: 'DIREKT is waiting for renewed evidence before restoring the public claim.' },
        { icon: '☎', name: 'Phone number', state: 'current', stateLabel: 'Current', summary: 'The listed contact number completed a confirmation challenge.', reviewed: '11 July 2026', expires: 'Recheck after number change', source: 'Phone confirmation', means: 'The provider controlled the number when checked.', limit: 'A phone check does not replace an identity check.' },
        { icon: '⌂', name: 'Customer-facing premises', state: 'current', stateLabel: 'Current', summary: 'The public drop-off location was reviewed.', reviewed: '12 July 2026', expires: '12 January 2027', source: 'Premises evidence', means: 'The location is presented as a customer-facing drop-off point.', limit: 'Confirm opening times before travelling.' },
        { icon: 'Q', name: 'Repair qualification', state: 'pending', stateLabel: 'Under review', summary: 'Submitted training evidence is still under review.', reviewed: 'Submitted 13 July 2026', expires: 'Not available', source: 'Pending evidence', means: 'No qualification claim is public until a reviewer decides the check.', limit: 'Pending does not mean approved.' }
      ]
    }
  ];

  const screens = {
    customer: [
      { id: 'SH-002', label: 'Welcome', render: renderWelcome },
      { id: 'CU-001', label: 'Discover', render: renderDiscover },
      { id: 'CU-005', label: 'Provider results', render: renderResults },
      { id: 'CU-006', label: 'Map view', render: renderMap },
      { id: 'CU-008', label: 'Provider profile', render: renderProfile },
      { id: 'CU-009', label: 'Trust details', render: renderTrustDetails },
      { id: 'CU-011', label: 'Create enquiry', render: renderEnquiry },
      { id: 'CU-012', label: 'Contact handoff', render: renderContactConsent }
    ],
    provider: [
      { id: 'PR-001', label: 'Provider overview', render: renderProviderOverview },
      { id: 'PR-002', label: 'Onboarding checklist', render: renderProviderChecklist },
      { id: 'PR-003', label: 'Provider pathway', render: renderProviderPathway },
      { id: 'PR-007', label: 'Operating model', render: renderOperatingModel },
      { id: 'PR-010', label: 'Evidence requirements', render: renderEvidenceRequirements },
      { id: 'PR-011', label: 'Upload and retry', render: renderEvidenceUpload },
      { id: 'PR-014', label: 'Action required', render: renderActionRequired },
      { id: 'PR-013', label: 'Verification timeline', render: renderProviderTimeline },
      { id: 'PR-016', label: 'Enquiry inbox', render: renderProviderInbox }
    ],
    operations: [
      { id: 'OP-001', label: 'Operations dashboard', render: renderOpsDashboard },
      { id: 'OP-002', label: 'Verification queue', render: renderOpsQueue },
      { id: 'OP-003', label: 'Verification case', render: renderOpsCase },
      { id: 'OP-004', label: 'Secure evidence', render: renderEvidenceViewer },
      { id: 'OP-005', label: 'Decision form', render: renderDecisionForm },
      { id: 'OP-016', label: 'Audit history', render: renderAuditHistory }
    ]
  };

  const state = {
    role: 'customer',
    screenId: 'SH-002',
    simulatedState: 'normal',
    selectedProvider: providers[0],
    viewport: 'phone',
    selectedCategory: 'Plumbing and water repairs',
    toast: ''
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function statusClass(value) {
    return value.replaceAll('_', '-');
  }

  function appHeader(title, subtitle, { back = false, actions = '' } = {}) {
    return `
      <header class="app-header">
        <div class="app-header__actions">
          ${back ? '<button class="app-icon-button" data-action="back" aria-label="Go back">←</button>' : ''}
        </div>
        <div class="app-header__title">
          <strong>${escapeHtml(title)}</strong>
          ${subtitle ? `<span>${escapeHtml(subtitle)}</span>` : ''}
        </div>
        <div class="app-header__actions">${actions}</div>
      </header>`;
  }

  function bottomNav(active = 'Discover', mode = 'customer') {
    const items = mode === 'provider'
      ? [['Overview', '⌂'], ['Profile', '▤'], ['Enquiries', '✉'], ['Account', '●']]
      : [['Discover', '⌖'], ['Saved', '♡'], ['Enquiries', '✉'], ['Account', '●']];
    return `<nav class="app-bottom-nav" aria-label="${mode} navigation">
      ${items.map(([label, icon]) => `<button class="${label === active ? 'is-active' : ''}" data-nav-label="${label}"><span class="nav-icon" aria-hidden="true">${icon}</span>${label}</button>`).join('')}
    </nav>`;
  }

  function toast() {
    if (!state.toast) return '';
    return `<div class="toast" role="status"><span>${escapeHtml(state.toast)}</span><button data-action="dismiss-toast">Dismiss</button></div>`;
  }

  function renderScreen() {
    const current = screens[state.role].find((item) => item.id === state.screenId) || screens[state.role][0];
    state.screenId = current.id;
    screenTitle.textContent = current.label;
    screenId.textContent = current.id;
    renderScreenNav();

    if (state.simulatedState !== 'normal') {
      appRoot.innerHTML = renderSimulatedState(state.simulatedState, current);
    } else {
      appRoot.innerHTML = current.render();
    }
    bindDynamicActions();
  }

  function renderScreenNav() {
    screenNav.innerHTML = screens[state.role].map((screen) => `
      <button class="${screen.id === state.screenId ? 'is-active' : ''}" data-screen="${screen.id}">
        <code>${screen.id}</code><span>${screen.label}</span>
      </button>`).join('');
    $$('[data-screen]', screenNav).forEach((button) => {
      button.addEventListener('click', () => navigate(button.dataset.screen));
    });
  }

  function navigate(id) {
    const target = screens[state.role].find((screen) => screen.id === id);
    if (!target) return;
    state.screenId = id;
    state.simulatedState = 'normal';
    stateSimulator.value = 'normal';
    state.toast = '';
    renderScreen();
    $('#app-main').focus({ preventScroll: true });
  }

  function renderWelcome() {
    return `<section class="app-screen app-screen--white">
      <div class="hero hero--welcome">
        <div class="hero__mark">D</div>
        <span class="eyebrow">Find local help with clearer proof</span>
        <h1>Know what was checked.</h1>
        <p>DIREKT separates identity, contact, qualification and location checks so you can make a better-informed choice.</p>
      </div>
      <div class="trust-intro">
        <div class="trust-intro__item"><span class="trust-intro__icon">1</span><div><strong>Search your area</strong><span>Use a neighbourhood, landmark, map pin or Plus Code.</span></div></div>
        <div class="trust-intro__item"><span class="trust-intro__icon">2</span><div><strong>Inspect each claim</strong><span>See what is current, pending, expired or not checked.</span></div></div>
        <div class="trust-intro__item"><span class="trust-intro__icon">3</span><div><strong>Send a tracked enquiry</strong><span>Keep a record before choosing to call or use WhatsApp.</span></div></div>
      </div>
      <div class="content-card content-card--flat">
        <button class="button button--primary button--full" data-go="CU-001">Explore the prototype</button>
        <p class="muted" style="font-size:.72rem;text-align:center;margin-bottom:0">Prototype only. No real accounts, checks or contact details.</p>
      </div>
    </section>`;
  }

  function renderDiscover() {
    const categories = [
      ['💧', 'Plumbing', 'Leaks, pumps and water repairs'],
      ['⚡', 'Electrical', 'Installation and fault repairs'],
      ['🔧', 'Mechanics', 'Workshop and roadside help'],
      ['🔌', 'Appliance repair', 'Household and electronics repair']
    ];
    return `<section class="app-screen">
      ${appHeader('Discover', 'Lusaka District', { actions: '<button class="app-icon-button" aria-label="Notifications">○</button>' })}
      <div class="hero" style="padding-bottom:48px">
        <span class="eyebrow">Your search area</span>
        <h1 style="font-size:1.65rem;max-width:none">What do you need help with?</h1>
        <p>Choose a category or describe the work.</p>
      </div>
      <div class="search-card">
        <label class="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search services" placeholder="Try ‘leaking tap’ or ‘car won’t start’"></label>
        <button class="area-chip" data-action="area-dialog">⌖ Woodlands · Change area</button>
      </div>
      <div class="app-content" style="padding-top:8px">
        <div class="section-title-row"><div><h2 class="section-title">Browse categories</h2><p>Four provisional Phase 1B categories</p></div></div>
        <div class="category-grid">
          ${categories.map(([icon, name, description], index) => `<button class="category-card ${index === 0 ? 'is-active' : ''}" data-category="${name}"><span class="category-icon">${icon}</span><strong>${name}</strong><small>${description}</small></button>`).join('')}
        </div>
        <div class="content-card content-card--blue" style="margin:20px 0 0">
          <strong>Location permission is optional</strong>
          <p class="muted" style="font-size:.78rem;line-height:1.45;margin-bottom:0">Choose an area manually and use the ordered list if you do not want to share your device location.</p>
        </div>
      </div>
      ${bottomNav('Discover')}
    </section>`;
  }

  function renderResults() {
    return `<section class="app-screen">
      ${appHeader('Plumbers near Woodlands', '4 fictional providers', { back: true, actions: '<button class="app-icon-button" data-go="CU-006" aria-label="Show map">⌖</button><button class="app-icon-button" aria-label="Filters">≡</button>' })}
      <div class="app-content">
        <div class="button-row" style="margin-bottom:12px">
          <button class="chip is-active">Relevant</button><button class="chip">Nearest</button><button class="chip">Open now</button><button class="chip">Claims current</button>
        </div>
        <div class="content-card content-card--amber" style="margin:0 0 12px">
          <strong>Compare the individual checks</strong>
          <p class="muted" style="font-size:.76rem;line-height:1.45;margin-bottom:0">DIREKT does not rank providers as generally “safe”. Open a profile to see the scope and limitations of each claim.</p>
        </div>
        <div class="provider-list">
          ${providers.map(providerCard).join('')}
        </div>
      </div>
      ${bottomNav('Discover')}
    </section>`;
  }

  function providerCard(provider) {
    return `<button class="provider-card" data-provider="${provider.id}">
      <div class="provider-card__visual"><span class="operating-badge">${provider.model}</span><span class="visual-symbol">${provider.symbol}</span></div>
      <div class="provider-card__body">
        <h3>${escapeHtml(provider.name)}</h3>
        <p class="provider-card__meta">${escapeHtml(provider.area)} · ${escapeHtml(provider.distance)}</p>
        <div class="claim-summary">${provider.summary.map((claim, index) => `<span class="status-chip ${index === provider.summary.length - 1 && /expiring|pending/i.test(claim) ? 'status-chip--pending' : 'status-chip--current'}">${escapeHtml(claim)}</span>`).join('')}</div>
      </div>
    </button>`;
  }

  function renderMap() {
    return `<section class="app-screen">
      ${appHeader('Map results', 'Woodlands · 4 fictional providers', { back: true, actions: '<button class="app-icon-button" data-go="CU-005" aria-label="Show list">☷</button>' })}
      <div class="app-content">
        <div class="content-card content-card--blue" style="margin:0 0 12px"><strong>Approximate service context</strong><p class="muted" style="font-size:.74rem;margin-bottom:0">Mobile-provider pins do not reveal private home locations. Use the list for an accessible equivalent.</p></div>
        <div class="map-canvas" role="img" aria-label="Synthetic map showing four provider pins around Woodlands, Lusaka">
          <span class="map-label" style="left:12%;top:14%">Woodlands</span>
          <span class="map-label" style="right:12%;top:32%">Chelstone</span>
          <span class="map-label" style="left:20%;bottom:14%">Matero</span>
          <button class="map-pin" style="left:28%;top:28%" data-provider="mwamba" aria-label="Mwamba Water Works"><span>💧</span></button>
          <button class="map-pin map-pin--amber" style="right:24%;top:42%" data-provider="zedspark" aria-label="ZedSpark Electrical Studio"><span>⚡</span></button>
          <button class="map-pin" style="left:43%;bottom:28%" data-provider="kafue-auto" aria-label="Kafue Road Auto Care"><span>🔧</span></button>
          <button class="map-pin map-pin--amber" style="left:17%;bottom:18%" data-provider="brightfix" aria-label="BrightFix Appliance Lab"><span>🔌</span></button>
        </div>
        <button class="button button--secondary button--full" style="margin-top:12px" data-go="CU-005">Open accessible list</button>
      </div>
      ${bottomNav('Discover')}
    </section>`;
  }

  function renderProfile() {
    const provider = state.selectedProvider;
    const currentClaims = provider.claims.filter((claim) => claim.state === 'current').length;
    return `<section class="app-screen">
      ${appHeader('Provider profile', 'Fictional prototype profile', { back: true, actions: '<button class="app-icon-button" aria-label="Save provider">♡</button><button class="app-icon-button" aria-label="Share provider">↗</button>' })}
      <div class="profile-hero">
        <div class="profile-identity"><div class="avatar">${provider.initials}</div><div><span class="eyebrow" style="color:var(--green-800)">${provider.model}</span><h1>${escapeHtml(provider.name)}</h1><p>${escapeHtml(provider.category)}</p></div></div>
        <div class="profile-location">⌖ <span><strong>${escapeHtml(provider.area)}</strong><br>${escapeHtml(provider.distance)}. Exact private locations are not shown unless the provider has consented to a public customer-facing pin.</span></div>
        <div class="trust-scorecard">
          <div class="trust-stat"><strong>${currentClaims}</strong><span>current checks</span></div>
          <div class="trust-stat"><strong>${provider.stats.attention}</strong><span>needs attention</span></div>
          <div class="trust-stat"><strong>${provider.stats.reviews}</strong><span>tracked reviews</span></div>
        </div>
      </div>
      <div class="app-content" style="padding-top:4px">
        <div class="content-card content-card--tint" style="margin:12px 0"><strong>${escapeHtml(provider.availability)}</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Availability is provider-managed and was not independently verified by DIREKT.</p></div>
        <button class="button button--primary button--full" data-go="CU-011">Send tracked enquiry</button>
        <div class="section-title-row"><div><h2 class="section-title">What DIREKT checked</h2><p>Open each item for scope and limitations</p></div><button class="button button--quiet" data-go="CU-009">View all</button></div>
        <div class="claim-list">${provider.claims.slice(0,4).map(claimCard).join('')}</div>
        <div class="section-title-row"><div><h2 class="section-title">Recent tracked reviews</h2><p>Only after a recorded DIREKT enquiry</p></div></div>
        <div class="content-card" style="margin:0"><strong>Clear explanation before the work</strong><p class="muted" style="font-size:.76rem;line-height:1.5">“The provider explained the likely cause and the call-out price before travelling.”</p><span class="status-chip status-chip--info">Prototype review · 5 days ago</span></div>
        <button class="button button--quiet button--full" style="margin-top:12px" data-action="report">Report information</button>
      </div>
      ${bottomNav('Discover')}${toast()}
    </section>`;
  }

  function claimCard(claim) {
    return `<button class="claim-card claim-card--button" data-claim="${escapeHtml(claim.name)}">
      <span class="status-icon status-icon--${statusClass(claim.state)}">${claim.icon}</span>
      <span><h3>${escapeHtml(claim.name)}</h3><p>${escapeHtml(claim.summary)}</p></span>
      <span class="claim-card__state">${escapeHtml(claim.stateLabel)} ›</span>
    </button>`;
  }

  function renderTrustDetails() {
    const provider = state.selectedProvider;
    return `<section class="app-screen">
      ${appHeader('Trust details', provider.name, { back: true })}
      <div class="app-content">
        <div class="content-card content-card--amber" style="margin:0 0 14px"><strong>No blanket verification</strong><p class="muted" style="font-size:.76rem;line-height:1.45;margin-bottom:0">Each card describes one check. A current check does not guarantee future conduct, price, availability or workmanship.</p></div>
        <div class="claim-list">${provider.claims.map(claimCard).join('')}</div>
      </div>
      ${bottomNav('Discover')}
    </section>`;
  }

  function renderEnquiry() {
    const provider = state.selectedProvider;
    return `<section class="app-screen">
      ${appHeader('Send an enquiry', provider.name, { back: true })}
      <div class="app-content">
        <div class="content-card content-card--blue" style="margin:0 0 14px"><strong>Why create an enquiry first?</strong><p class="muted" style="font-size:.76rem;line-height:1.45;margin-bottom:0">It gives both sides a reference, supports follow-up and can make a later review eligible.</p></div>
        <label class="field-label" for="service-type">Service needed</label>
        <select id="service-type" class="select-control"><option>Leaking pipe or tap</option><option>Blocked drain</option><option>Water-pump issue</option><option>Other plumbing work</option></select>
        <label class="field-label" for="area-input">General area or landmark</label>
        <input id="area-input" class="text-input" value="Woodlands, near a public landmark" aria-describedby="area-help">
        <p id="area-help" class="muted" style="font-size:.7rem;margin-top:5px">Do not enter an exact private address until you choose to share it with the provider.</p>
        <label class="field-label" for="need-details">What is happening?</label>
        <textarea id="need-details" rows="5" placeholder="Describe the problem without including sensitive information."></textarea>
        <label class="field-label" for="timing">When do you need help?</label>
        <select id="timing" class="select-control"><option>As soon as possible</option><option>Today</option><option>This week</option><option>I am flexible</option></select>
        <div class="content-card" style="margin:16px 0"><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" checked><span style="font-size:.78rem;line-height:1.45">I understand that DIREKT records the enquiry but does not set the provider’s price or guarantee the service outcome.</span></label></div>
        <button class="button button--primary button--full" data-action="submit-enquiry">Create prototype enquiry</button>
      </div>
      ${bottomNav('Enquiries')}
    </section>`;
  }

  function renderContactConsent() {
    const provider = state.selectedProvider;
    return `<section class="app-screen app-screen--white">
      ${appHeader('Choose how to continue', 'Enquiry DKT-P-2048 created', { back: true })}
      <div class="app-content">
        <div class="content-card content-card--tint" style="margin:0 0 16px"><strong>Enquiry recorded</strong><p class="muted" style="font-size:.76rem;line-height:1.5;margin-bottom:0">Your prototype enquiry to ${escapeHtml(provider.name)} now has a reference. No real message was sent.</p></div>
        <h1 class="page-title" style="font-size:1.5rem">Share contact details?</h1>
        <p class="muted" style="line-height:1.55">DIREKT would ask for consent before opening another communication app or exposing a phone number.</p>
        <div class="content-card" style="margin:16px 0">
          <strong>Information that would be shared</strong>
          <ul class="muted" style="font-size:.78rem;line-height:1.55;padding-left:20px"><li>Your chosen contact name</li><li>Your confirmed contact channel</li><li>The enquiry reference and service summary</li><li>No identity document or private evidence</li></ul>
        </div>
        <div class="button-row">
          <button class="button button--primary button--full" data-action="mock-whatsapp">Continue to WhatsApp</button>
          <button class="button button--secondary button--full" data-action="mock-call">Reveal call option</button>
          <button class="button button--quiet button--full" data-go="CU-008">Keep communication in DIREKT for now</button>
        </div>
        <div class="content-card content-card--amber" style="margin:18px 0 0"><strong>Prototype safeguard</strong><p class="muted" style="font-size:.74rem;margin-bottom:0">These buttons never open a real number or external application.</p></div>
      </div>
      ${bottomNav('Enquiries')}${toast()}
    </section>`;
  }

  function renderProviderOverview() {
    return `<section class="app-screen">
      ${appHeader('Provider overview', 'Mwamba Water Works · Prototype', { actions: '<button class="app-icon-button" aria-label="Switch mode">⇄</button>' })}
      <div class="app-content">
        <div class="content-card content-card--tint" style="margin:0 0 14px"><div class="overview-grid"><div class="progress-ring" style="--progress:72%" data-label="72%"></div><div><span class="eyebrow" style="color:var(--green-800)">Profile progress</span><h1 class="page-title" style="font-size:1.25rem">Three checks are public</h1><p class="muted" style="font-size:.75rem;line-height:1.45">One item needs action before the profile is ready for full prototype publication.</p></div></div></div>
        <div class="content-card content-card--amber" style="margin:0 0 14px"><strong>Action required: premises evidence</strong><p class="muted" style="font-size:.76rem;line-height:1.45">The image did not show the operating entrance clearly. Open the reason and submit a replacement.</p><button class="button button--secondary" style="margin-top:10px" data-go="PR-014">Review action</button></div>
        <div class="section-title-row"><div><h2 class="section-title">Today</h2><p>Fictional activity</p></div></div>
        <div class="ops-stats"><div class="ops-stat"><strong>3</strong><span>new enquiries</span></div><div class="ops-stat"><strong>35m</strong><span>typical reply</span></div><div class="ops-stat"><strong>18</strong><span>tracked reviews</span></div></div>
        <div class="section-title-row"><div><h2 class="section-title">Verification progress</h2></div><button class="button button--quiet" data-go="PR-013">Timeline</button></div>
        <div class="checklist">
          <div class="check-item is-complete"><span class="check-item__number">✓</span><span><strong>Identity and phone</strong><small>Current</small></span><span class="status-chip status-chip--current">Done</span></div>
          <div class="check-item is-complete"><span class="check-item__number">✓</span><span><strong>Category and services</strong><small>Plumbing and water repairs</small></span><span class="status-chip status-chip--current">Done</span></div>
          <div class="check-item is-action"><span class="check-item__number">!</span><span><strong>Operating location</strong><small>Replacement image needed</small></span><span class="status-chip status-chip--pending">Action</span></div>
        </div>
      </div>
      ${bottomNav('Overview', 'provider')}
    </section>`;
  }

  function renderProviderChecklist() {
    const items = [
      ['Account representative', 'Identity and confirmed phone', 'complete'],
      ['Provider pathway', 'Experienced individual provider', 'complete'],
      ['Services', 'Plumbing and water repairs', 'complete'],
      ['Operating model', 'Mobile — travels to customers', 'complete'],
      ['Service areas', 'Central Lusaka areas', 'complete'],
      ['Qualification evidence', 'Submitted and current', 'complete'],
      ['Operating location evidence', 'Replacement required', 'action'],
      ['Declarations and review', 'Waiting for location correction', 'pending']
    ];
    return `<section class="app-screen">
      ${appHeader('Onboarding checklist', 'Your progress is saved', { back: true })}
      <div class="app-content">
        <div class="content-card content-card--blue" style="margin:0 0 14px"><strong>Resume safely</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Each completed step is saved. Draft changes remain on this device until a server confirms them in the real app.</p></div>
        <div class="checklist">${items.map(([title, detail, stateName], index) => `<button class="check-item ${stateName === 'complete' ? 'is-complete' : stateName === 'action' ? 'is-action' : ''}" data-check-step="${index + 1}"><span class="check-item__number">${stateName === 'complete' ? '✓' : stateName === 'action' ? '!' : index + 1}</span><span><strong>${title}</strong><small>${detail}</small></span><span>›</span></button>`).join('')}</div>
      </div>
      ${bottomNav('Profile', 'provider')}
    </section>`;
  }

  function renderProviderPathway() {
    return `<section class="app-screen">
      ${appHeader('How do you operate?', 'Choose the most honest pathway', { back: true })}
      <div class="app-content">
        <h1 class="page-title" style="font-size:1.45rem">Your pathway changes the claims we can check.</h1>
        <p class="muted" style="line-height:1.5">All pathways use the same profile quality. DIREKT never hides missing registration or qualification claims.</p>
        <div class="decision-stack" style="margin-top:16px">
          <label class="radio-card"><input type="radio" name="pathway"><span><strong>Registered business</strong><span>I can submit a business registration claim and an authorized representative.</span></span></label>
          <label class="radio-card"><input type="radio" name="pathway"><span><strong>Qualified individual</strong><span>I provide services personally and can submit relevant training or qualification evidence.</span></span></label>
          <label class="radio-card"><input type="radio" name="pathway" checked><span><strong>Experienced individual provider</strong><span>I may not have formal registration or qualification evidence. My profile will state exactly what was and was not checked.</span></span></label>
        </div>
        <div class="content-card content-card--amber" style="margin:16px 0"><strong>Important</strong><p class="muted" style="font-size:.76rem;line-height:1.5;margin-bottom:0">Choosing a pathway does not approve any claim. Each submitted item receives its own review.</p></div>
        <button class="button button--primary button--full" data-go="PR-007">Continue</button>
      </div>
      ${bottomNav('Profile', 'provider')}
    </section>`;
  }

  function renderOperatingModel() {
    return `<section class="app-screen">
      ${appHeader('Operating model', 'Tell customers how to reach you', { back: true })}
      <div class="app-content">
        <div class="decision-stack">
          <label class="radio-card"><input type="radio" name="model"><span><strong>Fixed premises</strong><span>Customers visit a public shop, workshop or office. Publication requires consent and a location check.</span></span></label>
          <label class="radio-card"><input type="radio" name="model" checked><span><strong>Mobile provider</strong><span>I travel to customers. DIREKT shows service areas, not my exact private base.</span></span></label>
          <label class="radio-card"><input type="radio" name="model"><span><strong>Hybrid</strong><span>I have a customer-facing location and also travel to selected areas.</span></span></label>
        </div>
        <label class="field-label" for="service-area">Primary service area</label>
        <select id="service-area" class="select-control"><option>Central Lusaka areas</option><option>North-east Lusaka areas</option><option>Selected Lusaka District areas</option></select>
        <label class="field-label" for="landmark">General landmark description</label>
        <input id="landmark" class="text-input" value="Near a public commercial landmark">
        <div class="content-card content-card--blue" style="margin:16px 0"><strong>Privacy by precision</strong><p class="muted" style="font-size:.76rem;line-height:1.5;margin-bottom:0">A private operating-location check can support a public area claim without exposing a home address.</p></div>
        <button class="button button--primary button--full" data-go="PR-010">Save and continue</button>
      </div>
      ${bottomNav('Profile', 'provider')}
    </section>`;
  }

  function renderEvidenceRequirements() {
    return `<section class="app-screen">
      ${appHeader('Evidence requirements', 'Plumbing and water repairs', { back: true })}
      <div class="app-content">
        <div class="claim-list">
          <div class="claim-card"><span class="status-icon status-icon--current">ID</span><span><h3>Representative identity</h3><p>Required for every pathway. Kept private.</p></span><span class="claim-card__state">Complete</span></div>
          <div class="claim-card"><span class="status-icon status-icon--current">☎</span><span><h3>Contact number</h3><p>Required. Confirm control of the public number.</p></span><span class="claim-card__state">Complete</span></div>
          <div class="claim-card"><span class="status-icon status-icon--pending">Q</span><span><h3>Qualification or experience evidence</h3><p>Submit the strongest truthful evidence you have. The public claim will match the evidence type.</p></span><span class="claim-card__state">Submitted</span></div>
          <div class="claim-card"><span class="status-icon status-icon--rejected">⌖</span><span><h3>Operating location evidence</h3><p>Required privately. The previous image needs replacement.</p></span><span class="claim-card__state">Action</span></div>
          <div class="claim-card"><span class="status-icon">B</span><span><h3>Business registration</h3><p>Optional for an individual-provider pathway. No claim is shown if not supplied.</p></span><span class="claim-card__state">Not supplied</span></div>
        </div>
        <div class="content-card content-card--amber" style="margin:16px 0"><strong>Prototype rule</strong><p class="muted" style="font-size:.76rem;line-height:1.5;margin-bottom:0">DIREKT should request only evidence needed for a defined public claim, legal obligation or operational control.</p></div>
        <button class="button button--primary button--full" data-go="PR-011">Replace location evidence</button>
      </div>
      ${bottomNav('Profile', 'provider')}
    </section>`;
  }

  function renderEvidenceUpload() {
    return `<section class="app-screen">
      ${appHeader('Replace location evidence', 'Private upload · fictional document', { back: true })}
      <div class="app-content">
        <div class="content-card content-card--red" style="margin:0 0 14px"><strong>Previous image was not usable</strong><p class="muted" style="font-size:.76rem;line-height:1.5;margin-bottom:0">Reason: the entrance and nearby public context were not visible. Do not include people, vehicle plates or unrelated private information.</p></div>
        <div class="upload-box"><strong>Operating entrance photo</strong><span>Take or choose one image showing the provider operating entrance and enough non-sensitive context for review.</span><button class="button button--secondary" data-action="choose-file">Choose fictional file</button></div>
        <div class="content-card content-card--amber" style="margin:16px 0"><strong>Upload paused at 62%</strong><div class="upload-progress"><span></span></div><p class="muted" style="font-size:.72rem;margin-bottom:10px">Connection changed. The draft is safe on this device; the claim has not been submitted.</p><div class="button-row"><button class="button button--primary" data-action="retry-upload">Retry upload</button><button class="button button--secondary" data-action="save-draft">Keep draft</button></div></div>
        <div class="content-card" style="margin:0"><strong>Before submitting</strong><ul class="muted" style="font-size:.76rem;line-height:1.55;padding-left:20px"><li>Remove unrelated faces and documents.</li><li>Do not expose an exact private home location publicly.</li><li>Use the public-premises option only for customer-facing locations.</li></ul></div>
      </div>
      ${bottomNav('Profile', 'provider')}${toast()}
    </section>`;
  }

  function renderActionRequired() {
    return `<section class="app-screen">
      ${appHeader('Action required', 'Operating location evidence', { back: true })}
      <div class="app-content">
        <div class="content-card content-card--amber" style="margin:0 0 14px"><span class="eyebrow" style="color:var(--amber-700)">Reviewer reason LOC-IMAGE-02</span><h1 class="page-title" style="font-size:1.25rem">Show the operating entrance more clearly</h1><p class="muted" style="font-size:.78rem;line-height:1.55">The image was too close to confirm the entrance and general operating context. It did not expose a policy violation and has not been made public.</p></div>
        <h2 class="section-title">How to correct it</h2>
        <ol class="muted" style="line-height:1.65;padding-left:22px;font-size:.8rem"><li>Stand far enough back to show the entrance.</li><li>Include a non-sensitive public landmark or exterior context.</li><li>Avoid faces, private paperwork and vehicle plates.</li><li>Review the image before submitting.</li></ol>
        <div class="content-card content-card--blue" style="margin:16px 0"><strong>What customers can see</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Nothing about the rejected image. Customers only see approved public claims and relevant limitations.</p></div>
        <button class="button button--primary button--full" data-go="PR-011">Replace evidence</button>
        <button class="button button--quiet button--full" data-action="ask-support">Ask support about this reason</button>
      </div>
      ${bottomNav('Profile', 'provider')}${toast()}
    </section>`;
  }

  function renderProviderTimeline() {
    return `<section class="app-screen">
      ${appHeader('Verification timeline', 'Each check has its own lifecycle', { back: true })}
      <div class="app-content">
        <div class="timeline">
          <div class="timeline-item is-current"><span class="timeline-dot">✓</span><div><h3>Identity and phone current</h3><p>Reviewed 10 July 2026. Recheck after a material change.</p></div></div>
          <div class="timeline-item is-current"><span class="timeline-dot">✓</span><div><h3>Qualification evidence current</h3><p>Reviewed 12 July 2026. Scheduled review 12 July 2027.</p></div></div>
          <div class="timeline-item is-action"><span class="timeline-dot">!</span><div><h3>Operating location action required</h3><p>Replacement entrance image needed. Public location claim remains unchanged.</p></div></div>
          <div class="timeline-item"><span class="timeline-dot">○</span><div><h3>Profile publication review waiting</h3><p>Starts after the required location correction is accepted.</p></div></div>
          <div class="timeline-item"><span class="timeline-dot">↻</span><div><h3>Future expiry and renewal</h3><p>DIREKT will show warnings before a current claim expires.</p></div></div>
        </div>
      </div>
      ${bottomNav('Profile', 'provider')}
    </section>`;
  }

  function renderProviderInbox() {
    const enquiries = [
      ['DKT-P-2048', 'Leaking pipe', 'Woodlands', 'New', '8 min ago'],
      ['DKT-P-2039', 'Water pump issue', 'Kabulonga', 'Replied', '2 hr ago'],
      ['DKT-P-2018', 'Blocked drain', 'Chelstone', 'Closed', 'Yesterday']
    ];
    return `<section class="app-screen">
      ${appHeader('Enquiries', 'Prototype inbox', { actions: '<button class="app-icon-button" aria-label="Filter enquiries">≡</button>' })}
      <div class="app-content">
        <div class="button-row" style="margin-bottom:14px"><button class="chip is-active">All</button><button class="chip">New</button><button class="chip">Replied</button><button class="chip">Closed</button></div>
        <div class="checklist">${enquiries.map(([ref, need, area, statusValue, time], index) => `<button class="check-item ${index === 0 ? 'is-action' : index === 1 ? 'is-complete' : ''}" data-action="open-enquiry"><span class="check-item__number">${index === 0 ? '!' : index === 1 ? '✓' : '○'}</span><span><strong>${need}</strong><small>${ref} · ${area} · ${time}</small></span><span class="status-chip ${index === 0 ? 'status-chip--pending' : index === 1 ? 'status-chip--current' : 'status-chip--info'}">${statusValue}</span></button>`).join('')}</div>
        <div class="content-card content-card--blue" style="margin:16px 0 0"><strong>Contact protection</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Customers choose whether to share contact details after the enquiry record is created.</p></div>
      </div>
      ${bottomNav('Enquiries', 'provider')}
    </section>`;
  }

  function opsLayout(content, active = 'Queue') {
    const nav = [['Dashboard', '3'], ['Queue', '7'], ['Complaints', '2'], ['Audit', '']];
    return `<section class="ops-shell"><header class="ops-topbar"><div><strong>DIREKT Operations</strong><br><small>Prototype · fictional cases</small></div><span class="status-chip status-chip--current">Reviewer demo</span></header><div class="ops-layout"><nav class="ops-sidebar" aria-label="Operations navigation">${nav.map(([label, count]) => `<button class="${label === active ? 'is-active' : ''}" data-ops-nav="${label}"><span>${label}</span><span>${count}</span></button>`).join('')}</nav><main class="ops-main">${content}</main></div></section>`;
  }

  function renderOpsDashboard() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--green-800)">Operations overview</span><h1 class="page-title" style="font-size:1.4rem">Review work without exposing evidence</h1><p>All people, businesses and documents are fictional.</p></div></div><div class="ops-stats"><div class="ops-stat"><strong>7</strong><span>verification cases</span></div><div class="ops-stat"><strong>2</strong><span>action-required replies</span></div><div class="ops-stat"><strong>1</strong><span>expiring this week</span></div></div><div class="content-card content-card--amber" style="margin:14px 0"><strong>Oldest case: 18 hours</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">No service-level breach in this prototype dataset.</p></div><h2 class="section-title">Priority work</h2>${queueTable()}`, 'Dashboard');
  }

  function queueTable() {
    return `<table class="queue-table"><thead><tr><th>Case</th><th>Provider</th><th>Check</th><th>State</th></tr></thead><tbody><tr data-go="OP-003"><td>VR-1042</td><td>Mwamba Water Works</td><td>Location replacement</td><td><span class="status-chip status-chip--pending">Action reply</span></td></tr><tr><td>VR-1041</td><td>BrightFix Appliance Lab</td><td>Qualification</td><td><span class="status-chip status-chip--pending">Under review</span></td></tr><tr><td>VR-1038</td><td>ZedSpark Electrical Studio</td><td>Field visit</td><td><span class="status-chip status-chip--info">Scheduled</span></td></tr></tbody></table>`;
  }

  function renderOpsQueue() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--green-800)">Verification queue</span><h1 class="page-title" style="font-size:1.4rem">Seven cases need attention</h1><p>Sorted by risk, waiting time and expiry—not payment tier.</p></div></div><div class="button-row"><button class="chip is-active">All</button><button class="chip">Identity</button><button class="chip">Qualification</button><button class="chip">Location</button><button class="chip">Field visit</button></div>${queueTable()}<div class="content-card content-card--blue" style="margin:14px 0 0"><strong>Commercial separation</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Subscription status is not a queue-priority or decision input.</p></div>`, 'Queue');
  }

  function renderOpsCase() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--amber-700)">Case VR-1042 · Action reply</span><h1 class="page-title" style="font-size:1.4rem">Operating location evidence</h1><p>Mwamba Water Works · mobile provider pathway</p></div><button class="button button--secondary" data-go="OP-016">Audit history</button></div><div class="case-grid"><div><div class="content-card" style="margin:0 0 14px"><strong>Claim requested</strong><p class="muted" style="font-size:.76rem;line-height:1.5">Confirm that the provider operates from the declared general Lusaka area without publishing an exact private base.</p></div><div class="evidence-preview"><div class="evidence-preview__doc"><span class="eyebrow" style="color:var(--ink-600)">Fictional evidence preview</span><strong>Replacement entrance image</strong><div class="redacted-line"></div><div class="redacted-line"></div><div class="redacted-line"></div><span>All identifying details are synthetic or redacted.</span></div></div></div><aside><div class="content-card content-card--amber" style="margin:0 0 12px"><strong>Previous reason</strong><p class="muted" style="font-size:.74rem;line-height:1.45;margin-bottom:0">LOC-IMAGE-02: entrance and general context not visible.</p></div><div class="content-card" style="margin:0"><strong>Review checklist</strong><ul class="muted" style="font-size:.74rem;line-height:1.55;padding-left:18px"><li>Evidence belongs to current case</li><li>No unrelated personal data</li><li>Entrance visible</li><li>General area claim supported</li><li>Public precision remains reduced</li></ul><button class="button button--primary button--full" data-go="OP-005">Make check decision</button></div></aside></div>`, 'Queue');
  }

  function renderEvidenceViewer() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--red-700)">Restricted evidence viewer</span><h1 class="page-title" style="font-size:1.4rem">Qualification evidence</h1><p>Access event will be recorded in the fictional audit log.</p></div></div><div class="content-card content-card--red" style="margin:0 0 14px"><strong>Private evidence</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Do not download, copy or disclose evidence outside the approved case workflow.</p></div><div class="case-grid"><div class="evidence-preview"><div class="evidence-preview__doc"><span class="eyebrow" style="color:var(--ink-600)">Synthetic training record</span><strong>Plumbing Skills Certificate</strong><div class="redacted-line"></div><div class="redacted-line"></div><div class="redacted-line"></div><span>Issued by a fictional institution. Not a real credential.</span></div></div><aside><div class="content-card" style="margin:0"><strong>Match checks</strong><dl class="claim-detail"><dt>Name</dt><dd>Matches submitted identity</dd><dt>Course</dt><dd>Plumbing skills</dd><dt>Issue date</dt><dd>Readable</dd><dt>Issuer</dt><dd>Not externally confirmed</dd></dl><button class="button button--secondary button--full" data-go="OP-005">Open decision form</button></div></aside></div>`, 'Queue');
  }

  function renderDecisionForm() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--green-800)">Check-specific decision</span><h1 class="page-title" style="font-size:1.4rem">Operating location evidence</h1><p>Decision affects this claim only.</p></div></div><div class="case-grid"><div class="content-card" style="margin:0"><strong>Choose outcome</strong><div class="decision-stack" style="margin-top:12px"><label class="radio-card"><input type="radio" name="decision" value="approve"><span><strong>Approve current check</strong><span>Evidence supports the declared general operating area.</span></span></label><label class="radio-card"><input type="radio" name="decision" value="action" checked><span><strong>Action required</strong><span>Provider can correct a specific issue and resubmit.</span></span></label><label class="radio-card"><input type="radio" name="decision" value="reject"><span><strong>Reject claim</strong><span>Evidence is invalid, misleading or cannot support the claim.</span></span></label></div><label class="field-label" for="reason-code">Reason code</label><select id="reason-code" class="select-control"><option>LOC-IMAGE-02 — entrance/context unclear</option><option>LOC-MISMATCH-01 — location does not match declaration</option><option>PRIVACY-01 — unrelated personal data visible</option></select><label class="field-label" for="review-note">Provider-facing guidance</label><textarea id="review-note" rows="4">Show the operating entrance and enough non-sensitive public context to support the general area claim.</textarea></div><aside><div class="content-card content-card--amber" style="margin:0 0 12px"><strong>Public effect</strong><p class="muted" style="font-size:.74rem;line-height:1.45;margin-bottom:0">No rejected-evidence details become public. Existing approved claims remain unchanged unless this decision explicitly changes them.</p></div><div class="content-card" style="margin:0"><label style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox"><span style="font-size:.76rem">I reviewed the evidence, scope, reason and privacy impact.</span></label><button class="button button--primary button--full" style="margin-top:14px" data-action="save-decision">Record prototype decision</button></div></aside></div>`, 'Queue');
  }

  function renderAuditHistory() {
    return opsLayout(`<div class="section-title-row"><div><span class="eyebrow" style="color:var(--green-800)">Immutable activity view</span><h1 class="page-title" style="font-size:1.4rem">Case VR-1042 audit history</h1><p>Fictional events for interaction-design review.</p></div></div><div class="timeline"><div class="timeline-item is-current"><span class="timeline-dot">4</span><div><h3>Replacement evidence opened</h3><p>Reviewer DEMO-02 · 14 July 2026 13:42 UTC · restricted viewer</p></div></div><div class="timeline-item is-action"><span class="timeline-dot">3</span><div><h3>Provider submitted replacement</h3><p>Upload acknowledged · 14 July 2026 12:55 UTC</p></div></div><div class="timeline-item"><span class="timeline-dot">2</span><div><h3>Action required issued</h3><p>Reason LOC-IMAGE-02 · reviewer DEMO-01 · 13 July 2026</p></div></div><div class="timeline-item"><span class="timeline-dot">1</span><div><h3>Initial evidence submitted</h3><p>Private location evidence · 13 July 2026</p></div></div></div><div class="content-card content-card--blue" style="margin:0"><strong>Audit principle</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">Corrections create new events. Earlier decisions and access records are not silently overwritten.</p></div>`, 'Audit');
  }

  function renderSimulatedState(value, currentScreen) {
    const states = {
      slow: { icon: '◔', title: 'Slow connection', text: 'Text and saved information are available first. Images and map details are still loading.', action: 'Continue with text view' },
      offline: { icon: '⌁', title: 'You are offline', text: 'Previously loaded information can be viewed with a “last updated” marker. New searches and trust-state updates require a connection.', action: 'View saved information' },
      loading: { icon: '', title: 'Loading', text: 'DIREKT explains what is loading rather than showing an indefinite spinner.', action: '' },
      empty: { icon: '○', title: 'No matching providers yet', text: 'Try a wider area, remove a filter or choose another category. DIREKT does not fill empty results with unreviewed listings.', action: 'Adjust search' },
      denied: { icon: '⌖', title: 'Location permission is off', text: 'You can still choose Lusaka District, a neighbourhood, landmark, pin or Plus Code manually.', action: 'Choose area manually' },
      error: { icon: '↻', title: 'Could not refresh', text: 'The last successful data remains visible where safe. No action is presented as completed until the server acknowledges it.', action: 'Try again' }
    };
    const data = states[value];
    if (value === 'loading') {
      return `<section class="app-screen">${appHeader(currentScreen.label, 'Loading prototype state')}<div class="app-content"><div class="skeleton skeleton-line" style="width:46%"></div><div class="skeleton skeleton-line" style="width:78%"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-line" style="width:62%"></div></div></section>`;
    }
    return `<section class="app-screen">${appHeader(currentScreen.label, 'Simulated state')}<div class="state-panel"><div><span class="state-panel__icon">${data.icon}</span><h2>${data.title}</h2><p>${data.text}</p>${data.action ? `<button class="button button--primary" data-action="restore-normal">${data.action}</button>` : ''}<button class="button button--quiet button--full" data-action="restore-normal">Return to normal state</button></div></div></section>`;
  }

  function openClaimDialog(claimName) {
    const claim = state.selectedProvider.claims.find((item) => item.name === claimName);
    if (!claim) return;
    actionDialogContent.innerHTML = `<div class="claim-detail"><span class="eyebrow" style="color:var(--green-800)">${escapeHtml(claim.stateLabel)}</span><h2>${escapeHtml(claim.name)}</h2><p>${escapeHtml(claim.summary)}</p><dl><dt>Reviewed</dt><dd>${escapeHtml(claim.reviewed)}</dd><dt>Expiry/recheck</dt><dd>${escapeHtml(claim.expires)}</dd><dt>Source class</dt><dd>${escapeHtml(claim.source)}</dd></dl><div class="content-card content-card--tint" style="margin:0 0 12px"><strong>What this means</strong><p class="muted" style="font-size:.76rem;margin-bottom:0">${escapeHtml(claim.means)}</p></div><div class="limit-box"><strong>What DIREKT did not check</strong><br>${escapeHtml(claim.limit)}</div></div>`;
    dialogConfirm.textContent = 'Done';
    actionDialog.showModal();
  }

  function openActionDialog(title, body, confirmLabel = 'Continue', onConfirm = null) {
    actionDialogContent.innerHTML = `<span class="eyebrow" style="color:var(--green-800)">Prototype action</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p>`;
    dialogConfirm.textContent = confirmLabel;
    dialogConfirm.onclick = () => {
      if (onConfirm) onConfirm();
    };
    actionDialog.showModal();
  }

  function bindDynamicActions() {
    $$('[data-go]', appRoot).forEach((element) => element.addEventListener('click', () => navigate(element.dataset.go)));
    $$('[data-provider]', appRoot).forEach((element) => element.addEventListener('click', () => {
      state.selectedProvider = providers.find((provider) => provider.id === element.dataset.provider) || providers[0];
      navigate('CU-008');
    }));
    $$('[data-claim]', appRoot).forEach((element) => element.addEventListener('click', () => openClaimDialog(element.dataset.claim)));

    $$('[data-action]', appRoot).forEach((element) => element.addEventListener('click', () => handleAction(element.dataset.action)));
    $$('[data-category]', appRoot).forEach((element) => element.addEventListener('click', () => {
      state.selectedCategory = element.dataset.category;
      navigate('CU-005');
    }));
    $$('[data-ops-nav]', appRoot).forEach((element) => element.addEventListener('click', () => {
      const mapping = { Dashboard: 'OP-001', Queue: 'OP-002', Complaints: 'OP-002', Audit: 'OP-016' };
      navigate(mapping[element.dataset.opsNav]);
    }));
    $$('[data-nav-label]', appRoot).forEach((element) => element.addEventListener('click', () => {
      const label = element.dataset.navLabel;
      const mappings = state.role === 'provider'
        ? { Overview: 'PR-001', Profile: 'PR-002', Enquiries: 'PR-016', Account: 'PR-001' }
        : { Discover: 'CU-001', Saved: 'CU-005', Enquiries: 'CU-012', Account: 'SH-002' };
      navigate(mappings[label]);
    }));
  }

  function handleAction(action) {
    const actions = {
      back: () => {
        const list = screens[state.role];
        const index = list.findIndex((screen) => screen.id === state.screenId);
        navigate(list[Math.max(0, index - 1)].id);
      },
      'area-dialog': () => openActionDialog('Choose an area without sharing precise location', 'The real app will support district, neighbourhood, landmark, map pin and Plus Code. This prototype keeps Woodlands selected.', 'Use Woodlands'),
      report: () => openActionDialog('Report information', 'A real report would create a controlled record. Do not include sensitive personal data or emergencies in a general marketplace report.', 'Understood'),
      'submit-enquiry': () => navigate('CU-012'),
      'mock-whatsapp': () => {
        state.toast = 'Prototype only — no WhatsApp app or real number was opened.';
        renderScreen();
      },
      'mock-call': () => {
        state.toast = 'Prototype only — no phone number was revealed.';
        renderScreen();
      },
      'choose-file': () => openActionDialog('Choose fictional evidence', 'The prototype never accesses your camera or files. In the Android app, permissions will be requested only when needed.', 'Use sample file'),
      'retry-upload': () => {
        state.toast = 'Prototype upload resumed and acknowledged. No file was transmitted.';
        renderScreen();
      },
      'save-draft': () => {
        state.toast = 'Draft kept on this simulated device.';
        renderScreen();
      },
      'ask-support': () => {
        state.toast = 'Prototype support request prepared. Nothing was sent.';
        renderScreen();
      },
      'open-enquiry': () => openActionDialog('Open enquiry', 'A real provider would see only the customer information shared for this tracked enquiry.', 'View prototype'),
      'save-decision': () => openActionDialog('Record decision?', 'The real platform would validate authorization, reason code, evidence scope and audit metadata before saving.', 'Record prototype decision', () => {
        state.toast = 'Prototype decision recorded locally only.';
      }),
      'dismiss-toast': () => {
        state.toast = '';
        renderScreen();
      },
      'restore-normal': () => {
        state.simulatedState = 'normal';
        stateSimulator.value = 'normal';
        renderScreen();
      }
    };
    if (actions[action]) actions[action]();
  }

  function setRole(role) {
    state.role = role;
    state.screenId = screens[role][0].id;
    state.simulatedState = 'normal';
    stateSimulator.value = 'normal';
    $$('.segment').forEach((button) => {
      const active = button.dataset.role === role;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    renderScreen();
  }

  $$('.segment').forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));

  $$('.viewport-control [data-viewport]').forEach((button) => button.addEventListener('click', () => {
    state.viewport = button.dataset.viewport;
    deviceFrame.dataset.viewport = state.viewport;
    $$('.viewport-control [data-viewport]').forEach((item) => {
      const active = item.dataset.viewport === state.viewport;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }));

  stateSimulator.addEventListener('change', () => {
    state.simulatedState = stateSimulator.value;
    renderScreen();
  });

  $('#open-feedback').addEventListener('click', () => {
    const saved = JSON.parse(localStorage.getItem('direkt-prototype-feedback') || '{}');
    $('#feedback-understood').value = saved.understood || '';
    $('#feedback-confusing').value = saved.confusing || '';
    $('#feedback-action').value = saved.action || '';
    $('#feedback-status').textContent = '';
    feedbackDialog.showModal();
  });

  $('#save-feedback').addEventListener('click', (event) => {
    event.preventDefault();
    const payload = {
      understood: $('#feedback-understood').value.trim(),
      confusing: $('#feedback-confusing').value.trim(),
      action: $('#feedback-action').value.trim(),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('direkt-prototype-feedback', JSON.stringify(payload));
    $('#feedback-status').textContent = 'Saved in this browser only. Nothing was submitted.';
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (feedbackDialog.open) feedbackDialog.close();
      if (actionDialog.open) actionDialog.close();
    }
  });

  renderScreen();
})();

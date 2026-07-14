# DIREKT Design System

## Purpose

Provide consistent Android and operations-portal components that communicate trust accurately across devices, states and languages.

## Foundations

### Colour roles

Use semantic tokens rather than hard-coded screen colours:

- `primary`: core DIREKT actions;
- `onPrimary`;
- `surface`, `surfaceVariant`, `onSurface`;
- `success`: current approved check;
- `warning`: pending/expiring/action needed;
- `danger`: rejected/revoked/suspended/destructive;
- `info`: neutral explanation/location;
- `outline`, `disabled`.

All text/background pairs must meet WCAG contrast targets. Status always includes text/icon.

### Typography

Material 3 scale is the base. Critical status uses body-large or stronger. Captions never contain essential expiry or limitation text. Support font scaling and localization expansion.

### Spacing and shape

- 4dp base grid;
- 8/12/16/24/32dp common spacing;
- 48dp minimum touch target;
- moderate corner radius;
- elevation reserved for hierarchy, not decoration.

## Core components

### Verification check card
Fields:

- icon;
- check name;
- state label;
- reviewed/current date;
- expiry where relevant;
- short meaning;
- details action.

Variants: current, pending, action required, expiring, expired, unavailable.

### Provider summary card
- provider name/category;
- operating model;
- distance or service-area match;
- concise current checks;
- availability;
- review summary if threshold met;
- sponsored label where applicable.

### Area selector
- current/manual source;
- human-readable area;
- change action;
- permission state;
- never displays private evidence location.

### Evidence upload tile
- evidence type;
- requirement explanation;
- capture/select action;
- progress;
- validation;
- version/state;
- remove/replace based on policy.

### Status timeline
- chronological states;
- customer-safe/provider-safe messages;
- timestamps;
- next action;
- no private reviewer notes.

### Enquiry card
- service;
- safe area summary;
- state;
- provider/customer identity as permitted;
- last update;
- response action.

### Banner
Use for offline, stale cache, suspension, critical action, privacy or service degradation. Banners must be dismissible only when safe.

## Iconography

Use Material Symbols or approved vector assets. Icons must not imply government endorsement. The shield/check icon always carries an adjacent scoped label.

## Motion

- short, functional transitions;
- no celebratory verification animation that implies guarantee;
- honour reduced motion;
- upload/processing animation must not conceal duration or state.

## Component governance

Every new component requires:

- purpose;
- states;
- accessibility semantics;
- Android preview with synthetic data;
- portal equivalent if shared concept;
- tests;
- design-system documentation.

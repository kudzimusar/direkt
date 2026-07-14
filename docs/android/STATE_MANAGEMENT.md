# DIREKT Android State Management

## Model

Unidirectional data flow:

- user intent;
- ViewModel;
- use case/repository;
- immutable UI state;
- one-time effect only for navigation/system operations.

## UI state

State must explicitly represent:

- initial/loading;
- data;
- empty;
- refreshing;
- stale/offline;
- recoverable failure;
- permission blocked;
- unauthorized/session expired;
- submitting with duplicate-action prevention.

Do not encode state as unrelated booleans that allow impossible combinations.

## Events

User actions are functions/intents. One-time effects use a controlled channel/flow and survive/reconcile process loss where business-critical.

## Source of truth

- backend: trust, permissions, payment, publication;
- Room: cached public data, own draft/queue;
- DataStore: preferences;
- ViewModel: transient presentation.

## Time and IDs

Inject clock and ID generator for testing. Display local time but store/transport UTC.

## Error mapping

Network/database/domain errors map to typed user-safe states with correlation reference. Compose never parses raw exception text.

# DIREKT iOS Future Compatibility

## Rule

No iOS UI or build target is included in Android Version 1.

## Portability boundaries

Future iOS is enabled by:

- REST/OpenAPI independent of Android;
- stable domain/state semantics;
- server-owned trust and permissions;
- standards-based authentication;
- platform-neutral notification events;
- documented deep-link concepts;
- no Android-only data stored as authoritative business state;
- shared design tokens/concepts, not shared UI code.

## Explicit non-goals

- Kotlin Multiplatform adoption;
- Flutter/React Native;
- iOS placeholders in current Android code;
- compromising Android UX for hypothetical iOS reuse.

## Decision gate

See Phase 14 in `MASTER_BUILD_PLAN.md`. A future iOS project should be native unless a new architecture decision proves otherwise.

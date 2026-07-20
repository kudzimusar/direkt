# W8 Managed Public Functional Web Main Trigger

Purpose: dispatch the reviewed W8 public synthetic-only functional browser/BFF cutover from trusted `main` against this exact merged source.

Attempt: 6 — dedicated runtime deployment now passes preflight, API invoker binding, image build/push, Cloud Run deployment/runtime attachment, origin pinning, and IAM verification. The final public verification is split into auditable fail-closed phases so any remaining issue is isolated to direct API denial, public shell, PWA assets/offline, BFF discovery, synthetic session/private-state boundaries, or privacy evidence.

Scope: evidence trigger only. No Android, canonical API public exposure, real participant, external-provider, payment, Phase 11 exit or formal production-release authorization change.

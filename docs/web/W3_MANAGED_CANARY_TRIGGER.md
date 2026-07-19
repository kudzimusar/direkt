# W3 Managed Auth/Session Canary Trigger

**Purpose:** Execute the reviewed IAM-private synthetic browser authentication/session canary against the exact already-merged `main` base selected by the workflow.

**Scope:** Evidence only. This trigger contains no application, Android, backend, infrastructure or workflow implementation change.

The canary must deploy only the PR base SHA, keep API and web services IAM-private, exercise the W3 authentication/session closure criteria, remove temporary deployer Invoker grants, and must not activate Firebase Web phone authentication, real participants, public cutover or formal Phase 12 production release.

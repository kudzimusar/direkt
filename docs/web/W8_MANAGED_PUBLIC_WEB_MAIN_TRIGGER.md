# W8 Managed Public Functional Web Main Trigger

Purpose: dispatch the reviewed W8 public synthetic-only functional browser/BFF cutover from trusted `main` against this exact merged source.

Attempt: 8 — attempt 7 proved every managed W8 runtime, IAM, PWA, BFF, session and privacy check successfully. The only remaining defect was evidence promotion: the generated evidence file was not uploaded because the workflow used `hashFiles` against `runner.temp`. That promotion pipeline is now corrected and permanently guarded. This run must reproduce the successful managed verification and publish the exact public functional UI URL from the sanitized evidence artifact.

Scope: evidence trigger only. No Android, canonical API public exposure, real participant, external-provider, payment, Phase 11 exit or formal production-release authorization change.

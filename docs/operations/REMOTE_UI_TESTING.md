# DIREKT Remote UI Testing

## Owner-facing test surfaces

DIREKT uses separate remote surfaces because native Android, public customer/provider web UI and privileged operations have different security boundaries.

| Surface | Canonical entry | Audience | Data |
|---|---|---|---|
| Customer/provider PWA | `https://direkt.forum/app/` | owner/stakeholders/public pre-release reviewers | synthetic only |
| Documentation | `https://direkt.forum/` | public collaborators | non-sensitive |
| Native Android | Firebase App Distribution / GitHub build artifacts | named testers | approved test environment only |
| Operations portal | IAM-private Cloud Run staging | explicitly authorized operators | synthetic/private staging boundary |

## What the public PWA is for

Use it to evaluate:

- palette and brand direction;
- desktop/tablet/mobile layout;
- customer/provider navigation;
- discovery and provider profiles;
- check-specific trust language;
- provider workspace/evidence status concepts;
- enquiry and commercial lifecycle presentation;
- accessibility and offline shell behavior.

It is not evidence that a provider integration is live. Every gated function must remain labelled accordingly.

## Native Android testing

The real Android UI is compiled by GitHub Actions and can be distributed through Firebase App Distribution to `direkt-internal-testers`. This is the correct channel for device-specific behavior, Android permissions, Keystore/session storage, performance and future Play validation.

The public PWA complements Android; it does not replace native-device testing.

## Operations testing

The operations portal remains protected on Cloud Run staging. Do not publish it into the public Pages/PWA bundle. Browser access requires an approved identity/IAM path.

## Release discipline

A publicly reachable synthetic PWA does not authorize:

- real Firebase participant sign-in;
- public Cloud Run API access;
- real evidence upload;
- real contact handoff;
- Maps/private-location activation;
- production email/WhatsApp/push;
- money movement;
- production launch claims.

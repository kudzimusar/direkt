# DIREKT Remote UI Testing

## Owner-facing test surfaces

| Surface | Canonical entry | Audience | Data |
|---|---|---|---|
| Customer/provider PWA | `https://direkt.forum/app/` | owner/stakeholders/pre-release reviewers | synthetic only |
| Documentation | `https://direkt.forum/` | public collaborators | non-sensitive |
| Native Android | Firebase App Distribution / GitHub build artifacts | named testers | approved test environment only |
| Operations portal | IAM-private Cloud Run staging | explicitly authorized operators | protected staging boundary |

## Public PWA purpose

Use the PWA to evaluate palette/brand direction, desktop/tablet/mobile layout, customer/provider navigation, discovery/provider profiles, check-specific trust language, provider workspace/evidence-status concepts, enquiry/commercial presentation, accessibility and offline shell behavior.

It is not evidence that an external provider integration is live. Gated functions remain labelled.

## Native Android testing

The real Android UI is compiled by GitHub Actions and can be distributed through Firebase App Distribution to `direkt-internal-testers`. This remains the correct channel for Android permissions, secure device storage, native performance and future Play validation.

The PWA complements Android; it does not replace native-device testing.

## Operations testing

The operations portal remains protected on Cloud Run staging. Do not publish it into the public Pages/PWA bundle. Browser access requires an approved identity/IAM path.

## Release discipline

A publicly reachable synthetic PWA does not authorize real Firebase participant sign-in, public Cloud Run API access, real evidence upload, real contact handoff, Maps/private-location activation, production communications, money movement or production launch claims.

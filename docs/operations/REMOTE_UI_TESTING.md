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

## Owner UI regression checklist

After a promoted UI/integration checkpoint:

1. Open the PWA and confirm the synthetic-review notice is visible.
2. Test Customer mode: Discover, provider profile, Saved, Enquiries and Account.
3. Confirm trust is shown as individual scoped checks rather than a blanket “verified” label.
4. Open the sign-in explanation and confirm real participant sign-in remains gated.
5. Switch to Provider mode and test Overview, Evidence, Enquiries and Account.
6. Trigger the evidence/upload preview and confirm it remains a preview rather than a real upload.
7. Resize across desktop, tablet and narrow/mobile widths.
8. Test keyboard Tab/Shift+Tab plus Enter/Space on interactive provider/navigation elements.
9. Toggle light/dark theme and test the install prompt when supported.
10. After one online load, test the offline shell. Only the explicit static shell should be cached.
11. Confirm no real participant, payment, private evidence, private location or external-provider action is presented as active.

Expected result: the PWA is interactive for design/product review while real-data/provider actions remain disabled or explanatory.

## CI-packaged UI fallback

PWA CI packages the exact `site/app/**` build as a short-lived `direkt-pwa-review-*` artifact. Use that artifact when reviewing the exact commit before public static deployment or when DNS/browser routing is unavailable.

## Native Android testing

The real Android UI is compiled by GitHub Actions and can be distributed through Firebase App Distribution to `direkt-internal-testers`. This remains the correct channel for Android permissions, secure device storage, native performance and future Play validation.

The PWA complements Android; it does not replace native-device testing.

For an integration audit checkpoint, native regression is complete only after unit tests, lint, debug assembly and the merged release-manifest/Play Data Safety boundary pass.

## Operations testing

The operations portal remains protected on Cloud Run staging. Do not publish it into the public Pages/PWA bundle. Browser access requires an approved identity/IAM path.

The integration regression checkpoint also verifies portal formatting, lint, typecheck, tests and production build while keeping direct privileged data access out of the portal.

## Release discipline

A publicly reachable synthetic PWA does not authorize real Firebase participant sign-in, public Cloud Run API access, real evidence upload, real contact handoff, Maps/private-location activation, production communications, money movement or production launch claims.

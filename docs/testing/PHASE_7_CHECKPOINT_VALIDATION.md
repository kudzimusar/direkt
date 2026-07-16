# Phase 7 Exact-Head Checkpoint Validation

**Pull request:** #29  
**Exact validation head:** `5f6d68bd7e58a2d8e062609656b82df4c3eea1f8`  
**Governing issue:** #28

## Permanent workflow evidence

| Gate | Run | Result | Artifact digest |
|---|---:|---|---|
| Backend/PostGIS | #794 | Passed | `sha256:dd06072a341c8a34592f59500026f2397341d87986dece3d06752518ffbcce00` |
| Android | #290 | Passed | `sha256:dcbb0d89d020cb3855065ccad09998a7ca7778a2ae029be8e874d496b491a28d` |
| Operations portal | #384 | Passed | `sha256:c15bbd5ab72c528ae545e3c67fdc0f719c87b1632c7ce92bffb91e9390261a7c` |
| Documentation quality | #1283 | Passed | `sha256:27fbb826d895cfbacb971ac69783cad740a7d6189682cbdb426f4ab670a11980` |

## Retained Android artifacts

| Artifact | Digest |
|---|---|
| Debug APK | `sha256:c930dd9b16d0f8669ea836ec128cd6436e82bdf325c605c6be9c27a55dacee76` |
| Compose test APK | `sha256:a6a1140db0999a10dd310ed4b481f3ca8eb41eb919705c0c5d6ae8770eb9e925` |

## Verified scope

- backend formatting, lint, strict TypeScript, forward-only migrations, tests with coverage, production build and OpenAPI;
- Android preflight, unit tests, lint, debug APK and Compose test APK assembly;
- operations portal formatting, lint, strict TypeScript, tests with coverage, production build and API-only isolation;
- documentation quality checks;
- no unresolved PR comments, review threads or submitted reviews.

Phase 8 remains unclaimed and unauthorized. Real data, production credentials, storage, maps, messaging, payments, deployment and public pilot operation remain outside this checkpoint.

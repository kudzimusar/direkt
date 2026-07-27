# RC7 managed Google Maps proof trigger

STATUS=CONSUMED
CONFIRMATION=RUN-DIREKT-RC7-MAPS-MANAGED

Corrective trigger: the earlier backend API-key plus Public Cloud NAT design is prohibited because Google API traffic does not use the reserved NAT address for source-IP restriction. This trigger authorizes one fresh exact-current-main managed execution only after the reviewed service-identity OAuth correction merges and the owner bootstrap receipt is current.

The proof must use Geocoding API v4 with the assigned Cloud Run user-managed service identity and the narrow `maps-platform.geocode.address` OAuth scope. A backend Maps API key, backend Maps secret value, Direct VPC egress, Cloud Router, Cloud NAT and static egress address are not authorized.

This repository-controlled trigger does not authorize participant traffic, production authentication, private-location publication, Places, Routes, real communications, payments or production release.

Closure receipt: exact main `47285575862cbf08845eaeabe093afea1ea79bd1` passed managed run `30234521983/1`. Artifact `8641270327` has digest `sha256:24da53c0bd6fa885fa4a6814f70af090096192e6c5b7a03c89fba51416877fde`. Backend service-identity OAuth, final APK key restriction, API 36 map readiness and cleanup all passed; participant and production authorization remained false.

After terminal managed evidence is recorded, the closure change must replace `STATUS=ARMED` with `STATUS=CONSUMED` so later main pushes cannot repeat managed mutation automatically.

# RC7 managed Google Maps proof trigger

STATUS=ARMED
CONFIRMATION=RUN-DIREKT-RC7-MAPS-MANAGED

Corrective trigger: the earlier backend API-key plus Public Cloud NAT design is prohibited because Google API traffic does not use the reserved NAT address for source-IP restriction. This trigger authorizes one fresh exact-current-main managed execution only after the reviewed service-identity OAuth correction merges and the owner bootstrap receipt is current.

The proof must use Geocoding API v4 with the assigned Cloud Run user-managed service identity and the narrow `maps-platform.geocode.address` OAuth scope. A backend Maps API key, backend Maps secret value, Direct VPC egress, Cloud Router, Cloud NAT and static egress address are not authorized.

This repository-controlled trigger does not authorize participant traffic, production authentication, private-location publication, Places, Routes, real communications, payments or production release.

After terminal managed evidence is recorded, the closure change must replace `STATUS=ARMED` with `STATUS=CONSUMED` so later main pushes cannot repeat managed mutation automatically.

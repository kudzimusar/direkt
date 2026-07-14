# DIREKT Data Dictionary

This dictionary sets naming and sensitivity rules. Detailed columns are finalized with migrations.

| Domain field | Type/format | Sensitivity | Rule |
|---|---|---|---|
| `user_id` | UUID | Internal | opaque |
| `phone_e164` | string | Personal | encrypted/protected, masked |
| `email_normalized` | string | Personal | normalized, protected |
| `provider_id` | UUID | Internal | stable |
| `display_name` | string | Public after moderation | versioned |
| `provider_type` | enum | Public | sole trader/business/organization |
| `operating_model` | enum | Public | fixed/mobile/hybrid |
| `public_location` | PostGIS point/area | Public/coarsened | consent and precision |
| `private_location` | PostGIS point/address | Sensitive | restricted |
| `service_area` | geometry/place set | Public | provider-declared unless checked |
| `verification_check_type` | enum/key | Operational/public summary | controlled taxonomy |
| `verification_status` | enum | Operational/public subset | state machine |
| `evidence_object_key` | string | Highly sensitive | private storage |
| `decision_reason_code` | key | Restricted/public mapped copy | controlled |
| `amount_minor` | bigint | Financial | no floating point |
| `currency` | ISO code | Financial | initially ZMW |
| `audit_actor_id` | UUID/system | Restricted | immutable event |
| `occurred_at` | timestamptz | Internal | UTC |

## Classification

- Public
- Internal
- Personal
- Sensitive
- Highly sensitive/restricted
- Financial
- Security secret

Every new field requires purpose, classification, retention, visibility and audit consideration.

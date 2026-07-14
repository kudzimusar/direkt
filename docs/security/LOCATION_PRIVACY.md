# DIREKT Location Privacy

## Rules

- background customer location prohibited in Version 1;
- manual search area always available;
- exact provider home/base private by default;
- public storefront pin requires consent and operational suitability;
- field visit coordinates restricted;
- logs/analytics coarse;
- support exports omit exact location unless purpose-authorized;
- change of checked location triggers recheck/public state review.

## Precision levels

- country/province/district/locality;
- approximate map area;
- public exact premises;
- private exact evidence.

API DTOs use explicit types so private points cannot be accidentally serialized as public.

## Customer enquiries

Initial enquiry shares area, not exact household address. Customer may share exact details directly after evaluating provider and consenting.

## Safety review

Consider stalking, domestic violence, provider home safety, employee exposure and field-agent risk.

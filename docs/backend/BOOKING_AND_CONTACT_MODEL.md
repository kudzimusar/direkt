# DIREKT Booking and Contact Model

## MVP choice

Use structured enquiries and tracked contact handoff rather than full booking/payment or unrestricted chat.

## Enquiry fields

- customer/provider;
- service;
- safe area;
- preferred timeframe;
- description;
- attachments only if approved;
- contact-sharing consent;
- state;
- timestamps;
- abuse/safety flags.

## States

`DRAFT → SUBMITTED → DELIVERED → VIEWED → RESPONDED → CONTACTED → COMPLETED/CLOSED/EXPIRED/CANCELLED`

State transitions are append-only events. “Completed” may be customer/provider-confirmed or inferred only according to documented rule.

## Contact sharing

- customer chooses channel/data;
- provider receives only consented details;
- app launches dialer/message;
- exact household address is not required at initial enquiry;
- record handoff without reading external communications.

## Full chat decision

Deferred unless research shows it is essential for safety/accountability and operations can moderate/support it.

## Future booking

If added, model appointments, quotes, cancellation and payment separately rather than overloading enquiry state.

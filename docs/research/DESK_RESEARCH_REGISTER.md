# DIREKT Phase 1A Desk Research Register

**Purpose:** Record preliminary official-source findings that shape field questions.  
**Rule:** Desk research identifies candidate checks and authorities; it does not approve production access, legal use, provider competence or public trust language.

## Source-quality labels

- `OFFICIAL-PRIMARY` — official authority, regulator, legislature or issuing body;
- `OFFICIAL-SECONDARY` — official publication summarizing another official source;
- `ACADEMIC` — research used to frame questions, not legal or operational authority;
- `INDUSTRY` — provider or commercial documentation requiring independent confirmation.

## Register

| ID | Accessed | Source | Quality | Relevant finding | DIREKT implication | Limitation / required follow-up |
|---|---|---|---|---|---|---|
| DR-001 | 2026-07-14 | [PACRA](https://www.pacra.org.zm/) | OFFICIAL-PRIMARY | PACRA describes itself as Zambia’s official registry for business entities, intellectual property and securities, and provides a public business search link. | Business-registration matching may be a candidate check for registered providers. | Confirm search terms, result fields, reliability, terms, data-protection basis, permissible caching/display and whether an API or written agreement is needed. Registration does not prove trade competence or active operation. |
| DR-002 | 2026-07-14 | [PACRA business search](https://search.pacra.org.zm/) | OFFICIAL-PRIMARY | A business search service is linked from PACRA’s official site. | Phase 1A should test whether customers value registration and whether providers can supply matching names. | Do not automate, scrape or republish until terms and permitted usage are confirmed. Test sole traders and trading-name mismatches. |
| DR-003 | 2026-07-14 | [National Council for Construction](https://www.ncc.org.zm/) | OFFICIAL-PRIMARY | NCC states that it regulates and builds capacity in Zambia’s construction industry and registers contractors, suppliers and manufacturers. | NCC status may be relevant to some construction firms or contractors. | Determine which DIREKT categories, grades and job values fall within NCC scope. Do not apply contractor registration rules automatically to every individual artisan. |
| DR-004 | 2026-07-14 | [NCC registered contractors and suppliers](https://www.ncc.org.zm/) | OFFICIAL-PRIMARY | The official site links registration information and registered-contractor/supplier/manufacturer records. | Candidate issuer-confirmation route for applicable construction entities. | Confirm data fields, renewal status, lookup method, consent and public-display language. Current registration does not guarantee workmanship. |
| DR-005 | 2026-07-14 | [TEVETA Zambia](https://www.teveta.org.zm/) | OFFICIAL-PRIMARY | TEVETA states that it regulates, monitors and coordinates technical, vocational and entrepreneurship training and links certification and accreditation systems. | TEVETA-issued or supervised credentials may be relevant for selected trades. | Confirm credential types, individual verification process, legacy formats, trade-test coverage, revocation/expiry and permitted platform use. A training credential must not be presented as a guarantee of current skill. |
| DR-006 | 2026-07-14 | [TEVETA certification system](https://certification.teveta.org.zm:442/) | OFFICIAL-PRIMARY | TEVETA links an online certification system from its official site. | Potential candidate for issuer confirmation or provider self-service validation. | Confirm availability, authentication, public access, data fields and integration rights directly with TEVETA. |
| DR-007 | 2026-07-14 | [National Assembly of Zambia](https://www.parliament.gov.zm/) | OFFICIAL-PRIMARY | The National Assembly site provides Laws of Zambia, Acts and Bills sections. | Legal research should cite enacted law and current official instruments, not blog summaries. | Qualified Zambian counsel must confirm applicable privacy, consumer, electronic-transactions, evidence, employment, tax and sector rules. |
| DR-008 | 2026-07-14 | [Bank of Zambia](https://www.boz.zm/) | OFFICIAL-PRIMARY | Bank of Zambia is the candidate authority for payment-system and mobile-money regulatory research. | Payment-provider selection and money-flow architecture require current BoZ sources and approved providers. | The accessible homepage did not expose sufficient report detail during initialization. Obtain current payment-system reports and legal guidance before selecting an integration. |
| DR-009 | 2026-07-14 | [ZICTA](https://www.zicta.zm/) | OFFICIAL-PRIMARY | ZICTA is the candidate ICT/communications authority for sector statistics, numbering, electronic communications and consumer issues. | Device/connectivity, OTP/SMS and communications research should use current ZICTA publications where available. | The site was not reliably retrievable during initialization. Obtain current official market reports and verify vendor obligations before decisions. |
| DR-010 | 2026-07-14 | [Zambia Data Protection Commissioner](https://www.dataprotection.gov.zm/) | OFFICIAL-PRIMARY | The office is the candidate authority for current data-protection guidance and registration/compliance questions. | Identity, certificates, private coordinates and complaints require a formal privacy basis and controls. | The site was not reliably retrievable during initialization. Obtain the current Act, regulations, guidance and counsel review. Do not treat consent as the only possible legal requirement. |

## Preliminary authority map

| Claim or data type | Candidate authority/source | Current status |
|---|---|---|
| Business/entity registration | PACRA | Official source identified; permitted verification workflow unconfirmed |
| Construction contractor status | NCC | Official source identified; category applicability unconfirmed |
| Technical/vocational qualification | TEVETA and relevant issuing institution | Official source identified; credential-level confirmation unconfirmed |
| Professional engineering status | Engineering Institution of Zambia / relevant statutory framework | Research required |
| Electrical contractor/installation authority | Relevant energy, engineering, local-authority or utility rules | Research required; do not guess |
| Motor mechanic qualification | TEVETA/training institutions/industry evidence | Research required |
| Tax registration | Zambia Revenue Authority, where legally relevant | Research required; avoid unnecessary collection |
| Identity | Approved identity process and lawful source | Legal/operational research required |
| Payment and mobile money | Bank of Zambia and approved providers | Current provider/rules research required |
| SMS/OTP and communications | ZICTA plus approved vendors | Current technical/regulatory research required |
| Personal data and private location | Data Protection Commissioner, enacted law and counsel | Legal review required |
| Consumer complaints and public claims | Applicable consumer/competition authorities and counsel | Legal review required |

## Source-use rules

1. Capture the publication date and version when using a report or legal instrument.
2. Prefer official registries and enacted instruments over search-engine summaries.
3. Preserve an archived citation or document reference privately where permitted.
4. Record unavailable or unreliable systems as operational risk.
5. Do not build scraping or automated lookup before permission and usage terms are confirmed.
6. Do not infer competence, safety or current activity from registration alone.
7. Do not expose identifiers returned by official systems unless necessary, lawful and approved.
8. Re-check sources at Phase 1A exit and before production integration.

## Next desk-research assignments

- obtain current ZICTA ICT market/device/connectivity statistics;
- obtain current Bank of Zambia payment-system and mobile-money reports;
- obtain the current Data Protection Act, regulations and official guidance;
- determine category-specific licensing and professional requirements;
- inspect PACRA, NCC and TEVETA lookup workflows with synthetic or authorized test cases;
- confirm whether written data-sharing agreements are required;
- map local-authority business-licence and premises requirements for candidate pilot areas;
- record official contacts for authority interviews without publishing personal contact data.
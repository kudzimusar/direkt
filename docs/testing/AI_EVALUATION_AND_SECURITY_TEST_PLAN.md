# DIREKT AI Evaluation and Security Test Plan

**Status:** Required before any production AI use case is marked active  
**Parent architecture:** `docs/architecture/AI_PRODUCT_ARCHITECTURE.md`  
**Parent programme:** `docs/product/WORLD_CLASS_PRODUCT_AND_AI_PLAN.md`

## 1. Purpose

Provide a repeatable test and release framework for every DIREKT AI feature so model output is evaluated as software behavior rather than accepted because it appears plausible in a demo.

This plan covers:

- customer discovery assistance;
- provider onboarding assistance;
- public provider comparison/explanation;
- documentation-grounded support;
- evidence quality/OCR assistance;
- operations case assistance;
- review/complaint moderation assistance;
- fraud/anomaly signals;
- recommendation/ranking intelligence;
- analytics/taxonomy proposals.

## 2. Governing rule

No AI feature is production-ready until the exact configured model/provider/prompt/use-case version passes the tests appropriate to its risk.

A model or prompt change is a behavior change and may require re-evaluation even when application code is unchanged.

## 3. Test layers

Every use case is evaluated across:

1. deterministic contract and schema;
2. offline quality/grounding;
3. safety/security;
4. privacy/data boundary;
5. fairness/bias where relevant;
6. latency/cost/resilience;
7. human-factors/product usefulness;
8. integration/regression;
9. managed canary/observability before broader activation.

## 4. Evaluation dataset policy

Default datasets use:

- synthetic provider/customer/account data;
- synthetic documents/evidence-like fixtures;
- public-safe product/category/help content;
- adversarial synthetic prompts;
- synthetic Zambia locality/service terminology where representative.

Real participant or restricted evidence is not placed into repository fixtures or external model evaluation by default.

Any real-data evaluation requires:

- approved purpose;
- minimum necessary fields;
- legal/privacy/data-processing review;
- secure access/storage;
- retention/deletion rule;
- no public artifact leakage.

## 5. Dataset structure

Each AI use case should maintain versioned cases containing, as applicable:

- input/context;
- caller role/scope;
- expected allowed behavior;
- expected prohibited behavior;
- expected structured fields;
- acceptable answer classes;
- required canonical facts/source references;
- known ambiguity;
- adversarial variants;
- demographic/language/context slices where fairness is relevant.

Do not overfit the test set by embedding exact expected wording into prompts.

## 6. Contract and schema tests

Verify:

- use-case key is allow-listed;
- caller role/scope is enforced;
- allowed input fields are validated;
- prohibited fields are rejected/minimized;
- output schema validates;
- unknown tool/action types are rejected;
- malformed model output falls back safely;
- model cannot introduce unsupported domain fields;
- canonical IDs/state are resolved by server logic, not invented by the model.

## 7. Customer discovery quality

Measure:

- intent/category top-1 and top-k accuracy;
- clarification usefulness;
- query expansion relevance;
- no-result recovery quality;
- unsupported category hallucination rate;
- manual correction rate;
- completion/abandonment impact.

Test examples include:

- direct service request;
- symptom/problem description;
- ambiguous multi-trade problem;
- slang/local phrasing;
- misspellings;
- mixed English/local terms where supported;
- irrelevant or unsafe requests;
- emergency-like language requiring safe limitation rather than false dispatch.

Pass condition must be use-case specific and documented before activation.

## 8. Provider comparison and explanation quality

Verify that generated explanations:

- use only approved public-safe facts;
- do not invent credentials/reviews/availability/location;
- do not convert a missing/pending check into a positive claim;
- do not imply guarantee/safety/government approval;
- distinguish relevance from trust;
- preserve sponsored-placement disclosure where applicable;
- remain consistent with deterministic ranking inputs actually used.

Material trust-fact hallucination is a release blocker.

## 9. Provider onboarding quality

Measure:

- requirement explanation accuracy;
- category suggestion usefulness;
- draft-copy factual fidelity to provider input;
- unsupported claim insertion rate;
- correction/edit rate;
- provider confirmation flow.

Generated public copy must never invent:

- licences/qualifications;
- years of experience;
- service coverage;
- guarantees;
- awards/affiliations;
- verification state.

## 10. Evidence/OCR assistance quality

This use case remains disabled until restricted-data approval exists.

Evaluate:

- document-type candidate accuracy;
- field extraction precision/recall;
- date/name/registration-number extraction;
- unreadable/crop/blur detection;
- confidence calibration;
- duplicate/anomaly signal quality;
- cross-field mismatch suggestions;
- reviewer correction rate.

Rules:

- extracted values remain `candidate` until confirmed;
- model output cannot satisfy a verification requirement by itself;
- final decisions remain human/policy controlled;
- false positive/negative impact must be measured before queue prioritization use.

## 11. Operations copilot quality

For case summaries/checklists/draft explanations, test:

- canonical fact coverage;
- contradiction rate;
- omission of critical dates/state/history;
- confusion between allegation and finding;
- confusion between prior/current evidence;
- private/public note separation;
- reason-code semantic fidelity;
- operator correction rate;
- time saved without decision-quality degradation.

The UI must let reviewers inspect source facts/evidence directly.

## 12. Support assistant grounding

Verify:

- answers are grounded in approved documentation;
- policy/version-sensitive answers use current sources;
- account-specific responses are authorized to the caller;
- unsupported questions produce limitation/escalation rather than fabrication;
- legal/emergency/financial advice boundaries are respected;
- human/manual support path remains available.

Measure grounded-answer rate and unsupported-answer refusal/escalation quality.

## 13. Moderation and risk signals

Evaluate separately for each signal type.

Metrics may include:

- precision/recall;
- false positive rate;
- false negative rate;
- severity calibration;
- protected/context slices where applicable;
- reviewer override/correction rate;
- downstream enforcement impact.

No risk signal is treated as automatic guilt or final enforcement decision.

## 14. Recommendation/ranking evaluation

Use offline and shadow evaluation before live impact.

Test:

- deterministic eligibility precedes ML/AI scoring;
- private mobile-provider base location is never used improperly;
- payment does not create trust/relevance authority;
- service/category fit;
- locality/service-area compatibility;
- freshness;
- trust-signal currentness;
- diversity of useful results;
- no hidden sponsored placement;
- stability/reproducibility within intended model behavior;
- fallback deterministic ranking.

Where ranking can materially affect provider opportunity, evaluate fairness across relevant provider pathways/operating models/categories/geographies without using sensitive traits as unjustified optimization targets.

## 15. Prompt-injection tests

Test direct and indirect attacks including:

- `ignore previous instructions`;
- fake system/developer instructions in user input;
- malicious provider descriptions;
- malicious review text;
- malicious uploaded-document text/OCR;
- malicious retrieved documentation/web/registry text;
- encoded/obfuscated instructions;
- role-play/jailbreak attempts;
- tool-call coercion;
- data-exfiltration prompts.

Expected behavior:

- untrusted content remains data;
- system/use-case instructions remain authoritative;
- unauthorized tools/actions are impossible;
- secrets/private context are not disclosed;
- safe fallback/escalation occurs.

## 16. Sensitive-information disclosure tests

Attempt to extract:

- system prompts;
- model credentials;
- tokens/session data;
- private evidence;
- raw contacts;
- exact private coordinates;
- reviewer-private notes;
- other tenant/provider data;
- hidden retrieved context.

Zero tolerance for unauthorized restricted-data disclosure.

## 17. Tool/function and excessive-agency tests

Where AI can propose actions:

- call an unknown tool;
- call an allowed tool with unauthorized provider/user scope;
- alter protected fields;
- skip required confirmation;
- chain actions to escalate privilege;
- trigger repeated costly actions;
- attempt final verification/payment/complaint decisions;
- manipulate role/permission state.

Expected:

- server rejects unauthorized/unknown actions;
- high-impact actions require normal deterministic preconditions and human confirmation;
- AI cannot widen its own permissions.

## 18. Retrieval/vector authorization tests

If retrieval/embeddings are introduced:

- cross-tenant/provider queries;
- role-restricted documents;
- deleted/revoked source material;
- prompt injection embedded in retrieved content;
- nearest-neighbor leakage across authorization boundaries;
- stale policy/document versions;
- metadata filter bypass.

Authorization filtering must occur independently of similarity scoring.

## 19. Misinformation and uncertainty tests

Test ambiguous, incomplete and conflicting cases.

The model should:

- preserve uncertainty;
- ask clarifying questions where appropriate;
- use `unknown/not available` rather than fabricate;
- distinguish canonical fact from inference;
- avoid overconfident trust/safety language.

## 20. Fairness and bias tests

Apply proportionately to use cases that rank, prioritize, moderate or create opportunity/risk signals.

Check for unjustified differences by relevant slices such as:

- provider pathway (registered/qualified/experienced informal);
- fixed/mobile/hybrid operating model;
- geography/urban-peri-urban context;
- language/wording quality;
- newer providers with limited reviews;
- category type.

Do not infer or optimize on protected traits without explicit lawful justification.

Document known limitations and mitigation.

## 21. Latency, cost and rate tests

For every use case define:

- target p50/p95 latency;
- hard timeout;
- retry policy;
- maximum context/output size;
- cost budget per successful task;
- user/account/IP/use-case rate limits as appropriate;
- concurrency limits;
- circuit breaker/kill switch.

Test:

- model timeout;
- provider 429/5xx;
- malformed response;
- partial streaming failure where streaming is used;
- cost-threshold breach;
- retry storm;
- denial-of-wallet/unbounded request patterns.

## 22. Resilience and fallback tests

Force:

- primary model outage;
- all model providers unavailable;
- retrieval unavailable;
- model safety refusal;
- low-confidence/invalid output;
- AI kill switch on.

Core flows must remain usable through deterministic/manual alternatives.

## 23. Observability validation

Verify telemetry captures only approved metadata such as:

- use-case key;
- correlation ID;
- provider/model/version;
- prompt/template version;
- latency;
- usage/cost estimate;
- success/fallback/error class;
- safety/validation result;
- human correction/confirmation state where appropriate.

Verify logs do not contain:

- secrets;
- raw restricted evidence;
- unnecessary private contact/location data;
- full sensitive prompts/responses by default.

## 24. Human evaluation

Before material user impact, run structured human review appropriate to the use case.

Examples:

- customer comprehension of suggestions;
- provider understanding of requirements;
- reviewer trust in summaries without automation bias;
- clarity that AI is advisory;
- language/locality appropriateness;
- whether users can recover easily when AI is wrong.

Do not measure success only by `accepted suggestion`; users may over-trust confident output.

## 25. Model/prompt regression matrix

Re-run relevant suites when any of these changes:

- model family/version;
- provider;
- system prompt;
- use-case instructions;
- tool schema;
- retrieval corpus/filtering;
- embedding model;
- output schema;
- ranking features/weights;
- safety filters;
- data-classification policy.

Record exact versions with test results.

## 26. CI and managed evidence

Recommended layers:

### Pull request

- schema/contract/unit tests;
- deterministic fake-model tests;
- prompt/template lint/security assertions;
- small offline golden/adversarial evaluation subset;
- no-secret/data-classification checks.

### Protected managed evaluation

- exact configured model/provider;
- larger quality/safety/adversarial suite;
- latency/cost metrics;
- managed canary using synthetic/public-safe data first;
- restricted-data canary only after explicit approval.

CI must not expose model credentials or private evaluation data.

## 27. Release evidence template

Each activated use case records:

- use-case key/version;
- owner;
- model/provider/version;
- prompt/template version;
- data classes;
- evaluation dataset version;
- quality metrics/results;
- security/adversarial results;
- fairness results where applicable;
- latency/cost results;
- fallback/kill-switch result;
- human-evaluation findings;
- managed canary evidence;
- known limitations;
- approval decision.

## 28. Stop conditions

Do not activate an AI use case when:

- material factual/trust hallucinations exceed the approved threshold;
- prompt injection can change authority/tool behavior;
- restricted data can leak;
- cross-scope retrieval is possible;
- fallback is broken;
- high-impact action can occur without human/deterministic confirmation;
- false positives create unacceptable trust/safety harm;
- cost/latency cannot be bounded;
- model/provider data terms are not approved;
- monitoring/kill switch is absent;
- real participant data would be required before the corresponding Phase 11/legal gate.

## 29. Standards references

Use as external guidance:

- NIST AI Risk Management Framework;
- NIST Generative AI Profile;
- OWASP GenAI/LLM Top 10;
- existing DIREKT threat model/privacy/security/testing controls.

Repository-specific authority, Zambia requirements and real pilot evidence remain controlling.
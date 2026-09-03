# MyChappie HyperMarketing — Functionality Catalog

This document is the canonical inventory of product, protocol, semantic, runtime, decisioning, integration, storage, governance and research functionalities for **MyChappie HyperMarketing / AHMP**.

It distinguishes what is already available from what is partially implemented and what is planned. The catalog is intended to guide implementation, conformance, roadmap planning and future AllasCode projections.

## Status legend

| Status | Meaning |
| --- | --- |
| `IMPLEMENTED` | Available in the repository with executable or normative artifacts. |
| `PARTIAL` | Core behavior or specification exists, but the full production path is incomplete. |
| `SPECIFIED` | Normative design exists, but the executable implementation is not complete. |
| `PLANNED` | Accepted roadmap functionality that still needs design and/or implementation. |
| `RESEARCH` | Candidate functionality that requires experimentation, formalization or benchmarking before becoming normative. |

---

# 1. Consumer-governed marketing

## 1.1 Demand Contract

**Status:** `IMPLEMENTED / PARTIAL`

The consumer has a machine-readable contract that controls which marketing interactions may reach them.

Current model supports:

- consumer identity;
- explicit purchase intents;
- allowed categories;
- blocked categories;
- accepted channels;
- accepted modalities;
- contact windows;
- complementary discovery enable/disable;
- maximum discovery presentations per week;
- interruption budget;
- selective disclosure preference;
- contract versioning.

The Demand Contract is a hard governance layer. Merchant ranking, bids, bandit scores or recommendation confidence must never override an explicit consumer constraint.

### Future extensions

**Status:** `PLANNED`

- minimum and maximum price ranges by category;
- preferred brands and blocked brands;
- preferred merchants and blocked merchants;
- geographic constraints;
- maximum delivery time;
- sustainability preferences;
- local-only preference;
- refurbished/used/new condition preferences;
- recurring purchase declarations;
- budget periods;
- household/shared demand contracts;
- temporary intents with automatic expiration;
- delegated preferences managed by a Personal Agent;
- category-specific communication rules;
- per-merchant frequency caps;
- privacy sensitivity levels;
- user-defined utility weights.

---

# 2. Explicit intent marketing

## 2.1 Intent Offer

**Status:** `PARTIAL`

Businesses may submit offers that satisfy a consumer's declared intent instead of targeting the consumer through inferred advertising audiences.

Examples:

- `I want a notebook up to R$ 4,500`;
- `I need dog food this week`;
- `I am looking for a PlayStation controller`;
- `I want delivery in less than 24 hours`.

The current eligibility engine can compare an offer against explicit product/category intents and maximum price constraints.

### Future

**Status:** `PLANNED`

- intent negotiation;
- intent marketplace;
- multiple merchants competing for one intent;
- consumer-side ranking by total utility;
- intent expiration and fulfillment events;
- intent pause/resume;
- intent splitting into sub-intents;
- group-buy intents;
- reverse auction flows;
- anonymous intent publication;
- agent-to-agent intent negotiation.

---

# 3. Purchase-aware advertising suppression

## 3.1 Already-owned suppression

**Status:** `IMPLEMENTED`

When a consumer already owns a durable product, identical offers can be suppressed.

```text
Purchase(console)
→ Ownership state
→ Offer(console)
→ ALREADY_OWNED
→ not eligible
```

## 3.2 Subscription suppression

**Status:** `IMPLEMENTED`

An active subscription suppresses redundant offers while it remains active.

## 3.3 Consumable replenishment window

**Status:** `IMPLEMENTED / PARTIAL`

Consumables and quantity-sensitive products can remain suppressed until their configured replenishment window is reached.

### Future lifecycle functionality

**Status:** `PLANNED`

- learned replenishment intervals;
- quantity-aware depletion estimates;
- household consumption modeling;
- seasonality-aware replenishment;
- subscription renewal offers;
- service renewal windows;
- ownership transfer/removal;
- product replacement lifecycle;
- warranty expiration triggers;
- maintenance cycles;
- replacement-before-failure predictions.

---

# 4. Complementary-product discovery

## 4.1 Complement graph

**Status:** `IMPLEMENTED / PARTIAL`

Products may declare semantic complement relationships with confidence values.

```text
Console
├─ Headset
├─ Controller
├─ Charging dock
└─ Game
```

## 4.2 Complement-only discovery

**Status:** `SPECIFIED / PARTIAL`

The Demand Contract can require that discovery offers be complementary to known ownership or intent context.

### Future

**Status:** `PLANNED`

- automatic complement graph extraction from catalogs;
- LLM-assisted complement classification;
- knowledge-graph complement inference;
- compatibility constraints;
- accessory/device compatibility validation;
- complement confidence calibration;
- merchant-independent complement ontology;
- substitutes vs complements classifier;
- complement chains;
- bundle discovery;
- complement timing models;
- semantic compatibility proofs.

---

# 5. Eligibility engine

## 5.1 Deterministic pre-qualification

**Status:** `IMPLEMENTED`

The engine evaluates hard constraints before an offer reaches any probabilistic optimizer.

Current eligibility reasons include:

- `ALREADY_OWNED`;
- `BLOCKED_CATEGORY`;
- `EXPLICITLY_REJECTED`;
- `PRICE_NOT_ELIGIBLE`;
- `TIMING_NOT_ALLOWED`;
- `CHANNEL_NOT_ALLOWED`;
- `MODALITY_NOT_ALLOWED`;
- `INTERRUPTION_BUDGET_EXHAUSTED`;
- `DISCOVERY_BUDGET_EXHAUSTED`;
- `OFFER_EXPIRED`;
- `INVALID_OFFER`;
- `CONSTRAINT_NOT_SATISFIED`.

## 5.2 AtomicBehavior: `Offer.evaluateEligibility`

**Status:** `IMPLEMENTED`

Implemented according to the AllasCode atomic behavior structure with `README.md`, `manifest.yml`, `config.yml`, schemas, specifications, `Ok/Error` events and a TypeScript projection.

A valid business rejection is `Ok { eligible: false }`, not a technical error.

### Future eligibility rules

**Status:** `PLANNED`

- stock availability;
- shipping coverage;
- delivery SLA;
- seller reputation;
- legal/regulatory eligibility;
- age restrictions;
- geography;
- consumer affordability rules;
- warranty requirements;
- merchant blocklist;
- duplicate campaign suppression;
- repetition fatigue;
- recent rejection cooldown;
- household duplicate ownership;
- policy-as-code eligibility plugins.

---

# 6. Contextual Multi-Armed Bandit decisioning

## 6.1 Conservative contextual bandit

**Status:** `IMPLEMENTED / PARTIAL`

The TypeScript reference implements a Conservative LinUCB-style policy.

Current action families:

- `intent`;
- `complement_discovery`;
- `replenishment`;
- `baseline`;
- `bundle`;
- `discount`;
- `no_action`.

## 6.2 AtomicBehavior: `Marketing.selectNextBestOffer`

**Status:** `IMPLEMENTED`

Only prequalified candidates should reach this behavior.

```text
Candidate
→ Eligibility
→ PrequalifiedCandidate
→ Bandit
```

## 6.3 Baseline safety

**Status:** `IMPLEMENTED`

Exploration can fall back to baseline, replenishment or `no_action` candidates when exploration does not satisfy the conservative safety margin.

## 6.4 `no_action` as an arm

**Status:** `IMPLEMENTED`

The system may decide that the best marketing action is to not interrupt the consumer.

### Future bandit functionality

**Status:** `PLANNED / RESEARCH`

- Thompson Sampling;
- contextual Thompson Sampling;
- neural contextual bandits;
- hierarchical bandits;
- cascading bandits;
- constrained/safe bandits;
- non-stationary bandits;
- delayed reward handling;
- multi-objective reward optimization;
- per-consumer vs shared/global bandits;
- federated bandit learning;
- cold-start priors;
- transfer learning between categories;
- learned exploration budgets;
- exploration fatigue penalty;
- counterfactual offline evaluation;
- propensity logging;
- IPS/SNIPS/DR estimators;
- online policy experiments;
- safety rollback.

---

# 7. Recovery after rejection

**Status:** `SPECIFIED / PARTIAL`

A rejected discovery offer changes the context for the next decision.

The protocol rejects this rule:

```text
Rejected
→ automatic bigger discount
```

Instead:

```text
Rejected
→ new context
→ recovery candidate generation
→ next-best-action decision
```

Recovery candidates can include a known product, replenishment, another complement, bundle, discount variation or `no_action`.

### Future

**Status:** `PLANNED`

- `Recovery.generateCandidates` AtomicBehavior;
- rejection cooldown;
- rejection reason classification;
- repeated rejection suppression;
- recovery budget;
- fatigue penalty;
- configurable recovery policy;
- merchant counteroffer path;
- cross-merchant recovery.

---

# 8. Dynamic discount decisioning

**Status:** `SPECIFIED / PARTIAL`

Discount is modeled as a candidate action family, never as an automatic reward for rejecting a previous offer.

### Future

**Status:** `PLANNED / RESEARCH`

- price-elasticity estimation;
- minimum merchant margin constraints;
- discount budget;
- personalized discount arms;
- bundle-vs-discount optimization;
- margin-aware rewards;
- merchant floor price;
- reverse negotiation;
- auction-based discounts;
- consumer-surplus optimization.

---

# 9. Next Best Action / Next Best Offer

## 9.1 Next Best Offer

**Status:** `IMPLEMENTED / PARTIAL`

The system can select the best eligible marketing candidate for the current consumer context.

## 9.2 Next Best Action

**Status:** `SPECIFIED`

The next action may eventually be an offer, clarification, counteroffer, delayed contact, replenishment, bundle, modality change, channel change, permission request or `no_action`.

### Future

- action utility model;
- channel selection model;
- modality selection model;
- send-time optimization;
- action sequencing;
- dynamically generated journeys.

---

# 10. B2A Marketing

**Status:** `SPECIFIED / PARTIAL`

Businesses submit structured offers to a consumer-side agent or neutral broker instead of directly purchasing human attention.

Core principle:

> The merchant must prove to the consumer agent that an offer deserves human attention.

Current consumer-side eligibility protects the human from merchant optimization.

Selective disclosure is specified so the agent may reject an offer without revealing a private constraint value.

### Future B2A capabilities

- MerchantMarketingAgent;
- ConsumerAgent;
- neutral MarketingBrokerAgent;
- agent-to-agent counteroffers;
- machine-readable campaign objectives;
- privacy-preserving negotiation;
- agent reputation and authorization;
- signed offers, decisions and consumer mandates;
- merchant capability discovery;
- B2A campaign lifecycle.

---

# 11. AHMP — Agentic HyperMarketing Protocol

**Status:** `IMPLEMENTED / SPECIFIED`

AHMP defines machine-readable contracts for Demand Contract, Offer Proposal, Decision, Feedback, Purchase, event envelope, discovery metadata and framework configuration.

It is transport-independent. Bindings are documented for REST/OpenAPI, A2A, MCP and event/queue transports.

### Future protocol work

- formal version negotiation;
- capability discovery;
- signatures;
- replay protection;
- error taxonomy;
- canonical media types;
- executable conformance suite;
- interoperability certification;
- compatibility rules;
- extension registry;
- standard rejection reasons.

---

# 12. UCP interoperability

**Status:** `SPECIFIED`

AHMP handles marketing qualification; UCP can take over when the consumer enters the commerce/checkout flow.

### Future

- UCP profile discovery;
- catalog ingestion;
- offer-to-UCP product mapping;
- checkout handoff;
- order state → AHMP feedback;
- purchase → ownership update.

---

# 13. A2A interoperability

**Status:** `SPECIFIED`

An A2A Agent Card/extension example exists for exposing AHMP capabilities.

### Future

- complete A2A task bindings;
- MerchantAgent ↔ ConsumerAgent negotiation;
- streaming counteroffers;
- capability negotiation;
- authenticated identities;
- consent-bound tasks.

---

# 14. MCP interoperability

**Status:** `SPECIFIED`

The repository defines AHMP-oriented MCP operations such as evaluating offers and recording feedback/purchases.

### Future

- catalog tool;
- inventory tool;
- pricing tool;
- complement discovery tool;
- explanation tool;
- selectively disclosed preference query;
- conformance MCP server.

---

# 15. AP2 interoperability

**Status:** `SPECIFIED`

Payment authority is handed off to AP2 rather than reimplemented inside AHMP.

### Future

- accepted offer → AP2 mandate;
- payment outcome → purchase;
- failed-payment feedback;
- delegated spending limits;
- agent spending constraints.

---

# 16. Storage abstraction

## JSON files

**Status:** `IMPLEMENTED`

The reference runtime can operate directly on `.json` collections.

## Database gateway

**Status:** `IMPLEMENTED / PARTIAL`

The core depends on a generic gateway instead of PostgreSQL, MongoDB or another concrete database.

## In-memory adapter

**Status:** `IMPLEMENTED`

Used by tests and lightweight execution.

### Future

- PostgreSQL/MongoDB/SQLite/EventStore adapters;
- append-only event log;
- CQRS projections;
- transactions;
- optimistic concurrency;
- schema migrations;
- encrypted local storage;
- offline-first synchronization.

---

# 17. AllasCode semantic architecture

**Status:** `IMPLEMENTED / PARTIAL`

```text
allascode.semantics/
= canonical business meaning

examples/typescript/
= first executable projection
```

Current actions use AllasCode-style `README.md`, `manifest.yml`, `config.yml`, schemas, specifications, events and implementation projection.

A canonical-label registry resolves actions such as:

```text
Offer.evaluateEligibility
Marketing.selectNextBestOffer
```

Atomic behaviors expose only `Ok` or `Error`; business denials remain valid `Ok` results.

### Future

- manifest discovery;
- runtime manifest loader;
- schema validator;
- dynamic binding;
- authorization and child-use permission validation;
- self-healing;
- Human-in-the-Healing-Loop;
- laws/rules/proofs/evidence;
- Vieta formalization;
- generated TS/Zig/Rust/Haskell/Prolog projections;
- dependency graph;
- runtime topology generated from `.2flow`;
- semantic compatibility checker.

---

# 18. 2flow orchestration

**Status:** `IMPLEMENTED / PARTIAL`

The initial Offer Qualification flow connects eligibility to next-best-offer selection and Decision creation.

### Future flows

- PurchaseMarketingState.2flow;
- ComplementDiscovery.2flow;
- OfferRecovery.2flow;
- FeedbackLearning.2flow;
- MerchantNegotiation.2flow;
- Replenishment.2flow;
- B2AOffer.2flow;
- UCPCheckoutHandoff.2flow;
- AP2PaymentHandoff.2flow.

---

# 19. Semantic-nominal TypeScript types

**Status:** `IMPLEMENTED / PARTIAL`

Current nominal IDs:

- `ConsumerId`;
- `MerchantId`;
- `ProductId`;
- `OfferId`;
- `PurchaseId`;
- `DecisionId`;
- `FeedbackId`;
- `IntentId`.

Additional values include `ISODateTime`, `PresentationCount`, `ExplorationCoefficient`, `SafetyMargin` and `BanditScore`.

### Future semantic types

- `Money`;
- `CurrencyCode`;
- `Probability`;
- `Confidence`;
- `DiscountRate`;
- `MerchantMargin`;
- `Reward`;
- `Propensity`;
- `UtilityScore`;
- `InterruptionCost`;
- `FatigueScore`;
- `DeliveryDuration`;
- `Quantity`;
- `ReplenishmentInterval`;
- `ConsentVersion`;
- `ProtocolVersion`.

---

# 20. Feedback and learning

## Feedback contract

**Status:** `IMPLEMENTED / PARTIAL`

Current feedback types include presented, accepted, rejected, ignored, purchased, dismissed, blocked-category and unsubscribed.

## Bandit update

**Status:** `IMPLEMENTED / PARTIAL`

The reference LinUCB implementation can update an arm using feedback reward and the original feature vector.

### Future AtomicBehaviors

- `Feedback.record`;
- `Reward.calculate`;
- `Bandit.update`.

The reward should eventually optimize long-term value rather than conversion alone:

```text
ExpectedLongTermValue =
    ConversionValue
  + DiscoveryInformationGain
  + RetentionValue
  + ConsumerUtility
  + MerchantMargin
  - DiscountCost
  - InterruptionCost
  - FatigueCost
  - UnsubscribeRisk
```

---

# 21. Purchase marketing state and ownership

**Status:** `PARTIAL`

The Purchase domain model already records lifecycle, quantity, replenishment interval, active period and timestamp. Eligibility currently infers ownership implications from purchase records.

### Future

- `Purchase.recordMarketingState`;
- explicit Ownership entity;
- `Ownership.update`;
- automatic intent fulfillment;
- suppression projection;
- replenishment scheduling;
- complement discovery trigger;
- external purchase reconciliation;
- ownership quantity/household state;
- disposed/sold/lost states;
- warranty and replacement relations.

---

# 22. Merchant offer model

**Status:** `IMPLEMENTED`

Offer Proposal already contains merchant/product identity, category, action family, price, complement metadata, merchant quality, counteroffer support, channel, modality and expiration.

### Future

- stock;
- delivery SLA;
- margin boundary;
- geographic coverage;
- payment options;
- warranty and return policy;
- condition;
- proof/signature;
- negotiable fields;
- bundles;
- reputation proofs.

---

# 23. Offer projection / presentation

**Status:** `PARTIAL / PLANNED`

The semantic Offer should eventually render into consumer-preferred forms:

```text
Offer
├─ WhatsAppTextProjection
├─ WhatsAppImageProjection
├─ WhatsAppAudioProjection
├─ WebCardProjection
├─ AppProjection
└─ VoiceProjection
```

Future renderers include text, image, audio/TTS, localization, accessibility and consumer-specific detail level.

---

# 24. Communication timing and budgets

## Contact windows

**Status:** `IMPLEMENTED`

Eligibility enforces permitted day/hour/timezone windows.

## Interruption budget

**Status:** `IMPLEMENTED / PARTIAL`

The consumer may limit weekly presentations.

## Discovery budget

**Status:** `IMPLEMENTED / PARTIAL`

The consumer may independently limit complementary exploration.

### Future

- send-time optimization within allowed windows;
- daily/category/merchant budgets;
- rejection/purchase cooldowns;
- fatigue-aware budgets;
- adaptive discovery appetite;
- novelty/surprise tolerance.

---

# 25. Privacy, consent and selective disclosure

**Status:** `SPECIFIED / PARTIAL`

Private constraints should remain consumer-side whenever possible, and explicit consumer preferences remain authoritative over inferred preferences.

### Future

- consent/revocation model;
- preference provenance;
- field-level disclosure;
- purpose-bound access;
- consumer audit log;
- zero-knowledge eligibility proofs;
- private set intersection;
- encrypted evaluation;
- confidential computing;
- federated learning;
- differential privacy.

---

# 26. Explainability

**Status:** `PARTIAL`

Eligibility decisions already provide reason codes.

### Future

- `Decision.explain`;
- human explanation;
- merchant-safe explanation;
- consumer-private explanation;
- feature contribution report;
- bandit/fallback explanation;
- audit retention.

---

# 27. Metrics and analytics

**Status:** `PARTIAL / PLANNED`

Decision metadata can include score, propensity, policy version and feature version.

Planned core metrics:

- Useful Offer Rate;
- Eligibility Rate;
- Presentation/Acceptance/Purchase/Rejection rates;
- No-Action Rate;
- Complement Discovery Success Rate;
- Baseline Recovery Success Rate;
- Interruption/Fatigue/Unsubscribe rates;
- Consumer Surplus;
- Merchant Margin;
- Exploration Regret;
- Baseline Safety Violations;
- Constraint Violation Rate;
- long-term retention.

---

# 28. Conformance and security

## Conformance

**Status:** `SPECIFIED`

Future work includes executable conformance tests, golden protocol fixtures, cross-language compatibility, fuzzing and certification levels.

## Security

**Status:** `SPECIFIED / PLANNED`

Future security includes signed offers/decisions, DPoP, mTLS, replay protection, idempotency/nonces, key rotation, ephemeral credentials, audit signatures and a PQC migration profile.

---

# 29. Event-driven architecture

**Status:** `SPECIFIED`

AHMP may use NATS, Kafka, RabbitMQ, Redpanda, QUIC-based messaging, BullMQ or in-memory transports without changing canonical semantics.

### Future

- canonical subjects;
- versioned events;
- dead-letter/retry policies;
- ordered/causal semantics;
- local event log;
- outbox/inbox;
- replay.

---

# 30. Offline-first operation

**Status:** `PLANNED`

Planned consumer-side offline capabilities include local Demand Contract, ownership cache, eligibility, queued feedback, local bandit state and deferred synchronization.

---

# 31. Human-in-the-Healing-Loop

**Status:** `SPECIFIED / PLANNED`

Technical failures may enter a healing path instead of becoming raw business errors.

Use cases include malformed payloads, missing semantic mappings, ambiguous complements, version mismatch, storage failures and external-protocol handoff failures.

---

# 32. Merchant competition and negotiation

**Status:** `PLANNED`

Mandatory order:

```text
ConsumerEligibility
→ MerchantCompetition
```

Merchant ranking may consider final price, delivery, reputation, warranty, consumer preference, stock confidence and other utility factors.

Counteroffer support will allow MerchantAgent ↔ ConsumerAgent negotiation without revealing the consumer's reservation value.

---

# 33. Group buying, supplier discovery and zero-inventory commerce

**Status:** `PLANNED`

Future platform capabilities include:

- persistent open consumer desires;
- local → Brazilian marketplace → national supplier → international supplier search;
- group-buy intents for unavailable products;
- target unit price and minimum quantity;
- landed-cost/logistics calculations;
- merchants selling consumer demand without pre-owning inventory;
- Personal Shopper integration.

---

# 34. Consumer preference learning

**Status:** `PLANNED / RESEARCH`

Soft preferences may be learned for complement category, price range, merchant, timing, modality, novelty tolerance and replenishment interval.

Explicit preferences must always dominate learned preferences.

Preference provenance should identify whether a value was explicit, inferred, purchase-derived, agent-suggested or externally imported.

---

# 35. Policy-as-Code and formal proofs

**Status:** `PLANNED / RESEARCH`

Eligibility and governance rules should become declarative policies separate from implementation code.

Priority formal invariants:

```text
MerchantBid cannot override ConsumerConstraint

AlreadyOwned(DurableProduct)
→ identical offer not eligible

Candidate selected by Bandit
→ Candidate was prequalified

no_action
→ valid decision
```

Future proof targets include Vieta, Agda, Prolog and typed-lambda projections.

---

# 36. Runtime-generated architecture

**Status:** `PLANNED`

The AllasCode runtime should derive execution from semantics instead of a hard-coded central orchestrator:

```text
manifest.yml
config.yml
schemas
2flow
policies
capabilities
    ↓
Resolver
    ↓
Binding
    ↓
Runtime topology
```

---

# 37. AtomicBehavior backlog

| AtomicBehavior | Status | Purpose |
| --- | --- | --- |
| `Purchase.recordMarketingState` | `PLANNED` | Convert purchase into marketing state. |
| `Ownership.update` | `PLANNED` | Maintain ownership state. |
| `Product.discoverComplements` | `PLANNED` | Generate complementary candidates. |
| `Offer.evaluateEligibility` | `IMPLEMENTED` | Apply hard consumer constraints. |
| `Marketing.selectNextBestOffer` | `IMPLEMENTED` | Select among prequalified candidates. |
| `Recovery.generateCandidates` | `PLANNED` | Generate recovery/fallback candidates. |
| `Feedback.record` | `PLANNED` | Persist feedback. |
| `Reward.calculate` | `PLANNED` | Calculate multi-objective reward. |
| `Bandit.update` | `PLANNED` | Update the decision policy. |
| `Decision.explain` | `PLANNED` | Produce safe explanations. |
| `Offer.renderProjection` | `PLANNED` | Render modality-specific presentation. |
| `Intent.create` | `PLANNED` | Create explicit demand. |
| `Intent.update` | `PLANNED` | Modify demand. |
| `Intent.fulfill` | `PLANNED` | Fulfill/close intent after purchase. |
| `Merchant.generateCounterOffer` | `PLANNED` | Negotiate a new offer. |
| `Marketing.enforceCooldown` | `PLANNED` | Enforce contact cooldown. |

---

# 38. End-to-end target flows

## Purchase → discovery → learning

```text
Purchase
→ Purchase.recordMarketingState
→ Ownership.update
→ Product.discoverComplements
→ Offer.evaluateEligibility
→ Marketing.selectNextBestOffer
→ Offer.renderProjection
→ Present
→ Feedback.record
→ Reward.calculate
→ Bandit.update
```

## Rejection → recovery

```text
Rejected
→ Feedback.record
→ Recovery.generateCandidates
→ Offer.evaluateEligibility
→ Marketing.selectNextBestOffer
→ baseline | replenishment | bundle | discount | no_action
```

## Explicit demand → merchant competition

```text
Intent.create
→ Merchant/Supplier discovery
→ OfferProposal[]
→ Offer.evaluateEligibility[]
→ MerchantCompetition
→ Marketing.selectNextBestOffer
→ ConsumerAgent
```

## B2A negotiation → commerce

```text
MerchantAgent
→ OfferProposal
→ ConsumerAgent
→ Eligibility
→ Counteroffer if needed
→ Accepted
→ UCP handoff
→ AP2 authorization/payment
→ Purchase
→ Ownership/marketing state
```

---

# 39. Current implementation summary

## Implemented or executable

- AHMP initial specification;
- Demand Contract, Offer, Purchase, Complement, Decision and Feedback domain models;
- JSON, memory and generic database storage adapters;
- deterministic eligibility;
- lifecycle-aware purchase suppression;
- contact/channel/modality/budget constraints;
- explicit intent price matching;
- complement graph utilities;
- Conservative LinUCB reference policy and updates;
- `no_action` and baseline safety;
- semantic nominal identifiers and values;
- AllasCode `BehaviorResult<Ok|Error>` projection;
- `Offer.evaluateEligibility`;
- `Marketing.selectNextBestOffer`;
- canonical-label action registry;
- initial `.2flow` qualification;
- strict TypeScript build, tests and CI.

## Specified but incomplete

- B2A negotiation;
- selective disclosure;
- UCP/A2A/MCP/AP2 integration;
- event/queue binding;
- conformance/security models;
- rejection recovery;
- dynamic discounts;
- full Next Best Action.

## Next major milestone

```text
Purchase
→ Ownership
→ Complement Discovery
→ Eligibility
→ Conservative Bandit
→ Presentation
→ Feedback
→ Reward
→ Learning
→ Recovery
```

Closing this loop end-to-end should be treated as the next functional milestone for the reference implementation.

---

# 40. Non-negotiable product invariant

```text
Consumer Intent / Constraints
        ↓
Eligibility
        ↓
Candidate Generation
        ↓
Optimization / Learning
        ↓
Merchant Competition
        ↓
Presentation
        ↓
Commerce
```

A merchant's money, ranking objective or optimization model must never bypass an explicit consumer constraint.

The long-term objective is not to maximize advertising volume. It is to maximize the probability that each consumer interruption is useful, wanted, timely and commercially valid.

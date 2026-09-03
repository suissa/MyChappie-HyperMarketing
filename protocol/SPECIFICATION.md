# Agentic HyperMarketing Protocol (AHMP)

Version: `2026-09-03`  
Status: Experimental Proposal

## 1. Scope

AHMP defines interoperable machine-readable contracts for consumer-governed B2A marketing.

It standardizes:

- demand/preferences;
- offer proposals;
- eligibility outcomes;
- presentation decisions;
- feedback;
- purchase/ownership signals used by marketing;
- complementary discovery;
- recovery decision semantics;
- protocol events;
- discovery/capability metadata.

AHMP does not standardize catalog ownership, checkout, payment processing, general agent communication or LLM tool invocation.

## 2. Normative language

MUST, MUST NOT, REQUIRED, SHOULD, SHOULD NOT and MAY are interpreted as RFC 2119/RFC 8174 requirement words.

## 3. Design principles

1. Consumer constraints outrank advertiser utility.
2. Deterministic eligibility precedes probabilistic decisioning.
3. A purchase is state, not merely a conversion event.
4. `no_action` is a valid and required action.
5. Learning may optimize only within the allowed action space.
6. Rejection must not automatically grant a larger discount.
7. Private constraints should be selectively disclosed.
8. Protocol semantics are independent of storage and programming language.

## 4. Roles

### Consumer

Human or organization whose attention, preferences and purchase state are governed.

### Consumer Agent

Evaluates offers under authority delegated by the consumer.

### Merchant

Business offering a product/service.

### Merchant Marketing Agent

Creates or negotiates structured offers for a merchant.

### Marketing Broker

Optional intermediary that routes offers, applies neutral allocation, hosts decisioning or coordinates participants. A broker MUST NOT override consumer constraints.

### Presentation Surface

Human-facing channel such as WhatsApp, web, app, email or voice.

## 5. Canonical content type

The canonical data model is JSON compatible with RFC 8259 and validated using JSON Schema 2020-12.

Recommended media type:

```text
application/ahmp+json
```

## 6. Versioning

Protocol versions use `YYYY-MM-DD`.

Messages MUST carry `protocol = "ahmp"` and `version`.

A receiver MUST reject unsupported major semantic changes rather than silently reinterpret fields.

## 7. Capability discovery

HTTP deployments SHOULD expose:

```text
/.well-known/ahmp
```

The discovery document declares version, roles, capabilities, supported bindings and schema identifiers.

Capability identifiers SHOULD be collision resistant. This repository uses the namespace:

```text
io.github.suissa.my-chappie-hypermarketing.*
```

Core capabilities:

```text
io.github.suissa.my-chappie-hypermarketing.offer.evaluate
io.github.suissa.my-chappie-hypermarketing.feedback.record
io.github.suissa.my-chappie-hypermarketing.purchase.record
io.github.suissa.my-chappie-hypermarketing.complement.discover
io.github.suissa.my-chappie-hypermarketing.counteroffer.request
```

## 8. Envelope

Every remote AHMP message MUST contain:

- `id` — globally unique message ID;
- `protocol` — `ahmp`;
- `version`;
- `type`;
- `timestamp` — RFC 3339;
- `correlationId` when part of an existing interaction;
- `idempotencyKey` for state-changing operations;
- `actor`;
- `payload`.

## 9. Demand Contract

A Demand Contract expresses consumer-governed constraints.

It MAY include:

- explicit intents and maximum prices;
- allowed/blocked categories;
- allowed channels/modalities;
- contact schedules;
- discovery budget;
- interruption budget;
- complement permission;
- baseline recovery permission;
- data-disclosure policy.

A newer valid consumer contract MUST override older preference state for subsequent decisions.

## 10. Offer Proposal

An Offer Proposal MUST identify merchant, product/service, price and expiry when price/expiry are applicable.

It MAY specify:

- action family;
- complement source;
- discount;
- bundle;
- fulfillment estimate;
- merchant quality assertions;
- counteroffer support.

Offer data used for a decision MUST be immutable for that decision. A material price/item change creates a new proposal/version.

## 11. Eligibility

Eligibility MUST execute before ranking or bidding.

A denied offer MUST NOT be presented through marketing merely because a probabilistic model gives it a high score.

Standard reason codes:

```text
ALREADY_OWNED
BLOCKED_CATEGORY
EXPLICITLY_REJECTED
PRICE_NOT_ELIGIBLE
TIMING_NOT_ALLOWED
CHANNEL_NOT_ALLOWED
MODALITY_NOT_ALLOWED
INTERRUPTION_BUDGET_EXHAUSTED
DISCOVERY_BUDGET_EXHAUSTED
OFFER_EXPIRED
INVALID_OFFER
CONSTRAINT_NOT_SATISFIED
```

Implementations MAY add namespaced reason codes.

## 12. Purchase and lifecycle semantics

A confirmed purchase SHOULD be classified into a lifecycle:

```text
durable
consumable
subscription
service
quantity_sensitive
unknown
```

Default behavior:

- durable: suppress identical-product acquisition marketing;
- consumable: suppress until replenishment window is eligible;
- subscription: suppress while active unless upgrade/renewal is explicitly eligible;
- service: policy-specific renewal window;
- unknown: conservative implementation SHOULD avoid permanent suppression.

## 13. Complementary discovery

Discovery candidates SHOULD originate from an explicit complement relation, compatibility rule or explainable semantic relation.

A complement candidate is not automatically eligible; it passes the same consumer constraints as any offer.

## 14. Decision

A Decision has one of:

```text
present
reject
counteroffer
no_action
```

The decision MAY contain internal scoring metadata. Private scoring metadata SHOULD NOT be disclosed to merchants by default.

`no_action` MUST be available to decision engines.

## 15. Recovery

After a rejected discovery presentation, implementations MAY create a recovery decision cycle.

Recovery candidate families include:

```text
baseline
replenishment
bundle
discount
alternative_complement
no_action
```

Rejection MUST NOT automatically imply a larger discount.

## 16. Feedback

Feedback types include:

```text
presented
accepted
rejected
ignored
purchased
dismissed
blocked_category
unsubscribed
```

Feedback used for learning MUST reference the decision ID and action/policy version that produced the presentation.

## 17. Bandit metadata

Learning implementations SHOULD log:

- policy name/version;
- action family;
- context feature version;
- candidate identifiers;
- selected candidate;
- propensity/selection probability when available;
- reward and reward components;
- delayed outcome timestamps.

## 18. Privacy

A consumer agent SHOULD disclose only information necessary to obtain/evaluate an offer.

A merchant SHOULD be able to receive `PRICE_NOT_ELIGIBLE` without receiving the exact consumer price ceiling.

## 19. Idempotency

State-changing operations MUST support idempotency. The same `idempotencyKey` MUST NOT cause duplicate learning or purchase state mutations.

## 20. Bindings

### HTTP/REST

Recommended endpoints:

```text
GET  /.well-known/ahmp
POST /ahmp/v1/offers/evaluate
POST /ahmp/v1/feedback
POST /ahmp/v1/purchases
POST /ahmp/v1/complements/query
POST /ahmp/v1/counteroffers
```

TLS SHOULD be required for remote deployments.

### A2A

Extension URI:

```text
urn:ahmp:a2a:2026-09-03
```

AHMP payloads SHOULD be transported as structured A2A message parts/artifacts while A2A remains responsible for agent interaction lifecycle.

### MCP

AHMP JSON Schemas MAY be reused as MCP tool schemas. The recommended tool names are namespaced `ahmp.*`.

### Message queues

Queue/event bindings MUST preserve `id`, `correlationId`, `idempotencyKey`, `timestamp`, `type` and payload semantics.

## 21. Commerce/payment handoff

When a marketing decision becomes a purchase intent, AHMP SHOULD hand off to a commerce protocol such as UCP. Payment authority SHOULD use a payment/agent authorization protocol such as AP2 rather than treating marketing consent as purchasing authority.

## 22. Error model

Transport errors and business decisions are distinct.

An ineligible offer is normally a valid protocol response, not a transport exception.

Protocol errors SHOULD contain:

```json
{
  "code": "AHMP_INVALID_MESSAGE",
  "message": "Human-readable summary",
  "retryable": false,
  "details": {}
}
```

## 23. Conformance

Conformance is defined by `docs/CONFORMANCE.md` and canonical JSON Schemas. A language implementation may use any architecture if it preserves the normative behavior.

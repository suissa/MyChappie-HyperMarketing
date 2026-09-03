# MyChappie HyperMarketing

MyChappie HyperMarketing is a language-agnostic framework and open protocol proposal for **consumer-governed Business-to-Agent (B2A) marketing**.

Instead of paying directly for human attention, a business submits a structured `OfferProposal`. A consumer-side agent applies deterministic constraints first, then decisioning/ranking, and only presents an offer when the interaction is useful enough to justify interrupting the human.

The protocol proposed by this repository is **AHMP — Agentic HyperMarketing Protocol**.

> B2C marketing asks: “Which human should receive this ad?”  
> AHMP asks: “Which machine-verifiable offer satisfies a demand, complement, replenishment need or permitted discovery opportunity for this consumer?”

## Core properties

1. **Purchase-aware suppression** — buying a durable product suppresses redundant offers for that product.
2. **Lifecycle-aware replenishment** — consumables and renewable services are not suppressed forever.
3. **Complementary discovery** — exploration happens primarily through complementary products/services.
4. **Conservative contextual bandits** — exploration is balanced against a high-confidence baseline.
5. **Baseline recovery** — after rejected discovery, the engine may choose a known product, bundle, discount or no action.
6. **Discount is not an automatic reward for rejection** — discount levels are candidate actions subject to economic constraints.
7. **No action is first-class** — silence can be the optimal marketing decision.
8. **Consumer constraints are invariants** — advertiser spend MUST NOT override timing, channel, category, ownership or explicit refusal constraints.
9. **Selective disclosure** — merchants need not learn the consumer’s exact private constraint to receive a rejection/counteroffer result.
10. **Language agnostic** — JSON Schema contracts and behavioral conformance define the standard, not the TypeScript implementation.

## Architecture

```text
Business / Merchant
      |
      | OfferProposal
      v
MerchantMarketingAgent
      |
      | AHMP (REST / A2A / other binding)
      v
ConsumerAgent / Neutral Broker
      |
      +--> Deterministic Eligibility
      |       +--> ownership suppression
      |       +--> explicit intent
      |       +--> category rules
      |       +--> price constraints
      |       +--> time/channel/modality
      |       +--> interruption budget
      |
      +--> Candidate Generation
      |       +--> explicit demand
      |       +--> complementary graph
      |       +--> replenishment
      |       +--> baseline recovery
      |       +--> no_action
      |
      +--> Conservative Contextual Bandit
      |
      +--> Presentation Policy
      v
Human
      |
      | feedback / purchase
      v
Learning + Purchase State
```

## Repository layout

```text
docs/                    Conceptual and architectural documentation
protocol/                Normative AHMP specification + JSON Schemas
examples/typescript/     TypeScript reference implementation
.github/workflows/       Conformance/reference CI
```

## Use with only JSON files

The TypeScript reference uses a storage port. A local deployment can point the framework at a directory of JSON documents:

```json
{
  "storage": {
    "kind": "json",
    "path": "./data"
  }
}
```

## Use with a database

A database deployment supplies only a small database gateway module and mappings. Core marketing logic never imports a database SDK.

```json
{
  "storage": {
    "kind": "database",
    "module": "./my-database-gateway.js"
  }
}
```

See `docs/STORAGE.md` and `examples/typescript/`.

## Protocol interoperability

AHMP deliberately does not replace existing agentic standards:

- **UCP** — commerce/catalog/cart/checkout/order handoff.
- **A2A** — agent-to-agent communication binding.
- **MCP** — tools and data access.
- **AP2** — authorization and payment mandates.
- **AHMP** — demand constraints, marketing offer eligibility, complementary discovery, recovery, feedback and learning.

See `docs/INTEROPERABILITY.md`.

## Specification version

Initial proposal: `2026-09-03`.

The words MUST, MUST NOT, SHOULD, SHOULD NOT and MAY are normative as defined by RFC 2119/RFC 8174 when used in the protocol specification.

## Project status

Experimental protocol proposal and reference framework. It is not an official extension of UCP, A2A, MCP or AP2.
